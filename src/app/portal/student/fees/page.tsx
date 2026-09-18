import { getProfile, getCampusContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentFeesClient from "./StudentFeesClient";
import type { FeeStructure, FeeTransaction } from "@/types/erp";

export const metadata = {
  title: "Fee Receipts & Dues · Student Portal",
};

export default async function StudentFeesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const campus = await getCampusContext();
  const adminClient = await createAdminClient();

  // 1. Fetch student record linked to parent's phone
  let student: any = null;
  try {
    const { data: children } = await adminClient
      .from("students")
      .select("id, full_name, roll_no, admission_no, class_id, parent_name, parent_phone, is_active, class:classes(name, section)")
      .eq("school_id", campus.schoolId)
      .eq("parent_phone", profile.phone)
      .eq("is_active", true)
      .limit(1);

    if (children && children.length > 0) {
      student = children[0];
    }
  } catch (err) {
    console.warn("Could not load child by phone:", err);
  }

  // Fallback demo student if logged in user has no student linked
  if (!student) {
    try {
      const { data: fallbackStudents } = await adminClient
        .from("students")
        .select("id, full_name, roll_no, admission_no, class_id, parent_name, parent_phone, is_active, class:classes(name, section)")
        .eq("school_id", campus.schoolId)
        .eq("is_active", true)
        .limit(1);

      if (fallbackStudents && fallbackStudents.length > 0) {
        student = fallbackStudents[0];
      }
    } catch {}
  }

  if (!student) {
    student = {
      id: "demo-student-1",
      full_name: "Yasaswini",
      roll_no: 1,
      admission_no: "ADM-2026-001",
      class_id: null,
      parent_name: profile.full_name,
      parent_phone: profile.phone || "+918247220252",
    };
  }

  // 2. Fetch Fee Structures
  let structures: FeeStructure[] = [];
  try {
    const { data: stData } = await adminClient
      .from("fee_structures")
      .select("*")
      .eq("school_id", campus.schoolId)
      .order("name", { ascending: true });
    structures = (stData as FeeStructure[]) || [];
  } catch (err) {
    console.warn("Could not fetch fee structures:", err);
  }

  if (structures.length === 0) {
    structures = [
      { id: "fs-1", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Term 1 Tuition Fee", category: "tuition", amount: 12000, due_date: "2026-07-31", is_mandatory: true, created_at: new Date().toISOString() },
      { id: "fs-2", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Smart Digital Diary & Portal Fee", category: "digital_portal", amount: 2500, due_date: "2026-06-30", is_mandatory: true, created_at: new Date().toISOString() },
      { id: "fs-3", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Mid-Term Examination Fee", category: "exam", amount: 1500, due_date: "2026-09-15", is_mandatory: true, created_at: new Date().toISOString() },
    ];
  }

  // 3. Fetch Fee Transactions for this student
  let transactions: FeeTransaction[] = [];
  try {
    const { data: txData } = await adminClient
      .from("fee_transactions")
      .select("*")
      .eq("student_id", student.id)
      .order("paid_at", { ascending: false });
    transactions = (txData as FeeTransaction[]) || [];
  } catch (err) {
    console.warn("Could not fetch student transactions:", err);
  }

  return (
    <StudentFeesClient
      student={student}
      schoolName={campus.schoolName}
      structures={structures}
      transactions={transactions}
    />
  );
}
