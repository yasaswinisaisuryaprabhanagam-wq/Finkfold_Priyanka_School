import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/webhook/whatsapp-status
 *
 * Called by n8n AFTER it sends the WhatsApp message via Meta Cloud API.
 * n8n writes the delivery result back to Finkfold so the Audit Log shows real status.
 *
 * Expected body (from n8n):
 * {
 *   school_id:       "uuid",
 *   session_id:      "uuid",
 *   student_id:      "uuid",
 *   parent_phone:    "+91XXXXXXXXXX",
 *   event_type:      "absent" | "correction_to_present",
 *   attendance_date: "YYYY-MM-DD",
 *   template_name:   "school_absence_alert_v1",
 *   status:          "delivered" | "failed" | "pending",
 *   meta_message_id: "wamid.XXXX" (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Validate shared secret ───────────────────────────────
    const secret = req.headers.get("x-finkfold-secret");
    const expectedSecret = process.env.N8N_ATTENDANCE_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse body ───────────────────────────────────────────
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      school_id,
      session_id,
      student_id,
      parent_phone,
      event_type,
      attendance_date,
      template_name = "school_absence_alert_v1",
      status = "pending",
      meta_message_id = null,
    } = body;

    // ── 3. Validate required fields ────────────────────────────
    if (!school_id || !student_id || !attendance_date) {
      return NextResponse.json(
        { error: "Missing required fields: school_id, student_id, attendance_date" },
        { status: 400 }
      );
    }

    // ── 4. Upsert into whatsapp_notifications ──────────────────
    // Uses (session_id, student_id) as the natural dedup key.
    const adminClient = await createAdminClient();

    const { error: upsertErr } = await adminClient
      .from("whatsapp_notifications")
      .upsert(
        {
          school_id,
          session_id: session_id || null,
          student_id,
          parent_phone,
          event_type,
          attendance_date,
          template_name,
          status,
          meta_message_id,
        },
        {
          onConflict: "session_id,student_id",
          ignoreDuplicates: false, // update existing row with new status
        }
      );

    if (upsertErr) {
      // Fallback: plain insert (in case unique constraint not set up)
      const { error: insertErr } = await adminClient
        .from("whatsapp_notifications")
        .insert({
          school_id,
          session_id: session_id || null,
          student_id,
          parent_phone,
          event_type,
          attendance_date,
          template_name,
          status,
          meta_message_id,
        });

      if (insertErr) {
        console.error("[whatsapp-status] DB write failed:", insertErr.message);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, status }, { status: 200 });
  } catch (err) {
    console.error("[whatsapp-status] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/webhook/whatsapp-status
 * Health check — n8n can ping this to verify the route is live.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-finkfold-secret");
  const expectedSecret = process.env.N8N_ATTENDANCE_WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ status: "ok", authenticated: false });
  }

  return NextResponse.json({
    status: "ok",
    authenticated: true,
    service: "Finkfold WhatsApp Status Callback",
    version: "1.0",
    timestamp: new Date().toISOString(),
  });
}
