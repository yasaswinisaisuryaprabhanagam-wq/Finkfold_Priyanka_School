"use client";

import { useState } from "react";
import {
  DEFAULT_PENALTY_RULE,
  INITIAL_DEFAULTERS,
  INITIAL_RECOVERY_METRICS,
  applyLatePenaltyRule,
  dispatchDefaulterWhatsAppReminders,
} from "@/actions/admin-defaulters";
import type { DefaulterRecord, LatePenaltyRule } from "@/types/admin-extended";

export default function AdminFeeDefaultersPage() {
  const [rule, setRule] = useState<LatePenaltyRule>(DEFAULT_PENALTY_RULE);
  const [defaulters, setDefaulters] = useState<DefaulterRecord[]>(INITIAL_DEFAULTERS);
  const [metrics, setMetrics] = useState(INITIAL_RECOVERY_METRICS);
  const [isUpdatingRule, setIsUpdatingRule] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSaveRule(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdatingRule(true);
    const res = await applyLatePenaltyRule(rule);
    if (res.success) {
      setStatusMessage(`✓ ${res.message}`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
    setIsUpdatingRule(false);
  }

  async function handleSendReminders() {
    setIsSendingWhatsApp(true);
    const pendingIds = defaulters.filter((d) => d.status === "pending").map((d) => d.id);
    const res = await dispatchDefaulterWhatsAppReminders(pendingIds);
    if (res.success) {
      setStatusMessage(`✓ ${res.message} (Dispatched at ${res.timestamp})`);
      setDefaulters(
        defaulters.map((d) =>
          d.status === "pending"
            ? { ...d, remindersCount: d.remindersCount + 1, lastReminderSentAt: `Today, ${res.timestamp}` }
            : d
        )
      );
      setMetrics({
        ...metrics,
        automatedRemindersDispatched: metrics.automatedRemindersDispatched + pendingIds.length,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    }
    setIsSendingWhatsApp(false);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100 mb-2">
              <span>Level 2: Revenue Automation</span>
              <span>·</span>
              <span>Defaulters & Collections</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Automated Defaulter & Late-Penalty Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Stop manually calling unpaid parents. Automatically compute daily late fees after the monthly grace period and trigger automated WhatsApp notices with direct dynamic UPI payment links.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendReminders}
              disabled={isSendingWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {isSendingWhatsApp ? "Dispatching WhatsApps..." : "⚡ Broadcast WhatsApp Notices to Defaulters"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats & Recovery Heatmap */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unpaid Defaulters</div>
          <div className="text-xl font-bold text-rose-700 mt-1 font-mono">{metrics.totalDefaultersCount} Students</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">₹{metrics.totalOutstandingAmount.toLocaleString("en-IN")} Base Dues</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Accrued Late Fees</div>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">₹{metrics.totalPenaltiesAccrued.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">₹50 / day active penalty rule</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recovered This Week</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">₹{(metrics.recoveredThisWeek / 100000).toFixed(1)} Lakhs</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Via automated WhatsApp UPI links</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recovery Efficiency</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">{metrics.recoveryConversionRate}%</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Across {metrics.automatedRemindersDispatched} auto notices</div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
          {statusMessage}
        </div>
      )}

      {/* Main Grid: Penalty Rule Configurator + Defaulters Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rule Configurator Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Late-Penalty Automation Rules
            </h2>
            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Due Cutoff Day</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rule.gracePeriodDays}
                    onChange={(e) => setRule({ ...rule, gracePeriodDays: Number(e.target.value) })}
                    className="w-20 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    min={1}
                    max={28}
                  />
                  <span className="text-xs text-slate-500 font-medium">th of every calendar month</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Penalties start accumulating automatically from the 11th.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Late Penalty Rate</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    value={rule.dailyPenaltyAmount}
                    onChange={(e) => setRule({ ...rule, dailyPenaltyAmount: Number(e.target.value) })}
                    className="w-24 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    min={10}
                    step={10}
                  />
                  <span className="text-xs text-slate-500 font-medium">per overdue day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Penalty Cap</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    value={rule.maxCapAmount}
                    onChange={(e) => setRule({ ...rule, maxCapAmount: Number(e.target.value) })}
                    className="w-24 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    min={500}
                    step={100}
                  />
                  <span className="text-xs text-slate-500 font-medium">ceiling limit</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingRule}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                >
                  {isUpdatingRule ? "Saving Rule..." : "Update Penalty Automation Rule"}
                </button>
              </div>
            </form>
          </div>

          {/* Recovery Heatmap Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Weekly Recovery Heatmap</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Mon - Wed Reminders</span>
                <span className="text-emerald-700 font-mono">₹2.6L (62% recovery)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "62%" }} />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <span className="text-slate-600">Thu - Sat Reminders</span>
                <span className="text-emerald-700 font-mono">₹1.6L (38% recovery)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "38%" }} />
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 font-medium">
              💡 <strong>Executive Insight:</strong> Sending notices at 5:00 PM on Friday yields the highest instant UPI payment conversion.
            </div>
          </div>
        </div>

        {/* Defaulters Roster Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Active Defaulter Queue ({defaulters.length})
              </h2>
              <span className="text-xs text-slate-500 font-medium">Auto-synced with Term 2 Tuition & Bus Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Student & Parent</th>
                    <th className="p-3">Fee Category</th>
                    <th className="p-3 text-right">Base Due</th>
                    <th className="p-3 text-right">Penalty (+{rule.dailyPenaltyAmount}/day)</th>
                    <th className="p-3 text-right">Total Payable</th>
                    <th className="p-3 text-center">Status & Notices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {defaulters.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{d.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{d.admissionNumber} ({d.classGrade})</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Parent: {d.parentName} · <span className="font-mono">{d.parentPhone}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-800 font-semibold">{d.termName}</span>
                        <div className="text-[10px] text-slate-400">Due: {d.dueDate}</div>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        ₹{d.baseDueAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">
                        +₹{d.calculatedPenalty}
                        <div className="text-[9px] text-slate-400 font-normal">({d.overdueDays} days)</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{d.totalPayable.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        {d.status === "cleared" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            ✓ Paid Online
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              Unpaid ({d.overdueDays}d)
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {d.remindersCount} Notice(s) Sent
                            </div>
                          </div>
                        )}
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
