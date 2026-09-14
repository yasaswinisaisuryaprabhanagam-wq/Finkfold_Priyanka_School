"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

/**
 * Sends a single test WhatsApp notification to a specified phone number
 * via the n8n webhook, without affecting any real attendance records.
 * Admin-only server action.
 */
export async function sendTestWhatsApp(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const profile = await getProfile();
  if (!profile || !["school_admin", "super_admin"].includes(profile.role)) {
    return { success: false, message: "Unauthorized" };
  }

  const phone = String(formData.get("phone") || "").replace(/\D/g, "");
  const parentName = String(formData.get("parent_name") || "Test Parent");
  const studentName = String(formData.get("student_name") || "Test Student");
  const classLabel = String(formData.get("class_label") || "10-A");

  if (phone.length !== 10 && phone.length !== 12) {
    return { success: false, message: "Enter a valid 10-digit mobile number" };
  }

  const formattedPhone = phone.length === 10 ? `+91${phone}` : `+${phone}`;
  const webhookUrl = process.env.N8N_ATTENDANCE_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_ATTENDANCE_WEBHOOK_SECRET;

  if (!webhookUrl) {
    return {
      success: false,
      message: "N8N_ATTENDANCE_WEBHOOK_URL is not configured in environment variables.",
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-finkfold-secret": webhookSecret || "-",
      },
      body: JSON.stringify({
        school_id: profile.school_id,
        session_id: null, // test — no real session
        student_id: "00000000-0000-0000-0000-000000000000", // sentinel test ID
        student_name: studentName,
        class_label: classLabel,
        event_type: "absent",
        attendance_date: today,
        parent_phone: formattedPhone,
        parent_name: parentName,
        is_test: true, // n8n can use this flag to skip DB write-back
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        success: false,
        message: `n8n webhook responded with status ${res.status}: ${body.slice(0, 200)}`,
      };
    }

    const responseData = await res.json().catch(() => null);
    return {
      success: true,
      message: `Test notification dispatched to ${formattedPhone}. n8n response: ${responseData?.status || "received"}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to reach n8n webhook: ${err?.message || "Network error"}`,
    };
  }
}

/**
 * Pings the n8n webhook health check endpoint.
 * Returns latency and connectivity status.
 */
export async function pingWebhook(): Promise<{
  reachable: boolean;
  latencyMs: number;
  configured: boolean;
  message: string;
}> {
  const profile = await getProfile();
  if (!profile || !["school_admin", "super_admin"].includes(profile.role)) {
    return { reachable: false, latencyMs: 0, configured: false, message: "Unauthorized" };
  }

  const webhookUrl = process.env.N8N_ATTENDANCE_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      reachable: false,
      latencyMs: 0,
      configured: false,
      message: "N8N_ATTENDANCE_WEBHOOK_URL not set in environment variables.",
    };
  }

  const start = Date.now();
  try {
    const res = await fetch(webhookUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    const latencyMs = Date.now() - start;
    return {
      reachable: true,
      latencyMs,
      configured: true,
      message: `Webhook reachable (HTTP ${res.status}) in ${latencyMs}ms`,
    };
  } catch (err: any) {
    return {
      reachable: false,
      latencyMs: Date.now() - start,
      configured: true,
      message: `Cannot reach webhook: ${err?.message || "Timeout or network error"}`,
    };
  }
}
