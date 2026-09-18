import { getProfile, getCampusContext, getAllCampuses } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TreasuryClient from "./TreasuryClient";

export const metadata = {
  title: "Centralized Treasury (HQ) · Finkfold EdOS",
};

export default async function AdminTreasuryPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "school_admin" && profile.role !== "super_admin" && profile.role !== "branch_admin") {
    redirect("/portal/faculty");
  }

  const campus = await getCampusContext();
  const allCampuses = await getAllCampuses();
  const adminClient = await createAdminClient();

  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Fetch cross-branch stats for each branch
  const branchSummaries = await Promise.all(
    allCampuses.map(async (branch: any) => {
      // Fetch students count
      const { count: studentCount } = await adminClient
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("school_id", branch.id)
        .eq("is_active", true);

      // Fetch today's transactions
      const { data: txs } = await adminClient
        .from("fee_transactions")
        .select("amount, payment_method")
        .eq("school_id", branch.id)
        .gte("paid_at", `${todayStr}T00:00:00Z`);

      let cashToday = 0;
      let upiToday = 0;
      (txs || []).forEach((t: any) => {
        const amt = Number(t.amount) || 0;
        if (t.payment_method === "cash") cashToday += amt;
        else upiToday += amt;
      });

      // Fetch today's drawer
      const { data: drawer } = await adminClient
        .from("cash_drawers")
        .select("status, discrepancy")
        .eq("school_id", branch.id)
        .eq("drawer_date", todayStr)
        .maybeSingle();

      return {
        ...branch,
        studentCount: studentCount || 0,
        cashToday,
        upiToday,
        totalToday: cashToday + upiToday,
        drawerStatus: drawer?.status || "open",
        discrepancy: drawer?.discrepancy || 0,
      };
    })
  );

  // 2. Fetch Recent cross-branch transactions
  let recentTransactions: any[] = [];
  try {
    const { data: txData } = await adminClient
      .from("fee_transactions")
      .select("id, receipt_no, amount, payment_method, paid_at, student:students(full_name, admission_no), school:schools(name, branch_code)")
      .order("paid_at", { ascending: false })
      .limit(30);
    recentTransactions = txData || [];
  } catch (err) {
    console.warn("Could not fetch cross-branch transactions:", err);
  }

  // 3. Fetch Drawer Discrepancies
  let discrepancies: any[] = [];
  try {
    const { data: drawerData } = await adminClient
      .from("cash_drawers")
      .select("id, drawer_date, opening_cash, system_cash_collected, declared_cash, discrepancy, status, school:schools(name, branch_code), cashier:profiles(full_name)")
      .order("drawer_date", { ascending: false })
      .limit(20);
    discrepancies = drawerData || [];
  } catch (err) {
    console.warn("Could not fetch drawer audits:", err);
  }

  // Roll-up aggregates
  let totalCash = 0;
  let totalUpi = 0;
  let totalStudents = 0;
  let flaggedCount = 0;

  branchSummaries.forEach((b) => {
    totalCash += b.cashToday;
    totalUpi += b.upiToday;
    totalStudents += b.studentCount;
    if (b.drawerStatus === "discrepancy_flagged") flaggedCount++;
  });

  return (
    <TreasuryClient
      orgName="Priyanka Educational Trust"
      branches={branchSummaries}
      summary={{
        totalCash,
        totalUpi,
        grandTotal: totalCash + totalUpi,
        totalStudents,
        flaggedCount,
      }}
      recentTransactions={recentTransactions}
      discrepancies={discrepancies}
      currentSchoolId={campus.schoolId}
    />
  );
}
