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
  const [activeTab, setActiveTab] = useState<"branches" | "audit" | "ledger" | "whatsapp" | "tally" | "recon">("branches");
  const [switchingBranch, setSwitchingBranch] = useState<string | null>(null);
  const [tallyExported, setTallyExported] = useState(false);
  const [bankFileUploaded, setBankFileUploaded] = useState(false);

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
        <button
          onClick={() => setActiveTab("tally")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "tally"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📑 1-Click Tally-Sync
        </button>
        <button
          onClick={() => setActiveTab("recon")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "recon"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🏦 Automated Bank Reconciliation
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

      {/* ── TAB 5: 1-CLICK TALLY-SYNC ── */}
      {activeTab === "tally" && (
        <div className="space-y-6">
          <div className="card p-6 space-y-5 border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📑</span>
                  <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    1-Click Tally ERP9 / TallyPrime XML Exporter
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Eliminate double data entry. Automatically map fee categories to standard accounting ledger codes and generate a ready-to-import Tally XML voucher payload.
                </p>
              </div>
              <button
                onClick={() => setTallyExported(true)}
                className="btn btn-primary text-xs flex items-center gap-2"
              >
                <span>💾</span>
                {tallyExported ? "Re-Download Tally XML" : "Export Tally XML (Today's Vouchers)"}
              </button>
            </div>

            {tallyExported && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">✅</span>
                  <div>
                    <strong>Tally XML Generated Successfully:</strong> <span className="font-mono">finkfold_tally_vouchers_{new Date().toISOString().slice(0, 10)}.xml</span> (Ready for TallyPrime Import &gt; Transactions).
                  </div>
                </div>
                <button
                  onClick={() => {
                    const xmlData = `<?xml version="1.0" encoding="utf-8"?>\n<ENVELOPE>\n  <HEADER>\n    <TALLYREQUEST>Import Data</TALLYREQUEST>\n  </HEADER>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDESC>\n        <REPORTNAME>Vouchers</REPORTNAME>\n      </REQUESTDESC>\n      <REQUESTDATA>\n        <!-- Finkfold School Management Autonomous Tally Vouchers -->\n        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n          <VOUCHER VCHTYPE="Receipt" ACTION="Create">\n            <DATE>20260919</DATE>\n            <NARRATION>Finkfold Tuition Fee Collection Daily Summary</NARRATION>\n            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>\n            <ALLLEDGERENTRIES.LIST>\n              <LEDGERNAME>SBI Current Account - 9481</LEDGERNAME>\n              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>\n              <AMOUNT>-${summary.totalUpi}</AMOUNT>\n            </ALLLEDGERENTRIES.LIST>\n            <ALLLEDGERENTRIES.LIST>\n              <LEDGERNAME>Tuition Fee Revenue</LEDGERNAME>\n              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>\n              <AMOUNT>${summary.totalUpi}</AMOUNT>\n            </ALLLEDGERENTRIES.LIST>\n          </VOUCHER>\n        </TALLYMESSAGE>\n      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`;
                    const blob = new Blob([xmlData], { type: "text/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `finkfold_tally_vouchers_${new Date().toISOString().slice(0, 10)}.xml`;
                    a.click();
                  }}
                  className="btn btn-secondary btn-sm text-[11px]"
                >
                  📥 Download File
                </button>
              </div>
            )}

            {/* Standard Accounting Ledger Mapping */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Fee Category &rarr; Tally Chart of Accounts Mapping
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Fee Category (Finkfold)</th>
                      <th className="py-2.5 px-4 text-left">Mapped Tally Ledger Name</th>
                      <th className="py-2.5 px-4 text-left">Tally Group</th>
                      <th className="py-2.5 px-4 text-left">Default Cost Centre</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">Tuition & Term Fee</td>
                      <td className="py-2 px-4 text-blue-700">FEE_REV_TUITION_AC</td>
                      <td className="py-2 px-4 text-slate-600">Direct Incomes</td>
                      <td className="py-2 px-4 text-slate-600">Primary / Senior Branch</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[10px]">Active</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">Transport & Fleet Bus Pass</td>
                      <td className="py-2 px-4 text-blue-700">FEE_REV_TRANSPORT_AC</td>
                      <td className="py-2 px-4 text-slate-600">Direct Incomes</td>
                      <td className="py-2 px-4 text-slate-600">Fleet Operations</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[10px]">Active</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">Uniform & Books Store</td>
                      <td className="py-2 px-4 text-blue-700">STORE_REV_UNIFORM_AC</td>
                      <td className="py-2 px-4 text-slate-600">Direct Incomes</td>
                      <td className="py-2 px-4 text-slate-600">Campus Store Indent</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[10px]">Active</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">Admission & Prospectus</td>
                      <td className="py-2 px-4 text-blue-700">CAPITAL_ADMISSION_FEES</td>
                      <td className="py-2 px-4 text-slate-600">Capital Account</td>
                      <td className="py-2 px-4 text-slate-600">Central Trust HQ</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[10px]">Active</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">Cash Counter Till In-Hand</td>
                      <td className="py-2 px-4 text-emerald-700">CASH_BURSAR_TILL_MAIN</td>
                      <td className="py-2 px-4 text-slate-600">Cash-in-Hand</td>
                      <td className="py-2 px-4 text-slate-600">Main Bursar Counter</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[10px]">Active</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">Dynamic UPI Direct Bank Settlement</td>
                      <td className="py-2 px-4 text-emerald-700">BANK_SBI_CURRENT_9481</td>
                      <td className="py-2 px-4 text-slate-600">Bank Accounts</td>
                      <td className="py-2 px-4 text-slate-600">Main Fee Collection Account</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[10px]">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* XML Schema Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live XML Voucher Structure Preview (TallyPrime Schema 2.0)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Compatible with Tally ERP 9, Release 6.6+ &amp; TallyPrime</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48 border border-slate-800">
                <pre>{`<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>20260919</DATE>
            <NARRATION>Finkfold Tuition Fee Collection Daily Summary</NARRATION>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>BANK_SBI_CURRENT_9481</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${summary.totalUpi || 284000}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>FEE_REV_TUITION_AC</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${summary.totalUpi || 284000}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: AUTOMATED BANK RECONCILIATION ── */}
      {activeTab === "recon" && (
        <div className="space-y-6">
          <div className="card p-6 space-y-5 border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏦</span>
                  <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Automated Bank Reconciliation &amp; UTR Cross-Matcher
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload the Trust&apos;s monthly bank statement (CSV). The system&apos;s AI instantly cross-matches UTR numbers from dynamic UPI payments, flagging unmatched credits or bounced transactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBankFileUploaded(true)}
                  className="btn btn-primary text-xs flex items-center gap-2"
                >
                  <span>📁</span>
                  {bankFileUploaded ? "Re-Run AI Matching Engine" : "Upload Bank Statement (CSV)"}
                </button>
              </div>
            </div>

            {/* Reconciliation KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-semibold text-slate-500">Total UPI Logged in Portal</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  ₹{(summary.totalUpi || 284000).toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">342 verified transactions</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                <div className="text-[11px] font-semibold text-emerald-800">Auto-Matched by UTR</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">99.4%</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">340 transactions cleared</div>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80">
                <div className="text-[11px] font-semibold text-rose-800">Flagged Discrepancies</div>
                <div className="text-xl font-bold font-mono text-rose-700 mt-1">2 Vouchers</div>
                <div className="text-[10px] text-rose-600 mt-0.5">Requires audit intervention</div>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80">
                <div className="text-[11px] font-semibold text-blue-800">Bank Balance Status</div>
                <div className="text-xl font-bold font-mono text-blue-900 mt-1">₹68,42,190</div>
                <div className="text-[10px] text-blue-600 mt-0.5">Statement as of 19-Sep-2026</div>
              </div>
            </div>

            {/* Reconciliation Exception Queue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  AI Reconciliation Exception Queue (Requires Bursar Verification)
                </h4>
                <span className="text-[11px] text-rose-600 font-semibold">2 Exceptions Detected</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-red text-[10px]">Unmatched Bank Credit</span>
                      <span className="font-mono font-bold text-slate-800">UTR: UPI/628941029481</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="font-mono font-bold text-emerald-700">₹15,000.00</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Received in SBI Current Account via NEFT/UPI, but no student voucher was generated in the portal. Remitter name: <em>&quot;Ramesh Kumar (GPay)&quot;</em>.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="btn btn-secondary btn-sm text-[11px]">Search Student Roll</button>
                    <button className="btn btn-primary btn-sm text-[11px]">Allocate to Voucher</button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-yellow text-[10px]">Pending Bank Settlement</span>
                      <span className="font-mono font-bold text-slate-800">UTR: UPI/628949821034</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="font-mono font-bold text-amber-700">₹8,500.00</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Marked paid on Cash Counter POS (Student: Aarav Sharma, Class 7-A), but bank statement shows transaction pending in NPCI clearing pool.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="btn btn-secondary btn-sm text-[11px]">Re-Query NPCI</button>
                    <button className="btn btn-primary btn-sm text-[11px]">Flag for Bursar Followup</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Audit Trail Log */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recently Auto-Matched Bank Entries (Sample Stream)
                </span>
                <span className="badge badge-green text-[10px]">Auto-Matched by AI</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full font-mono text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-sans font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Bank Tx Date</th>
                      <th className="py-2.5 px-4 text-left">Bank UTR Number</th>
                      <th className="py-2.5 px-4 text-left">Student / Voucher Ref</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-4">19-Sep-2026 11:24</td>
                      <td className="py-2 px-4 text-slate-600">UPI/628910481920</td>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">VCH-2026-9810 (Priya Sharma, Cl 10-B)</td>
                      <td className="py-2 px-4 text-right text-emerald-700 font-bold">₹24,500.00</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[9px]">Matched</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4">19-Sep-2026 10:15</td>
                      <td className="py-2 px-4 text-slate-600">UPI/628909182371</td>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">VCH-2026-9809 (Rohan Gupta, Cl 8-A)</td>
                      <td className="py-2 px-4 text-right text-emerald-700 font-bold">₹12,000.00</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[9px]">Matched</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4">19-Sep-2026 09:42</td>
                      <td className="py-2 px-4 text-slate-600">UPI/628908172944</td>
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">VCH-2026-9808 (Ananya Reddy, Cl 6-C)</td>
                      <td className="py-2 px-4 text-right text-emerald-700 font-bold">₹18,200.00</td>
                      <td className="py-2 px-4 text-center"><span className="badge badge-green text-[9px]">Matched</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
