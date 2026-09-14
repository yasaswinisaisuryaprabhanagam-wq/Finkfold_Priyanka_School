import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Student Portal – ${SCHOOL.name}`,
  description: "Student attendance, timetable, homework and circulars.",
};

export default async function StudentPortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();
  const todayDate = new Date().toISOString().slice(0, 10);

  // ── Fetch children linked to this parent's phone ─────────────
  // Parent profile.phone matches students.parent_phone
  const { data: children } = await adminClient
    .from("students")
    .select("id, full_name, roll_no, admission_no, class_id, parent_name, parent_phone, is_active")
    .eq("school_id", profile.school_id)
    .eq("parent_phone", profile.phone)
    .eq("is_active", true)
    .order("roll_no");

  // If no children found for this parent's phone, show a clear message
  if (!children || children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl text-white p-8 text-center"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            No Student Found
          </h1>
          <p className="text-white/60 text-sm">
            No student record is linked to your phone number ({profile.phone}).
          </p>
          <p className="text-white/40 text-xs mt-2">
            Please contact the school admin to link your account.
          </p>
        </div>
      </div>
    );
  }

  // For now show the first child (multi-child selector can be added later)
  const studentRecord = children[0];

  // ── Fetch class info ─────────────────────────────────────────
  let className = "--", classSection = "", academicYear = SCHOOL.academicYear;
  const { data: cls } = await adminClient
    .from("classes")
    .select("name, section, academic_year")
    .eq("id", studentRecord.class_id)
    .maybeSingle();
  if (cls) { className = cls.name; classSection = cls.section; academicYear = cls.academic_year; }

  // ── Fetch attendance records (last 30 sessions) ──────────────
  let history: { date: string; status: "present" | "absent"; note: string | null }[] = [];

  const { data: sessions } = await adminClient
    .from("attendance_sessions")
    .select("id, attendance_date")
    .eq("school_id", profile.school_id)
    .eq("class_id", studentRecord.class_id)
    .order("attendance_date", { ascending: false })
    .limit(30);

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map((s: any) => s.id);
    const { data: records } = await adminClient
      .from("attendance_records")
      .select("session_id, status, note")
      .eq("student_id", studentRecord.id)
      .in("session_id", sessionIds);

    if (records && records.length > 0) {
      const sessionMap = new Map(sessions.map((s: any) => [s.id, s.attendance_date]));
      history = records.map((r: any) => ({
        date: sessionMap.get(r.session_id) || todayDate,
        status: r.status,
        note: r.note,
      })).sort((a, b) => b.date.localeCompare(a.date));
    }
  }

  const totalDays    = history.length;
  const presentDays  = history.filter((h) => h.status === "present").length;
  const absentDays   = totalDays - presentDays;
  const percentage   = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // SVG gauge values
  const radius          = 70;
  const circumference   = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gaugeColor      = percentage >= 90 ? "#16a34a" : percentage >= 75 ? "#2060b0" : "#dc2626";

  // ── Timetable (placeholder — real table TBD) ─────────────────
  const timetable = [
    { period: 1, time: "08:30–09:15", subject: "Mathematics",      teacher: "As assigned", room: "Classroom" },
    { period: 2, time: "09:15–10:00", subject: "English",          teacher: "As assigned", room: "Classroom" },
    { period: 3, time: "10:00–10:45", subject: "Science / EVS",    teacher: "As assigned", room: "Classroom" },
    { period: 4, time: "11:00–11:45", subject: "Social Studies",   teacher: "As assigned", room: "Classroom" },
    { period: 5, time: "11:45–12:30", subject: "Telugu",           teacher: "As assigned", room: "Classroom" },
    { period: 6, time: "01:15–02:00", subject: "Art / P.E.",       teacher: "As assigned", room: "Ground"    },
  ];

  // ── Circulars (placeholder) ───────────────────────────────────
  const circulars = [
    { id: 1, title: "Annual Day Celebrations", desc: "Annual Day is scheduled for 25th October 2026. All students must participate.", urgent: true  },
    { id: 2, title: "Unit Test Schedule – October", desc: "Unit tests will be held from 10th October. Prepare chapters 1–5 for all subjects.", urgent: false },
    { id: 3, title: "Library Books Return",  desc: "All borrowed library books must be returned by Friday.", urgent: false },
  ];

  // ── Homework (placeholder) ───────────────────────────────────
  const homework = [
    { subject: "Mathematics", task: "Solve Exercise 4.3 (Q1–Q10)",              due: "Tomorrow" },
    { subject: "Science",     task: "Write notes on chapter — 2 pages",          due: "2 days"   },
    { subject: "English",     task: "Write a paragraph: 'My Favourite Season'",  due: "3 days"   },
  ];

  return (
    <div className="space-y-6">

      {/* ── Student Header Card ── */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", border: "none", color: "white" }}>
        <div className="h-16 w-16 rounded-2xl bg-violet-400 flex items-center justify-center text-3xl font-black flex-shrink-0">
          {studentRecord.full_name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            {studentRecord.full_name}
          </h1>
          <div className="text-white/60 text-xs mt-1 flex flex-wrap gap-3">
            <span>Admission: <strong className="text-white">{studentRecord.admission_no}</strong></span>
            <span>Roll No: <strong className="text-white">{studentRecord.roll_no}</strong></span>
            <span>Class: <strong className="text-white">{className}{classSection ? `-${classSection}` : ""}</strong></span>
            <span>AY: <strong className="text-white">{academicYear}</strong></span>
          </div>
          {children.length > 1 && (
            <div className="text-amber-300 text-xs mt-1 font-medium">
              👨‍👧‍👦 {children.length} children linked to your account
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-3xl font-black ${percentage >= 75 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalDays > 0 ? `${percentage}%` : "–"}
          </div>
          <div className="text-white/50 text-xs">Attendance</div>
        </div>
      </div>

      {/* ── Main Grid: Gauge + History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Attendance Gauge */}
        <div className="card p-6 flex flex-col items-center gap-4 lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-700 self-start" style={{ fontFamily: "Outfit, sans-serif" }}>
            Overall Attendance
          </h2>

          {totalDays === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="text-4xl">📊</div>
              <p className="text-xs text-slate-400 text-center">No attendance records yet for this academic year.</p>
            </div>
          ) : (
            <>
              <div className="relative flex items-center justify-center">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  <circle
                    cx="90" cy="90" r={radius}
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 90 90)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black" style={{ color: gaugeColor, fontFamily: "Outfit, sans-serif" }}>
                    {percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Attendance</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="text-center p-2 rounded-xl bg-emerald-50">
                  <div className="text-lg font-black text-emerald-600">{presentDays}</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Present</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-rose-50">
                  <div className="text-lg font-black text-rose-600">{absentDays}</div>
                  <div className="text-[10px] text-rose-700 font-medium">Absent</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50">
                  <div className="text-lg font-black text-slate-600">{totalDays}</div>
                  <div className="text-[10px] text-slate-600 font-medium">Total</div>
                </div>
              </div>

              {percentage < 75 && (
                <div className="w-full rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium text-center">
                  ⚠️ Below 75% – risk of detention
                </div>
              )}
            </>
          )}
        </div>

        {/* Attendance History Table */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
              Attendance History
            </h2>
          </div>
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-3">📅</div>
              <p className="text-xs text-slate-400">Attendance records will appear here once the teacher marks roll.</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-80">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Day</th><th>Status</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td className="font-mono text-xs font-semibold">{h.date}</td>
                      <td className="text-xs text-slate-500">
                        {new Date(h.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}
                      </td>
                      <td>
                        <span className={`badge ${h.status === "present" ? "badge-green" : "badge-red"}`}>
                          {h.status === "present" ? "✓ Present" : "✗ Absent"}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">{h.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Timetable ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
            Today's Timetable - Class {className}{classSection ? `-${classSection}` : ""}
          </h2>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead><tr><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th></tr></thead>
            <tbody>
              {timetable.map((row) => (
                <tr key={row.period}>
                  <td className="font-bold text-slate-900">P{row.period}</td>
                  <td className="font-mono text-xs">{row.time}</td>
                  <td className="font-semibold text-blue-900">{row.subject}</td>
                  <td className="text-xs text-slate-600">{row.teacher}</td>
                  <td className="font-mono text-xs text-slate-500">{row.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Homework + Circulars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>📝 Pending Homework</h2>
          </div>
          <div className="card-body space-y-3">
            {homework.map((hw, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">📚</div>
                <div>
                  <div className="text-xs font-bold text-blue-900">{hw.subject}</div>
                  <div className="text-xs text-slate-700 mt-0.5">{hw.task}</div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">Due: {hw.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>📢 School Circulars</h2>
          </div>
          <div className="card-body space-y-3">
            {circulars.map((c) => (
              <div key={c.id} className={`p-3 rounded-xl border ${c.urgent ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {c.urgent && <span className="badge badge-amber">Urgent</span>}
                  <span className="text-xs font-bold text-slate-800">{c.title}</span>
                </div>
                <p className="text-xs text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
