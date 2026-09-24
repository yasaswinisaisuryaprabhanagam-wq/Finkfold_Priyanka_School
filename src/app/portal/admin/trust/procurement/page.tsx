import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProcurementClient from "./ProcurementClient";

export const metadata = {
  title: "Bulk E-Procurement & Blind Bidding - Trust HQ Finkfold",
  description: "Coupa and SAP Ariba-inspired bulk procurement aggregation, vendor blind bidding, and 1-click PO generation.",
};

export default async function ProcurementPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <ProcurementClient />;
}
