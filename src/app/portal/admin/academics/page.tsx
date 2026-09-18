import { getProfile, getCampusContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AcademicsClient from "./AcademicsClient";
import type { AcademicYear, Subject } from "@/types/erp";

export const metadata = {
  title: "Academic Setup & Subjects · Finkfold EdOS",
};

export default async function AdminAcademicsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "school_admin" && profile.role !== "super_admin") {
    redirect("/portal/faculty");
  }

  const campus = await getCampusContext();
  const adminClient = await createAdminClient();

  // Load Academic Years
  let years: AcademicYear[] = [];
  try {
    const { data } = await adminClient
      .from("academic_years")
      .select("*")
      .eq("school_id", campus.schoolId)
      .order("start_date", { ascending: false });
    years = data || [];
  } catch (err) {
    console.warn("Could not fetch academic years:", err);
  }

  // Fallback seed if none exists
  if (years.length === 0) {
    years = [
      {
        id: "ay-default-1",
        school_id: campus.schoolId,
        name: "2026-2027",
        start_date: "2026-06-01",
        end_date: "2027-04-30",
        is_current: true,
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Load Subjects
  let subjects: Subject[] = [];
  try {
    const { data } = await adminClient
      .from("subjects")
      .select("*")
      .eq("school_id", campus.schoolId)
      .order("name", { ascending: true });
    subjects = data || [];
  } catch (err) {
    console.warn("Could not fetch subjects:", err);
  }

  // Fallback defaults if empty
  if (subjects.length === 0) {
    subjects = [
      { id: "sub-1", school_id: campus.schoolId, name: "Mathematics", code: "MATH", type: "theory", created_at: new Date().toISOString() },
      { id: "sub-2", school_id: campus.schoolId, name: "Physical Science", code: "PSCI", type: "theory", created_at: new Date().toISOString() },
      { id: "sub-3", school_id: campus.schoolId, name: "English Language", code: "ENG", type: "language", created_at: new Date().toISOString() },
      { id: "sub-4", school_id: campus.schoolId, name: "Computer Laboratory", code: "COMP-LAB", type: "practical", created_at: new Date().toISOString() },
    ];
  }

  return (
    <AcademicsClient
      schoolId={campus.schoolId}
      schoolName={campus.schoolName}
      initialYears={years}
      initialSubjects={subjects}
    />
  );
}
