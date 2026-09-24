import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import { redirect } from "next/navigation";
import StudentLessonPlanModal from "@/components/StudentLessonPlanModal";
import StudentDashboardSchedule from "@/components/StudentDashboardSchedule";

export const metadata = {
  title: `Student Portal – ${SCHOOL.name}`,
  description: "Student attendance, timetable, homework and circulars.",
};

export default async function StudentPortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Fetch children linked to this parent's phone
  const { data: children } = await adminClient
    .from("students")
    .select("id, full_name, roll_no, admission_no, class_id, parent_name, parent_phone, is_active")
    .eq("school_id", profile.school_id)
    .eq("parent_phone", profile.phone)
    .eq("is_active", true)
    .order("roll_no");

  if (!children || children.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-xs">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            No Student Record Linked
          </h1>
          <p className="text-slate-500 text-xs">
            No active student profile matches your registered phone number ({profile.phone}).
          </p>
          <p className="text-slate-400 text-xs mt-3">
            Please contact the school office to verify student enrollment records.
          </p>
        </div>
      </div>
    );
  }

  const studentRecord = children[0];

  // Fetch class info
  let className = "10", classSection = "A", academicYear = SCHOOL.academicYear;
  const { data: cls } = await adminClient
    .from("classes")
    .select("name, section, academic_year")
    .eq("id", studentRecord.class_id)
    .maybeSingle();
  if (cls) {
    className = cls.name;
    classSection = cls.section;
    academicYear = cls.academic_year;
  }

  // Fetch attendance records (last 30 sessions)
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

  const totalDays = history.length > 0 ? history.length : 24;
  const presentDays = history.length > 0 ? history.filter((h) => h.status === "present").length : 22;
  const absentDays = totalDays - presentDays;
  const percentage = Math.round((presentDays / totalDays) * 100);

  const timetable = [
    { period: 1, time: "08:30–09:15", subject: "Mathematics", teacher: "Mrs. Priyanka Devi", room: "Room 204" },
    { period: 2, time: "09:15–10:00", subject: "Physics & Lab", teacher: "Mr. Satish Kumar", room: "Lab 1" },
    { period: 3, time: "10:00–10:45", subject: "English Literature", teacher: "Mrs. Ayesha Khan", room: "Room 102" },
    { period: 4, time: "11:00–11:45", subject: "Social Studies", teacher: "Mr. Ramesh Sharma", room: "Room 103" },
    { period: 5, time: "11:45–12:30", subject: "Telugu / Second Lang", teacher: "Mrs. V. Lakshmi", room: "Room 104" },
    { period: 6, time: "01:15–02:00", subject: "Robotics & Coding", teacher: "Mr. K. Anjaneyulu", room: "Tech Lab" },
  ];

  const circulars = [
    { id: 1, title: "Annual Day Celebrations", desc: "Annual cultural festival scheduled for 25th October 2026.", urgent: true, date: "Oct 25" },
    { id: 2, title: "Summative Assessment 1 Schedule", desc: "SA-1 examinations commence from 10th October.", urgent: false, date: "Oct 10" },
    { id: 3, title: "Library Books Return Reminder", desc: "All borrowed library books must be returned by Friday.", urgent: false, date: "Friday" },
  ];

  const homework = [
    { subject: "Mathematics", task: "Quadratic Equations: Exercise 4.3 (Q1–Q10)", due: "Tomorrow", status: "Pending" },
    { subject: "Physics", task: "Ray diagrams for concave mirrors — 2 pages", due: "In 2 days", status: "In Progress" },
    { subject: "English", task: "Formal essay: 'Technological Ethics in Society'", due: "In 3 days", status: "Reviewed" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── TOP STATS ROW (Matching Screenshot 2 & 4) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Attendance Rate */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
            📋
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{percentage}%</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>↑ 5% vs last month</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Enrolled Classes */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
            🎒
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Classes</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">5</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <span>Class {className}-{classSection}</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Classes Attended */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0">
            📖
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classes Attended</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{presentDays}</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              <span>↑ 1 vs last month</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Missed Classes */}
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0">
            ⏳
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Missed Classes</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{absentDays}</div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              <span>{absentDays === 0 ? "Perfect Record" : "Approved Leave"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WELCOME BANNER (Matching Screenshot 2 & 4) ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
            <span>🎒</span>
            <span>{SCHOOL.name} &bull; Student Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Welcome, {studentRecord.full_name}!
          </h1>
          <p className="text-slate-500 text-sm">
            A new day, a new opportunity to grow. Let&apos;s learn something new today!
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
            <span>Admission: <strong className="text-slate-700 font-semibold">{studentRecord.admission_no}</strong></span>
            <span>&bull;</span>
            <span>Roll No: <strong className="text-slate-700 font-semibold">{studentRecord.roll_no}</strong></span>
            <span>&bull;</span>
            <span>Class: <strong className="text-slate-700 font-semibold">{className}-{classSection}</strong></span>
            <span>&bull;</span>
            <span>AY: <strong className="text-slate-700 font-semibold">{academicYear}</strong></span>
          </div>
        </div>

        {/* Friendly Waving Student Character */}
        <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 px-4 py-3 rounded-2xl flex-shrink-0">
          <div className="text-4xl">👦</div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800">Ready for Today</div>
            <div className="text-[11px] text-emerald-600 font-medium">● 6 Periods Scheduled</div>
          </div>
        </div>
      </div>

      {/* ── PASTEL ENROLLED COURSES ROW (Directly from Screenshot 4) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            <span>📖</span>
            <span>Enrolled Courses &amp; Subjects</span>
          </h2>
          <Link href="/portal/student/subjects" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Course 1: Soft Lilac */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-purple-900">Mathematics &bull; MAT101</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1"><span>👤</span> Mrs. Priyanka Devi</div>
              <div className="flex items-center gap-1"><span>🗓️</span> Mon &amp; Wed</div>
              <div className="flex items-center gap-1"><span>⏰</span> 08:30 AM &ndash; 09:15 AM</div>
              <div className="flex items-center gap-1"><span>📍</span> Room 204</div>
            </div>
          </div>

          {/* Course 2: Soft Butter Yellow */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-amber-900">Science &amp; Physics &bull; SCI102</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1"><span>👤</span> Mr. Satish Kumar</div>
              <div className="flex items-center gap-1"><span>🗓️</span> Tue &amp; Thu</div>
              <div className="flex items-center gap-1"><span>⏰</span> 09:15 AM &ndash; 10:00 AM</div>
              <div className="flex items-center gap-1"><span>📍</span> Science Lab 1</div>
            </div>
          </div>

          {/* Course 3: Soft Sky Blue */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-sky-900">English Literature &bull; ENG103</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1"><span>👤</span> Mrs. Ayesha Khan</div>
              <div className="flex items-center gap-1"><span>🗓️</span> Mon &amp; Sat</div>
              <div className="flex items-center gap-1"><span>⏰</span> 10:00 AM &ndash; 10:45 AM</div>
              <div className="flex items-center gap-1"><span>📍</span> Room 102</div>
            </div>
          </div>

          {/* Course 4: Soft Mint/Sage */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-emerald-900">Robotics &amp; Coding &bull; CS104</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1"><span>👤</span> Mr. K. Anjaneyulu</div>
              <div className="flex items-center gap-1"><span>🗓️</span> Wednesday</div>
              <div className="flex items-center gap-1"><span>⏰</span> 01:15 PM &ndash; 02:00 PM</div>
              <div className="flex items-center gap-1"><span>📍</span> Tech Lab</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN DASHBOARD GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN (8 cols): Upcoming Class, Schedule & Homework ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Upcoming Class Card (Directly from Screenshot 2) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 text-lg">⏰</span>
                <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Upcoming Class
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Starting Soon</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-700 text-xs font-semibold">
                  <span>Class 10-A</span> &bull; <span>Mathematics</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Advanced Quadratic Equations &amp; Parabolic Optimization
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">⏰ 08:30 AM &ndash; 09:15 AM</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">📍 Room 204</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">👤 Mrs. Priyanka Devi</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60 font-medium">
                  <span>🎒 Pack Tonight:</span>
                  <span>Long Ruled Math Vol. 2 Notebook &bull; Geometry Box &bull; NCERT Textbook</span>
                </div>
              </div>

              <StudentLessonPlanModal
                subject="Mathematics"
                className={`${className}-${classSection}`}
                topic="Advanced Quadratic Equations &amp; Parabolic Optimization"
                time="08:30 AM – 09:15 AM (Period 1)"
                room="Room 204"
                teacher="Mrs. Priyanka Devi"
              />
            </div>
          </div>

          {/* Interactive Class Schedule with working Today / This Week / This Month toggle */}
          <StudentDashboardSchedule timetable={timetable} />

          {/* Daily Homework & Assignments (Matching Screenshot 4) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 text-lg">📝</span>
                <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Active Homework &amp; Assignments
                </h2>
              </div>
              <Link href="/portal/student/homework" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                View all &rarr;
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {homework.map((hw, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 flex items-start justify-between gap-3 bg-slate-50/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{hw.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        hw.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200/60" :
                        hw.status === "Reviewed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" :
                        "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                      }`}>
                        {hw.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{hw.task}</p>
                    <div className="text-[11px] text-slate-400 font-medium">Due: {hw.due}</div>
                  </div>

                  <Link href="/portal/student/homework" className="btn btn-ghost text-xs px-3 py-1 rounded-lg self-center">
                    Submit
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attendance Records Log */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Attendance Register Log
              </h2>
              <span className="text-xs text-slate-400">Class 10-A</span>
            </div>

            <div className="overflow-auto max-h-56">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Day</th><th>Status</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {history.slice(0, 6).map((h, i) => (
                    <tr key={i}>
                      <td className="font-mono text-xs font-semibold">{h.date}</td>
                      <td className="text-xs text-slate-500">
                        {new Date(h.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                      </td>
                      <td>
                        <span className={`badge ${h.status === "present" ? "badge-green" : "badge-red"}`}>
                          {h.status === "present" ? "✓ Present" : "✗ Absent"}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">{h.note || "Regular Session"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 cols): Gauges & Behavioral Feedback (Matching Screenshot 2) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Behavioral Notes / Feedback Quote Card (Directly from Screenshot 2) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Behavioral Commendation</span>
              <span>😊</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
              &ldquo;Shows great engagement in group discussions and consistently displays strong analytical problem solving. Please keep it up, you can do it!&rdquo;
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>&mdash; Mrs. Priyanka Devi &bull; Class Teacher</span>
              <span className="text-slate-400 font-mono text-[11px]">Jan 10</span>
            </div>
          </div>

          {/* Attendance Rate Circular Donut (Directly from Screenshot 2) */}
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
                    strokeDasharray={`${percentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-slate-900 text-sm">{percentage}%</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                You&apos;ve shown up for <strong className="text-slate-900 font-semibold">{presentDays} out of {totalDays}</strong> classes this period. Solid consistency!
              </div>
            </div>
          </div>

          {/* On-Time Rate Circular Donut (Directly from Screenshot 2) */}
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
                    strokeDasharray="92, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-slate-900 text-sm">92%</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                Consistent morning bus arrival and class hall punctuality.
              </div>
            </div>
          </div>

          {/* Official School Circulars (Matching Screenshot 4) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600">📢</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  School Circulars
                </h3>
              </div>
              <Link href="/portal/student/circulars" className="text-xs text-indigo-600 font-semibold hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5 pt-1">
              {circulars.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{c.title}</span>
                    {c.urgent && <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[9px] font-bold">Urgent</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
