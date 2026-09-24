import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import MasterDataClient from "./MasterDataClient";

export const metadata = {
  title: "Global Master Data & Policy Lock - Trust HQ Finkfold",
  description: "SAP-inspired enterprise master data management, global policy locks, and branch exception approvals.",
};

export default async function MasterDataPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <MasterDataClient />;
}
