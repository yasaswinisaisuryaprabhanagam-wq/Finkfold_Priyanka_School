"use client";

import { useState } from "react";
import Link from "next/link";
import { switchCampus } from "@/actions/switchCampus";

export default function TreasuryClient({
  orgName,
  branches,
  summary,
  recentTransactions,
  discrepancies,
  currentSchoolId,
}: {
  orgName: string;
  branches: any[];
  summary: {
    totalCash: number;
    totalUpi: number;
    grandTotal: number;
    totalStudents: number;
    flaggedCount: number;
  };
  recentTransactions: any[];
  discrepancies: any[];
  currentSchoolId: string;
}) {
  const [activeTab, setActiveTab] = useState<"branches" | "audit" | "ledger" | "whatsapp">("branches");
  const [switchingBranch, setSwitchingBranch] = useState<string | null>(null);

  async function handleQuickSwitch(schoolId: string) {
    setSwitchingBranch(schoolId);
    const res = await switchCampus(schoolId);
    if (res.success) {
      window.location.href = "/portal/admin/fees";
    }
    setSwitchingBranch(null);
  }

  const cashPct = summary.grandTotal > 0
    ? Math.round((summary.totalCash / summary.grandTotal) * 100)
    : 50;
  const upiPct = 100 - cashPct;

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #091e3a 0%, #102a45 50%, #1e3a8a 100%)" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              HQ Financial Governance &middot; {orgName}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              🏛️ Centralized Treasury & Multi-Branch Audit
            </h1>
            <p className="text-white/70 text-sm">
              Real-time cash & UPI collections roll-up, till reconciliation status, and automated EOD audit trail across all campuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {branches.length} Active Campuses
            </span>
          </div>
        </div>
      </div>

      {/* ── Top Summary Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Grand Total Collections (Today)</div>
          <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
            ₹{summary.grandTotal.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all 3 campuses</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Cash vs. Digital UPI Ratio</div>
          <div className="text-lg font-black text-slate-800 mt-1 flex items-center justify-between">
            <span className="text-emerald-700">Cash: ₹{summary.totalCash.toLocaleString("en-IN")}</span>
            <span className="text-blue-700">UPI: ₹{summary.totalUpi.toLocaleString("en-IN")}</span>
          </div>
          {/* Progress split bar */}
          <div className="h-2 rounded-full bg-blue-600 overflow-hidden flex mt-2">
            <div style={{ width: `${cashPct}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${upiPct}%` }} className="bg-blue-500 h-full" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>{cashPct}% Cash</span>
            <span>{upiPct}% Digital UPI</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Total Trust Students</div>
          <div className="text-3xl font-black text-indigo-900 mt-1 font-mono">
            {summary.totalStudents.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-indigo-600 mt-1">Active student body</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Till Discrepancy Flags</div>
          <div className="text-3xl font-black mt-1 font-mono flex items-center gap-2">
            <span className={summary.flaggedCount > 0 ? "text-rose-600" : "text-emerald-600"}>
              {summary.flaggedCount}
            </span>
            {summary.flaggedCount > 0 ? (
              <span className="badge badge-red text-[10px]">Variance Alert</span>
            ) : (
              <span className="badge badge-green text-[10px]">Zero Variance</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Maker-checker EOD balance</div>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("branches")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "branches"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🏫 Campus Treasury Breakdown ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🚨 Till Discrepancies & Audits ({discrepancies.length})
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "ledger"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📜 Cross-Branch Transactions Ledger
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "whatsapp"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📱 5:30 PM WhatsApp Audit Digest
        </button>
      </div>

      {/* ── TAB 1: CAMPUS BREAKDOWN ── */}
      {activeTab === "branches" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b) => {
              const isCurrent = b.id === currentSchoolId;
              return (
                <div
                  key={b.id}
                  className={`card p-6 space-y-4 transition-all relative ${
                    isCurrent ? "border-2 border-blue-500 bg-blue-50/10 shadow-md" : "border border-slate-200"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        ACTIVE CONTEXT
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏫</span>
                      <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {b.name}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Code: {b.branch_code || "BR-MAIN"} &bull; {b.city || "Nellore"}
                    </div>
                  </div>

                  {/* Financial Mini Stats */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cash Collections:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ₹{Number(b.cashToday || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">UPI / Digital:</span>
                      <span className="font-mono font-bold text-blue-700">
                        ₹{Number(b.upiToday || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold">
                      <span>Total Today:</span>
                      <span className="font-mono text-slate-900 text-sm">
                        ₹{Number(b.totalToday || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="text-slate-500">
                      👥 Students: <strong className="text-slate-800">{b.studentCount || 0}</strong>
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          b.drawerStatus === "verified"
                            ? "badge-green"
                            : b.drawerStatus === "discrepancy_flagged"
                            ? "badge-red"
                            : "badge-yellow"
                        }`}
                      >
                        Till: {b.drawerStatus ? b.drawerStatus.replace("_", " ").toUpperCase() : "OPEN"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      disabled={switchingBranch === b.id}
                      onClick={() => handleQuickSwitch(b.id)}
                      className="btn btn-secondary btn-sm w-full"
                      style={{ justifyContent: "center" }}
                    >
                      {switchingBranch === b.id ? "Switching..." : isCurrent ? "Go to Counter POS →" : "Switch Branch →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: AUDIT & DISCREPANCIES ── */}
      {activeTab === "audit" && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Maker-Checker Daily Till Audits
              </h2>
              <p className="text-xs text-slate-500">Discrepancy surveillance across all campus cash registers</p>
            </div>
            <span className="badge badge-slate">{discrepancies.length} Total Drawers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>Date</th>
                  <th>Cashier</th>
                  <th>System Expected</th>
                  <th>Declared Cash</th>
                  <th>Variance / Discrepancy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                      Zero discrepancies recorded. All branch cash drawers are balanced.
                    </td>
                  </tr>
                ) : (
                  discrepancies.map((d: any) => {
                    const variance = Number(d.discrepancy || 0);
                    return (
                      <tr key={d.id} className={variance !== 0 ? "bg-rose-50/40" : ""}>
                        <td className="font-bold text-slate-800">
                          {d.school?.name || "School Branch"}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {d.school?.branch_code}
                          </div>
                        </td>
                        <td className="text-xs text-slate-600">{d.drawer_date}</td>
                        <td className="text-xs font-medium text-slate-700">
                          {d.cashier?.full_name || "Cashier"}
                        </td>
                        <td className="font-mono text-xs font-bold text-slate-800">
                          ₹{(Number(d.opening_cash) + Number(d.system_cash_collected)).toLocaleString("en-IN")}
                        </td>
                        <td className="font-mono text-xs font-bold text-slate-800">
                          ₹{Number(d.declared_cash || 0).toLocaleString("en-IN")}
                        </td>
                        <td>
                          {variance === 0 ? (
                            <span className="text-xs font-mono font-bold text-emerald-600">₹0 (Balanced)</span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-rose-600">
                              {variance > 0 ? `+₹${variance}` : `-₹${Math.abs(variance)}`}
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              d.status === "verified"
                                ? "badge-green"
                                : d.status === "discrepancy_flagged"
                                ? "badge-red"
                                : "badge-yellow"
                            }`}
                          >
                            {d.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: CROSS-BRANCH LEDGER ── */}
      {activeTab === "ledger" && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              HQ Real-Time Transaction Feed
            </h2>
            <span className="badge badge-blue">{recentTransactions.length} Latest Receipts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Campus</th>
                  <th>Student</th>
                  <th>Payment Mode</th>
                  <th>Date & Time</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                      No transactions recorded yet today.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td className="font-mono text-xs font-bold text-slate-800">{tx.receipt_no}</td>
                      <td>
                        <span className="badge badge-slate text-[10px]">
                          {tx.school?.branch_code || tx.school?.name || "Main"}
                        </span>
                      </td>
                      <td>
                        <div className="font-bold text-slate-800">{tx.student?.full_name || "Student"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Adm: {tx.student?.admission_no}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tx.payment_method === "cash"
                              ? "badge-green"
                              : tx.payment_method === "upi_dynamic"
                              ? "badge-purple"
                              : "badge-blue"
                          }`}
                        >
                          {tx.payment_method.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">
                        {new Date(tx.paid_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-700">
                        ₹{Number(tx.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: WHATSAPP 5:30 PM AUDIT DIGEST PREVIEW ── */}
      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Autonomous 5:30 PM WhatsApp Financial Audit
                </h3>
                <p className="text-xs text-slate-500">Triggered daily at 5:30 PM to Trust Chairman & Principals</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                To resolve cash leakage and trust deficits across physical branches, Finkfold EdOS autonomously compiles the end-of-day cash till balances, dynamic UPI bank receipts, and cashier variances into a formatted WhatsApp financial statement.
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                <div className="font-bold">✓ Zero Manual Reporting</div>
                <div className="text-[11px]">
                  Principals and cashiers do not need to prepare Excel sheets. The system automatically cross-audits drawer declarations against POS transactions.
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Message Preview Bubble */}
          <div className="bg-[#e5ddd5] p-5 rounded-3xl shadow-inner max-w-md">
            <div className="bg-white rounded-2xl p-4 shadow-xs text-xs space-y-2 border border-slate-200 font-sans leading-relaxed">
              <div className="font-bold text-emerald-800 text-sm border-b border-slate-100 pb-1 flex items-center justify-between">
                <span>🏛️ {orgName}</span>
                <span className="text-[10px] text-slate-400 font-normal">5:30 PM</span>
              </div>
              <div className="font-semibold text-slate-700">
                📊 Daily Financial Reconciliation Report
                <br />
                <span className="text-[11px] text-slate-400">Date: {new Date().toLocaleDateString("en-IN")}</span>
              </div>

              <div className="space-y-1 py-2 border-y border-dashed border-slate-200 font-mono text-[11px]">
                {branches.map((b) => (
                  <div key={b.id} className="flex justify-between">
                    <span>{b.branch_code || b.name}:</span>
                    <span className="font-bold">
                      ₹{Number(b.totalToday || 0).toLocaleString("en-IN")} ({b.drawerStatus || "OPEN"})
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex justify-between font-bold text-slate-900">
                <span>TOTAL TRUST COLLECTIONS:</span>
                <span className="text-emerald-700 font-mono">₹{summary.grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                💵 Cash in Hand: ₹{summary.totalCash.toLocaleString("en-IN")}
                <br />
                📱 Dynamic UPI Bank Direct: ₹{summary.totalUpi.toLocaleString("en-IN")}
                <br />
                🚨 Till Discrepancy Status:{" "}
                <span className={summary.flaggedCount > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                  {summary.flaggedCount > 0 ? "⚠️ FLAG RAISED" : "✓ ZERO DISCREPANCY"}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 text-right pt-1">
                Finkfold Autonomous Treasury Engine ✓
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
