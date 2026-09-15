"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AssignSchema = z.object({
  teacherId: z.string(),
  classId: z.string(),
  subject: z.string().optional(),
  isClassTeacher: z
    .preprocess((val) => val === true || val === "true" || val === "1", z.boolean())
    .default(false),
  academicYear: z.string().default("2026-2027"),
  action: z.enum(["assign", "remove"]),
});

export type AssignResult = { success: boolean; error?: string };

export async function assignClass(formData: FormData): Promise<AssignResult> {
  const parsed = AssignSchema.safeParse({
    teacherId: formData.get("teacherId"),
    classId: formData.get("classId"),
    subject: formData.get("subject") || undefined,
    isClassTeacher: formData.get("isClassTeacher"),
    academicYear: formData.get("academicYear") || "2026-2027",
    action: formData.get("action"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { teacherId, classId, subject, isClassTeacher, academicYear, action } = parsed.data;
  const adminClient = await createAdminClient();

  if (action === "assign") {
    const { error } = await adminClient
      .from("teacher_classes")
      .upsert(
        { teacher_id: teacherId, class_id: classId, subject, is_class_teacher: isClassTeacher, academic_year: academicYear, assigned_on: new Date().toISOString().slice(0, 10) },
        { onConflict: "teacher_id,class_id" }
      );
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await adminClient
      .from("teacher_classes")
      .delete()
      .eq("teacher_id", teacherId)
      .eq("class_id", classId);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/portal/admin/staff");
  revalidatePath("/portal/faculty");
  revalidatePath("/portal/faculty/students");
  return { success: true };
}
