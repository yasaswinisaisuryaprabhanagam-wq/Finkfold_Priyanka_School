import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatutoryClient from "./StatutoryClient";

export const metadata = {
  title: "Global Statutory Consolidation (EPF, TDS, PT) - Trust HQ Finkfold",
  description: "Zoho Books & GreytHR Enterprise-inspired statutory compliance dashboard, generating consolidated ECR, 24Q, and PT challans across all school campuses.",
};

export default async function StatutoryPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <StatutoryClient />;
}
