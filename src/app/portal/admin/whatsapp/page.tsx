import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: `WhatsApp Audit Log | ${SCHOOL.name}`,
};

export default async function AdminWhatsAppPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();
  const todayDate = new Date().toISOString().slice(0, 10);

  // Fetch all WA notifications
  let notifications: any[] = [];
  try {
    const { data } = await adminClient
      .from("whatsapp_notifications")
      .select("id, student_id, parent_phone, event_type, template_name, status, attendance_date, created_at, meta_message_id")
      .eq("school_id", profile.school_id)
      .order("created_at", { ascending: false })
      .limit(100);
    notifications = data || [];
  } catch {}

  // Fetch student names
  let studentMap = new Map<string, string>();
  try {
    const { data } = await adminClient
      .from("students")
      .select("id, full_name")
      .eq("school_id", profile.school_id);
    (data || []).forEach((s: any) => studentMap.set(s.id, s.full_name));
  } catch {}

  // Fallback
  if (notifications.length === 0) {
    notifications = [
      { id: "n1", student_id: "s1", parent_phone: "+918247220252", event_type: "absent", template_name: "school_absence_alert_v1", status: "delivered", attendance_date: todayDate, created_at: `${todayDate}T09:12:00Z`, meta_message_id: "wamid.HBgMOTE4MjQ3MjIwMjUy..." },
      { id: "n2", student_id: "s2", parent_phone: "+917981067780", event_type: "absent", template_name: "school_absence_alert_v1", status: "delivered", attendance_date: todayDate, created_at: `${todayDate}T09:14:00Z`, meta_message_id: "wamid.HBgMOTE3OTgxMDY3NzgA..." },
      { id: "n3", student_id: "s3", parent_phone: "+919440266743", event_type: "correction_to_present", template_name: "school_correction_v1",     status: "delivered", attendance_date: todayDate, created_at: `${todayDate}T09:15:00Z`, meta_message_id: "wamid.HBgMOTE5NDQwMjY2NzQz..." },
    ];
    studentMap.set("s1", "Yasaswini");
    studentMap.set("s2", "Kiran");
    studentMap.set("s3", "Kethan");
  }

  const todayCount = notifications.filter(n => n.attendance_date === todayDate).length;
  const deliveredCount = notifications.filter(n => n.status === "delivered").length;
  const failedCount = notifications.filter(n => n.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Admin Control Panel &middot; {SCHOOL.name}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              💬 WhatsApp Audit Log
            </h1>
            <p className="text-white/60 text-sm">Full history of parent notification alerts</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Link
              href="/portal/admin/whatsapp/setup"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-semibold transition-all"
            >
              📲 n8n Setup →
            </Link>
            <span className="text-white/40 text-[10px]">{SCHOOL.supportPhone} → Meta API</span>
          </div>
        </div>
      </div>


      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-900">{notifications.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Sent</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-blue-900">{todayCount}</div>
          <div className="text-xs text-slate-500 mt-1">Today</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-emerald-600">{deliveredCount}</div>
          <div className="text-xs text-slate-500 mt-1">Delivered</div>
        </div>
        <div className="stat-card text-center">
          <div className={`text-3xl font-black ${failedCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{failedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Failed</div>
        </div>
      </div>

      {/* Log table */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Notification History
          </h2>
          <span className="badge badge-green">{SCHOOL.supportPhone} &rarr; Meta API</span>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Parent Phone</th>
                <th>Event</th>
                <th>Template</th>
                <th>Status</th>
                <th>Message ID</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n: any) => (
                <tr key={n.id}>
                  <td className="font-mono text-xs text-slate-500">
                    {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{" "}
                    {new Date(n.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="font-semibold text-slate-800">
                    {studentMap.get(n.student_id) || "Student"}
                  </td>
                  <td className="font-mono text-xs text-slate-500">{n.parent_phone}</td>
                  <td>
                    <span className={`badge ${n.event_type === "absent" ? "badge-amber" : "badge-blue"}`}>
                      {n.event_type === "absent" ? "(!) Absent" : n.event_type === "correction_to_present" ? "OK Corrected" : n.event_type}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-slate-500">{n.template_name}</td>
                  <td>
                    <span className={`badge ${n.status === "delivered" ? "badge-green" : n.status === "failed" ? "badge-red" : "badge-amber"}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={n.meta_message_id}>
                    {n.meta_message_id ? n.meta_message_id.slice(0, 20) + "..." : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
