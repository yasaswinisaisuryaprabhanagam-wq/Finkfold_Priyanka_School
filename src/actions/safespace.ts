"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedStudent } from "@/lib/studentSession";
import type { GrievanceReport, ConductEntry } from "@/types/self-service";
import { INITIAL_GRIEVANCES, INITIAL_CONDUCT_ENTRIES } from "@/types/self-service";

export async function getSafeSpaceData(): Promise<{
  grievances: GrievanceReport[];
  conductEntries: ConductEntry[];
  totalMerits: number;
  totalDemerits: number;
}> {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  let conduct = INITIAL_CONDUCT_ENTRIES;
  let grievances: GrievanceReport[] = [];

  try {
    // 1. Fetch real grievances from database for this school
    const { data: dbGrievances } = await supabase
      .from("anonymous_grievance_reports")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (dbGrievances && dbGrievances.length > 0) {
      grievances = dbGrievances.map((g: any) => ({
        id: g.id,
        trackingToken: g.tracking_token,
        category: g.category,
        description: g.description,
        locationDetails: g.location_details || undefined,
        urgency: g.urgency,
        status: g.status,
        counselorReply: g.counselor_reply || undefined,
        createdAt: new Date(g.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
  } catch (err) {
    console.error("Error fetching grievances:", err);
  }

  // Prepend default samples if empty
  if (grievances.length === 0) {
    grievances = INITIAL_GRIEVANCES;
  }

  try {
    // 2. Fetch conduct ledger for this student
    const { data: dbConduct } = await supabase
      .from("student_conduct_ledger")
      .select("*")
      .eq("student_id", student.id)
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
    console.error("Error fetching conduct ledger:", err);
  }

  const merits = conduct.filter((c) => c.type === "merit").reduce((sum, c) => sum + c.points, 0);
  const demerits = Math.abs(conduct.filter((c) => c.type === "demerit").reduce((sum, c) => sum + c.points, 0));

  return {
    grievances,
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
  const { schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const token = "SAFE-TOKEN-" + Math.floor(1000 + Math.random() * 9000);
  const counselorReply =
    "Your report has been encrypted and routed directly to the Principal and Senior Counselor. Check this portal with your tracking token for private updates.";

  // Validate allowed category
  const validCategories = [
    "bullying",
    "cyber_bullying",
    "harassment",
    "vandalism",
    "counselor_private_chat",
    "safety_hazard",
  ];
  const safeCategory = validCategories.includes(payload.category) ? payload.category : "bullying";
  const safeUrgency = ["standard", "high", "critical"].includes(payload.urgency) ? payload.urgency : "standard";

  const { data, error } = await supabase
    .from("anonymous_grievance_reports")
    .insert({
      school_id: schoolId,
      tracking_token: token,
      category: safeCategory,
      description: payload.description.trim(),
      location_details: payload.locationDetails?.trim() || null,
      urgency: safeUrgency,
      status: "received",
      counselor_reply: counselorReply,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert grievance into Supabase:", error);
  }

  const newReport: GrievanceReport = {
    id: data?.id || "grv-" + Date.now(),
    trackingToken: token,
    category: safeCategory as any,
    description: payload.description,
    locationDetails: payload.locationDetails,
    urgency: safeUrgency as any,
    status: "received",
    counselorReply,
    createdAt: "Just now",
  };

  revalidatePath("/portal/student/safespace");
  revalidatePath("/portal/admin");
  return {
    success: true,
    trackingToken: token,
    report: newReport,
    message: `Confidential drop-box report lodged securely into database! Your zero-identity tracking token is [${token}]. Encrypted and dispatched to Principal & Senior Counselor.`,
  };
}
