"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  teacherId: z.string().uuid(),
  relievedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  replacementTeacherId: z.string().uuid().optional(),
});

export type RelieveResult = { success: boolean; error?: string };

export async function relieveStaff(formData: FormData): Promise<RelieveResult> {
  const raw = {
    teacherId: formData.get("teacherId"),
    relievedOn: formData.get("relievedOn"),
    replacementTeacherId: formData.get("replacementTeacherId") || undefined,
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { teacherId, relievedOn, replacementTeacherId } = parsed.data;
  const adminClient = await createAdminClient();

  // 1. Soft-deactivate the teacher profile
  const { error: profileErr } = await adminClient
    .from("profiles")
    .update({ is_active: false, relieved_on: relievedOn })
    .eq("id", teacherId);

  if (profileErr) return { success: false, error: profileErr.message };

  // 2. Mark their class allocations as relieved
  const { error: allocErr } = await adminClient
    .from("teacher_classes")
    .update({ relieved_on: relievedOn })
    .eq("teacher_id", teacherId)
    .is("relieved_on", null);

  if (allocErr) return { success: false, error: allocErr.message };

  // 3. If a replacement teacher is selected, transfer all class assignments
  if (replacementTeacherId) {
    const { data: oldAllocs } = await adminClient
      .from("teacher_classes")
      .select("class_id, subject, is_class_teacher, academic_year")
      .eq("teacher_id", teacherId);

    if (oldAllocs && oldAllocs.length > 0) {
      const newAllocs = oldAllocs.map((a: any) => ({
        teacher_id: replacementTeacherId,
        class_id: a.class_id,
        subject: a.subject,
        is_class_teacher: a.is_class_teacher,
        academic_year: a.academic_year,
        assigned_on: relievedOn,
      }));

      await adminClient
        .from("teacher_classes")
        .upsert(newAllocs, { onConflict: "teacher_id,class_id" });
    }
  }

  revalidatePath("/portal/admin/staff");
  return { success: true };
}
