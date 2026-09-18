"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Row schema ────────────────────────────────────────────────
const RowSchema = z.object({
  full_name: z.string().min(2, "Name too short"),
  roll_no: z.coerce.number().int().positive("Roll no must be positive"),
  admission_no: z.string().min(1, "Admission number required"),
  class_name: z.string().min(1, "Class required"),
  section: z.string().min(1, "Section required"),
  parent_name: z.string().optional().default(""),
  parent_phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10 || v.length === 12, "Phone must be 10 digits"),
  gender: z.enum(["male", "female", "other"]).optional(),
  consent_whatsapp: z.coerce.boolean().optional().default(true),
});

type RowInput = z.infer<typeof RowSchema>;

export type ValidationResult = {
  row: number;
  raw: Record<string, string>;
  parsed?: RowInput;
  errors: string[];
  valid: boolean;
};

export type BulkImportResult = {
  validated: ValidationResult[];
  inserted: number;
  skipped: number;
  dbError?: string;
};

// ── Parse & validate CSV text ─────────────────────────────────
export async function validateCSV(csvText: string): Promise<ValidationResult[]> {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const results: ValidationResult[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted CSV values
    const values = line.match(/(".*?"|[^,]+)/g)?.map((v) =>
      v.trim().replace(/^"|"$/g, "")
    ) ?? line.split(",").map((v) => v.trim());

    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => (raw[h] = values[idx] || "-"));

    const parseResult = RowSchema.safeParse(raw);
    results.push({
      row: i,
      raw,
      parsed: parseResult.success ? parseResult.data : undefined,
      errors: parseResult.success
        ? []
        : parseResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
      valid: parseResult.success,
    });
  }

  return results;
}

// ── Commit valid rows to DB ───────────────────────────────────
export async function commitBulkImport(
  schoolId: string,
  rows: ValidationResult[]
): Promise<BulkImportResult> {
  const adminClient = await createAdminClient();
  const validRows = rows.filter((r) => r.valid && r.parsed);

  if (validRows.length === 0) {
    return { validated: rows, inserted: 0, skipped: rows.length };
  }

  // Fetch class ID map for this school
  const { data: classes } = await adminClient
    .from("classes")
    .select("id, name, section")
    .eq("school_id", schoolId);

  const classMap = new Map<string, string>();
  (classes || []).forEach((c: any) =>
    classMap.set(`${c.name.trim().toLowerCase()}-${c.section.trim().toLowerCase()}`, c.id)
  );

  // Build insert payloads
  const toInsert: any[] = [];
  const classErrors: string[] = [];

  for (const r of validRows) {
    const p = r.parsed!;
    const key = `${p.class_name.trim().toLowerCase()}-${p.section.trim().toLowerCase()}`;
    const classId = classMap.get(key);

    if (!classId) {
      classErrors.push(
        `Row ${r.row}: Class "${p.class_name}-${p.section}" not found in school`
      );
      r.errors.push(`Class "${p.class_name}-${p.section}" does not exist`);
      r.valid = false;
      continue;
    }

    // Format phone: ensure +91 prefix
    let phone = p.parent_phone.replace(/\D/g, "");
    if (phone.length === 10) phone = `+91${phone}`;
    else if (phone.length === 12 && phone.startsWith("91")) phone = `+${phone}`;

    toInsert.push({
      school_id: schoolId,
      class_id: classId,
      full_name: p.full_name.trim(),
      roll_no: p.roll_no,
      admission_no: p.admission_no.trim(),
      parent_name: p.parent_name?.trim() || null,
      parent_phone: phone,
      gender: p.gender || null,
      consent_whatsapp: p.consent_whatsapp,
      is_active: true,
    });
  }

  if (toInsert.length === 0) {
    return { validated: rows, inserted: 0, skipped: rows.length, dbError: classErrors.join("; ") };
  }

  // Single batch transaction
  const { data: insertedStudents, error } = await adminClient
    .from("students")
    .insert(toInsert)
    .select("id, school_id, class_id, roll_no");

  if (error) {
    return {
      validated: rows,
      inserted: 0,
      skipped: rows.length,
      dbError: error.message,
    };
  }

  // Also record enrollments for the active academic session
  if (insertedStudents && insertedStudents.length > 0) {
    try {
      const { data: currentYear } = await adminClient
        .from("academic_years")
        .select("id, name")
        .eq("school_id", schoolId)
        .eq("is_current", true)
        .maybeSingle();

      const yearName = currentYear?.name || "2026-2027";
      const yearId = currentYear?.id || null;

      const enrollments = insertedStudents.map((s: any) => ({
        school_id: s.school_id,
        student_id: s.id,
        class_id: s.class_id,
        academic_year_id: yearId,
        academic_year: yearName,
        roll_no: s.roll_no,
        status: "active",
        enrolled_on: new Date().toISOString().slice(0, 10),
      }));

      await adminClient
        .from("student_enrollments")
        .upsert(enrollments, { onConflict: "student_id,academic_year" });
    } catch (enrollErr) {
      console.warn("Could not record initial student_enrollments:", enrollErr);
    }
  }

  revalidatePath("/portal/admin/students");

  return {
    validated: rows,
    inserted: toInsert.length,
    skipped: rows.length - validRows.length,
    dbError: classErrors.length ? classErrors.join("; ") : undefined,
  };
}
