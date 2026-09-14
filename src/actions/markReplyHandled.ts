"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markReplyHandled(replyId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const { createAdminClient } = await import("@/lib/supabase/server");
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from("parent_reply_log")
      .update({
        handled: true,
        handled_by: user.id,
      })
      .eq("id", replyId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update reply status",
    };
  }
}
