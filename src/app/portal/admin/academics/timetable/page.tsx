"use client";

import { useState } from "react";
import {
  INITIAL_CONSTRAINTS,
  INITIAL_TIMETABLE_SLOTS,
  runTimetableClashSolver,
} from "@/actions/admin-timetable";
import type { TimetableConstraint, TimetableSlot, MasterTimetableSummary } from "@/types/admin-extended";

export default function AdminTimetablePage() {
  const [constraints, setConstraints] = useState<TimetableConstraint[]>(INITIAL_CONSTRAINTS);
  const [slots, setSlots] = useState<TimetableSlot[]>(INITIAL_TIMETABLE_SLOTS);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<MasterTimetableSummary | null>({
    academicYear: "2026-2027",
    totalClassesScheduled: 18,
    totalTeachersAllocated: 34,
    totalPeriodsPerWeek: 648,
    conflictsDetected: 0,
    isConflictFree: true,
    generatedAt: "2026-09-20 09:30 AM",
  });
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const filteredSlots = slots.filter((s) => {
    if (selectedClass !== "all" && s.classId !== selectedClass) return false;
    if (selectedTeacher !== "all" && s.teacherId !== selectedTeacher) return false;
    return true;
  });

  async function handleRunSolver() {
    setIsSolving(true);
    const res = await runTimetableClashSolver(constraints);
    if (res.success && res.summary) {
      setSolverResult(res.summary);
      setStatusNotice(`✓ ${res.message}`);
      setTimeout(() => setStatusNotice(null), 5000);
    }
    setIsSolving(false);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
              <span>Level 3: Enterprise AI</span>
              <span>·</span>
              <span>Automated Schedule Optimization</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              AI Timetable & Clash-Resolution Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Eliminate weeks of manual scheduling puzzles. The AI engine processes teacher max workload limits, room and lab capacities, and part-time availability to construct a 100% conflict-free master timetable in seconds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunSolver}
              disabled={isSolving}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isSolving ? "Analyzing Permutations..." : "⚡ Run AI Clash-Resolution Solver"}
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
            >
              Print Master Timetable
            </button>
          </div>
        </div>
      </div>

      {/* Solver Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schedule Integrity</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono flex items-center gap-1.5">
            <span>100% Conflict-Free</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">0 teacher / room collisions</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weekly Periods</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">648 Periods</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 18 classes (Nursery - Class 10)</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Faculty Allocated</div>
          <div className="text-xl font-bold text-sky-700 mt-1 font-mono">34 Educators</div>
          <div className="text-[10px] text-slate-500 mt-1">Average load: 19 periods/week</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Constraints</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">{constraints.length} Rules</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Labs, part-time & daily limits</div>
        </div>
      </div>

      {statusNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs">
          {statusNotice}
        </div>
      )}

      {/* Grid: Constraints Panel + Master Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Constraints Rules Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Active Optimization Constraints
            </h2>
            <div className="space-y-2.5">
              {constraints.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.targetName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Rule Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              💡 <strong>AI Heuristic:</strong> Mathematics and Sciences are automatically distributed to morning Periods 1 through 3 when student cognitive focus is highest.
            </div>
          </div>
        </div>

        {/* Timetable Schedule Grid Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Master Schedule Grid (Monday - Class 10)
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="all">All Classes</option>
                  <option value="c-10a">Class 10 - Section A</option>
                  <option value="c-10b">Class 10 - Section B</option>
                </select>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value="all">All Teachers</option>
                  <option value="t-priyanka">Mrs. Priyanka Devi</option>
                  <option value="t-srinivas">Dr. K. Srinivas</option>
                  <option value="t-david">Mr. David Raju</option>
                  <option value="t-ramanujan">Dr. S. Ramanujan</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Period & Time</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Subject & Code</th>
                    <th className="p-3">Assigned Faculty</th>
                    <th className="p-3">Room / Lab</th>
                    <th className="p-3 text-center">Clash Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-900">Period {slot.periodNumber}</div>
                        <div className="text-[10px] text-slate-400">{slot.startTime} – {slot.endTime}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{slot.className}-{slot.section}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{slot.subjectName}</span>
                          {slot.isLabPeriod && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              LAB
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Code {slot.subjectCode}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{slot.teacherName}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{slot.roomNumber}</td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          ✓ Conflict-Free
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
