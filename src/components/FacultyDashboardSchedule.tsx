"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

interface TeacherClassItem {
  class_id: string;
  subject?: string;
  is_class_teacher?: boolean;
  classes?: {
    id: string;
    name: string;
    section: string;
    academic_year?: string;
  };
}

interface Props {
  teacherClassesList: TeacherClassItem[];
  todayMarkedClassIds: string[];
}

export default function FacultyDashboardSchedule({
  teacherClassesList,
  todayMarkedClassIds,
}: Props) {
  const [scheduleMode, setScheduleMode] = useState<"today" | "this_week" | "this_month">("today");

  const markedSet = new Set(todayMarkedClassIds);

  const times = [
    "08:30 AM – 09:15 AM",
    "09:15 AM – 10:00 AM",
    "10:15 AM – 11:00 AM",
    "11:00 AM – 11:45 AM",
    "12:30 PM – 01:15 PM",
    "01:15 PM – 02:00 PM",
  ];

  const weeklyTeachingSchedule = [
    { day: "Monday", periods: "6 Periods", focus: "Class 10-A (Quadratic Systems) & 9-A (Polynomials)", room: "Room 101 & 204" },
    { day: "Tuesday", periods: "5 Periods", focus: "Class 10-A (Math Lab) & 9-B (Coordinate Geometry)", room: "Math Discovery Lab" },
    { day: "Wednesday", periods: "6 Periods", focus: "Class 10-A (Remedial Clinic) & 10-B (Trigonometry)", room: "Room 101 & 102" },
    { day: "Thursday", periods: "5 Periods", focus: "Class 9-A (Number Systems) & 10-A (Board Practice)", room: "Room 204" },
    { day: "Friday", periods: "6 Periods", focus: "Class 10-A (Syllabus Milestone Review) & Robotics Lab", room: "Innovation Lab" },
    { day: "Saturday", periods: "4 Periods", focus: "Weekly Diagnostic Assessment & Remedial Drills", room: "Senior Hall" },
  ];

  const monthlyAcademicCalendar = [
    { date: "Oct 02", title: "Gandhi Jayanti (Institutional Holiday)", type: "holiday", badge: "School Closed" },
    { date: "Oct 08", title: "Unit 3 Syllabus Completion Target Deadline", type: "academic", badge: "Curriculum" },
    { date: "Oct 12 – Oct 20", title: "Summative Assessment 1 (SA-1) Examination Window", type: "exam", badge: "Exam Duty" },
    { date: "Oct 22", title: "Dussehra Vacation Begins", type: "vacation", badge: "5 Days" },
    { date: "Oct 28", title: "Parent-Teacher Consultation & Academic Report Release", type: "ptm", badge: "Office Hours" },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header with Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 text-lg">🗓️</span>
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class Schedule &amp; Timetable
          </h2>
        </div>

        {/* Segmented Toggle Control */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-medium text-slate-600 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setScheduleMode("today")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              scheduleMode === "today"
                ? "bg-white shadow-2xs font-bold text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode("this_week")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              scheduleMode === "this_week"
                ? "bg-white shadow-2xs font-bold text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode("this_month")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              scheduleMode === "this_month"
                ? "bg-white shadow-2xs font-bold text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* ── MODE 1: TODAY'S SCHEDULE ── */}
      {scheduleMode === "today" && (
        <div className="space-y-3">
          {teacherClassesList.map((item, idx) => {
            const cls = item.classes;
            const classId = cls?.id || item.class_id;
            const isMarked = markedSet.has(classId);

            return (
              <div
                key={classId || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition gap-3"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold whitespace-nowrap">
                    {times[idx % times.length]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>Class {cls?.name || "10"}-{cls?.section || "A"} &bull; {item.subject || "Mathematics"}</span>
                      {item.is_class_teacher && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Class Teacher
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> Room {200 + idx}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> 42 Students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isMarked ? (
                    <span className="badge badge-green text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Roll Call Done
                    </span>
                  ) : (
                    <span className="badge badge-amber text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Attendance Pending
                    </span>
                  )}
                  <Link
                    href={`/dashboard/attendance/${classId}`}
                    className="btn btn-ghost text-xs px-3 py-1.5 rounded-lg hover:bg-slate-200/60 font-semibold"
                  >
                    Take Roll Call &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODE 2: THIS WEEK'S TEACHING BREAKDOWN ── */}
      {scheduleMode === "this_week" && (
        <div className="space-y-2.5">
          {weeklyTeachingSchedule.map((item) => (
            <div
              key={item.day}
              className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{item.day}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                    {item.periods}
                  </span>
                </div>
                <div className="text-xs text-slate-600">{item.focus}</div>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 self-start sm:self-auto">
                <MapPin className="w-3 h-3 text-slate-400" /> {item.room}
              </div>
            </div>
          ))}
          <div className="pt-2 text-right">
            <Link href="/portal/faculty/schedule" className="text-xs text-indigo-600 hover:underline font-bold inline-flex items-center gap-1">
              View Master Timetable Grid <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── MODE 3: THIS MONTH'S ACADEMIC MILESTONES ── */}
      {scheduleMode === "this_month" && (
        <div className="space-y-2.5">
          {monthlyAcademicCalendar.map((evt) => (
            <div
              key={evt.title}
              className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-mono text-xs font-bold whitespace-nowrap">
                  {evt.date}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{evt.type} Milestone</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                evt.type === "holiday"
                  ? "bg-slate-100 text-slate-700"
                  : evt.type === "exam"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {evt.badge}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
