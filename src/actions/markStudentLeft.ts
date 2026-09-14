"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  studentId: z.string().uuid(),
  leftOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  leftReason: z.enum(["tc_issued", "transferred", "family_relocation", "dropout", "other"]),
  notes: z.string().optional(),
});

export type MarkLeftResult = { success: boolean; error?: string };

export async function markStudentLeft(
  formData: FormData
): Promise<MarkLeftResult> {
  const raw = {
    studentId: formData.get("studentId"),
    leftOn: formData.get("leftOn"),
    leftReason: formData.get("leftReason"),
    notes: formData.get("notes") || undefined,
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { studentId, leftOn, leftReason, notes } = parsed.data;

  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("students")
    .update({
      is_active: false,
      left_on: leftOn,
      left_reason: leftReason,
    })
    .eq("id", studentId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/faculty/students");

  return { success: true };
}
