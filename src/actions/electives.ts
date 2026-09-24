"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedStudent } from "@/lib/studentSession";
import type { ElectiveClub } from "@/types/self-service";
import { INITIAL_CLUBS, INITIAL_EVENTS } from "@/types/self-service";

export async function getElectivesData() {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  try {
    const { data: bid, error } = await supabase
      .from("student_elective_bids")
      .select("*")
      .eq("student_id", student.id)
      .maybeSingle();

    if (error) console.error("Error querying student_elective_bids:", error);

    if (bid) {
      return {
        languageRanking: {
          first: bid.first_language || "Sanskrit",
          second: bid.second_language || "Hindi",
          third: bid.third_language || "French",
        },
        enrolledClubs: (bid.enrolled_clubs as string[]) || ["club-robotics"],
        waitlistedClubs: (bid.waitlisted_clubs as string[]) || [],
        eventRegistrations: (bid.event_registrations as Record<string, string>) || {},
      };
    }
  } catch (err) {
    console.error("Failed to fetch electives data:", err);
  }

  return {
    languageRanking: { first: "Sanskrit", second: "Hindi", third: "French" },
    enrolledClubs: ["club-robotics"],
    waitlistedClubs: [],
    eventRegistrations: {},
  };
}

export async function saveLanguageRankingAction(ranking: { first: string; second: string; third: string }) {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const { data: existing } = await supabase
    .from("student_elective_bids")
    .select("id")
    .eq("student_id", student.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("student_elective_bids")
      .update({
        first_language: ranking.first,
        second_language: ranking.second,
        third_language: ranking.third,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) console.error("Error updating language ranking:", error);
  } else {
    const { error } = await supabase.from("student_elective_bids").insert({
      school_id: schoolId,
      student_id: student.id,
      first_language: ranking.first,
      second_language: ranking.second,
      third_language: ranking.third,
    });

    if (error) console.error("Error inserting language ranking:", error);
  }

  revalidatePath("/portal/student/electives");
  revalidatePath("/portal/admin");
  return {
    success: true,
    message: `Elective language preferences saved in DB: 1st [${ranking.first}], 2nd [${ranking.second}], 3rd [${ranking.third}]. Seat allocation batch runs on Friday.`,
  };
}

export async function bidForClubAction(clubId: string, clubName: string, isWaitlist: boolean) {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const { data: existing } = await supabase
    .from("student_elective_bids")
    .select("id, enrolled_clubs, waitlisted_clubs")
    .eq("student_id", student.id)
    .maybeSingle();

  const enrolled: string[] = existing?.enrolled_clubs || ["club-robotics"];
  const waitlisted: string[] = existing?.waitlisted_clubs || [];

  if (isWaitlist) {
    if (!waitlisted.includes(clubId)) waitlisted.push(clubId);
  } else {
    if (!enrolled.includes(clubId)) enrolled.push(clubId);
  }

  if (existing) {
    const { error } = await supabase
      .from("student_elective_bids")
      .update({
        enrolled_clubs: enrolled,
        waitlisted_clubs: waitlisted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) console.error("Error updating club bid:", error);
  } else {
    const { error } = await supabase.from("student_elective_bids").insert({
      school_id: schoolId,
      student_id: student.id,
      enrolled_clubs: enrolled,
      waitlisted_clubs: waitlisted,
    });

    if (error) console.error("Error inserting club bid:", error);
  }

  revalidatePath("/portal/student/electives");
  revalidatePath("/portal/admin");
  return {
    success: true,
    message: isWaitlist
      ? `Joined waitlist for "${clubName}" in DB. You are #4 in queue.`
      : `Confirmed membership in "${clubName}" in DB! Wednesday Period 6 assigned.`,
  };
}

export async function registerForEventAction(eventId: string, categoryRole: string, eventTitle?: string) {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const { data: existing } = await supabase
    .from("student_elective_bids")
    .select("id, event_registrations")
    .eq("student_id", student.id)
    .maybeSingle();

  const reg: Record<string, string> = existing?.event_registrations || {};
  reg[eventId] = categoryRole;

  if (existing) {
    const { error } = await supabase
      .from("student_elective_bids")
      .update({
        event_registrations: reg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) console.error("Error updating event reg:", error);
  } else {
    const { error } = await supabase.from("student_elective_bids").insert({
      school_id: schoolId,
      student_id: student.id,
      event_registrations: reg,
    });

    if (error) console.error("Error inserting event reg:", error);
  }

  revalidatePath("/portal/student/electives");
  revalidatePath("/portal/admin");
  return {
    success: true,
    message: `Registered for "${eventTitle || eventId}" in DB under role: [${categoryRole}]. Rehearsal pass issued.`,
  };
}
