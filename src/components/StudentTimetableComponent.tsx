"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";

interface SlotItem {
  id?: string;
  day: string;
  period: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  isLab?: boolean;
}

export default function StudentTimetableComponent({
  slots,
  className,
  todayName,
  todayFormatted,
}: {
  slots: SlotItem[];
  className: string;
  todayName: string;
  todayFormatted: string;
}) {
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [selectedDay, setSelectedDay] = useState<string>(
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].includes(todayName)
      ? todayName
      : "Monday"
  );

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const periodsMeta = [
    { period: 1, time: "08:30 – 09:15", label: "Period 1" },
    { period: 2, time: "09:15 – 10:00", label: "Period 2" },
    { period: 3, time: "10:15 – 11:00", label: "Period 3" },
    { period: 4, time: "11:00 – 11:45", label: "Period 4" },
    { period: 5, time: "12:30 – 01:15", label: "Period 5" },
    { period: 6, time: "01:15 – 02:00", label: "Period 6" },
    { period: 7, time: "02:15 – 03:00", label: "Period 7" },
  ];

  // Active period calculation
  const now = new Date();
  const currentHour = now.getHours() * 60 + now.getMinutes();
  const periodRanges = [
    [510, 555], [555, 600], [615, 660], [660, 705],
    [750, 795], [795, 840], [855, 900],
  ];
  const activePeriod = periodRanges.findIndex(([start, end]) => currentHour >= start && currentHour < end) + 1;

  // Filter slots for selected day in Daily mode
  const dailySlots = slots.filter((s) => s.day === selectedDay).sort((a, b) => a.period - b.period);

  const activeSlot = dailySlots.find((s) => s.period === activePeriod);

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <span>🗓️</span>
            <span>Class {className} Schedule Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Academic Timetable
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{todayFormatted}</p>
        </div>

        {/* View Switcher (Daily vs Weekly) */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === "daily"
                ? "bg-white text-indigo-950 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ☀️ Daily Schedule
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === "weekly"
                ? "bg-white text-indigo-950 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🗓️ Weekly Grid (Mon–Sat)
          </button>
        </div>
      </div>

      {/* ── DAILY VIEW ── */}
      {viewMode === "daily" && (
        <div className="space-y-6">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {daysOfWeek.map((day) => {
              const isToday = day === todayName;
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Period Banner */}
          {selectedDay === todayName && activePeriod > 0 && activeSlot && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Currently in Session</div>
                  <div className="text-base font-extrabold text-slate-900">
                    Period {activePeriod}: {activeSlot.subject}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-emerald-800 font-medium">
                <span className="flex items-center gap-1">👤 {activeSlot.teacher}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">📍 {activeSlot.room}</span>
                <span>&bull;</span>
                <span className="font-mono">{activeSlot.time}</span>
              </div>
            </div>
          )}

          {/* Daily Schedule Cards */}
          <div className="grid grid-cols-1 gap-3">
            {dailySlots.map((slot) => {
              const isCurrent = selectedDay === todayName && activePeriod === slot.period;
              return (
                <div
                  key={slot.period}
                  className={`p-4 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? "border-emerald-300 ring-2 ring-emerald-100 shadow-sm"
                      : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold ${
                        isCurrent
                          ? "bg-emerald-600 text-white"
                          : slot.isLab
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold leading-none">P</span>
                      <span className="text-base leading-none mt-0.5">{slot.period}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-slate-900">{slot.subject}</h3>
                        {slot.isLab && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                            Lab Session
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold animate-pulse">
                            Active Now
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">👤 {slot.teacher}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">📍 {slot.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right self-end sm:self-center">
                    <div className="font-mono text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                      {slot.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WEEKLY GRID VIEW ── */}
      {viewMode === "weekly" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Full Weekly Class Schedule
              </h2>
              <p className="text-xs text-slate-500">All 7 instructional periods from Monday to Saturday.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
                🧪 Practical / Lab
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                📖 Core Theory
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-32">Period &amp; Time</th>
                  {daysOfWeek.map((day) => (
                    <th
                      key={day}
                      className={`py-3 px-4 min-w-[150px] ${
                        day === todayName ? "bg-indigo-50/70 text-indigo-950 font-black border-x border-indigo-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{day}</span>
                        {day === todayName && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodsMeta.map((p) => {
                  return (
                    <tr key={p.period} className="hover:bg-slate-50/40 transition">
                      <td className="py-3.5 px-4 bg-slate-50/50 border-r border-slate-100">
                        <div className="font-bold text-slate-900">{p.label}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.time}</div>
                      </td>
                      {daysOfWeek.map((day) => {
                        const slot = slots.find((s) => s.day === day && s.period === p.period);
                        const isCurrentCell = day === todayName && activePeriod === p.period;

                        return (
                          <td
                            key={day}
                            className={`py-3 px-3 align-top transition-colors ${
                              day === todayName ? "bg-indigo-50/20 border-x border-indigo-50" : ""
                            } ${isCurrentCell ? "bg-emerald-50/60 ring-1 ring-emerald-300" : ""}`}
                          >
                            {slot ? (
                              <div
                                className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                                  slot.isLab
                                    ? "bg-purple-50/60 border-purple-200 text-purple-950"
                                    : "bg-white border-slate-200/80 text-slate-800"
                                }`}
                              >
                                <div className="font-bold leading-tight flex items-center justify-between">
                                  <span>{slot.subject}</span>
                                  {slot.isLab && <span>🧪</span>}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {slot.teacher}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {slot.room}
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic p-2.5">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
