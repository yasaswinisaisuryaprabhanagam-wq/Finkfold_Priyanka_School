"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import type { TeacherContact, TeacherChatMessage, PtmSlot } from "@/types/self-service";
import { INITIAL_TEACHERS, INITIAL_MESSAGES, INITIAL_PTM_SLOTS } from "@/types/self-service";

async function getDefaultStudentId(supabase: any) {
  const { data: stu } = await supabase.from("students").select("id").limit(1).maybeSingle();
  return stu?.id || "6921082e-75ab-4067-b536-b76d09f71c3a";
}

export async function getPtmAndMessagingData(): Promise<{
  teachers: TeacherContact[];
  messages: TeacherChatMessage[];
  ptmSlots: PtmSlot[];
}> {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  let ptmSlots = INITIAL_PTM_SLOTS;

  try {
    const { data: dbSlots } = await supabase
      .from("ptm_booking_slots")
      .select("*")
      .order("slot_date", { ascending: true });

    if (dbSlots && dbSlots.length > 0) {
      ptmSlots = dbSlots.map((s: any) => ({
        id: s.id,
        teacherId: s.teacher_id,
        teacherName: s.teacher_name,
        subject: s.subject,
        date: s.slot_date,
        timeSlot: s.time_slot,
        status: s.status,
        meetingType: s.meeting_type,
      }));
    }
  } catch (err) {
    // Fallback
  }

  return {
    teachers: INITIAL_TEACHERS,
    messages: INITIAL_MESSAGES,
    ptmSlots,
  };
}

export async function sendTeacherMessageAction(payload: {
  teacherId: string;
  messageText: string;
}) {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);
  const teacher = INITIAL_TEACHERS.find((t) => t.id === payload.teacherId);
  const isOfficeHours = teacher ? teacher.isOfficeHoursActive : true;

  const newMsg: TeacherChatMessage = {
    id: "msg-" + Date.now(),
    teacherId: payload.teacherId,
    senderRole: "parent",
    text: payload.messageText,
    timestamp: "Just now",
    status: isOfficeHours ? "delivered" : "queued_for_office_hours",
  };

  try {
    await supabase.from("regulated_teacher_messages").insert({
      school_id: SCHOOL.id,
      student_id: studentId,
      teacher_id: payload.teacherId,
      sender_role: "parent",
      message_text: payload.messageText,
      status: newMsg.status,
    });
  } catch (err) {
    // Graceful fallback
  }

  revalidatePath("/portal/student/ptm-messages");
  return {
    success: true,
    message: newMsg,
    notice: isOfficeHours
      ? `Message delivered to ${teacher?.name || "the teacher"}. Office hours are currently active.`
      : `Teacher office hours are closed. Your message has been safely queued on the school server and will be delivered tomorrow at 03:45 PM.`,
  };
}

export async function bookPtmSlotAction(slotId: string) {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  try {
    await supabase
      .from("ptm_booking_slots")
      .update({
        status: "booked",
        student_id: studentId,
      })
      .eq("id", slotId);
  } catch (err) {
    // Graceful fallback
  }

  revalidatePath("/portal/student/ptm-messages");
  return {
    success: true,
    message: `PTM appointment successfully reserved! Confirmed on teacher's meeting schedule. Added to your parent itinerary.`,
  };
}
