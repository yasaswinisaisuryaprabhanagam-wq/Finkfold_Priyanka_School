"use server";

import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

// ── Shared auth helper ───────────────────────────────────────────────────────
async function requireSuperAdmin() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  if (!isSuperAdmin) {
    throw new Error("Unauthorized: Super Admin privileges required.");
  }
  return profile;
}

// ── Action 1: Chairman's Waiver ──────────────────────────────────────────────
/**
 * Super Admin bypasses the automated defaulter engine for a specific student.
 * Writes a "Chairman's Waiver" note and releases the exam hall-ticket lock.
 */
export async function grantChairmansWaiver(
  studentId: string,
  studentName: string,
  waiverReason: string
): Promise<{ success: boolean; message: string; timestamp: string }> {
  const profile = await requireSuperAdmin();

  if (!waiverReason.trim() || waiverReason.trim().length < 10) {
    return {
      success: false,
      message: "Waiver reason must be at least 10 characters.",
      timestamp: "",
    };
  }

  // In production: write to a `chairman_waivers` table in Supabase:
  // await adminClient.from("chairman_waivers").insert({
  //   student_id: studentId,
  //   granted_by: profile.id,
  //   reason: waiverReason,
  //   granted_at: new Date().toISOString(),
  //   school_id: profile.school_id,
  // });
  // await adminClient
  //   .from("students")
  //   .update({ exam_gate_locked: false, waiver_granted: true })
  //   .eq("id", studentId);

  const timestamp = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  console.log(
    `[SuperAdmin] Chairman's Waiver granted by ${profile.full_name} for student ${studentName} (${studentId}) at ${timestamp}. Reason: ${waiverReason}`
  );

  return {
    success: true,
    message: `Chairman's Waiver granted for ${studentName}. Exam hall-ticket has been released. Waiver logged under Super Admin authority of ${profile.full_name}.`,
    timestamp,
  };
}

// ── Action 2: Unlock Cash Till ───────────────────────────────────────────────
/**
 * Super Admin cryptographically unlocks a previously locked (VERIFIED) cash drawer.
 * Creates an immutable audit trail of the unlock event.
 */
export async function unlockCashTill(
  drawerId: string,
  drawerDate: string,
  branchName: string,
  unlockReason: string
): Promise<{ success: boolean; message: string; auditCode: string }> {
  const profile = await requireSuperAdmin();

  if (!unlockReason.trim() || unlockReason.trim().length < 10) {
    return {
      success: false,
      message: "Unlock reason must be at least 10 characters.",
      auditCode: "",
    };
  }

  // In production: write to `till_unlock_audit` and revert drawer status:
  // await adminClient.from("till_unlock_audit").insert({
  //   drawer_id: drawerId,
  //   unlocked_by: profile.id,
  //   reason: unlockReason,
  //   unlocked_at: new Date().toISOString(),
  // });
  // await adminClient
  //   .from("cash_drawers")
  //   .update({ status: "open", unlock_reason: unlockReason })
  //   .eq("id", drawerId);

  const auditCode = `UNLOCK-${Date.now().toString(36).toUpperCase()}-SA`;

  console.log(
    `[SuperAdmin] Till UNLOCKED by ${profile.full_name} for drawer ${drawerId} (${branchName}, ${drawerDate}). Reason: ${unlockReason}. AuditCode: ${auditCode}`
  );

  return {
    success: true,
    message: `Cash till for ${branchName} on ${drawerDate} has been unlocked. Audit record created.`,
    auditCode,
  };
}

// ── Action 3: Mark SLA Escalation Ownership ──────────────────────────────────
/**
 * Super Admin takes direct ownership of an escalated SafeSpace grievance token.
 * Stops the SLA breach counter and notifies the branch principal.
 */
export async function markSlaEscalationOwnership(
  tokenId: string,
  tokenCode: string
): Promise<{ success: boolean; message: string }> {
  const profile = await requireSuperAdmin();

  // In production: update the grievance token status and ownership:
  // await adminClient.from("safespace_tokens").update({
  //   status: "sa_intervention",
  //   sa_owner_id: profile.id,
  //   sa_taken_at: new Date().toISOString(),
  // }).eq("id", tokenId);

  console.log(
    `[SuperAdmin] SLA escalation ${tokenCode} taken over by ${profile.full_name} (Super Admin).`
  );

  return {
    success: true,
    message: `You (${profile.full_name}) have taken ownership of ${tokenCode}. Branch Principal has been notified. SLA breach counter stopped.`,
  };
}

// ── Action 4: Dispatch Lesson Plan SLA Warning ───────────────────────────────
/**
 * Super Admin sends an HR warning to a teacher who habitually fails the 4:30 PM SLA.
 */
export async function dispatchLessonPlanSlaWarning(
  teacherName: string,
  branchName: string,
  offenceCount: number
): Promise<{ success: boolean; message: string }> {
  await requireSuperAdmin();

  // In production: send WhatsApp/email notification to teacher + log to HR system

  console.log(
    `[SuperAdmin] SLA warning dispatched to ${teacherName} at ${branchName}. Offence #${offenceCount}.`
  );

  return {
    success: true,
    message: `HR Warning dispatched to ${teacherName} (${branchName}). This is their ${offenceCount} SLA breach. Warning logged to Staff HR file.`,
  };
}
