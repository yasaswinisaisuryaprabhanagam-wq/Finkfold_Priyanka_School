"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  schoolId: z.string(),
  fromClassId: z.string(),
  toClassId: z.string(),
  academicYearFrom: z.string(),
  academicYearTo: z.string(),
  promotedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type PromoteResult = {
  success: boolean;
  promoted?: number;
  error?: string;
};

export async function promoteStudents(formData: FormData): Promise<PromoteResult> {
  const parsed = Schema.safeParse({
    schoolId: formData.get("schoolId"),
    fromClassId: formData.get("fromClassId"),
    toClassId: formData.get("toClassId"),
    academicYearFrom: formData.get("academicYearFrom"),
    academicYearTo: formData.get("academicYearTo"),
    promotedBy: formData.get("promotedBy") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { schoolId, fromClassId, toClassId, academicYearFrom, academicYearTo, notes } = parsed.data;
  let promotedBy = parsed.data.promotedBy;

  if (!promotedBy) {
    const { createClient } = await import("@/lib/supabase/server");
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    promotedBy = user?.id || undefined;
  }

  // Handle "passed_out" — students who graduate leave school
  const passingOut = toClassId === "passed_out";

  const adminClient = await createAdminClient();

  // Fetch students in the source class
  const { data: students, error: fetchErr } = await adminClient
    .from("students")
    .select("id")
    .eq("school_id", schoolId)
    .eq("class_id", fromClassId)
    .eq("is_active", true);

  if (fetchErr) return { success: false, error: fetchErr.message };
  if (!students || students.length === 0) {
    return { success: false, error: "No active students found in this class" };
  }

  const studentIds = students.map((s: any) => s.id);

  if (passingOut) {
    // Mark all as inactive (passed out / graduated)
    const { error } = await adminClient
      .from("students")
      .update({ is_active: false, left_on: new Date().toISOString().slice(0, 10), left_reason: "passed_out" })
      .in("id", studentIds);

    if (error) return { success: false, error: error.message };
  } else {
    // Move students to new class
    const { error } = await adminClient
      .from("students")
      .update({ class_id: toClassId, promoted_from_class_id: fromClassId })
      .in("id", studentIds);

    if (error) return { success: false, error: error.message };
  }

  // Write audit records for every student
  const auditRows = studentIds.map((sid: string) => ({
    school_id: schoolId,
    student_id: sid,
    from_class_id: fromClassId,
    to_class_id: passingOut ? fromClassId : toClassId, // for passed-out, record same class as "final"
    promoted_by: promotedBy,
    academic_year_from: academicYearFrom,
    academic_year_to: academicYearTo,
    notes: passingOut ? "Passed out / Graduated" : notes || null,
  }));

  await adminClient.from("student_promotions").insert(auditRows);

  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/promotions");

  return { success: true, promoted: studentIds.length };
}
