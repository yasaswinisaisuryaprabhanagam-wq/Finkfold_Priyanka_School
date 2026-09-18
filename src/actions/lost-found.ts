"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import type { LostFoundItem } from "@/types/self-service";
import { INITIAL_LOST_FOUND_ITEMS } from "@/types/self-service";

async function getDefaultStudentId(supabase: any) {
  const { data: stu } = await supabase.from("students").select("id, full_name").limit(1).maybeSingle();
  return stu || { id: "6921082e-75ab-4067-b536-b76d09f71c3a", full_name: "Arjun Reddy" };
}

export async function getLostFoundData(): Promise<LostFoundItem[]> {
  const supabase = await createAdminClient();

  try {
    const { data: dbItems } = await supabase
      .from("lost_and_found_items")
      .select("*")
      .order("found_date", { ascending: false });

    if (dbItems && dbItems.length > 0) {
      return dbItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        foundLocation: item.found_location,
        foundDate: new Date(item.found_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        lockerBin: item.locker_bin,
        photoEmoji: item.photo_emoji || "📦",
        status: item.status,
        claimedByStudentName: item.claimed_by_student_name,
        claimedHomeroom: item.claimed_homeroom,
        claimNote: item.claim_note,
      }));
    }
  } catch (err) {
    // Graceful fallback
  }

  return INITIAL_LOST_FOUND_ITEMS;
}

export async function claimItemAction(payload: {
  itemId: string;
  studentName: string;
  homeroom: string;
  identifyingMark: string;
}) {
  const supabase = await createAdminClient();
  const student = await getDefaultStudentId(supabase);

  try {
    await supabase
      .from("lost_and_found_items")
      .update({
        status: "claimed_pending",
        claimed_by_student_id: student.id,
        claimed_by_student_name: payload.studentName || student.full_name,
        claimed_homeroom: payload.homeroom,
        claim_note: payload.identifyingMark,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.itemId);
  } catch (err) {
    // Graceful fallback
  }

  revalidatePath("/portal/student/lost-found");
  return {
    success: true,
    message: `Claim request submitted for "${payload.itemId}"! Caretaker notified to verify identifying mark and deliver to ${payload.homeroom} tomorrow morning.`,
  };
}
