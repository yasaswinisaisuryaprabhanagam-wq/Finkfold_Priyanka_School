"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  schoolId: z.string().uuid(),
  full_name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Enter valid 10-digit mobile number")
    .transform((v) => `+91${v}`),
  employee_code: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["teacher", "school_admin"]).default("teacher"),
});

export type AddTeacherResult = {
  success: boolean;
  teacherId?: string;
  error?: string;
};

export async function addTeacher(formData: FormData): Promise<AddTeacherResult> {
  const parsed = Schema.safeParse({
    schoolId: formData.get("schoolId"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    employee_code: formData.get("employee_code") || undefined,
    password: formData.get("password"),
    role: formData.get("role") || "teacher",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { schoolId, full_name, email, phone, employee_code, password, role } = parsed.data;

  const adminClient = await createAdminClient();

  // 1. Create Supabase Auth user with the admin API (bypasses email confirmation)
  const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm — no email verification needed
    user_metadata: { full_name },
  });

  if (authErr || !authData?.user) {
    return {
      success: false,
      error: authErr?.message || "Failed to create auth account",
    };
  }

  const userId = authData.user.id;

  // 2. Create the profile record
  const { error: profileErr } = await adminClient.from("profiles").insert({
    id: userId,
    school_id: schoolId,
    full_name: full_name.trim(),
    role,
    phone,
    employee_code: employee_code?.trim() || null,
    is_active: true,
  });

  if (profileErr) {
    // Rollback: delete the auth user since profile creation failed
    await adminClient.auth.admin.deleteUser(userId);
    return { success: false, error: profileErr.message };
  }

  revalidatePath("/portal/admin/staff");
  return { success: true, teacherId: userId };
}
