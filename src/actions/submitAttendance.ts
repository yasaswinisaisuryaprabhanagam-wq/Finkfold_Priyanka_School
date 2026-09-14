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
    const supabase = await createAdminClient();

    // 1. Find or create the attendance session for this class and date
    let sessionId: string;

    const { data: existingSession, error: checkErr } = await supabase
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
      const { data: prevRecs } = await supabase
        .from("attendance_records")
        .select("student_id, status")
        .eq("session_id", sessionId);

      if (prevRecs) {
        prevRecs.forEach((r) => {
          previousRecordsMap[r.student_id] = r.status;
        });
      }
    } else {
      const { data: newSession, error: sessErr } = await supabase
        .from("attendance_sessions")
        .insert({
          school_id: data.schoolId,
          class_id: data.classId,
          attendance_date: data.date,
          marked_by: data.userId,
        })
        .select("id")
        .single();

      if (sessErr || !newSession) {
        return { success: false, message: "Failed to create attendance session." };
      }
      sessionId = newSession.id;
    }

    // 2. Upsert attendance records in Supabase
    const recordsToInsert = data.records.map((r) => ({
      session_id: sessionId,
      student_id: r.studentId,
      status: r.status,
    }));

    const { error: recErr } = await supabase
      .from("attendance_records")
      .upsert(recordsToInsert, {
        onConflict: "session_id,student_id",
      });

    if (recErr) {
      console.warn("Upsert failed (possibly missing unique constraint), falling back to delete + insert:", recErr.message);
      await supabase
        .from("attendance_records")
        .delete()
        .eq("session_id", sessionId);

      const { error: insErr } = await supabase
        .from("attendance_records")
        .insert(recordsToInsert);

      if (insErr) {
        console.error("Failed to insert attendance records fallback:", insErr);
        return { success: false, message: "Failed to save attendance records." };
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

    if (eventsToDispatch.length > 0) {
      const targetStudentIds = eventsToDispatch.map((e) => e.studentId);

      // Fetch student and parent details
      const { data: studentsData, error: stuErr } = await supabase
        .from("students")
        .select("id, full_name, parent_name, parent_phone, consent_whatsapp")
        .in("id", targetStudentIds);

      // Fetch class details for the template
      const { data: classData } = await supabase
        .from("classes")
        .select("name, section")
        .eq("id", data.classId)
        .single();

      const classLabel = classData ? `${classData.name}-${classData.section}` : "";
      const webhookUrl = process.env.N8N_ATTENDANCE_WEBHOOK_URL;
      const webhookSecret = process.env.N8N_ATTENDANCE_WEBHOOK_SECRET;

      if (!stuErr && studentsData && webhookUrl) {
        const studentMap = new Map(studentsData.map((s) => [s.id, s]));

        const dispatchPromises = eventsToDispatch.map(async (event) => {
          const student = studentMap.get(event.studentId);
          if (!student || !student.parent_phone) return;

          const formattedPhone = normalizePhoneNumber(student.parent_phone);
          const parentName = student.parent_name || `Parent of ${student.full_name}`;

          // Note: n8n handles atomic insertion into whatsapp_notifications with "Prefer: resolution=ignore-duplicates"
          // We DO NOT pre-insert here so n8n's deduplication logic functions cleanly.
          try {
            const res = await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-finkfold-secret": webhookSecret || "-",
              },
              body: JSON.stringify({
                school_id: data.schoolId,
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
              const resData = await res.json().catch(() => null);
              if (resData?.status === "sent") {
                alertsDispatched++;
              }
            }
          } catch (err) {
            console.error("Failed to dispatch attendance event to n8n webhook:", err);
          }
        });

        await Promise.allSettled(dispatchPromises);
      }
    }

    return {
      success: true,
      message: "Attendance recorded successfully.",
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
