import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import BudgetsClient from "./BudgetsClient";

export const metadata = {
  title: "Universal Budgeting & Burn-Rate Monitor - Trust HQ Finkfold",
  description: "Coupa-inspired universal budgeting, real-time burn-rate monitoring, and over-budget expense voucher approvals.",
};

export default async function BudgetsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <BudgetsClient />;
}
