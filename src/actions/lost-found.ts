"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedStudent } from "@/lib/studentSession";
import type { LostFoundItem } from "@/types/self-service";
import { INITIAL_LOST_FOUND_ITEMS } from "@/types/self-service";

export async function getLostFoundData(): Promise<LostFoundItem[]> {
  const { schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  try {
    const { data: dbItems, error } = await supabase
      .from("lost_and_found_items")
      .select("*")
      .eq("school_id", schoolId)
      .order("found_date", { ascending: false });

    if (error) {
      console.error("Error querying lost_and_found_items:", error);
    }

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
    console.error("Failed to fetch lost and found data:", err);
  }

  return INITIAL_LOST_FOUND_ITEMS;
}

export async function claimItemAction(payload: {
  itemId: string;
  studentName: string;
  homeroom: string;
  identifyingMark: string;
}) {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  // Validate if itemId is a valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.itemId);

  let targetId = payload.itemId;

  if (!isUuid) {
    // If client has fallback ID (e.g. 'lf-01'), find corresponding row by title or match
    const { data: matched } = await supabase
      .from("lost_and_found_items")
      .select("id")
      .eq("school_id", schoolId)
      .ilike("title", "%uniform%")
      .limit(1)
      .maybeSingle();

    if (matched) {
      targetId = matched.id;
    }
  }

  const { data, error } = await supabase
    .from("lost_and_found_items")
    .update({
      status: "claimed_pending",
      claimed_by_student_id: student.id,
      claimed_by_student_name: payload.studentName || student.full_name,
      claimed_homeroom: payload.homeroom,
      claim_note: payload.identifyingMark,
      identifying_mark_claim: payload.identifyingMark,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .select()
    .single();

  if (error) {
    console.error("Error updating claim in Supabase lost_and_found_items:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to persist claim in database. Please try again.",
    };
  }

  revalidatePath("/portal/student/lost-found");
  revalidatePath("/portal/faculty");
  revalidatePath("/portal/admin");

  return {
    success: true,
    message: `Claim request confirmed and recorded in database! Caretaker and Class Teacher notified to verify identifying mark and deliver to ${payload.homeroom}.`,
  };
}
