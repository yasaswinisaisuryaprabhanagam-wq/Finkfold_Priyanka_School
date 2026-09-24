import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppraisalsClient from "./AppraisalsClient";

export const metadata = {
  title: "Faculty Appraisals & Trust Top 10 - Finkfold ERP",
  description: "360-degree biometric, academic, and sentiment appraisal matrix with Trust-wide cross-campus faculty leaderboard.",
};

export default async function AdminStaffAppraisalsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  return <AppraisalsClient isSuperAdmin={isSuperAdmin} />;
}
