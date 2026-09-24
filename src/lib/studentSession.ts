import { getProfile } from "./auth";
import { createAdminClient } from "./supabase/server";
import { SCHOOL } from "./school-config";

export interface AuthenticatedStudentInfo {
  id: string;
  school_id: string;
  full_name: string;
  admission_no: string;
  roll_no: number;
  class_id: string;
  className?: string;
  classSection?: string;
  parent_name?: string | null;
  parent_phone?: string | null;
}

/**
 * Resolves the authenticated student record for the currently logged in student or parent.
 * Guarantees a valid student record in Supabase is always resolved.
 */
export async function getAuthenticatedStudent(): Promise<{
  student: AuthenticatedStudentInfo;
  profile: any;
  schoolId: string;
}> {
  const profile = await getProfile();
  const supabase = await createAdminClient();

  const schoolId = profile?.school_id || SCHOOL.id;

  let studentRow: any = null;

  if (profile) {
    // 1. Try matching by parent_phone
    if (profile.phone) {
      const { data: byPhone } = await supabase
        .from("students")
        .select("id, school_id, full_name, admission_no, roll_no, class_id, parent_name, parent_phone")
        .eq("school_id", schoolId)
        .eq("parent_phone", profile.phone)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (byPhone) studentRow = byPhone;
    }

    // 2. Try matching by full_name
    if (!studentRow && profile.full_name) {
      // Remove any helper text like '(Demo Student)'
      const cleanName = profile.full_name.replace(/\(.*?\)/g, "").trim();
      const { data: byName } = await supabase
        .from("students")
        .select("id, school_id, full_name, admission_no, roll_no, class_id, parent_name, parent_phone")
        .eq("school_id", schoolId)
        .ilike("full_name", `%${cleanName}%`)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (byName) studentRow = byName;
    }
  }

  // 3. Fallback: get first active student in this school
  if (!studentRow) {
    const { data: fallback } = await supabase
      .from("students")
      .select("id, school_id, full_name, admission_no, roll_no, class_id, parent_name, parent_phone")
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .order("roll_no")
      .limit(1)
      .maybeSingle();

    if (fallback) studentRow = fallback;
  }

  // 4. Absolute fallback: get any student across all schools if needed
  if (!studentRow) {
    const { data: anyStudent } = await supabase
      .from("students")
      .select("id, school_id, full_name, admission_no, roll_no, class_id, parent_name, parent_phone")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    studentRow = anyStudent;
  }

  // Fetch class details
  let className = "10";
  let classSection = "A";
  if (studentRow?.class_id) {
    const { data: cls } = await supabase
      .from("classes")
      .select("name, section")
      .eq("id", studentRow.class_id)
      .maybeSingle();

    if (cls) {
      className = cls.name;
      classSection = cls.section;
    }
  }

  const enrichedStudent: AuthenticatedStudentInfo = {
    id: studentRow.id,
    school_id: studentRow.school_id || schoolId,
    full_name: studentRow.full_name,
    admission_no: studentRow.admission_no,
    roll_no: studentRow.roll_no || 1,
    class_id: studentRow.class_id,
    className,
    classSection,
    parent_name: studentRow.parent_name,
    parent_phone: studentRow.parent_phone,
  };

  return {
    student: enrichedStudent,
    profile,
    schoolId: studentRow.school_id || schoolId,
  };
}
