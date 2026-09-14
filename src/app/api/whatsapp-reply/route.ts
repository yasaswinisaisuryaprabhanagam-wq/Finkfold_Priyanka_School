import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Reason payload map — matches Meta Interactive Quick Reply button payloads
 * to human-readable reasons stored in the database.
 */
const REASON_MAP: Record<string, string> = {
  REASON_SICK: "Sick Leave",
  REASON_FAMILY: "Family Event",
  REASON_OTHER: "Other",
};

/**
 * POST /api/whatsapp-reply
 *
 * Called by n8n when a parent taps a Quick Reply button or sends a text reply.
 * This is the "Reconciler" — it:
 *  1. Identifies the student linked to the parent phone
 *  2. Updates the attendance_record with reason + acknowledged flag
 *  3. Logs the raw reply in parent_reply_log for audit
 *
 * Expected body (from n8n):
 * {
 *   parentPhone:    "+91XXXXXXXXXX",
 *   messageType:    "interactive" | "text",
 *   reasonPayload:  "REASON_SICK" | "REASON_FAMILY" | "REASON_OTHER" (for interactive),
 *   messageBody:    "We missed the bus" (for text replies),
 *   date:           "YYYY-MM-DD" (optional — defaults to today),
 *   metaMessageId:  "wamid.XXXX" (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Authenticate ─────────────────────────────────────────
    const secret = req.headers.get("x-finkfold-secret");
    const expectedSecret = process.env.N8N_ATTENDANCE_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse body ───────────────────────────────────────────
    const body = await req.json();
    const {
      parentPhone,
      messageType = "interactive",
      reasonPayload,
      messageBody,
      date,
      metaMessageId,
    } = body;

    if (!parentPhone) {
      return NextResponse.json(
        { error: "Missing required field: parentPhone" },
        { status: 400 }
      );
    }

    // Normalize phone for matching
    const normalizedPhone = normalizeForMatch(parentPhone);

    // Map payload to readable reason
    const readableReason =
      messageType === "interactive" && reasonPayload
        ? REASON_MAP[reasonPayload] || reasonPayload
        : messageBody
          ? `Parent reply: ${messageBody.slice(0, 200)}`
          : "Unknown";

    // Is this an auto-handled button tap or a text needing manual review?
    const isAutoHandled =
      messageType === "interactive" &&
      reasonPayload &&
      reasonPayload !== "REASON_OTHER";

    const supabase = await createAdminClient();

    // ── 3. Find students linked to this parent phone ────────────
    // Try exact match first, then normalized match
    const { data: students, error: stuErr } = await supabase
      .from("students")
      .select("id, full_name, class_id, school_id")
      .or(`parent_phone.eq.${parentPhone},parent_phone.eq.${normalizedPhone},parent_phone.eq.${parentPhone.replace("+", "")}`);

    if (stuErr || !students || students.length === 0) {
      // Log the reply even if we can't match a student
      await supabase.from("parent_reply_log").insert({
        from_phone: parentPhone,
        message_type: messageType,
        button_payload: reasonPayload || null,
        message_body: messageBody || `Button: ${reasonPayload}`,
        readable_reason: readableReason,
        handled: false,
        meta_message_id: metaMessageId || null,
      });

      return NextResponse.json({
        matched: false,
        message: "No student found for this phone number. Reply logged for manual review.",
      });
    }

    const studentIds = students.map((s) => s.id);
    const schoolId = students[0].school_id;

    // ── 4. Find today's attendance session ──────────────────────
    const targetDate = date || new Date().toISOString().slice(0, 10);

    // Get class IDs for matched students
    const classIds = [...new Set(students.map((s) => s.class_id).filter(Boolean))];

    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select("id")
      .in("class_id", classIds)
      .eq("attendance_date", targetDate);

    const sessionIds = sessions?.map((s) => s.id) || [];

    // ── 5. Update attendance records with reason ────────────────
    let recordsUpdated = 0;

    if (sessionIds.length > 0 && isAutoHandled) {
      const { data: updated, error: updateErr } = await supabase
        .from("attendance_records")
        .update({
          reason: readableReason,
          parent_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .in("session_id", sessionIds)
        .in("student_id", studentIds)
        .eq("status", "absent")
        .select("id");

      if (!updateErr && updated) {
        recordsUpdated = updated.length;
      }
    }

    // ── 6. Log to parent_reply_log ──────────────────────────────
    // One log entry per matched student
    const logInserts = students.map((s) => ({
      school_id: schoolId,
      student_id: s.id,
      session_id: sessionIds[0] || null,
      from_phone: parentPhone,
      message_type: messageType,
      button_payload: reasonPayload || null,
      message_body:
        messageType === "text"
          ? messageBody
          : `Button tapped: ${readableReason}`,
      readable_reason: readableReason,
      handled: isAutoHandled,
      meta_message_id: metaMessageId || null,
    }));

    await supabase.from("parent_reply_log").insert(logInserts);

    return NextResponse.json({
      success: true,
      matched: true,
      studentsFound: students.length,
      recordsUpdated,
      autoHandled: isAutoHandled,
      reason: readableReason,
      message: isAutoHandled
        ? `Attendance updated: ${readableReason} for ${students.map((s) => s.full_name).join(", ")}`
        : "Reply logged. Teacher will review.",
    });
  } catch (err: any) {
    console.error("[whatsapp-reply] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp-reply
 * Health check endpoint for n8n to verify the route is live.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Finkfold WhatsApp Reply Reconciler",
    version: "1.0",
    features: ["interactive_buttons", "text_replies", "auto_acknowledge"],
  });
}

/**
 * Normalizes phone numbers for matching in various formats stored in DB.
 */
function normalizeForMatch(phone: string): string {
  let cleaned = String(phone).replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
  if (cleaned.length === 10) cleaned = "+91" + cleaned;
  if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = "+" + cleaned;
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return cleaned;
}
