import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import StaffMobilityClient from "./StaffMobilityClient";

export const metadata = {
  title: "Inter-Campus Staff Mobility & Unified History - Trust HQ Finkfold",
  description: "Workday & Darwinbox-inspired cross-campus staff transfer orchestration with unified employee identity, leave ledgers, and appraisal history.",
};

export default async function StaffMobilityPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <StaffMobilityClient />;
}
