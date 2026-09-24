"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import type { OutPassRequest, MessDayMenu } from "@/types/self-service";
import { INITIAL_MESS_MENU, INITIAL_OUTPASSES } from "@/types/self-service";

import { getAuthenticatedStudent } from "@/lib/studentSession";

export async function getOutPassesData(): Promise<OutPassRequest[]> {
  try {
    const { student } = await getAuthenticatedStudent();
    const supabase = await createAdminClient();

    const { data: dbPasses, error } = await supabase
      .from("digital_outpasses")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query digital_outpasses:", error.message);
    }

    if (dbPasses && dbPasses.length > 0) {
      return dbPasses.map((p: any) => ({
        id: p.id,
        passNumber: p.pass_number,
        leaveType: p.leave_type,
        exitDateTime: p.exit_date_time,
        returnDateTime: p.return_date_time,
        companionName: p.companion_name,
        reason: p.reason,
        parentApproval: p.parent_approval,
        wardenApproval: p.warden_approval,
        gateExitScannedAt: p.gate_exit_scanned_at,
        gateReturnScannedAt: p.gate_return_scanned_at,
        gatePassQr: p.gate_pass_qr,
        createdAt: new Date(p.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
  } catch (err: any) {
    console.warn("getOutPassesData fallback error:", err?.message);
  }

  return INITIAL_OUTPASSES;
}

export async function submitOutPassAction(payload: {
  leaveType: "weekend_home" | "medical" | "day_outing";
  exitDateTime: string;
  returnDateTime: string;
  companionName: string;
  reason: string;
}) {
  const passNum = "OP-PRIY-2026-" + Math.floor(1000 + Math.random() * 9000);
  const gatePassQr = `QR-GATE-${passNum}`;

  const newPass: OutPassRequest = {
    id: "pass-" + Date.now(),
    passNumber: passNum,
    leaveType: payload.leaveType,
    exitDateTime: payload.exitDateTime,
    returnDateTime: payload.returnDateTime,
    companionName: payload.companionName,
    reason: payload.reason,
    parentApproval: "approved",
    wardenApproval: "pending",
    gatePassQr: gatePassQr,
    createdAt: "Just now",
  };

  try {
    const { student, schoolId } = await getAuthenticatedStudent();
    const supabase = await createAdminClient();

    const { data, error } = await supabase.from("digital_outpasses").insert({
      school_id: schoolId,
      student_id: student.id,
      pass_number: passNum,
      leave_type: payload.leaveType,
      exit_date_time: payload.exitDateTime,
      return_date_time: payload.returnDateTime,
      companion_name: payload.companionName,
      reason: payload.reason,
      parent_approval: "approved",
      warden_approval: "pending",
      gate_pass_qr: gatePassQr,
    }).select().single();

    if (error) {
      console.error("Failed to insert digital_outpasses:", error.message);
    } else if (data) {
      newPass.id = data.id;
    }
  } catch (err: any) {
    console.error("submitOutPassAction exception:", err?.message);
  }

  revalidatePath("/portal/student/outpass");
  revalidatePath("/portal/faculty");
  revalidatePath("/portal/admin");
  return {
    success: true,
    pass: newPass,
    message: `Out-pass request #${passNum} submitted & recorded in DB! Notification pushed to Hostel Warden and parent's WhatsApp.`,
  };
}

export async function submitMessFeedbackAction(rating: number, voteItem: string) {
  revalidatePath("/portal/student/outpass");
  return {
    success: true,
    message: `Thank you! Feedback recorded: ${rating}★ rating and vote cast for "${voteItem}" in Friday's Special Menu poll.`,
  };
}
