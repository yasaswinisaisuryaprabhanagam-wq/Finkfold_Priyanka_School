import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Normalizes phone numbers to standard formats for matching against the database.
 */
function normalizePhone(phone: string): { e164: string; national: string; last10: string } {
  const digits = String(phone || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  const national = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  const e164 = "+91" + last10;
  return { e164, national: last10, last10 };
}

/**
 * Maps Meta button payloads or titles into standardized school reason labels.
 */
function mapReason(reasonPayload?: string | null, messageBody?: string | null): string {
  const p = (reasonPayload || "").toUpperCase();
  const b = (messageBody || "").toLowerCase();

  if (p === "REASON_SICK" || p.includes("SICK") || b.includes("sick") || b.includes("fever") || b.includes("health")) {
    return "Sick Leave";
  }
  if (p === "REASON_FAMILY" || p.includes("FAMILY") || b.includes("family") || b.includes("function") || b.includes("wedding")) {
    return "Family Event";
  }
  if (p === "REASON_OTHER" || p.includes("OTHER")) {
    return messageBody && messageBody !== "Other" ? messageBody : "Other (Parent marked via WhatsApp)";
  }
  if (messageBody && messageBody.trim().length > 0) {
    return messageBody.trim();
  }
  return "Acknowledged by Parent";
}

/**
 * POST /api/whatsapp-reply
 *
 * Webhook endpoint invoked by n8n when an inbound WhatsApp message or button reply arrives from a parent.
 * Reconciles absence records in Supabase and updates the parent reply audit log.
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Authenticate n8n request ─────────────────────────────
    const secret = req.headers.get("x-finkfold-secret");
    const expectedSecret =
      process.env.N8N_ATTENDANCE_WEBHOOK_SECRET ||
      process.env.N8N_WEBHOOK_SECRET ||
      "finkfold_priyanka_2026";

    if (!secret || secret !== expectedSecret) {
      console.warn("[whatsapp-reply] Unauthorized attempt: secret mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse payload ─────────────────────────────────────────
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      parentPhone,
      messageType = "interactive",
      reasonPayload = null,
      messageBody = null,
      metaMessageId = null,
      date = null,
    } = body;

    if (!parentPhone) {
      return NextResponse.json({ error: "Missing required field: parentPhone" }, { status: 400 });
    }

    const phoneVariants = normalizePhone(parentPhone);
    const readableReason = mapReason(reasonPayload, messageBody);
    const isInteractive = messageType === "interactive" || Boolean(reasonPayload);

    // If interactive button click, it's auto-handled. If freeform text, requires teacher acknowledgment.
    const isHandled = isInteractive;

    const supabase = await createAdminClient();

    // ── 3. Find students linked to this parent phone ─────────────
    // Query matching +91XXXXXXXXXX or 10-digit format
    const { data: students, error: stuErr } = await supabase
      .from("students")
      .select("id, full_name, class_id, parent_phone")
      .or(`parent_phone.eq.${phoneVariants.e164},parent_phone.eq.${phoneVariants.last10},parent_phone.ilike.%${phoneVariants.last10}`);

    if (stuErr) {
      console.error("[whatsapp-reply] Student lookup error:", stuErr);
    }

    let updatedRecordsCount = 0;
    const matchedStudentIds = (students || []).map((s) => s.id);

    // ── 4. Reconcile attendance record ───────────────────────────
    if (matchedStudentIds.length > 0) {
      // Find today's (or recent) absent records for these students
      const targetDate = date || new Date().toISOString().slice(0, 10);

      // Find active sessions for today or latest
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("attendance_date", targetDate);

      const sessionIds = (sessions || []).map((s) => s.id);

      let recordQuery = supabase
        .from("attendance_records")
        .update({
          reason: readableReason,
          parent_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .in("student_id", matchedStudentIds)
        .eq("status", "absent");

      if (sessionIds.length > 0) {
        recordQuery = recordQuery.in("session_id", sessionIds);
      }

      const { data: updatedRecs, error: updateErr } = await recordQuery.select("id, student_id");

      if (updateErr) {
        console.error("[whatsapp-reply] Attendance update error:", updateErr);
      } else {
        updatedRecordsCount = updatedRecs?.length || 0;
      }
    }

    // ── 5. Insert into parent_reply_log ──────────────────────────
    const displayMessage = isInteractive
      ? `Interactive Button Tapped: ${readableReason}`
      : messageBody || `Text reply: ${readableReason}`;

    const { error: logErr } = await supabase.from("parent_reply_log").insert({
      from_phone: phoneVariants.e164,
      message_text: displayMessage,
      handled: isHandled,
    });

    if (logErr) {
      console.error("[whatsapp-reply] Log insertion error:", logErr);
    }

    // ── 6. Revalidate portal caches ──────────────────────────────
    try {
      revalidatePath("/portal/faculty");
      revalidatePath("/portal/faculty/messages");
      revalidatePath("/dashboard");
    } catch {}

    return NextResponse.json({
      success: true,
      matched: matchedStudentIds.length,
      recordsUpdated: updatedRecordsCount,
      autoHandled: isHandled,
      reason: readableReason,
      message: updatedRecordsCount > 0
        ? `Reconciled ${updatedRecordsCount} absence record(s) for reason "${readableReason}".`
        : `Logged reply from ${phoneVariants.e164}.`,
    });
  } catch (err) {
    console.error("[whatsapp-reply] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
