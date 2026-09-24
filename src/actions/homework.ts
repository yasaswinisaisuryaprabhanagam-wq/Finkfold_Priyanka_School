"use server";

import { getProfile } from "@/lib/auth";
import { insertHomework, removeHomework, getHomeworkList, HomeworkItem } from "@/lib/homeworkStore";
import { revalidatePath } from "next/cache";

export async function addHomeworkAction(data: {
  classId: string;
  subject: string;
  task: string;
  dueDate: string;
}): Promise<{ success: boolean; message: string; homework?: HomeworkItem }> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    if (!data.classId || !data.subject || !data.task || !data.dueDate) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const item = await insertHomework({
      school_id: profile.school_id,
      class_id: data.classId,
      subject: data.subject.trim(),
      task: data.task.trim(),
      due_date: data.dueDate,
      assigned_by: profile.id,
    });

    revalidatePath("/portal/faculty/homework");
    revalidatePath("/portal/admin/homework");
    revalidatePath("/portal/student/homework");

    return { success: true, message: "Homework published successfully!", homework: item };
  } catch (err: any) {
    console.error("addHomeworkAction error:", err);
    return { success: false, message: err?.message || "Failed to publish homework." };
  }
}

export async function deleteHomeworkAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { success: false, message: "Unauthorized." };
    }

    await removeHomework(id);

    revalidatePath("/portal/faculty/homework");
    revalidatePath("/portal/admin/homework");
    revalidatePath("/portal/student/homework");

    return { success: true, message: "Homework deleted successfully." };
  } catch (err: any) {
    console.error("deleteHomeworkAction error:", err);
    return { success: false, message: err?.message || "Failed to delete homework." };
  }
}

export async function saveHomeworkVerificationsAction(
  homeworkId: string,
  verifications: import("@/lib/homeworkStore").HomeworkVerification[]
): Promise<{ success: boolean; message: string }> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { success: false, message: "Unauthorized." };
    }

    const { saveHomeworkVerifications } = await import("@/lib/homeworkStore");
    await saveHomeworkVerifications(homeworkId, verifications);

    revalidatePath("/portal/faculty/homework");
    revalidatePath("/portal/student/homework");
    revalidatePath("/portal/admin/homework");
    revalidatePath("/portal/admin");

    return {
      success: true,
      message: `Successfully recorded ${verifications.length} notebook verifications. Student portals and parent alerts updated in real-time.`,
    };
  } catch (err: any) {
    console.error("saveHomeworkVerificationsAction error:", err);
    return { success: false, message: err?.message || "Failed to save verifications." };
  }
}

