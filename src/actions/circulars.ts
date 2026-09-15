"use server";

import { getProfile } from "@/lib/auth";
import { insertCircular, removeCircular, CircularItem } from "@/lib/circularsStore";
import { revalidatePath } from "next/cache";

export async function addCircularAction(data: {
  title: string;
  category: string;
  urgent: boolean;
  description: string;
  publishDate?: string;
}): Promise<{ success: boolean; message: string; circular?: CircularItem }> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { success: false, message: "Unauthorized. Please sign in." };
    }

    if (!data.title || !data.description) {
      return { success: false, message: "Title and description are required." };
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const item = await insertCircular({
      school_id: profile.school_id,
      title: data.title.trim(),
      category: data.category || "General",
      urgent: !!data.urgent,
      description: data.description.trim(),
      publish_date: data.publishDate || todayDate,
      posted_by: profile.id,
    });

    revalidatePath("/portal/admin/circulars");
    revalidatePath("/portal/faculty/circulars");
    revalidatePath("/portal/student/circulars");

    return { success: true, message: "Circular published successfully!", circular: item };
  } catch (err: any) {
    console.error("addCircularAction error:", err);
    return { success: false, message: err?.message || "Failed to publish circular." };
  }
}

export async function deleteCircularAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { success: false, message: "Unauthorized." };
    }

    await removeCircular(id);

    revalidatePath("/portal/admin/circulars");
    revalidatePath("/portal/faculty/circulars");
    revalidatePath("/portal/student/circulars");

    return { success: true, message: "Circular removed successfully." };
  } catch (err: any) {
    console.error("deleteCircularAction error:", err);
    return { success: false, message: err?.message || "Failed to remove circular." };
  }
}
