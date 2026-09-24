import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import SafeSpaceClient from "./SafeSpaceClient";
import { createAdminClient } from "@/lib/supabase/server";

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

  let liveGrievances: any[] = [];
  try {
    const supabase = await createAdminClient();
    const { data: dbReports } = await supabase
      .from("anonymous_grievance_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbReports && dbReports.length > 0) {
      liveGrievances = dbReports.map((r: any) => ({
        id: r.id,
        tokenCode: r.tracking_token,
        branchName: "Main Campus",
        category:
          r.category === "bullying" || r.category === "cyber_bullying"
            ? "severe_bullying"
            : r.category === "safety_hazard" || r.category === "vandalism"
            ? "facility_issue"
            : "mental_distress",
        severity:
          r.urgency === "immediate_danger"
            ? "critical"
            : r.urgency === "high_stress"
            ? "high"
            : "standard",
        messageSnippet: r.description,
        submittedAt:
          new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
          " at " +
          new Date(r.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        slaMinutesRemaining: r.sla_minutes_remaining || 60,
        status:
          r.status === "in_counselor_triage"
            ? "pending_triage"
            : r.status === "resolved"
            ? "resolved"
            : "pending_triage",
        replyHistory: [],
      }));
    }
  } catch (err: any) {
    console.warn("AdminSafeSpaceTriagePage live query error:", err?.message);
  }

  return (
    <SafeSpaceClient
      isSuperAdmin={isSuperAdmin}
      initialGrievances={liveGrievances.length > 0 ? liveGrievances : undefined}
    />
  );
}
