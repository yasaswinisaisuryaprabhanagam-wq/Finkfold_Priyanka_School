import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import CrmClient from "./CrmClient";

export const metadata = {
  title: "AI Admissions CRM & Cross-Campus ROI - Finkfold ERP",
  description: "Enrollment forecasting, lead conversion kanban, and multi-campus marketing ROI analytics.",
};

export default async function AdminAdmissionsCrmPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  return <CrmClient isSuperAdmin={isSuperAdmin} />;
}
