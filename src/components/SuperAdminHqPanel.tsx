"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { dispatchLessonPlanSlaWarning } from "@/actions/superAdmin";

interface TeacherSlaStatus {
  id: string;
  name: string;
  subject: string;
  branch: string;
  submissionTime: string;
  status: "on_time" | "sla_breach" | "pending";
  breachCount: number;
}

const INITIAL_TEACHERS: TeacherSlaStatus[] = [
  {
    id: "t1",
    name: "Mrs. S. Sharma",
    subject: "Mathematics (Grades 9-10)",
    branch: "Main Campus",
    submissionTime: "03:15 PM",
    status: "on_time",
    breachCount: 0,
  },
  {
    id: "t2",
    name: "Mr. K. Rao",
    subject: "Physics (Grades 11-12)",
    branch: "North Campus",
    submissionTime: "04:10 PM",
    status: "on_time",
    breachCount: 1,
  },
  {
    id: "t3",
    name: "Mrs. P. Varma",
    subject: "Chemistry (Grades 9-10)",
    branch: "East City",
    submissionTime: "Overdue (05:45 PM)",
    status: "sla_breach",
    breachCount: 2,
  },
  {
    id: "t4",
    name: "Mr. A. Nair",
    subject: "English Literature",
    branch: "Main Campus",
    submissionTime: "02:45 PM",
    status: "on_time",
    breachCount: 0,
  },
  {
    id: "t5",
    name: "Ms. D. Reddy",
    subject: "Biology & Life Sciences",
    branch: "North Campus",
    submissionTime: "Not Submitted",
    status: "pending",
    breachCount: 3,
  },
  {
    id: "t6",
    name: "Mr. R. Joshi",
    subject: "Computer Science & AI",
    branch: "East City",
    submissionTime: "04:00 PM",
    status: "on_time",
    breachCount: 0,
  },
];

export default function SuperAdminHqPanel() {
  const [teachers, setTeachers] = useState<TeacherSlaStatus[]>(INITIAL_TEACHERS);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loadingTeacherId, setLoadingTeacherId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDispatchWarning = (teacher: TeacherSlaStatus) => {
    setLoadingTeacherId(teacher.id);
    startTransition(async () => {
      const res = await dispatchLessonPlanSlaWarning(
        teacher.name,
        teacher.branch,
        teacher.breachCount + 1
      );
      setLoadingTeacherId(null);
      if (res.success) {
        setAlertMessage(res.message);
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === teacher.id ? { ...t, breachCount: t.breachCount + 1 } : t
          )
        );
        setTimeout(() => setAlertMessage(null), 7000);
      }
    });
  };

  return (
    <div className="rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-500/20 space-y-6 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            TRUST HQ COMMAND &bull; ELEVATED SUPER ADMIN PRIVILEGES
          </div>
          <h2
            className="text-2xl font-black text-white mt-2 tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            🏛️ Multi-Campus Executive Intelligence Center
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time cross-branch telemetry, centralized treasury control, safe space escalation triages, and institutional lesson plan SLAs.
          </p>
        </div>

        {/* Quick Nav Shortcut Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/admin/treasury"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
          >
            <span>🏛️</span>
            <span>Central Treasury</span>
          </Link>
          <Link
            href="/portal/admin/safespace"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md hover:shadow-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <span>🛡️</span>
            <span>SafeSpace SLA</span>
          </Link>
          <Link
            href="/portal/admin/fees/defaulters"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md hover:shadow-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Chairman&apos;s Waiver</span>
          </Link>
        </div>
      </div>

      {/* Alert toast banner if warning sent */}
      {alertMessage && (
        <div className="relative z-10 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-base">📢</span>
            <span className="font-semibold">{alertMessage}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Multi-Campus KPI Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Campuses */}
        <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Trust Campuses</span>
            <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
              3 Live
            </span>
          </div>
          <div
            className="text-3xl font-black text-white mt-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            3 Branches
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
            <span>Main (HYD)</span> &bull; <span>North</span> &bull; <span>East City</span>
          </div>
        </div>

        {/* Card 2: Total Trust Students */}
        <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Trust Students</span>
            <span className="text-indigo-300 text-[10px] font-bold bg-indigo-500/20 px-2 py-0.5 rounded-full">
              100% Synced
            </span>
          </div>
          <div
            className="text-3xl font-black text-white mt-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            1,842
          </div>
          <div className="text-xs text-indigo-300 mt-1 flex items-center gap-1">
            <span>840 Main</span> &bull; <span>520 North</span> &bull; <span>482 East</span>
          </div>
        </div>

        {/* Card 3: 4:30 PM Lesson Plan SLA */}
        <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>4:30 PM SLA Compliance</span>
            <span className="text-amber-300 text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">
              4 Overdue
            </span>
          </div>
          <div
            className="text-3xl font-black text-amber-400 mt-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            93.8%
          </div>
          <div className="text-xs text-slate-300 mt-1">
            58/62 Teachers submitted before 4:30 PM deadline
          </div>
        </div>

        {/* Card 4: SafeSpace SLA Escalations */}
        <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Critical Grievances</span>
            <span className="text-rose-400 text-[10px] font-bold bg-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
              Needs SA Triage
            </span>
          </div>
          <div
            className="text-3xl font-black text-rose-400 mt-2"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            2 Breaches
          </div>
          <div className="text-xs text-rose-300 mt-1">
            Exceeded 2-hour principal SLA threshold
          </div>
        </div>
      </div>

      {/* Lesson Plan Compliance Heatmap Table */}
      <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>📅</span>
              <span>Cross-Campus Daily Lesson Plan 4:30 PM SLA Compliance Heatmap</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict 4:30 PM daily cut-off. Super Admin oversight automatically logs repeated SLA breaches to staff HR appraisal records.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> On-Time
            </span>
            <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Delayed
            </span>
            <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> SLA Breach
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-white/5 uppercase tracking-wider text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Faculty Member</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Submission Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Monthly Breaches</th>
                <th className="py-2.5 px-3 text-right">Super Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {teacher.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{teacher.subject}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium text-[11px]">
                      {teacher.branch}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {teacher.submissionTime}
                  </td>
                  <td className="py-2.5 px-3">
                    {teacher.status === "on_time" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        ✓ On-Time
                      </span>
                    )}
                    {teacher.status === "sla_breach" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                        ⚠️ SLA Breach
                      </span>
                    )}
                    {teacher.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        teacher.breachCount >= 2
                          ? "text-rose-400"
                          : teacher.breachCount === 1
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {teacher.breachCount} {teacher.breachCount === 1 ? "breach" : "breaches"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {teacher.status !== "on_time" ? (
                      <button
                        onClick={() => handleDispatchWarning(teacher)}
                        disabled={loadingTeacherId === teacher.id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {loadingTeacherId === teacher.id
                          ? "Dispatching..."
                          : "Issue HR Warning ⚡"}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Compliant</span>
                    )}
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
