"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { SubjectType } from "@/types/erp";

export async function createAcademicYear(
  schoolId: string,
  name: string,
  startDate: string,
  endDate: string,
  isCurrent: boolean = false
) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "school_admin" && profile.role !== "super_admin")) {
      return { success: false, error: "Unauthorized" };
    }

    const adminClient = await createAdminClient();

    if (isCurrent) {
      // Unset previous current academic year for this school
      await adminClient
        .from("academic_years")
        .update({ is_current: false })
        .eq("school_id", schoolId);
    }

    const { data, error } = await adminClient
      .from("academic_years")
      .insert({
        school_id: schoolId,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/portal/admin/academics");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create academic year" };
  }
}

export async function setCurrentAcademicYear(schoolId: string, academicYearId: string) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "school_admin" && profile.role !== "super_admin")) {
      return { success: false, error: "Unauthorized" };
    }

    const adminClient = await createAdminClient();

    // Reset current flag
    await adminClient
      .from("academic_years")
      .update({ is_current: false })
      .eq("school_id", schoolId);

    // Set new current
    const { data, error } = await adminClient
      .from("academic_years")
      .update({ is_current: true })
      .eq("id", academicYearId)
      .eq("school_id", schoolId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/portal/admin/academics");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update current academic year" };
  }
}

export async function createSubject(
  schoolId: string,
  name: string,
  code: string,
  type: SubjectType = "theory"
) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "school_admin" && profile.role !== "super_admin")) {
      return { success: false, error: "Unauthorized" };
    }

    const adminClient = await createAdminClient();

    const { data, error } = await adminClient
      .from("subjects")
      .insert({
        school_id: schoolId,
        name: name.trim(),
        code: code.trim().toUpperCase() || null,
        type: type,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/portal/admin/academics");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create subject" };
  }
}

export async function deleteSubject(subjectId: string) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "school_admin" && profile.role !== "super_admin")) {
      return { success: false, error: "Unauthorized" };
    }

    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (error) throw error;

    revalidatePath("/portal/admin/academics");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete subject" };
  }
}
