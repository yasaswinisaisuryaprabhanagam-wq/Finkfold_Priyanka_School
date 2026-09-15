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
      let webhookUrl = (
        process.env.N8N_ATTENDANCE_WEBHOOK_URL ||
        "https://finkfold.app.n8n.cloud/webhook/attendance"
      ).trim();
      // Normalize any test webhook URL to production webhook URL
      if (webhookUrl.includes("/webhook-test/")) {
        webhookUrl = webhookUrl.replace("/webhook-test/", "/webhook/");
      }
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
          const tplName = "finkfold_priyanka";

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
                template_name: tplName,
              }),
            });

            let n8nSuccess = false;
            let n8nErrDetail = "";

            if (res.ok) {
              try {
                const n8nJson = await res.json();
                if (n8nJson && n8nJson.status === "failed") {
                  n8nSuccess = false;
                  n8nErrDetail = "n8n reported delivery failure";
                } else {
                  n8nSuccess = true;
                }
              } catch {
                n8nSuccess = true;
              }
            } else {
              n8nErrDetail = await res.text().catch(() => `HTTP ${res.status}`);
            }

            if (n8nSuccess) {
              alertsDispatched++;
              await adminClient
                .from("whatsapp_notifications")
                .update({ status: "sent", updated_at: new Date().toISOString() })
                .eq("student_id", student.id)
                .eq("attendance_date", data.date)
                .eq("event_type", event.eventType);
            } else {
              console.warn(`[submitAttendance] n8n delivery unsuccessful (${n8nErrDetail}), engaging direct Meta failover...`);

              // ── Bulletproof Failover: Direct Meta WhatsApp Cloud API ────────
              const metaToken =
                process.env.META_WHATSAPP_ACCESS_TOKEN ||
                "EAAVQwyCZCZAL0BSV8hFJdNQ9ZAYZBB2qxfgZAo2Yy9JnS5gVAZBSv4ZC2sYQGNv3nYvnVasLBDidAX7IUelO3AIdy7uLnhno2jEnJAqFIbCF7BWFzeaGdBLZCdnMxRy5NtTTJDbgNwLvrxwfO6McbjOERyXxz9do3ZAT2551dcBxb6L0T20fkEbk5qDTcZBXJgLQZDZD";
              const metaPhoneId =
                process.env.META_PHONE_NUMBER_ID ||
                "1144602028740736";

              let directSuccess = false;
              let directMsgId: string | null = null;

              if (metaToken && metaPhoneId) {
                try {
                  const metaRes = await fetch(
                    `https://graph.facebook.com/v19.0/${metaPhoneId}/messages`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${metaToken}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: formattedPhone,
                        type: "template",
                        template: {
                          name: "finkfold_priyanka",
                          language: { code: "en" },
                          components: [
                            {
                              type: "body",
                              parameters: [
                                { type: "text", text: student.full_name },
                                { type: "text", text: data.date },
                              ],
                            },
                          ],
                        },
                      }),
                    }
                  );

                  if (metaRes.ok) {
                    const metaData = await metaRes.json();
                    directMsgId = metaData.messages?.[0]?.id || null;
                    directSuccess = true;
                    alertsDispatched++;
                  } else {
                    const metaErr = await metaRes.text().catch(() => "");
                    console.warn("[submitAttendance] Direct Meta fallback returned error:", metaErr);
                  }
                } catch (metaErr) {
                  console.error("[submitAttendance] Direct Meta failover error:", metaErr);
                }
              }

              if (directSuccess) {
                await adminClient
                  .from("whatsapp_notifications")
                  .update({
                    status: "delivered",
                    meta_message_id: directMsgId,
                    error_detail: `Delivered via direct Meta failover (${n8nErrDetail || `HTTP ${res.status}`})`,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("student_id", student.id)
                  .eq("attendance_date", data.date)
                  .eq("event_type", event.eventType);
              } else {
                let note = n8nErrDetail || `HTTP ${res.status}`;
                if (note.includes("Did you mean to make a GET request")) {
                  note = "n8n webhook node is configured for GET instead of POST";
                  webhookErrorMessage = "n8n Webhook is configured for GET instead of POST. Please change the webhook HTTP Method to POST in n8n Cloud.";
                } else if (res.status === 404) {
                  webhookErrorMessage = "n8n Webhook is currently inactive or not listening. Please toggle the workflow switch to Active in n8n Cloud.";
                } else {
                  webhookErrorMessage = `Webhook error (${note})`;
                }

                await adminClient
                  .from("whatsapp_notifications")
                  .update({
                    status: "failed",
                    error_detail: note,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("student_id", student.id)
                  .eq("attendance_date", data.date)
                  .eq("event_type", event.eventType);
              }
            }
          } catch (err) {
            console.error("Failed to dispatch attendance event:", err);
            webhookErrorMessage = "Could not connect to WhatsApp webhook service.";
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
