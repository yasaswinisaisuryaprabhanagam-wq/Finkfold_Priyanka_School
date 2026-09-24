import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import SafeSpaceClient from "./SafeSpaceClient";

export const metadata = {
  title: "SafeSpace Grievance Triage - Finkfold ERP",
  description: "Confidential student grievance desk, emergency SLA monitoring, and Super Admin escalation interventions.",
};

export default async function AdminSafeSpaceTriagePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  return <SafeSpaceClient isSuperAdmin={isSuperAdmin} />;
}
