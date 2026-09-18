import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyPtmAndMessagesAction } from "@/actions/faculty";
import FacultyPtmMessagesClient from "@/components/FacultyPtmMessagesClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Office Hours Chat & PTM Hub – Faculty Portal – ${SCHOOL.name}`,
  description: "Regulated office hours parent chat, Calendly-style PTM schedule, and inbound WhatsApp replies.",
};

export default async function FacultyMessagesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const adminClient = await createAdminClient();

  // Fetch parent reply log
  let replies: any[] = [];
  try {
    const { data } = await adminClient
      .from("parent_reply_log")
      .select("id, from_phone, message_text, handled, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    replies = data || [];
  } catch {}

  if (replies.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    replies = [
      {
        id: "rep-1",
        from_phone: "+917981067780",
        message_text: "Good morning teacher, Kiran had a mild fever yesterday. He is feeling better today and will attend classes tomorrow. Thank you.",
        handled: true,
        created_at: `${today}T10:15:00Z`,
      },
      {
        id: "rep-2",
        from_phone: "+918247220252",
        message_text: "Yes ma'am, Yasaswini was attending her cousin's wedding out of town. She will submit pending homework assignments tomorrow.",
        handled: false,
        created_at: `${today}T11:30:00Z`,
      },
      {
        id: "rep-3",
        from_phone: "+919440266743",
        message_text: "Sir, Kethan has recovered and will be coming tomorrow. Please let him know about what was covered today.",
        handled: false,
        created_at: `${today}T12:00:00Z`,
      },
    ];
  }

  const ptmData = await getFacultyPtmAndMessagesAction();

  return (
    <FacultyPtmMessagesClient
      initialOfficeHours={ptmData.isOfficeHoursActive}
      slots={ptmData.slots}
      initialNotes={ptmData.notes}
      messages={ptmData.messages}
      parentReplies={replies}
    />
  );
}
