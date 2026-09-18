import { getProfile, getCampusContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeesClientShell from "./FeesClientShell";
import { getOrCreateTodayDrawer } from "@/actions/fees";
import type { CashDrawer, FeeTransaction, FeeStructure } from "@/types/erp";

export const metadata = {
  title: "Fee Counter POS & Cash Till · Finkfold EdOS",
};

export default async function AdminFeesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (
    profile.role !== "school_admin" &&
    profile.role !== "super_admin" &&
    profile.role !== "branch_admin" &&
    profile.role !== "accountant"
  ) {
    redirect("/portal/faculty");
  }

  const campus = await getCampusContext();
  const adminClient = await createAdminClient();

  // 1. Get or create today's active drawer for cashier
  let activeDrawer: CashDrawer | null = null;
  try {
    const drawerRes = await getOrCreateTodayDrawer(campus.schoolId);
    if (drawerRes.success && drawerRes.drawer) {
      activeDrawer = drawerRes.drawer as CashDrawer;
    }
  } catch (err) {
    console.warn("Could not get or create drawer:", err);
  }

  // 2. Fetch recent transactions for this school
  let transactions: FeeTransaction[] = [];
  try {
    const { data: txData } = await adminClient
      .from("fee_transactions")
      .select("*, student:students(full_name, admission_no, roll_no, parent_phone, class:classes(name, section))")
      .eq("school_id", campus.schoolId)
      .order("paid_at", { ascending: false })
      .limit(50);
    transactions = (txData as any[]) || [];
  } catch (err) {
    console.warn("Could not fetch transactions:", err);
  }

  // 3. Fetch Fee Structures
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

  // Fallback fee structures if empty
  if (structures.length === 0) {
    structures = [
      { id: "fs-1", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Term 1 Tuition Fee", category: "tuition", amount: 12000, due_date: "2026-07-31", is_mandatory: true, created_at: new Date().toISOString() },
      { id: "fs-2", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Smart Digital Diary & Portal Fee", category: "digital_portal", amount: 2500, due_date: "2026-06-30", is_mandatory: true, created_at: new Date().toISOString() },
      { id: "fs-3", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Mid-Term Examination Fee", category: "exam", amount: 1500, due_date: "2026-09-15", is_mandatory: true, created_at: new Date().toISOString() },
      { id: "fs-4", school_id: campus.schoolId, academic_year_id: null, class_id: null, name: "Textbooks & Uniform Kit", category: "books_uniform", amount: 4500, due_date: "2026-06-15", is_mandatory: false, created_at: new Date().toISOString() },
    ];
  }

  // 4. Fetch students in this school for autocomplete
  let students: any[] = [];
  try {
    const { data: stuData } = await adminClient
      .from("students")
      .select("id, full_name, admission_no, roll_no, parent_name, parent_phone, class:classes(name, section)")
      .eq("school_id", campus.schoolId)
      .eq("is_active", true)
      .order("roll_no", { ascending: true });
    students = stuData || [];
  } catch (err) {
    console.warn("Could not fetch students for fee collection:", err);
  }

  const isAdmin = profile.role === "school_admin" || profile.role === "super_admin";

  return (
    <FeesClientShell
      schoolId={campus.schoolId}
      schoolName={campus.schoolName}
      initialDrawer={activeDrawer}
      initialTransactions={transactions}
      initialStructures={structures}
      students={students}
      currentCashierName={profile.full_name}
      isAdmin={isAdmin}
    />
  );
}
