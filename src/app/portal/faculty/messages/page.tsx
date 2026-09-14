import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { redirect } from "next/navigation";
import ParentRepliesList from "@/components/ParentRepliesList";

export const metadata = {
  title: `Parent Messages | ${SCHOOL.name}`,
  description: "View and acknowledge parent WhatsApp replies.",
};

export default async function FacultyMessagesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createAdminClient();

  // Fetch all recent parent replies (last 30 days), unhandled first
  const { data: replies, error } = await supabase
    .from("parent_reply_log")
    .select(`
      id,
      school_id,
      student_id,
      session_id,
      from_phone,
      message_type,
      button_payload,
      message_body,
      readable_reason,
      handled,
      handled_at,
      created_at,
      students:student_id (full_name, class_id, classes:class_id (name, section))
    `)
    .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
    .order("handled", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  const unhandledCount = replies?.filter((r) => !r.handled).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b82f6 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 30%, #60a5fa 0%, transparent 50%)" }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Faculty Portal &middot; {SCHOOL.name}
            </div>
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              💬 Parent Messages
            </h1>
            <p className="text-white/60 text-sm">
              WhatsApp replies from parents — acknowledge absence reasons
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {unhandledCount > 0 ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/90 rounded-full text-xs font-bold text-white animate-pulse">
                🔴 {unhandledCount} Unhandled
              </span>
            ) : (
              <span className="badge badge-green">✓ All Handled</span>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-900">
            {replies?.length || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total Replies (30d)</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-rose-600">
            {unhandledCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Needs Review</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-emerald-600">
            {replies?.filter((r) => r.handled).length || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Acknowledged</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-blue-600">
            {replies?.filter((r) => r.message_type === "interactive").length || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Button Replies</div>
        </div>
      </div>

      {/* Reply list */}
      <ParentRepliesList
        replies={(replies || []).map((r: any) => ({
          id: r.id,
          from_phone: r.from_phone,
          message_type: r.message_type,
          button_payload: r.button_payload,
          message_body: r.message_body,
          readable_reason: r.readable_reason,
          handled: r.handled,
          handled_at: r.handled_at,
          created_at: r.created_at,
          student_name: r.students?.full_name || "Unknown Student",
          class_label: r.students?.classes
            ? `${r.students.classes.name}-${r.students.classes.section}`
            : "",
        }))}
      />
    </div>
  );
}
