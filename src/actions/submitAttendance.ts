"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  classId: z.string(),
  schoolId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  userId: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["present", "absent"]),
    })
  ),
});

/**
 * Normalizes phone numbers to E.164 (+91XXXXXXXXXX) format required by n8n and Meta WhatsApp Cloud API.
 */
function normalizePhoneNumber(phone: string): string {
  let cleaned = String(phone || "").replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
  if (cleaned.length === 10) cleaned = "+91" + cleaned;
  if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = "+" + cleaned;
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return cleaned;
}

export async function submitAttendance(input: unknown) {
  try {
    const data = schema.parse(input);
    const adminClient = await createAdminClient();

    // ── Database-Level Security & Authentication Gate ───────────────
    const { createClient } = await import("@/lib/supabase/server");
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized: Please sign in with your faculty account.",
      };
    }

    // Fetch verified profile from database
    const { data: profile, error: profErr } = await adminClient
      .from("profiles")
      .select("id, school_id, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile) {
      return {
        success: false,
        message: "Unauthorized: Faculty profile not found in database.",
      };
    }

    if (
      profile.role !== "teacher" &&
      profile.role !== "school_admin" &&
      profile.role !== "super_admin"
    ) {
      return {
        success: false,
        message: "Forbidden: Only faculty and administrators can mark attendance.",
      };
    }

    const authenticatedUserId = profile.id;
    const schoolId = profile.school_id;

    // Verify class belongs to verified school
    const { data: classRecord, error: classErr } = await adminClient
      .from("classes")
      .select("id, name, section, school_id")
      .eq("id", data.classId)
      .eq("school_id", schoolId)
      .maybeSingle();

    if (classErr || !classRecord) {
      return {
        success: false,
        message: "Invalid class: Specified class does not exist in your institution.",
      };
    }

    // 1. Find or create the attendance session for this class and date
    let sessionId: string;

    const { data: existingSession, error: checkErr } = await adminClient
      .from("attendance_sessions")
      .select("id")
      .eq("class_id", data.classId)
      .eq("attendance_date", data.date)
      .maybeSingle();

    if (checkErr) {
      return { success: false, message: "Database error checking attendance session." };
    }

    // Check existing records to detect corrections (e.g. absent -> present)
    let previousRecordsMap: Record<string, string> = {};
    if (existingSession) {
      sessionId = existingSession.id;
      const { data: prevRecs } = await adminClient
        .from("attendance_records")
        .select("student_id, status")
        .eq("session_id", sessionId);

      if (prevRecs) {
        prevRecs.forEach((r) => {
          previousRecordsMap[r.student_id] = r.status;
        });
      }
    } else {
      const { data: newSession, error: sessErr } = await adminClient
        .from("attendance_sessions")
        .insert({
          school_id: schoolId,
          class_id: data.classId,
          attendance_date: data.date,
          marked_by: authenticatedUserId,
        })
        .select("id")
        .single();

      if (sessErr || !newSession) {
        console.error("Failed to create attendance session:", sessErr);
        return { success: false, message: "Failed to create attendance session in database." };
      }
      sessionId = newSession.id;
    }

    // 2. Upsert attendance records in Supabase
    const recordsToInsert = data.records.map((r) => ({
      session_id: sessionId,
      student_id: r.studentId,
      status: r.status,
    }));

    const { error: recErr } = await adminClient
      .from("attendance_records")
      .upsert(recordsToInsert, {
        onConflict: "session_id,student_id",
      });

    if (recErr) {
      console.warn(
        "Upsert failed, falling back to delete + insert:",
        recErr.message
      );
      await adminClient
        .from("attendance_records")
        .delete()
        .eq("session_id", sessionId);

      const { error: insErr } = await adminClient
        .from("attendance_records")
        .insert(recordsToInsert);

      if (insErr) {
        console.error("Failed to insert attendance records fallback:", insErr);
        return { success: false, message: "Failed to save attendance records in database." };
      }
    }

    // 3. Determine notifications to send:
    // - Absent students: event_type = "absent"
    // - Corrected students (was previously absent, now marked present): event_type = "correction_to_present"
    const eventsToDispatch: { studentId: string; eventType: "absent" | "correction_to_present" }[] = [];

    data.records.forEach((r) => {
      const prevStatus = previousRecordsMap[r.studentId];
      if (r.status === "absent") {
        eventsToDispatch.push({ studentId: r.studentId, eventType: "absent" });
      } else if (r.status === "present" && prevStatus === "absent") {
        eventsToDispatch.push({ studentId: r.studentId, eventType: "correction_to_present" });
      }
    });

    let alertsDispatched = 0;
    const absentCount = data.records.filter((r) => r.status === "absent").length;
    let webhookErrorMessage = "";

    if (eventsToDispatch.length > 0) {
      const targetStudentIds = eventsToDispatch.map((e) => e.studentId);

      // Fetch student and parent details
      const { data: studentsData, error: stuErr } = await adminClient
        .from("students")
        .select("id, full_name, parent_name, parent_phone, consent_whatsapp")
        .in("id", targetStudentIds);

      const classLabel = `${classRecord.name}-${classRecord.section}`;
      const webhookUrl =
        process.env.N8N_ATTENDANCE_WEBHOOK_URL ||
        "https://finkfold.app.n8n.cloud/webhook/attendance";
      const webhookSecret =
        process.env.N8N_ATTENDANCE_WEBHOOK_SECRET ||
        "finkfold_priyanka_2026";

      if (!stuErr && studentsData && webhookUrl) {
        const studentMap = new Map(studentsData.map((s) => [s.id, s]));

        const dispatchPromises = eventsToDispatch.map(async (event) => {
          const student = studentMap.get(event.studentId);
          if (!student || !student.parent_phone) return;

          const formattedPhone = normalizePhoneNumber(student.parent_phone);
          const parentName = student.parent_name || `Parent of ${student.full_name}`;
          const tplName = event.eventType === "absent" ? "school_absence_alert_v1" : "school_correction_v1";

          // Log in whatsapp_notifications table in Supabase
          try {
            await adminClient
              .from("whatsapp_notifications")
              .upsert(
                {
                  school_id: schoolId,
                  session_id: sessionId,
                  student_id: student.id,
                  attendance_date: data.date,
                  event_type: event.eventType,
                  parent_phone: formattedPhone,
                  template_name: tplName,
                  status: "pending",
                  attempt_count: 1,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "student_id,attendance_date,event_type" }
              );
          } catch (logErr) {
            console.warn("Failed to write pending log to whatsapp_notifications:", logErr);
          }

          try {
            const res = await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-finkfold-secret": webhookSecret,
              },
              body: JSON.stringify({
                school_id: schoolId,
                session_id: sessionId,
                student_id: student.id,
                student_name: student.full_name,
                class_label: classLabel,
                event_type: event.eventType,
                attendance_date: data.date,
                parent_phone: formattedPhone,
                parent_name: parentName,
              }),
            });

            if (res.ok) {
              alertsDispatched++;
              await adminClient
                .from("whatsapp_notifications")
                .update({ status: "sent", updated_at: new Date().toISOString() })
                .eq("session_id", sessionId)
                .eq("student_id", student.id)
                .eq("event_type", event.eventType);
            } else {
              const errTxt = await res.text().catch(() => "");
              console.warn(`[submitAttendance] Webhook returned status ${res.status}:`, errTxt);

              let note = `HTTP ${res.status}`;
              if (errTxt.includes("Did you mean to make a GET request")) {
                note = "n8n webhook node is configured for GET instead of POST";
                webhookErrorMessage = "n8n Webhook is configured for GET instead of POST. Please change the webhook HTTP Method to POST in n8n Cloud.";
              } else {
                webhookErrorMessage = `Webhook error (HTTP ${res.status})`;
              }

              await adminClient
                .from("whatsapp_notifications")
                .update({
                  status: "failed",
                  error_detail: note,
                  updated_at: new Date().toISOString(),
                })
                .eq("session_id", sessionId)
                .eq("student_id", student.id)
                .eq("event_type", event.eventType);
            }
          } catch (err) {
            console.error("Failed to dispatch attendance event to n8n webhook:", err);
            webhookErrorMessage = "Could not connect to n8n webhook service.";
          }
        });

        await Promise.allSettled(dispatchPromises);
      }
    }

    let resultMessage = "Attendance recorded successfully in database.";
    if (absentCount > 0) {
      if (alertsDispatched > 0) {
        resultMessage = `Attendance saved. Dispatched ${alertsDispatched} WhatsApp alert(s) to parents.`;
      } else if (webhookErrorMessage) {
        resultMessage = `Attendance saved in database. Notice: ${webhookErrorMessage}`;
      }
    }

    return {
      success: true,
      message: resultMessage,
      absentCount,
      alertsDispatched,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Invalid attendance payload.",
    };
  }
}
