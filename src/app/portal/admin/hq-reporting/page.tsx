import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import BoardPacketClient from "./BoardPacketClient";

export const metadata = {
  title: "BoD Pitch Deck & Executive Reporting - Trust HQ Finkfold",
  description: "Automated 1-click boardroom packet generator, live quarterly financial & academic consolidation.",
};

export default async function HqReportingPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    redirect("/portal/admin");
  }

  return <BoardPacketClient />;
}
