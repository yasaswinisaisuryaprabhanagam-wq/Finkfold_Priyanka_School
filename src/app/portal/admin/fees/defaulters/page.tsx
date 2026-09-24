import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import DefaultersClient from "./DefaultersClient";

export const metadata = {
  title: "Defaulter Engine & Chairman's Waiver - Finkfold ERP",
  description: "Automated late penalty engine, recovery metrics, and Super Admin Chairman's waiver desk.",
};

export default async function AdminFeeDefaultersPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  return <DefaultersClient isSuperAdmin={isSuperAdmin} />;
}
