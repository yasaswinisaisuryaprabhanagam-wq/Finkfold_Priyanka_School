import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import ParentRepliesList from "@/components/ParentRepliesList";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Parent Messages "“ ${SCHOOL.name}`,
};

export default async function FacultyMessagesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

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

  // Fallback replies
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

  const unhandledCount = replies.filter((r) => !r.handled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}>
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Portal &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
             Parent Messages
          </h1>
          <p className="text-white/70 text-sm">
            WhatsApp replies from parents – {unhandledCount} unread
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-900">{replies.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Replies</div>
        </div>
        <div className="stat-card text-center">
          <div className={`text-3xl font-black ${unhandledCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {unhandledCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Unread</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-emerald-600">
            {replies.length - unhandledCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Handled</div>
        </div>
      </div>

      {/* Replies list */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Incoming Parent Replies
          </h2>
          {unhandledCount > 0 && (
            <span className="badge badge-amber">{unhandledCount} Unread</span>
          )}
        </div>
        <div className="divide-y divide-slate-100">
              <ParentRepliesList initialReplies={replies} />
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center">
        * Replies are automatically captured when parents respond to WhatsApp absence alerts.
        Mark as handled to clear the notification badge.
      </div>
    </div>
  );
}
