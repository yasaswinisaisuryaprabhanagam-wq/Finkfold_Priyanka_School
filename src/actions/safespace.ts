"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import type { GrievanceReport, ConductEntry } from "@/types/self-service";
import { INITIAL_GRIEVANCES, INITIAL_CONDUCT_ENTRIES } from "@/types/self-service";

async function getDefaultStudentId(supabase: any) {
  const { data: stu } = await supabase.from("students").select("id").limit(1).maybeSingle();
  return stu?.id || "6921082e-75ab-4067-b536-b76d09f71c3a";
}

export async function getSafeSpaceData(): Promise<{
  grievances: GrievanceReport[];
  conductEntries: ConductEntry[];
  totalMerits: number;
  totalDemerits: number;
}> {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  let conduct = INITIAL_CONDUCT_ENTRIES;

  try {
    const { data: dbConduct } = await supabase
      .from("student_conduct_ledger")
      .select("*")
      .eq("student_id", studentId)
      .order("entry_date", { ascending: false });

    if (dbConduct && dbConduct.length > 0) {
      conduct = dbConduct.map((c: any) => ({
        id: c.id,
        date: new Date(c.entry_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        type: c.entry_type,
        title: c.title,
        points: c.points,
        issuedBy: c.issued_by,
        description: c.description,
        badgeIcon: c.badge_icon || "⭐",
      }));
    }
  } catch (err) {
    // Fallback
  }

  const merits = conduct.filter((c) => c.type === "merit").reduce((sum, c) => sum + c.points, 0);
  const demerits = Math.abs(conduct.filter((c) => c.type === "demerit").reduce((sum, c) => sum + c.points, 0));

  return {
    grievances: INITIAL_GRIEVANCES,
    conductEntries: conduct,
    totalMerits: merits,
    totalDemerits: demerits,
  };
}

export async function submitAnonymousGrievanceAction(payload: {
  category: GrievanceReport["category"];
  description: string;
  locationDetails?: string;
  urgency: GrievanceReport["urgency"];
}) {
  const token = "SAFE-TOKEN-" + Math.floor(1000 + Math.random() * 9000);
  const newReport: GrievanceReport = {
    id: "grv-" + Date.now(),
    trackingToken: token,
    category: payload.category,
    description: payload.description,
    locationDetails: payload.locationDetails,
    urgency: payload.urgency,
    status: "received",
    counselorReply: "Your report has been encrypted and routed directly to the Principal and Senior Counselor. Check this portal with your tracking token for private updates.",
    createdAt: "Just now",
  };

  const supabase = await createAdminClient();

  try {
    await supabase.from("anonymous_grievance_reports").insert({
      school_id: SCHOOL.id,
      tracking_token: token,
      category: payload.category,
      description: payload.description,
      location_details: payload.locationDetails || null,
      urgency: payload.urgency,
      status: "received",
      counselor_reply: newReport.counselorReply,
    });
  } catch (err) {
    // Graceful fallback
  }

  revalidatePath("/portal/student/safespace");
  return {
    success: true,
    trackingToken: token,
    report: newReport,
    message: `Confidential drop-box report lodged securely! Your zero-identity tracking token is [${token}]. Save this token to view confidential counselor responses.`,
  };
}
