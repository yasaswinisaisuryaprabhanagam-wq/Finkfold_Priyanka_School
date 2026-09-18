"use client";

import { useState, useEffect, useTransition } from "react";
import type { StudentLeave } from "@/types/self-service";
import { INITIAL_LEAVES } from "@/types/self-service";
import { getLeavesData, submitLeaveApplicationAction } from "@/actions/leaves";
import {
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trophy,
  Award,
  ShieldCheck,
  UserCheck,
  Building,
  Info
} from "lucide-react";

export default function LeavesAndOdPage() {
  const [activeTab, setActiveTab] = useState<"apply" | "od">("apply");
  const [leaves, setLeaves] = useState<StudentLeave[]>(INITIAL_LEAVES);

  // Form states
  const [leaveType, setLeaveType] = useState<StudentLeave["leaveType"]>("sick_leave");
  const [startDate, setStartDate] = useState("2026-09-22");
  const [endDate, setEndDate] = useState("2026-09-23");
  const [totalDays, setTotalDays] = useState(2);
  const [reason, setReason] = useState("");
  const [medicalDocName, setMedicalDocName] = useState("");

  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getLeavesData().then((res) => {
      if (res && res.length > 0) setLeaves(res);
    });
  }, []);

  const isMedicalRequired = totalDays > 3 || leaveType === "medical_leave";

  function handleLeaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;

    startTransition(async () => {
      const res = await submitLeaveApplicationAction({
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason: reason.trim(),
        medicalDocName: isMedicalRequired ? medicalDocName || "Dr_Murthy_Medical_Certificate.pdf" : undefined,
      });

      if (res.success) {
        setLeaves((prev) => [res.leave, ...prev]);
        setNotification(res.message);
        setReason("");
        setMedicalDocName("");
        setTimeout(() => setNotification(null), 8000);
      }
    });
  }

  const odLeaves = leaves.filter((l) => l.leaveType === "on_duty");
  const regularLeaves = leaves.filter((l) => l.leaveType !== "on_duty");

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white border border-teal-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-semibold uppercase tracking-wider w-fit mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Digital Attendance & Exemption Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Leave Applications & On-Duty (OD) Roster
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Submit sick & casual leave requests online with automatic medical certificate verification for extended illness.
            Review certified On-Duty (OD) presence credits for inter-school sports & Olympiads.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("apply")}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "apply"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-900/50 font-semibold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Digital Leave Application ({regularLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab("od")}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "od"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 font-semibold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            On-Duty (OD) Representation Log ({odLeaves.length})
          </button>
        </div>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-teal-400" />
          <div className="text-sm">
            <span className="font-semibold block mb-0.5">Success!</span>
            {notification}
          </div>
        </div>
      )}

      {/* TAB 1: APPLY DIGITAL LEAVE */}
      {activeTab === "apply" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Apply for Student Absence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Absences are digitally recorded on the teacher&apos;s daily attendance ledger.
              </p>

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="sick_leave">Sick Leave (1–2 Days)</option>
                    <option value="medical_leave">Extended Medical Leave (&gt;3 Days, Doctor Certificate Required)</option>
                    <option value="casual_leave">Casual / Family Function Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Total Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={totalDays}
                      onChange={(e) => setTotalDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                {/* Conditional Medical Certificate Upload */}
                {isMedicalRequired && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Mandatory Medical Certificate Required (&gt; 3 Days Absence)
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      School regulations mandate a signed physician prescription/certificate for any medical leave longer than 3 consecutive school days.
                    </p>
                    <div>
                      <input
                        type="text"
                        placeholder="Attach Document: e.g. Dr_Murthy_Medical_Certificate.pdf"
                        value={medicalDocName}
                        onChange={(e) => setMedicalDocName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Reason for Absence *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed explanation for the class teacher & academic office..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !reason.trim()}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  {isPending ? "Submitting Application..." : "Submit Digital Leave Application"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: History & Approval Status */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Recent Leave Applications
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Approved leaves are automatically recognized on your monthly attendance scorecard.
              </p>

              <div className="space-y-4">
                {regularLeaves.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No active leave requests recorded.
                  </div>
                ) : (
                  regularLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md">
                          {l.leaveType.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            l.status === "approved"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {l.status.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {l.startDate} – {l.endDate} ({l.totalDays} {l.totalDays === 1 ? "day" : "days"})
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {l.reason}
                        </p>
                      </div>

                      {l.medicalDocName && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-teal-500" />
                          <span>Medical Proof: <strong>{l.medicalDocName}</strong></span>
                        </div>
                      )}

                      {/* Approval Stepper */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Class Teacher Approved
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Principal Endorsed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ON-DUTY (OD) REPRESENTATION ROSTER */}
      {activeTab === "od" && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 border border-emerald-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Trophy className="w-4 h-4" />
                Co-Curricular & Sports Honor Roster
              </div>
              <h2 className="text-xl font-bold">Official On-Duty (OD) Academic Presence Credit</h2>
              <p className="text-slate-300 text-xs mt-1">
                Absences during school representation do not penalize your mandatory 75% attendance threshold. Attendance is officially recorded as &quot;Present - On Duty&quot;.
              </p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 border border-emerald-500/30">
              Total OD Credits: 2 Days
            </div>
          </div>

          {/* OD Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {odLeaves.map((od) => (
              <div
                key={od.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified On-Duty
                  </span>
                  <span className="text-xs text-slate-400">{od.startDate} – {od.endDate}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {od.onDutyDetails?.eventName || "Official School Delegation"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {od.reason}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Organizing Authority:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{od.onDutyDetails?.organizer}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Escorting Faculty:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{od.onDutyDetails?.facultyInCharge}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Attendance Credit:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">+{od.totalDays} Days 100% Attendance</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
