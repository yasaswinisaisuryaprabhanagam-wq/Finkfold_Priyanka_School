import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProvisionCampusClient from "./ProvisionCampusClient";

export const metadata = {
  title: "1-Click New Campus Provisioning Wizard - Trust HQ Finkfold",
  description: "AWS CloudFormation & NetSuite-inspired multi-subsidiary automated branch deployment wizard. Replicates fee structures, grading scales, academic terms, and security roles in 3 seconds.",
};

export default async function ProvisionCampusPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <ProvisionCampusClient />;
}
