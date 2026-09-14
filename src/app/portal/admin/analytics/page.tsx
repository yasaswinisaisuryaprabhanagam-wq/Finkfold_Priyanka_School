import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: `AI Analytics | ${SCHOOL.name}`,
  description: "AI-powered attendance analytics, at-risk student alerts, and predictive insights.",
};

export default async function AdminAnalyticsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Last 30 days date range
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  // ── Fetch all students ──
  let students: any[] = [];
  try {
    const { data } = await adminClient
      .from("students")
      .select("id, full_name, class_id, admission_no, parent_name, parent_phone, consent_whatsapp")
      .eq("school_id", profile.school_id)
      .eq("is_active", true);
    students = data || [];
  } catch {}

  // ── Fetch classes ──
  let classes: any[] = [];
  try {
    const { data } = await adminClient
      .from("classes")
      .select("id, name, section")
      .eq("school_id", profile.school_id)
      .order("name");
    classes = data || [];
  } catch {}
  const classMap = new Map(classes.map((c) => [c.id, `${c.name}-${c.section}`]));

  // ── Fetch attendance sessions (last 30 days) ──
  let sessions: any[] = [];
  try {
    const { data } = await adminClient
      .from("attendance_sessions")
      .select("id, class_id, attendance_date")
      .eq("school_id", profile.school_id)
      .gte("attendance_date", thirtyDaysAgoStr)
      .order("attendance_date", { ascending: false });
    sessions = data || [];
  } catch {}

  // ── Fetch attendance records for these sessions ──
  let records: any[] = [];
  if (sessions.length > 0) {
    try {
      const sessionIds = sessions.map((s) => s.id);
      const { data } = await adminClient
        .from("attendance_records")
        .select("session_id, student_id, status")
        .in("session_id", sessionIds);
      records = data || [];
    } catch {}
  }

  // ── Compute per-student attendance stats ──
  const sessionMap = new Map(sessions.map((s) => [s.id, s]));
  const studentAbsenceMap: Record<string, { absent: number; total: number; lastAbsent: string | null }> = {};

  for (const rec of records) {
    if (!studentAbsenceMap[rec.student_id]) {
      studentAbsenceMap[rec.student_id] = { absent: 0, total: 0, lastAbsent: null };
    }
    studentAbsenceMap[rec.student_id].total++;
    if (rec.status === "absent") {
      studentAbsenceMap[rec.student_id].absent++;
      const sess = sessionMap.get(rec.session_id);
      if (sess) {
        const d = sess.attendance_date;
        if (!studentAbsenceMap[rec.student_id].lastAbsent || d > studentAbsenceMap[rec.student_id].lastAbsent!) {
          studentAbsenceMap[rec.student_id].lastAbsent = d;
        }
      }
    }
  }

  // ── AT-RISK: students with >20% absence rate in last 30 days ──
  const atRiskStudents = students
    .map((s) => {
      const stats = studentAbsenceMap[s.id] || { absent: 0, total: 0, lastAbsent: null };
      const rate = stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0;
      return { ...s, absent: stats.absent, total: stats.total, absenceRate: rate, lastAbsent: stats.lastAbsent };
    })
    .filter((s) => s.absenceRate >= 20 && s.total > 0)
    .sort((a, b) => b.absenceRate - a.absenceRate)
    .slice(0, 15);

  // ── School-wide attendance rate last 30 days ──
  const totalPresent = records.filter((r) => r.status === "present").length;
  const totalRecords = records.length;
  const overallRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
  const totalAbsent = totalRecords - totalPresent;

  // ── WhatsApp delivery stats ──
  let waStats = { total: 0, delivered: 0, failed: 0 };
  try {
    const { data } = await adminClient
      .from("whatsapp_notifications")
      .select("status")
      .eq("school_id", profile.school_id)
      .gte("created_at", thirtyDaysAgoStr);
    if (data) {
      waStats.total = data.length;
      waStats.delivered = data.filter((r: any) => r.status === "delivered").length;
      waStats.failed = data.filter((r: any) => r.status === "failed").length;
    }
  } catch {}

  // ── Daily attendance trend (last 7 unique dates with sessions) ──
  const recentDates = [...new Set(sessions.map((s) => s.attendance_date))]
    .sort()
    .slice(-7);

  const trendData = recentDates.map((date) => {
    const daySessions = sessions.filter((s) => s.attendance_date === date).map((s) => s.id);
    const dayRecs = records.filter((r) => daySessions.includes(r.session_id));
    const present = dayRecs.filter((r) => r.status === "present").length;
    const total = dayRecs.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { date, present, total, rate };
  });

  // ── Class-wise attendance ──
  const classStats = classes.map((cls) => {
    const classSessions = sessions.filter((s) => s.class_id === cls.id).map((s) => s.id);
    const classRecs = records.filter((r) => classSessions.includes(r.session_id));
    const present = classRecs.filter((r) => r.status === "present").length;
    const total = classRecs.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const studentCount = students.filter((s) => s.class_id === cls.id).length;
    return { ...cls, rate, total, present, studentCount };
  }).filter((c) => c.total > 0).sort((a, b) => a.rate - b.rate);

  // ── Consent stats ──
  const consentYes = students.filter((s) => s.consent_whatsapp).length;
  const consentNo = students.length - consentYes;

  // Use mock data if no real data available (demo mode)
  const isDemo = totalRecords === 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #00d2ff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7b2ff7 0%, transparent 50%)"
        }} />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
              AI Analytics &middot; {SCHOOL.name}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Predictive Insights Dashboard
            </h1>
            <p className="text-white/60 text-sm">Last 30 days &bull; {students.length} active students &bull; {classes.length} classes</p>
          </div>
          {isDemo && (
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold px-3 py-1 rounded-full">
              Demo Mode
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 text-center border-l-4 border-emerald-500">
          <div className={`text-4xl font-black ${overallRate >= 90 ? "text-emerald-600" : overallRate >= 75 ? "text-amber-600" : "text-rose-600"}`}>
            {isDemo ? "87" : overallRate}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Overall Attendance</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Last 30 days</div>
        </div>
        <div className="card p-5 text-center border-l-4 border-rose-500">
          <div className="text-4xl font-black text-rose-600">{isDemo ? "43" : totalAbsent}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Absences</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cumulative</div>
        </div>
        <div className="card p-5 text-center border-l-4 border-amber-500">
          <div className="text-4xl font-black text-amber-600">{isDemo ? "12" : atRiskStudents.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">At-Risk Students</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&gt;20% absence rate</div>
        </div>
        <div className="card p-5 text-center border-l-4 border-violet-500">
          <div className="text-4xl font-black text-violet-600">
            {isDemo ? "94" : (waStats.total > 0 ? Math.round((waStats.delivered / waStats.total) * 100) : 100)}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">WA Delivery Rate</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{isDemo ? "186" : waStats.total} alerts sent</div>
        </div>
      </div>

      {/* ── AI Insights Banner ── */}
      <div className="card p-5 border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">🤖</div>
          <div>
            <div className="text-sm font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              AI Insights &mdash; Today&apos;s Summary
            </div>
            <div className="space-y-1.5">
              {isDemo ? (
                <>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                    <span><strong>Attendance dip on Fridays</strong>: Average attendance 8% lower than Mon-Thu. Consider Friday engagement programs.</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-rose-500 font-bold flex-shrink-0">!</span>
                    <span><strong>Class 6-C flagged</strong>: 3 consecutive days of attendance below 70%. Immediate follow-up recommended.</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold flex-shrink-0">+</span>
                    <span><strong>WhatsApp alerts working</strong>: 94% delivery success. Parents responding within avg. 12 minutes.</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500 font-bold flex-shrink-0">i</span>
                    <span><strong>Prediction</strong>: Based on trends, 4 students are likely to fall below 75% attendance this month without intervention.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className={`font-bold flex-shrink-0 ${overallRate >= 85 ? "text-emerald-500" : "text-amber-500"}`}>{overallRate >= 85 ? "+" : "!"}</span>
                    <span>School-wide attendance is <strong>{overallRate}%</strong> over the last 30 days. {overallRate >= 85 ? "Excellent performance!" : "Below target — monitor closely."}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                    <span><strong>{atRiskStudents.length} students</strong> have absence rate above 20% and need immediate parent contact.</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500 font-bold flex-shrink-0">i</span>
                    <span><strong>WhatsApp coverage</strong>: {consentYes} of {students.length} parents opted in ({Math.round((consentYes / Math.max(students.length, 1)) * 100)}%). {consentNo} students have no alerts configured.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Attendance Trend + Class Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Daily Attendance Trend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Last 7 recorded school days</p>
          </div>
          <div className="p-5">
            {(isDemo
              ? [
                  { date: "2026-09-06", rate: 88 }, { date: "2026-09-07", rate: 85 },
                  { date: "2026-09-08", rate: 90 }, { date: "2026-09-09", rate: 79 },
                  { date: "2026-09-10", rate: 91 }, { date: "2026-09-11", rate: 83 },
                  { date: "2026-09-12", rate: 87 },
                ]
              : trendData
            ).map((d, i, arr) => {
              const max = Math.max(...arr.map((x) => x.rate), 1);
              const barWidth = Math.round((d.rate / max) * 100);
              const color = d.rate >= 85 ? "bg-emerald-500" : d.rate >= 70 ? "bg-amber-500" : "bg-rose-500";
              const label = new Date(d.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
              return (
                <div key={d.date} className="flex items-center gap-3 mb-2.5 group">
                  <div className="text-[10px] text-slate-500 w-16 flex-shrink-0">{label}</div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-6 rounded-full ${color} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${barWidth}%` }}
                    >
                      <span className="text-white text-[10px] font-bold">{d.rate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Class-wise Heatmap */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Class Performance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Sorted: lowest attendance first</p>
          </div>
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(isDemo
                  ? [
                      { name: "6", section: "C", studentCount: 32, rate: 68 },
                      { name: "7", section: "B", studentCount: 29, rate: 72 },
                      { name: "8", section: "A", studentCount: 35, rate: 81 },
                      { name: "9", section: "A", studentCount: 38, rate: 87 },
                      { name: "10", section: "A", studentCount: 40, rate: 91 },
                      { name: "10", section: "B", studentCount: 37, rate: 94 },
                    ]
                  : classStats.slice(0, 8)
                ).map((c, i) => {
                  const badge = c.rate >= 85 ? "badge-green" : c.rate >= 70 ? "badge-amber" : "badge-red";
                  const label = c.rate >= 85 ? "Good" : c.rate >= 70 ? "Warning" : "Critical";
                  return (
                    <tr key={i}>
                      <td className="font-bold text-slate-800">Class {c.name}-{c.section}</td>
                      <td className="text-slate-600">{c.studentCount}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${c.rate >= 85 ? "bg-emerald-500" : c.rate >= 70 ? "bg-amber-500" : "bg-rose-500"}`}
                              style={{ width: `${c.rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold">{c.rate}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${badge}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── At-Risk Students ── */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              At-Risk Students &mdash; Intervention Needed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Absence rate &gt;20% in last 30 days. WhatsApp alert recommended.</p>
          </div>
          <Link href="/portal/admin/whatsapp" className="btn btn-ghost text-xs">
            View WA Log &rarr;
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Absences</th>
                <th>Absence Rate</th>
                <th>Last Absent</th>
                <th>WA Alert</th>
              </tr>
            </thead>
            <tbody>
              {(isDemo
                ? [
                    { full_name: "Ravi Kumar", class_id: "c6c", absent: 8, total: 20, absenceRate: 40, lastAbsent: "2026-09-11", consent_whatsapp: true, parent_phone: "+919876543210" },
                    { full_name: "Priya Reddy", class_id: "c7b", absent: 7, total: 22, absenceRate: 32, lastAbsent: "2026-09-12", consent_whatsapp: false, parent_phone: "+919876543211" },
                    { full_name: "Suresh Babu", class_id: "c6c", absent: 6, total: 20, absenceRate: 30, lastAbsent: "2026-09-10", consent_whatsapp: true, parent_phone: "+919876543212" },
                    { full_name: "Anitha Devi", class_id: "c8a", absent: 5, total: 20, absenceRate: 25, lastAbsent: "2026-09-09", consent_whatsapp: true, parent_phone: "+919876543213" },
                    { full_name: "Mohammed Ali", class_id: "c7b", absent: 5, total: 22, absenceRate: 23, lastAbsent: "2026-09-08", consent_whatsapp: false, parent_phone: "+919876543214" },
                  ]
                : atRiskStudents
              ).map((s, i) => {
                const rateColor = s.absenceRate >= 40 ? "badge-red" : s.absenceRate >= 25 ? "badge-amber" : "badge-amber";
                return (
                  <tr key={i} className={s.absenceRate >= 40 ? "bg-rose-50/30" : ""}>
                    <td className="text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="font-semibold text-slate-800">{s.full_name}</td>
                    <td>{classMap.get(s.class_id) || "N/A"}</td>
                    <td className="font-mono font-bold text-rose-600">{s.absent}/{s.total}</td>
                    <td>
                      <span className={`badge ${rateColor}`}>{s.absenceRate}%</span>
                    </td>
                    <td className="font-mono text-xs text-slate-500">
                      {s.lastAbsent ? new Date(s.lastAbsent).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                    </td>
                    <td>
                      {s.consent_whatsapp
                        ? <span className="badge badge-green">Active</span>
                        : <span className="badge badge-slate">No consent</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── WhatsApp Coverage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-1">
          <div className="text-sm font-bold text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            WhatsApp Coverage
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Opted-In Parents</span>
                <span className="font-bold text-emerald-600">{isDemo ? 312 : consentYes}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-emerald-500 rounded-full"
                  style={{ width: `${isDemo ? 89 : Math.round((consentYes / Math.max(students.length, 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">No WA Consent</span>
                <span className="font-bold text-slate-500">{isDemo ? 38 : consentNo}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-slate-400 rounded-full"
                  style={{ width: `${isDemo ? 11 : Math.round((consentNo / Math.max(students.length, 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <strong className="text-emerald-600">{isDemo ? "94%" : (waStats.total > 0 ? `${Math.round((waStats.delivered / waStats.total) * 100)}%` : "N/A")}</strong> delivery success rate
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="text-sm font-bold text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/portal/admin/students" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <span className="text-xl">👥</span>
              <div>
                <div className="text-xs font-bold text-slate-800">Student Registry</div>
                <div className="text-[10px] text-slate-400">{isDemo ? 350 : students.length} students</div>
              </div>
            </Link>
            <Link href="/portal/admin/admissions" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
              <span className="text-xl">📋</span>
              <div>
                <div className="text-xs font-bold text-slate-800">Admissions</div>
                <div className="text-[10px] text-slate-400">Review applications</div>
              </div>
            </Link>
            <Link href="/portal/admin/staff" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all group">
              <span className="text-xl">👨‍🏫</span>
              <div>
                <div className="text-xs font-bold text-slate-800">Staff Management</div>
                <div className="text-[10px] text-slate-400">Teachers & allocations</div>
              </div>
            </Link>
            <Link href="/portal/admin/whatsapp" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group">
              <span className="text-xl">💬</span>
              <div>
                <div className="text-xs font-bold text-slate-800">WhatsApp Log</div>
                <div className="text-[10px] text-slate-400">{isDemo ? 186 : waStats.total} messages sent</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
