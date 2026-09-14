"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Mark a parent reply as handled (acknowledged by teacher).
 */
export async function acknowledgeParentReply(replyId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const profile = await getProfile();
  if (!profile) {
    return { success: false, message: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("parent_reply_log")
    .update({
      handled: true,
      handled_by: profile.id,
      handled_at: new Date().toISOString(),
    })
    .eq("id", replyId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/portal/faculty/messages");
  revalidatePath("/portal/faculty");
  return { success: true, message: "Reply acknowledged." };
}

/**
 * Mark a parent text reply as acknowledged AND update the attendance reason.
 */
export async function acknowledgeWithReason(
  replyId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const profile = await getProfile();
  if (!profile) {
    return { success: false, message: "Unauthorized" };
  }

  const supabase = await createAdminClient();

  // Get the reply log entry to find session + student
  const { data: reply, error: fetchErr } = await supabase
    .from("parent_reply_log")
    .select("student_id, session_id")
    .eq("id", replyId)
    .single();

  if (fetchErr || !reply) {
    return { success: false, message: "Reply not found." };
  }

  // Update attendance record if session exists
  if (reply.session_id && reply.student_id) {
    await supabase
      .from("attendance_records")
      .update({
        reason,
        parent_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("session_id", reply.session_id)
      .eq("student_id", reply.student_id)
      .eq("status", "absent");
  }

  // Mark reply as handled
  await supabase
    .from("parent_reply_log")
    .update({
      handled: true,
      handled_by: profile.id,
      handled_at: new Date().toISOString(),
      readable_reason: reason,
    })
    .eq("id", replyId);

  revalidatePath("/portal/faculty/messages");
  revalidatePath("/portal/faculty");
  return { success: true, message: `Reason set to "${reason}" and acknowledged.` };
}
