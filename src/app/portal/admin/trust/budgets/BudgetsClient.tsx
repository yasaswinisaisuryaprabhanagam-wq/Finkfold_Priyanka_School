"use client";

import { useState, useTransition } from "react";
import { approveOverBudgetVoucher } from "@/actions/superAdminEnterprise";

interface BudgetCategory {
  id: string;
  branchName: string;
  category: string;
  allocatedBudget: number;
  spentAmount: number;
  pendingVouchers: number;
  status: "nominal" | "amber_warning" | "hard_locked";
}

interface OverBudgetVoucher {
  id: string;
  branchName: string;
  category: string;
  voucherNumber: string;
  requestedAmount: number;
  vendorName: string;
  purpose: string;
  currentBudgetBalance: number;
  status: "pending" | "approved" | "rejected";
  authCode?: string;
}

const INITIAL_BUDGETS: BudgetCategory[] = [
  {
    id: "b-1",
    branchName: "North Campus (HYD-02)",
    category: "Marketing & Hoardings",
    allocatedBudget: 500000,
    spentAmount: 525000,
    pendingVouchers: 1,
    status: "hard_locked", // 105% spent
  },
  {
    id: "b-2",
    branchName: "East City (HYD-03)",
    category: "Science Lab Consumables",
    allocatedBudget: 350000,
    spentAmount: 325000,
    pendingVouchers: 1,
    status: "amber_warning", // 92.8% spent
  },
  {
    id: "b-3",
    branchName: "Main Campus (HYD-01)",
    category: "Estate Maintenance & Repairs",
    allocatedBudget: 800000,
    spentAmount: 540000,
    pendingVouchers: 0,
    status: "nominal", // 67.5% spent
  },
  {
    id: "b-4",
    branchName: "Main Campus (HYD-01)",
    category: "IT Infrastructure & Cloud",
    allocatedBudget: 450000,
    spentAmount: 290000,
    pendingVouchers: 0,
    status: "nominal", // 64.4% spent
  },
];

const INITIAL_VOUCHERS: OverBudgetVoucher[] = [
  {
    id: "v-8821",
    branchName: "North Campus (HYD-02)",
    category: "Marketing & Hoardings",
    voucherNumber: "VCHR-NC-2026-098",
    requestedAmount: 75000,
    vendorName: "Sri Balaji Outdoor Media",
    purpose: "Highway Hoarding Renewal at Suchitra Junction for Class 11 Admissions Campaign",
    currentBudgetBalance: -25000,
    status: "pending",
  },
];

export default function BudgetsClient() {
  const [budgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);
  const [vouchers, setVouchers] = useState<OverBudgetVoucher[]>(INITIAL_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState<OverBudgetVoucher | null>(null);
  const [overrideNotes, setOverrideNotes] = useState("");
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isApproving, startTransition] = useTransition();

  const handleConfirmOverride = () => {
    if (!selectedVoucher) return;
    if (overrideNotes.trim().length < 10) {
      setOverrideError("Please provide an executive justification note (minimum 10 characters).");
      return;
    }

    startTransition(async () => {
      const res = await approveOverBudgetVoucher(
        selectedVoucher.id,
        selectedVoucher.branchName,
        selectedVoucher.category,
        selectedVoucher.requestedAmount,
        overrideNotes
      );

      if (res.success) {
        setVouchers((prev) =>
          prev.map((v) =>
            v.id === selectedVoucher.id ? { ...v, status: "approved", authCode: res.authCode } : v
          )
        );
        setNotification(`✓ ${res.message} (Reference: ${res.authCode})`);
        setSelectedVoucher(null);
        setOverrideNotes("");
        setOverrideError(null);
        setTimeout(() => setNotification(null), 6000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 mb-2">
              <span>Coupa &bull; NetSuite Financial Governance</span>
              <span>&bull;</span>
              <span>Universal Budget Control</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Universal Budgeting &amp; Real-Time Burn-Rate Monitor
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Eliminate unexpected year-end branch deficits. HQ establishes annual operational budgets per ledger category. Vouchers exceeding 90% trigger amber warnings, while vouchers exceeding 100% are hard-locked.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
              1 Hard-Locked Voucher Awaiting HQ
            </span>
          </div>
        </div>
      </div>

      {/* Over-Budget Authorization Desk */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 text-white border border-rose-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
              <span>HARD-LOCKED EXPENSE QUEUE &bull; SUPER ADMIN SOVEREIGNTY</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              Vouchers Exceeding 100% Branch Category Allocation
            </h2>
          </div>
          <span className="text-xs text-rose-300 font-mono">Hard-Lock Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{v.branchName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    v.status === "pending"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {v.status === "pending" ? "HARD-LOCKED (>100%)" : "AUTHORIZED BY HQ"}
                  </span>
                </div>

                <div className="text-xs font-semibold text-rose-300">{v.category}</div>
                <div className="text-[11px] text-slate-300">
                  Voucher: <strong className="font-mono text-white">{v.voucherNumber}</strong> &bull; Vendor: <strong>{v.vendorName}</strong>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requested Amount:</span>
                    <span className="font-mono font-bold text-white">₹{v.requestedAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget Deficit if Approved:</span>
                    <span className="font-mono font-bold text-rose-400">-₹{(Math.abs(v.currentBudgetBalance) + v.requestedAmount).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-lg">
                  &ldquo;{v.purpose}&rdquo;
                </p>

                {v.authCode && (
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                    Auth Code: <strong>{v.authCode}</strong> &bull; Approved by Super Admin
                  </div>
                )}
              </div>

              {v.status === "pending" ? (
                <button
                  onClick={() => {
                    setSelectedVoucher(v);
                    setOverrideNotes("");
                    setOverrideError(null);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-md text-center mt-2"
                >
                  ⚡ Review &amp; Authorize Over-Budget Voucher
                </button>
              ) : (
                <div className="text-center text-[11px] font-bold text-emerald-400 pt-1">
                  ✓ Ledger Cleared for Disbursement
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Universal Budgets & Live Burn-Rate Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Active Branch Operational Budgets (FY 2026-27)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consumption tracking across all physical campuses. Real-time voucher synchronization.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
            Total Allocated: ₹21.0 Lakhs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const pct = Math.round((b.spentAmount / b.allocatedBudget) * 100);
            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {b.branchName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{b.category}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === "hard_locked"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : b.status === "amber_warning"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    {b.status === "hard_locked" ? "105% OVER-BUDGET" : b.status === "amber_warning" ? "93% AMBER ALERT" : "NOMINAL (68%)"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600">Spent: ₹{b.spentAmount.toLocaleString("en-IN")}</span>
                    <span className="font-bold text-slate-900">Cap: ₹{b.allocatedBudget.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? "bg-rose-500" : pct >= 90 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                  <span>Burn Rate: <strong className="text-slate-800">{pct}%</strong> of annual allocation</span>
                  <span>Pending Vouchers: <strong className={b.pendingVouchers > 0 ? "text-rose-600 font-bold" : "text-slate-800"}>{b.pendingVouchers}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Override Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Authorize Over-Budget Expenditure
                  </h3>
                  <p className="text-xs text-slate-500">
                    Super Admin Coupa-style budget override &amp; cryptographic authorization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-xs">
              <div className="font-bold text-rose-900">
                {selectedVoucher.branchName} &bull; {selectedVoucher.category}
              </div>
              <div className="text-rose-800">
                Voucher #{selectedVoucher.voucherNumber} &bull; Vendor: {selectedVoucher.vendorName}
              </div>
              <div className="text-rose-900 font-mono font-bold">
                Requested Amount: ₹{selectedVoucher.requestedAmount.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Executive Authorization Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="e.g. Critical admissions campaign renewal authorized by Chairman. Supplementary ₹1,00,000 allocated from Trust Central Reserve."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[10px] text-slate-400">
                Authorizing this unlocks the branch voucher and records the approval code in the Trust general ledger.
              </p>
            </div>

            {overrideError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {overrideError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmOverride}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isApproving ? "Authorizing..." : "Confirm & Unlock Voucher ⚡"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
