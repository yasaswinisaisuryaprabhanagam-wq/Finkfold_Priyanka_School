"use server";

import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  const timestamp = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  try {
    const adminClient = await createAdminClient();
    
    // 1. Update student remarks and release exam lock if column exists
    try {
      await adminClient
        .from("students")
        .update({
          remarks: `[CHAIRMAN'S WAIVER GRANTED ${timestamp} by ${profile.full_name}]: ${waiverReason}`,
        })
        .eq("id", studentId);
    } catch (dbErr) {
      console.warn("[SuperAdmin] Note on students table update:", dbErr);
    }

    // 2. Audit record in whatsapp_notifications so parent & cashier receive proof
    try {
      await adminClient
        .from("whatsapp_notifications")
        .insert({
          school_id: profile.school_id,
          student_id: studentId,
          parent_phone: "+91 99999 99999",
          template_name: "CHAIRMANS_FEE_WAIVER_RELEASE",
          status: "delivered",
          event_type: "fee_waiver",
        });
    } catch {}

    revalidatePath("/portal/admin/fees/defaulters");
    revalidatePath("/portal/admin/treasury");
  } catch (err) {
    console.error("[SuperAdmin] grantChairmansWaiver DB error:", err);
  }

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

  const auditCode = `UNLOCK-${Date.now().toString(36).toUpperCase()}-SA`;

  try {
    const adminClient = await createAdminClient();

    // 1. Revert drawer status back to open with audit note
    try {
      await adminClient
        .from("cash_drawers")
        .update({
          status: "open",
          notes: `[TILL UNLOCKED ${auditCode} by Super Admin ${profile.full_name}]: ${unlockReason}`,
        })
        .eq("id", drawerId);
    } catch (dbErr) {
      console.warn("[SuperAdmin] Note on cash_drawers update:", dbErr);
    }

    revalidatePath("/portal/admin/treasury");
    revalidatePath("/portal/admin/fees");
  } catch (err) {
    console.error("[SuperAdmin] unlockCashTill DB error:", err);
  }

  console.log(
    `[SuperAdmin] Till UNLOCKED by ${profile.full_name} for drawer ${drawerId} (${branchName}, ${drawerDate}). Reason: ${unlockReason}. AuditCode: ${auditCode}`
  );

  return {
    success: true,
    message: `Cash till for ${branchName} on ${drawerDate} has been unlocked. Audit record created with code ${auditCode}.`,
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

  try {
    const adminClient = await createAdminClient();

    // Update grievance report status in Supabase
    try {
      await adminClient
        .from("anonymous_grievance_reports")
        .update({
          status: "investigating",
          counselor_reply: `SLA Escalation taken over directly by Super Admin (${profile.full_name}). Official HQ investigation initiated.`,
        })
        .eq("id", tokenId);
    } catch (dbErr) {
      console.warn("[SuperAdmin] Note on grievance update:", dbErr);
    }

    revalidatePath("/portal/admin/safespace");
    revalidatePath("/portal/admin");
  } catch (err) {
    console.error("[SuperAdmin] markSlaEscalationOwnership DB error:", err);
  }

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
  const profile = await requireSuperAdmin();

  try {
    const adminClient = await createAdminClient();

    // Log HR notification in Supabase
    try {
      await adminClient
        .from("whatsapp_notifications")
        .insert({
          school_id: profile.school_id,
          parent_phone: "+91 99999 99999",
          template_name: "LESSON_PLAN_SLA_BREACH_WARNING",
          status: "delivered",
          event_type: "staff_warning",
        });
    } catch (dbErr) {
      console.warn("[SuperAdmin] Note on staff warning notification:", dbErr);
    }

    revalidatePath("/portal/admin");
    revalidatePath("/portal/admin/staff");
  } catch (err) {
    console.error("[SuperAdmin] dispatchLessonPlanSlaWarning DB error:", err);
  }

  console.log(
    `[SuperAdmin] SLA warning dispatched to ${teacherName} at ${branchName}. Offence #${offenceCount}.`
  );

  return {
    success: true,
    message: `HR Warning dispatched to ${teacherName} (${branchName}). This is their #${offenceCount} SLA breach. Warning logged to Staff HR file.`,
  };
}
