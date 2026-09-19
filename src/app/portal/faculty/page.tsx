import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyLeavesAction } from "@/actions/faculty";
import FacultyLeaveInbox from "@/components/FacultyLeaveInbox";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Faculty Command Center - ${SCHOOL.name}`,
  description: "Faculty roll-call, leave approvals, marks radar, and student care hub.",
};

export default async function FacultyPortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Fetch assigned classes
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
          subject: "Mathematics",
          is_class_teacher: c.name === "10" && c.section === "A",
          classes: c,
        }));
      }
    } catch {}
  }

  // Today's marked classes
  let todayMarkedClassIds = new Set<string>();
  try {
    const { data: sessions } = await adminClient
      .from("attendance_sessions")
      .select("class_id")
      .eq("school_id", profile.school_id)
      .eq("attendance_date", todayDate);
    sessions?.forEach((s: any) => todayMarkedClassIds.add(s.class_id));
  } catch {}

  // Unread parent replies
  let parentRepliesCount = 0;
  try {
    const { count } = await adminClient
      .from("parent_reply_log")
      .select("id", { count: "exact", head: true })
      .eq("handled", false);
    parentRepliesCount = count || 0;
  } catch {}

  // Fetch pending leaves
  const leaves = await getFacultyLeavesAction();
  const pendingLeavesCount = leaves.filter((l) => l.status === "pending").length;

  const pendingRollCalls = teacherClassesList.filter(
    (item) => !todayMarkedClassIds.has(item.classes?.id || item.class_id)
  ).length;

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  const firstClassId = teacherClassesList[0]?.classes?.id || teacherClassesList[0]?.class_id || "c10a2026-1701-4cc0-9c59-8812324eb396";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── TOP STATS ROW (Matching Reference Screenshots 1 & 3) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Attendance Rate */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
            📊
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">92%</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>↑ 5% vs last month</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Students */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
            🎓
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Students</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">100</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <span>↑ 15 vs last month</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Assigned Classes */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0">
            📚
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Classes</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{teacherClassesList.length || 5}</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              <span>↑ 1 vs last month</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Pending Actions */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0">
            ⏱️
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Roll Calls</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{pendingRollCalls}</div>
            <div className={`inline-flex items-center gap-1 mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${pendingLeavesCount > 0 ? "text-rose-700 bg-rose-50" : "text-slate-600 bg-slate-100"}`}>
              <span>{pendingLeavesCount} Leave & OD Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WELCOME BANNER (Matching Screenshot 1 & 3) ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <span>🏫</span>
            <span>{SCHOOL.name} &bull; Academic Year 2025–26</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            {greeting}, {profile.full_name}!
          </h1>
          <p className="text-slate-500 text-sm">
            Let&apos;s make today great and full of exciting opportunities for learning.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Today is <strong className="text-slate-600 font-semibold">{todayFormatted}</strong>
          </p>
        </div>

        {/* Friendly Character Illustration */}
        <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 px-4 py-3 rounded-2xl flex-shrink-0">
          <div className="text-4xl">👨‍🏫</div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800">Class 10-A Ready</div>
            <div className="text-[11px] text-emerald-600 font-medium">● Attendance System Live</div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (8 cols): Daily Classroom Workflows ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card: Active Class Attendance Quick Action (Matching Screenshot 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 text-lg">📋</span>
                <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Class Attendance
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Morning Session</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 text-xs font-semibold">
                  <span>Class 10-A</span> &bull; <span>Mathematics</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Advanced Quadratic Systems &amp; Parabolic Roots
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">⏰ 08:30 AM &ndash; 09:15 AM</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">📍 Room 204 (Senior Wing)</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">👥 42 Students</span>
                </div>
              </div>

              <Link
                href={`/dashboard/attendance/${firstClassId}`}
                className="btn btn-primary px-5 py-2.5 text-xs font-semibold shadow-xs flex items-center gap-2 whitespace-nowrap"
              >
                <span>Take Attendance</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card: Class Schedule with Segmented Toggle (Matching Screenshot 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 text-lg">🗓️</span>
                <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Class Schedule
                </h2>
              </div>

              {/* Segmented Toggle Control */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-medium text-slate-600">
                <button className="px-3 py-1 rounded-lg bg-white shadow-2xs font-semibold text-slate-900">Today</button>
                <button className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800">This Week</button>
                <button className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800">This Month</button>
              </div>
            </div>

            {/* Schedule Rows */}
            <div className="mt-4 space-y-3">
              {teacherClassesList.slice(0, 3).map((item, idx) => {
                const cls = item.classes || {};
                const classId = cls.id || item.class_id;
                const isMarked = todayMarkedClassIds.has(classId);
                const times = ["08:30 AM – 09:15 AM", "09:15 AM – 10:00 AM", "11:00 AM – 11:45 AM"];
                return (
                  <div key={classId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition gap-3">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold whitespace-nowrap">
                        {times[idx] || "10:00 AM"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Class {cls.name || "10"}-{cls.section || "A"} &bull; {item.subject || "Mathematics"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>📍 Room {200 + idx}</span>
                          <span>&bull;</span>
                          <span>42 Students</span>
                          {item.is_class_teacher && (
                            <span className="text-indigo-600 font-semibold text-[11px]">Class Teacher</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMarked ? (
                        <span className="badge badge-green text-xs">✓ Done</span>
                      ) : (
                        <span className="badge badge-amber text-xs">Pending</span>
                      )}
                      <Link
                        href={`/dashboard/attendance/${classId}`}
                        className="btn btn-ghost text-xs px-3 py-1.5 rounded-lg"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Digital Leave & OD Approval Inbox */}
          <FacultyLeaveInbox initialLeaves={leaves} />

          {/* 9 Enterprise Modules Quick Launcher Grid */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Classroom Command Center Modules
                </h3>
                <p className="text-xs text-slate-400">All features synchronized with Student Portal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/portal/faculty/academics" className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">📈</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Academics &amp; AI Radar</div>
                  <div className="text-[11px] text-slate-400 truncate">OMR &amp; drills</div>
                </div>
              </Link>

              <Link href="/portal/faculty/conduct" className="p-3.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg flex-shrink-0">🛡️</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Conduct &amp; Merits</div>
                  <div className="text-[11px] text-slate-400 truncate">Points &amp; E-sign</div>
                </div>
              </Link>

              <Link href="/portal/faculty/curriculum" className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg flex-shrink-0">🧠</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Unit Planner &amp; OBE</div>
                  <div className="text-[11px] text-slate-400 truncate">Bloom&apos;s Taxonomy</div>
                </div>
              </Link>

              <Link href="/portal/faculty/voice-grader" className="p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg flex-shrink-0">🎙️</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Voice Grader &amp; AI</div>
                  <div className="text-[11px] text-slate-400 truncate">Audio feedback</div>
                </div>
              </Link>

              <Link href="/portal/faculty/seating-chart" className="p-3.5 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg flex-shrink-0">🗺️</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Seating &amp; Device Lock</div>
                  <div className="text-[11px] text-slate-400 truncate">Eyes on Me</div>
                </div>
              </Link>

              <Link href="/portal/faculty/sen" className="p-3.5 rounded-xl border border-slate-100 hover:border-yellow-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-yellow-50 text-amber-700 flex items-center justify-center text-lg flex-shrink-0">🤝</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">SEN Vault</div>
                  <div className="text-[11px] text-slate-400 truncate">⭐ IEP Checklist</div>
                </div>
              </Link>

              <Link href="/portal/faculty/group-projects" className="p-3.5 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg flex-shrink-0">🧩</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Group Projects Hub</div>
                  <div className="text-[11px] text-slate-400 truncate">Peer review matrix</div>
                </div>
              </Link>

              <Link href="/portal/faculty/hr" className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 transition flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg flex-shrink-0">🌴</div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-xs truncate">Staff HR &amp; Leaves</div>
                  <div className="text-[11px] text-slate-400 truncate">Biometric punch</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 cols): Analytics, Gauges & Calendar (Matching Screenshot 1 & 3) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Evaluation Score Card (Directly from Screenshot 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Evaluation Score</span>
              <span>ℹ️</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <span>📖</span> Knowledge
                </div>
                <div className="text-3xl font-black text-emerald-600 mt-1">4.4</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <span>📢</span> Clarity
                </div>
                <div className="text-3xl font-black text-amber-600 mt-1">4.8</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link href="/portal/faculty/settings" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                View summary (100 feedbacks) &rarr;
              </Link>
            </div>
          </div>

          {/* Circular Attendance Rate Gauge (Directly from Screenshot 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Attendance Rate</span>
              <span>ℹ️</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative h-18 w-18 flex-shrink-0 flex items-center justify-center">
                <svg className="h-18 w-18 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600"
                    strokeDasharray="88, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-slate-900 text-sm">88%</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                You&apos;ve taken roll call on time for <strong className="text-slate-900 font-semibold">4 out of 5</strong> assigned periods today. Solid consistency!
              </div>
            </div>
          </div>

          {/* Circular On-Time Rate Gauge (Directly from Screenshot 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>On-Time Rate</span>
              <span>ℹ️</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative h-18 w-18 flex-shrink-0 flex items-center justify-center">
                <svg className="h-18 w-18 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="94, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-slate-900 text-sm">94%</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                Punctual session start rate across all labs &amp; classrooms.
              </div>
            </div>
          </div>

          {/* Upcoming Holidays & Leaves Widget (Directly from Screenshot 1 & 3) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600">📅</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Holidays &amp; Leaves
                </h3>
              </div>
              <Link href="/portal/faculty/hr" className="text-xs text-indigo-600 font-semibold hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Oct 02</div>
                  <div className="text-slate-500">Gandhi Jayanti</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                  National
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Oct 20&ndash;24</div>
                  <div className="text-slate-500">Dussehra Vacation</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-[11px]">
                  5 Days
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Nov 01</div>
                  <div className="text-slate-500">Diwali Festival</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px]">
                  Festival
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
