"use client";

import { useState, useTransition } from "react";
import { toggleGlobalPolicyLock, approvePolicyExceptionRequest } from "@/actions/superAdminEnterprise";

interface PolicyItem {
  key: string;
  name: string;
  category: "Finance & Fees" | "Academic Calendar" | "Grading Scale" | "Store & Inventory";
  baselineValue: string;
  isLocked: boolean;
  lastUpdatedBy: string;
  description: string;
}

interface PolicyExceptionRequest {
  id: string;
  branchName: string;
  policyKey: string;
  policyName: string;
  currentValue: string;
  requestedValue: string;
  principalName: string;
  reason: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_POLICIES: PolicyItem[] = [
  {
    key: "FEES_CLASS_10_TUITION",
    name: "Class 10 Baseline Tuition Fee",
    category: "Finance & Fees",
    baselineValue: "₹45,000 / annum",
    isLocked: true,
    lastUpdatedBy: "Trust Managing Trustee",
    description: "Standard tuition benchmark for Class 10 across all campuses. Branch principals cannot discount without HQ authorization.",
  },
  {
    key: "ACADEMIC_CALENDAR_TERMS",
    name: "Academic Term Schedule (2026-27)",
    category: "Academic Calendar",
    baselineValue: "Term 1: Jun 12 - Oct 20 | Term 2: Nov 04 - Mar 28",
    isLocked: true,
    lastUpdatedBy: "Chief Academic Officer",
    description: "Centralized examination and vacation schedule. Ensures all branches align for unified term-end report cards.",
  },
  {
    key: "GRADING_SCALE_CBSE",
    name: "CBSE 9-Point Scale (A1 to E2)",
    category: "Grading Scale",
    baselineValue: "91-100 A1, 81-90 A2, 71-80 B1, 61-70 B2...",
    isLocked: true,
    lastUpdatedBy: "HQ Curriculum Directorate",
    description: "Strict grading normalization. Local branches cannot alter GPA weightages or minimum passing criteria.",
  },
  {
    key: "STORE_UNIFORM_BLAZER",
    name: "Official Trust Navy Blazer (Senior Wing)",
    category: "Store & Inventory",
    baselineValue: "₹1,450 (MRP Standard)",
    isLocked: true,
    lastUpdatedBy: "Trust Procurement Committee",
    description: "Standardized vendor pricing. Prevents localized campus markups and kickback discrepancies.",
  },
];

const INITIAL_EXCEPTIONS: PolicyExceptionRequest[] = [
  {
    id: "EX-901",
    branchName: "North Campus (HYD-02)",
    policyKey: "FEES_CLASS_10_TUITION",
    policyName: "Class 10 Baseline Tuition Fee",
    currentValue: "₹45,000",
    requestedValue: "₹40,500 (10% Early Bird Discount)",
    principalName: "Dr. K. Srinivas (Principal)",
    reason: "New international school opened 800m away offering inaugural waivers. Need 10% fee parity to secure 25 borderline admissions.",
    submittedAt: "Today at 09:30 AM",
    status: "pending",
  },
  {
    id: "EX-902",
    branchName: "East City (HYD-03)",
    policyKey: "ACADEMIC_CALENDAR_TERMS",
    policyName: "Academic Term Schedule (2026-27)",
    currentValue: "Term 1 ends Oct 20",
    requestedValue: "Term 1 ends Oct 24 (+4 Days)",
    principalName: "Mrs. Meenakshi Sundaram",
    reason: "Heavy monsoon floods caused 4 declared district holidays in August. Need 4 additional instructional days before half-yearly exams.",
    submittedAt: "Yesterday at 04:15 PM",
    status: "pending",
  },
];

export default function MasterDataClient() {
  const [policies, setPolicies] = useState<PolicyItem[]>(INITIAL_POLICIES);
  const [exceptions, setExceptions] = useState<PolicyExceptionRequest[]>(INITIAL_EXCEPTIONS);
  const [notification, setNotification] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [processingExId, setProcessingExId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggleLock = (policy: PolicyItem) => {
    setTogglingKey(policy.key);
    startTransition(async () => {
      const newLockedState = !policy.isLocked;
      const res = await toggleGlobalPolicyLock(policy.name, newLockedState);
      setTogglingKey(null);
      if (res.success) {
        setPolicies((prev) =>
          prev.map((p) => (p.key === policy.key ? { ...p, isLocked: newLockedState } : p))
        );
        setNotification(res.message);
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  const handleApproveException = (ex: PolicyExceptionRequest, decision: "approved" | "rejected") => {
    setProcessingExId(ex.id);
    startTransition(async () => {
      const res = await approvePolicyExceptionRequest(
        ex.id,
        decision,
        decision === "approved" ? "Authorized by Super Admin for single academic batch." : "Rejected: Standard Trust fee parity must be maintained."
      );
      setProcessingExId(null);
      if (res.success) {
        setExceptions((prev) =>
          prev.map((item) => (item.id === ex.id ? { ...item, status: decision } : item))
        );
        setNotification(res.message);
        setTimeout(() => setNotification(null), 5000);
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
              <span>SAP &bull; Oracle MDM Architecture</span>
              <span>&bull;</span>
              <span>Global Master Data Foundation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Global Master Data &amp; Policy Lock
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Prevent localized policy drift. When a policy has the Global Lock 🔒 engaged, branch principals cannot modify fee structures, academic terms, grading scales, or inventory prices without HQ digital authorization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs shadow-xs">
              4/4 Policies Locked 🔒
            </span>
          </div>
        </div>
      </div>

      {/* Pending Policy Exception Requests (Digital Approval Desk) */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
              <span>⚠️</span>
              <span>Branch Policy Exception Desk &bull; Awaiting Super Admin Authorization</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              Inbound Campus Override Requisitions ({exceptions.filter(e => e.status === "pending").length})
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-mono">1-Click Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exceptions.map((ex) => (
            <div
              key={ex.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{ex.branchName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ex.status === "pending"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      : ex.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    {ex.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-indigo-300 font-semibold">{ex.policyName}</div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">HQ Locked Value</span>
                    <span className="font-mono text-slate-200 line-through">{ex.currentValue}</span>
                  </div>
                  <div>
                    <span className="text-amber-300 block text-[9px] uppercase">Requested Exception</span>
                    <span className="font-mono font-bold text-amber-300">{ex.requestedValue}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-lg">
                  &ldquo;{ex.reason}&rdquo;
                </p>
                <div className="text-[10px] text-slate-400">
                  Requested by: <strong>{ex.principalName}</strong> &bull; {ex.submittedAt}
                </div>
              </div>

              {ex.status === "pending" ? (
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    disabled={processingExId === ex.id}
                    onClick={() => handleApproveException(ex, "rejected")}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer"
                  >
                    Reject Exception
                  </button>
                  <button
                    disabled={processingExId === ex.id}
                    onClick={() => handleApproveException(ex, "approved")}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Authorize Override ✓
                  </button>
                </div>
              ) : (
                <div className="text-center text-[11px] font-bold text-slate-400 pt-1">
                  Resolved by Super Admin
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Master Data Policies Roster */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Active Trust Master Data Registry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggling a lock instantly enforces read-only mode across all branch portals and prevents database mutations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <div
              key={policy.key}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                policy.isLocked
                  ? "bg-slate-50/70 border-slate-200"
                  : "bg-amber-50/40 border-amber-200 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {policy.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{policy.name}</h3>
                </div>
                <button
                  disabled={togglingKey === policy.key}
                  onClick={() => handleToggleLock(policy)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    policy.isLocked
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                  }`}
                >
                  {togglingKey === policy.key ? (
                    "Updating..."
                  ) : policy.isLocked ? (
                    <>
                      <span>🔒</span>
                      <span>Locked (Global)</span>
                    </>
                  ) : (
                    <>
                      <span>🔓</span>
                      <span>Unlocked (Branch Editable)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 font-mono text-xs font-bold text-slate-800">
                Baseline: {policy.baselineValue}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {policy.description}
              </p>

              <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-200/60">
                <span>Authority: {policy.lastUpdatedBy}</span>
                <span className={policy.isLocked ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                  {policy.isLocked ? "Read-Only on Branch Portals" : "Editable by Principals"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
