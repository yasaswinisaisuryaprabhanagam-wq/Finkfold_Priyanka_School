import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import InfrastructureClient from "./InfrastructureClient";

export const metadata = {
  title: "Institutional Asset & Infrastructure Audit (RTE) - Trust HQ Finkfold",
  description: "PowerSchool and CBSE Affiliation Bye-Laws audit engine monitoring Student-Teacher Ratio (STR 30:1), classroom square footage per child, lab workstations, and library title ratios.",
};

export default async function InfrastructurePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <InfrastructureClient />;
}
