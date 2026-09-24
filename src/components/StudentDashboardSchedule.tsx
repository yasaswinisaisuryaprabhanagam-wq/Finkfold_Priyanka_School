"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, ChevronRight, CheckCircle2 } from "lucide-react";

interface ScheduleItem {
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

export default function StudentDashboardSchedule({
  timetable,
}: {
  timetable: ScheduleItem[];
}) {
  const [scheduleMode, setScheduleMode] = useState<"today" | "this_week" | "this_month">("today");

  const weeklySchedule = [
    { day: "Monday", focus: "Core Mathematics & Quadratic Theory", lab: "Physics Mechanics Lab", periods: 7 },
    { day: "Tuesday", focus: "Chemical Reactions & Equations", lab: "Chemistry Lab 1", periods: 7 },
    { day: "Wednesday", focus: "English Formal Rhetoric & Essay", lab: "Computer Science & Robotics", periods: 7 },
    { day: "Thursday", focus: "Social Studies & Economic Geography", lab: "Biology Specimen Lab", periods: 7 },
    { day: "Friday", focus: "Second Language Telugu Grammar", lab: "Library & Research Block", periods: 7 },
    { day: "Saturday", focus: "Weekly Chapter Tests & Remedial Clinics", lab: "Sports & Physical Ed", periods: 5 },
  ];

  const monthlyEvents = [
    { date: "Oct 02", title: "Gandhi Jayanti (Institutional Holiday)", type: "holiday", badge: "School Closed" },
    { date: "Oct 10 – Oct 18", title: "Summative Assessment 1 (SA-1) Examination Window", type: "exam", badge: "Board Exam" },
    { date: "Oct 20", title: "Dussehra & Autumn Vacation Begins", type: "vacation", badge: "Term Break" },
    { date: "Oct 25", title: "Annual Cultural & Science Exhibition Showcase", type: "event", badge: "Main Campus" },
    { date: "Oct 28", title: "Parent-Teacher Meeting (PTM) & SA-1 Grade Report Release", type: "ptm", badge: "Mandatory" },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 text-lg">🗓️</span>
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class Schedule
          </h2>
        </div>

        {/* Segmented Toggle Control */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-medium text-slate-600 self-start sm:self-auto">
          <button
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

      {/* MODE 1: TODAY */}
      {scheduleMode === "today" && (
        <div className="space-y-3">
          {timetable.map((row) => (
            <div
              key={row.period}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition gap-3"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold whitespace-nowrap">
                  {row.time}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{row.subject}</span>
                    <span className="text-[10px] font-semibold text-slate-400">P{row.period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>👤 {row.teacher}</span>
                    <span>&bull;</span>
                    <span>📍 {row.room}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Scheduled
                </span>
              </div>
            </div>
          ))}

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400">Showing today&apos;s active periods</span>
            <Link href="/portal/student/timetable" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Open Full Timetable &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* MODE 2: THIS WEEK */}
      {scheduleMode === "this_week" && (
        <div className="space-y-3">
          {weeklySchedule.map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-100 hover:bg-indigo-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {item.day}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.focus}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>🧪 Practical Block: <strong className="text-purple-700 font-semibold">{item.lab}</strong></span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-slate-700 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {item.periods} Periods
                </span>
              </div>
            </div>
          ))}

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400">Standard 6-day academic cycle</span>
            <Link href="/portal/student/timetable" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              View Timetable Grid &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* MODE 3: THIS MONTH */}
      {scheduleMode === "this_month" && (
        <div className="space-y-3">
          {monthlyEvents.map((ev, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono whitespace-nowrap">
                  {ev.date}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{ev.title}</h3>
                  <div className="text-[11px] text-slate-400 capitalize">Category: {ev.type}</div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md self-start sm:self-center ${
                  ev.type === "exam"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : ev.type === "holiday"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                {ev.badge}
              </span>
            </div>
          ))}

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400">Term 1 Academic Almanac 2026-27</span>
            <Link href="/portal/student/circulars" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Official Circulars &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
