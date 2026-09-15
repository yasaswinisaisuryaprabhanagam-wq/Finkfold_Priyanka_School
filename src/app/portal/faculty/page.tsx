import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Faculty Portal - ${SCHOOL.name}`,
  description: "Faculty roll-call, schedule, and parent communication dashboard.",
};

export default async function FacultyPortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // -- Fetch assigned classes --
  let teacherClassesList: any[] = [];
  try {
    const { data } = await adminClient
      .from("teacher_classes")
      .select("class_id, subject, is_class_teacher, classes(id, name, section, academic_year)")
      .eq("teacher_id", profile.id);
    if (data && data.length > 0) teacherClassesList = data;
  } catch {}

  if (teacherClassesList.length === 0) {
    try {
      const { data: schoolClasses } = await adminClient
        .from("classes")
        .select("id, name, section, academic_year")
        .eq("school_id", profile.school_id)
        .order("name", { ascending: true })
        .limit(6);

      if (schoolClasses && schoolClasses.length > 0) {
        teacherClassesList = schoolClasses.map((c: any) => ({
          class_id: c.id,
          subject: "General",
          is_class_teacher: false,
          classes: c,
        }));
      }
    } catch {}
  }

  // -- Today's marked classes --
  let todayMarkedClassIds = new Set<string>();
  try {
    const { data: sessions } = await adminClient
      .from("attendance_sessions")
      .select("class_id")
      .eq("school_id", profile.school_id)
      .eq("attendance_date", todayDate);
    sessions?.forEach((s: any) => todayMarkedClassIds.add(s.class_id));
  } catch {}

  // -- Unread parent replies --
  let parentRepliesCount = 0;
  try {
    const { count } = await adminClient
      .from("parent_reply_log")
      .select("id", { count: "exact", head: true })
      .eq("handled", false);
    parentRepliesCount = count || 0;
  } catch {}

  const pendingRollCalls = teacherClassesList.filter(
    (item) => !todayMarkedClassIds.has(item.classes?.id || item.class_id)
  ).length;

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fbbf24, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Workspace &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            {greeting}, {profile.full_name.split(" ")[0]}!
          </h1>
          <p className="text-white/70 text-sm">{todayFormatted}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-blue-900">{teacherClassesList.length}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Assigned Classes</div>
        </div>
        <div className="stat-card text-center">
          <div className={`text-3xl font-black ${pendingRollCalls > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {pendingRollCalls}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Pending Roll Calls</div>
        </div>
        <div className="stat-card text-center">
          <div className={`text-3xl font-black ${parentRepliesCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {parentRepliesCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Unread Parent Replies</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-emerald-600">ON</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">WhatsApp Gateway</div>
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Your Assigned Classes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &ldquo;Mark Roll Call&rdquo; to take attendance. Absences trigger WhatsApp alerts instantly.
            </p>
          </div>
          <span className="badge badge-blue">{teacherClassesList.length} Classes</span>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherClassesList.map((item: any) => {
              const cls = item.classes || {};
              const classId = cls.id || item.class_id;
              const isTodayMarked = todayMarkedClassIds.has(classId);
              return (
                <div
                  key={classId}
                  className="card card-hover p-5 flex flex-col gap-4"
                  style={{ border: isTodayMarked ? "1px solid #bbf7d0" : "1px solid #e2e8f0" }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-2">
                        Class {cls.name} - Sec {cls.section}
                      </div>
                      <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Class {cls.name} (Section {cls.section})
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        AY {cls.academic_year} &middot; {item.subject || "General"}
                        {item.is_class_teacher && <span className="ml-2 text-blue-600 font-semibold">Class Teacher</span>}
                      </div>
                    </div>
                    {isTodayMarked ? (
                      <span className="badge badge-green">✓ Completed</span>
                    ) : (
                      <span className="badge badge-amber">Pending</span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Link
                      href={`/dashboard/attendance/${classId}`}
                      className={`btn flex-1 w-full text-xs ${isTodayMarked ? "btn-secondary text-emerald-800 border-emerald-300 hover:bg-emerald-50" : "btn-primary"}`}
                      style={{ justifyContent: "center" }}
                    >
                      {isTodayMarked ? "✓ Completed — View / Edit Roll" : "Mark Roll Call →"}
                    </Link>
                    <Link
                      href={`/portal/faculty/homework`}
                      className="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1 text-slate-700 hover:text-blue-900 w-full sm:w-auto"
                      style={{ justifyContent: "center" }}
                      title="Assign Homework for this class"
                    >
                      <span>📝 Homework</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/portal/faculty/homework" className="card card-hover p-5 flex items-center gap-4 cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">📝</div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Assign Homework</div>
            <div className="text-xs text-slate-500">Post daily assignments</div>
          </div>
        </Link>
        <Link href="/portal/faculty/circulars" className="card card-hover p-5 flex items-center gap-4 cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl flex-shrink-0">📢</div>
          <div>
            <div className="font-bold text-slate-900 text-sm">School Circulars</div>
            <div className="text-xs text-slate-500">Official notices &amp; alerts</div>
          </div>
        </Link>
        <Link href="/portal/faculty/messages" className="card card-hover p-5 flex items-center gap-4 cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">💬</div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Parent Replies</div>
            <div className="text-xs text-slate-500">{parentRepliesCount} unread messages</div>
          </div>
        </Link>
        <Link href="/portal/faculty/students" className="card card-hover p-5 flex items-center gap-4 cursor-pointer">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">👥</div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Student Roster</div>
            <div className="text-xs text-slate-500">View &amp; search students</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
