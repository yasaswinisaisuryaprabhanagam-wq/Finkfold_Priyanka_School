import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import ObeClient from "./ObeClient";

export const metadata = {
  title: "NEP 2020 OBE Auditor & Trust Cognitive Index - Finkfold ERP",
  description: "Outcome-based education auditor, Bloom's Taxonomy analytics, and multi-campus cognitive rigor index.",
};

export default async function AdminAcademicsObePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  return <ObeClient isSuperAdmin={isSuperAdmin} />;
}
