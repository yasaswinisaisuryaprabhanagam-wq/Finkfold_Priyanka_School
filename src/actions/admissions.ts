"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ── Submit admission form (public, no login) ──────────────────
const SubmitSchema = z.object({
  schoolId: z.string().uuid(),
  full_name: z.string().min(2, "Full name required"),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  applying_for_class: z.string().min(1, "Class required"),
  applying_for_section: z.string().optional(),
  parent_name: z.string().min(2, "Parent name required"),
  parent_phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Enter valid 10-digit mobile number"),
  second_parent_phone: z.string().optional(),
  address: z.string().optional(),
  previous_school: z.string().optional(),
});

export type SubmitAdmissionResult = { success: boolean; error?: string };

export async function submitAdmission(formData: FormData): Promise<SubmitAdmissionResult> {
  const parsed = SubmitSchema.safeParse({
    schoolId: formData.get("schoolId"),
    full_name: formData.get("full_name"),
    date_of_birth: formData.get("date_of_birth") || undefined,
    gender: formData.get("gender") || undefined,
    applying_for_class: formData.get("applying_for_class"),
    applying_for_section: formData.get("applying_for_section") || undefined,
    parent_name: formData.get("parent_name"),
    parent_phone: formData.get("parent_phone"),
    second_parent_phone: formData.get("second_parent_phone") || undefined,
    address: formData.get("address") || undefined,
    previous_school: formData.get("previous_school") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const d = parsed.data;
  let phone = d.parent_phone;
  if (phone.length === 10) phone = `+91${phone}`;

  const adminClient = await createAdminClient();
  const { error } = await adminClient.from("pending_admissions").insert({
    school_id: d.schoolId,
    full_name: d.full_name.trim(),
    date_of_birth: d.date_of_birth || null,
    gender: d.gender || null,
    applying_for_class: d.applying_for_class.trim(),
    applying_for_section: d.applying_for_section?.trim() || null,
    parent_name: d.parent_name.trim(),
    parent_phone: phone,
    second_parent_phone: d.second_parent_phone?.trim() || null,
    address: d.address?.trim() || null,
    previous_school: d.previous_school?.trim() || null,
    status: "pending",
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/portal/admin/admissions");
  return { success: true };
}

// ── Approve admission → create student record ──────────────────
const ApproveSchema = z.object({
  admissionId: z.string(),
  schoolId: z.string(),
  classId: z.string(),
  admissionNo: z.string().min(1, "Admission number required"),
  rollNo: z.coerce.number().int().positive("Roll number must be positive"),
  approvedBy: z.string().optional(),
});

export type ApproveResult = { success: boolean; studentId?: string; error?: string };

export async function approveAdmission(formData: FormData): Promise<ApproveResult> {
  const parsed = ApproveSchema.safeParse({
    admissionId: formData.get("admissionId"),
    schoolId: formData.get("schoolId"),
    classId: formData.get("classId"),
    admissionNo: formData.get("admissionNo"),
    rollNo: formData.get("rollNo"),
    approvedBy: formData.get("approvedBy") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { admissionId, schoolId, classId, admissionNo, rollNo } = parsed.data;
  let approvedBy = parsed.data.approvedBy;

  const adminClient = await createAdminClient();

  if (!approvedBy) {
    const { createClient } = await import("@/lib/supabase/server");
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    approvedBy = user?.id || undefined;
  }

  // Fetch the pending admission record
  const { data: adm, error: fetchErr } = await adminClient
    .from("pending_admissions")
    .select("*")
    .eq("id", admissionId)
    .single();

  if (fetchErr || !adm) return { success: false, error: "Admission record not found" };

  // Create the student
  const { data: student, error: stuErr } = await adminClient
    .from("students")
    .insert({
      school_id: schoolId,
      class_id: classId,
      admission_no: admissionNo,
      full_name: adm.full_name,
      roll_no: rollNo,
      parent_name: adm.parent_name,
      parent_phone: adm.parent_phone,
      gender: adm.gender,
      date_of_birth: adm.date_of_birth,
      consent_whatsapp: true,
      is_active: true,
    })
    .select("id")
    .single();

  if (stuErr) return { success: false, error: stuErr.message };

  // Mark admission as approved
  await adminClient
    .from("pending_admissions")
    .update({ status: "approved", reviewed_by: approvedBy, reviewed_at: new Date().toISOString() })
    .eq("id", admissionId);

  revalidatePath("/portal/admin/admissions");
  revalidatePath("/portal/admin/students");
  return { success: true, studentId: student?.id };
}

// ── Reject admission ───────────────────────────────────────────
export async function rejectAdmission(admissionId: string, approvedBy?: string) {
  const adminClient = await createAdminClient();
  let reviewerId = approvedBy;
  if (!reviewerId) {
    const { createClient } = await import("@/lib/supabase/server");
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    reviewerId = user?.id || undefined;
  }
  await adminClient
    .from("pending_admissions")
    .update({ status: "rejected", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq("id", admissionId);
  revalidatePath("/portal/admin/admissions");
  return { success: true };
}
