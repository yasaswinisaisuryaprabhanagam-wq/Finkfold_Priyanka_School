import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccreditationClient from "./AccreditationClient";

export const metadata = {
  title: "Accreditation & Affiliation Vault - Trust HQ Finkfold",
  description: "Centralized legal compliance repository with proactive 90-day & 30-day countdown timers for Fire NOC, Building Safety, CBSE SARAS 4.0, and RTE Recognition.",
};

export default async function AccreditationPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <AccreditationClient />;
}
