"use client";

import { useState, useTransition } from "react";
import { TeacherLeaveBalance, StaffPayslip, BiometricLogEntry } from "@/types/faculty";
import { applyTeacherLeaveAction, regularizeBiometricAttendanceAction } from "@/actions/faculty";
import { downloadFacultyPayslipPdf } from "@/lib/pdfDownloader";

interface Props {
  initialLeaveBalance: TeacherLeaveBalance;
  initialPayslips: StaffPayslip[];
  initialBiometrics: BiometricLogEntry[];
}

export default function FacultyHrClient({
  initialLeaveBalance,
  initialPayslips,
  initialBiometrics,
}: Props) {
  const [leaveBalance, setLeaveBalance] = useState<TeacherLeaveBalance>(initialLeaveBalance);
  const [payslips] = useState<StaffPayslip[]>(initialPayslips);
  const [biometrics, setBiometrics] = useState<BiometricLogEntry[]>(initialBiometrics);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // Leave Form State
  const [leaveType, setLeaveType] = useState<"casualLeave" | "sickLeave" | "earnedLeave">("casualLeave");
  const [startDate, setStartDate] = useState("2026-09-22");
  const [endDate, setEndDate] = useState("2026-09-22");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // Biometric Regularization Modal
  const [regLogId, setRegLogId] = useState<string | null>(null);
  const [regReason, setRegReason] = useState("");

  const handleApplyLeave = () => {
    if (!leaveReason) return;
    startTransition(async () => {
      const res = await applyTeacherLeaveAction({
        leaveType,
        startDate,
        endDate,
        reason: leaveReason,
      });
      if (res.success && res.leaveBalance) {
        setLeaveBalance(res.leaveBalance);
        setNotification(res.message);
        setLeaveModalOpen(false);
        setLeaveReason("");
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification(res.message);
      }
    });
  };

  const handleRegularizePunch = () => {
    if (!regLogId || !regReason) return;
    startTransition(async () => {
      const res = await regularizeBiometricAttendanceAction({
        logId: regLogId,
        reason: regReason,
      });
      if (res.success) {
        setBiometrics((prev) =>
          prev.map((b) => (b.id === regLogId ? { ...b, status: "regularized", regularizationReason: regReason } : b))
        );
        setNotification(res.message);
        setRegLogId(null);
        setRegReason("");
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>🌴</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner - Clean White & Soft Pastel Style */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                Enterprise HRIS Hub
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Leaves • Payslips • Biometrics
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Staff Self-Service HR &amp; Payroll Portal
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Track live leave quotas, download monthly bank payslips, declare Section 80C investments, and regularize biometric punch errors directly from your phone.
            </p>
          </div>

          <button
            onClick={() => setLeaveModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📝</span>
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* 3 Live Leave Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Casual Leave (CL)</span>
            <span className="text-lg">🌴</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{leaveBalance.casualLeave.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {leaveBalance.casualLeave.total} Days Left</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {leaveBalance.casualLeave.used} days utilized this academic term
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Medical / Sick Leave (SL)</span>
            <span className="text-lg">🩺</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{leaveBalance.sickLeave.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {leaveBalance.sickLeave.total} Days Left</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {leaveBalance.sickLeave.used} days utilized
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">Earned Leave (EL)</span>
            <span className="text-lg">⭐</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{leaveBalance.earnedLeave.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {leaveBalance.earnedLeave.total} Days Available</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Eligible for vacation encashment
          </div>
        </div>
      </div>

      {/* 2-Column: Payslips (Left) & Biometrics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Salary Slips Vault */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Payslip Vault & Tax Forms</h3>
              <p className="text-[11px] text-muted-foreground">Direct bank direct-deposit salary records.</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              Direct Deposit
            </span>
          </div>

          <div className="space-y-3">
            {payslips.map((pay) => (
              <div key={pay.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-foreground">{pay.monthYear}</div>
                    <div className="text-[10px] text-muted-foreground">Disbursed on {pay.disbursedDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-foreground">
                      ₹{pay.netPayInr.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Net Disbursed</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] bg-background/60 p-2 rounded-lg border border-border/60">
                  <div>
                    <span className="text-muted-foreground">Gross:</span>{" "}
                    <strong className="text-foreground">₹{pay.grossSalaryInr.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">EPF:</span>{" "}
                    <strong className="text-foreground">₹{pay.deductions.epf}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TDS Tax:</span>{" "}
                    <strong className="text-foreground">₹{pay.deductions.tdsIncomeTax}</strong>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => downloadFacultyPayslipPdf(pay, "Mrs. Priyanka Devi")}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition shadow-2xs"
                  >
                    <span>📥</span> Download Salary Slip PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 80C Box */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-foreground">Income Tax Declaration (Sec 80C)</div>
              <div className="text-[10px] text-muted-foreground">Declared: ₹1,50,000 (PPF + Tuition + LIC)</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
              Verified by Accounts
            </span>
          </div>
        </div>

        {/* Right Col: Biometric Punch Sync View */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Biometric Punch-In / Punch-Out Log</h3>
              <p className="text-[11px] text-muted-foreground">Synced from Campus Gate 1 & Gate 2 biometric thumb scanners.</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
              Live Biometrics
            </span>
          </div>

          <div className="space-y-3">
            {biometrics.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">{log.date}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>In: <strong className="text-foreground">{log.inTime}</strong></span>
                    <span>•</span>
                    <span>Out: <strong className="text-foreground">{log.outTime}</strong></span>
                  </div>
                  {log.regularizationReason && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                      Reason: {log.regularizationReason}
                    </div>
                  )}
                </div>

                <div>
                  {log.status === "missing_punch" ? (
                    <button
                      onClick={() => setRegLogId(log.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-colors"
                    >
                      Regularize
                    </button>
                  ) : log.status === "regularized" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Regularization Pending
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Present (On-Time)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Apply for Leave */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Apply for Staff Leave</h3>
              <button onClick={() => setLeaveModalOpen(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                >
                  <option value="casualLeave">Casual Leave (CL) — {leaveBalance.casualLeave.remaining} Days Remaining</option>
                  <option value="sickLeave">Medical / Sick Leave (SL) — {leaveBalance.sickLeave.remaining} Days Remaining</option>
                  <option value="earnedLeave">Earned Leave (EL) — {leaveBalance.earnedLeave.remaining} Days Remaining</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Attending family wedding in Hyderabad. Class substitution notes uploaded to Relief Desk."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyLeave}
                disabled={isPending || !leaveReason}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Submit to Principal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Biometric Regularization */}
      {regLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Request Biometric Punch Regularization</h3>
              <button onClick={() => setRegLogId(null)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <p className="text-xs text-muted-foreground">
              Explain why the campus biometric scanner did not register your thumb punch on this date.
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Reason for Missing Punch</label>
              <textarea
                rows={3}
                placeholder="e.g. Arrived on time at 08:15 AM at Gate 2, but the scanner displayed 'Device Error'."
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setRegLogId(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleRegularizePunch}
                disabled={isPending || !regReason}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Submit Regularization to HR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
