"use client";

import { useState, useTransition } from "react";
import { markSlaEscalationOwnership } from "@/actions/superAdmin";

interface GrievanceToken {
  id: string;
  tokenCode: string;
  branchName?: string;
  category: "severe_bullying" | "mental_distress" | "academic_pressure" | "facility_issue";
  severity: "critical" | "high" | "standard";
  messageSnippet: string;
  submittedAt: string;
  slaMinutesRemaining: number;
  status: "pending_triage" | "intervention_logged" | "sa_intervention" | "resolved";
  interventionNote?: string;
  saOwner?: string;
  replyHistory: { sender: "counselor" | "student" | "super_admin"; message: string; time: string }[];
}

const INITIAL_GRIEVANCES: GrievanceToken[] = [
  {
    id: "g-8819",
    tokenCode: "SAFE-TOKEN-8819",
    branchName: "Main Campus",
    category: "severe_bullying",
    severity: "critical",
    messageSnippet: "Three senior students are waiting near the cycle stand after school and demanding money. I am scared to come to school tomorrow.",
    submittedAt: "Today at 11:20 AM",
    slaMinutesRemaining: 48, // 48 mins left of 120m SLA
    status: "pending_triage",
    replyHistory: [],
  },
  {
    id: "g-8812",
    tokenCode: "SAFE-TOKEN-8812",
    branchName: "North Campus",
    category: "academic_pressure",
    severity: "high",
    messageSnippet: "Extreme panic attacks before board mock examinations. Unable to sleep for the past 4 days.",
    submittedAt: "Yesterday at 04:15 PM",
    slaMinutesRemaining: 0,
    status: "intervention_logged",
    interventionNote: "Head Counselor scheduled confidential breathing and time-management session during free period.",
    replyHistory: [
      { sender: "counselor", message: "Hello. You are not alone in feeling this way. Please visit Room 104 during lunch break for a quiet breathing session.", time: "Yesterday at 04:45 PM" },
    ],
  },
  {
    id: "g-9041",
    tokenCode: "SAFE-TOKEN-9041",
    branchName: "East City",
    category: "severe_bullying",
    severity: "critical",
    messageSnippet: "Continuous cyber harassment in class WhatsApp group regarding my economic background. Repeatedly reported to section coordinator with no response.",
    submittedAt: "Today at 08:00 AM",
    slaMinutesRemaining: -120, // Breached by 2 hours
    status: "pending_triage",
    replyHistory: [],
  },
];

export default function SafeSpaceClient({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) {
  const [grievances, setGrievances] = useState<GrievanceToken[]>(INITIAL_GRIEVANCES);
  const [activeToken, setActiveToken] = useState<GrievanceToken | null>(INITIAL_GRIEVANCES[0]);
  const [replyText, setReplyText] = useState("");
  const [interventionText, setInterventionText] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [takingOwnershipId, setTakingOwnershipId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleLogIntervention() {
    if (!activeToken || !interventionText.trim()) return;

    setGrievances((prev) =>
      prev.map((g) =>
        g.id === activeToken.id
          ? { ...g, status: "intervention_logged", interventionNote: interventionText }
          : g
      )
    );
    setActiveToken((prev) => prev ? { ...prev, status: "intervention_logged", interventionNote: interventionText } : null);
    setNotification("✓ Counselor intervention logged! 2-Hour emergency SLA timer stopped.");
    setInterventionText("");
    setTimeout(() => setNotification(null), 4000);
  }

  function handleSendReply() {
    if (!activeToken || !replyText.trim()) return;

    const senderRole = isSuperAdmin ? "super_admin" as const : "counselor" as const;
    const newReply = { sender: senderRole, message: replyText, time: "Just now" };
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === activeToken.id
          ? { ...g, replyHistory: [...g.replyHistory, newReply] }
          : g
      )
    );
    setActiveToken((prev) => prev ? { ...prev, replyHistory: [...prev.replyHistory, newReply] } : null);
    setNotification(`Dispatched encrypted response to ${activeToken.tokenCode}`);
    setReplyText("");
    setTimeout(() => setNotification(null), 4000);
  }

  function handleTakeOwnership(g: GrievanceToken) {
    setTakingOwnershipId(g.id);
    startTransition(async () => {
      const res = await markSlaEscalationOwnership(g.id, g.tokenCode);
      setTakingOwnershipId(null);
      if (res.success) {
        setGrievances((prev) =>
          prev.map((item) =>
            item.id === g.id
              ? {
                  ...item,
                  status: "sa_intervention",
                  saOwner: "Trust Super Admin (Executive Intervention)",
                  slaMinutesRemaining: 0,
                }
              : item
          )
        );
        if (activeToken?.id === g.id) {
          setActiveToken((prev) =>
            prev
              ? {
                  ...prev,
                  status: "sa_intervention",
                  saOwner: "Trust Super Admin (Executive Intervention)",
                  slaMinutesRemaining: 0,
                }
              : null
          );
        }
        setNotification(`🛡️ ${res.message}`);
        setTimeout(() => setNotification(null), 6000);
      }
    });
  }

  const escalatedGrievances = grievances.filter(
    (g) => g.status === "pending_triage" && (g.slaMinutesRemaining <= 0 || g.severity === "critical")
  );

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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100 mb-2">
              <span>Section 4: Safety &amp; Governance</span>
              <span>&bull;</span>
              <span>Principal &amp; Counselor Clearance Only</span>
              {isSuperAdmin && (
                <>
                  <span>&bull;</span>
                  <span className="text-indigo-700 font-bold">🏛️ Super Admin Oversight</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              The &ldquo;SafeSpace&rdquo; Grievance Triage Board
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Confidential student drop-box triage. Critical mental health and bullying reports trigger a mandatory 2-hour SLA countdown with automated escalation to the Trust Chairman.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <div className="text-xl font-bold text-rose-700 font-['Outfit']">
                {grievances.filter((g) => g.status === "pending_triage").length} Pending Cases
              </div>
              <div className="text-[10px] text-rose-700 font-medium">Active SLA Clock</div>
            </div>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN ONLY: 2-Hour SLA Escalation Command Desk */}
      {isSuperAdmin && (
        <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-rose-950 to-indigo-950 text-white border border-rose-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                <span>SUPER ADMIN ESCALATION INBOX &bull; 2-HOUR TRUST SLA BREACHES</span>
              </div>
              <h2 className="text-lg font-black text-white mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                🛡️ Trust HQ Crisis Escalations &amp; Direct Takeover
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                When a campus principal or counselor fails to log an intervention within 2 hours, the grievance breaches SLA and escalates here. Super Admin can seize direct control to protect student welfare.
              </p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-rose-300">
              Breached / Critical: <strong className="text-white">{escalatedGrievances.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {escalatedGrievances.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{g.tokenCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                      {g.branchName || "Main Campus"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    &ldquo;{g.messageSnippet}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{g.submittedAt}</span>
                    <span className="font-bold font-mono text-rose-400">
                      {g.slaMinutesRemaining < 0
                        ? `⚠️ SLA Breached by ${Math.abs(g.slaMinutesRemaining)}m`
                        : `⏳ ${g.slaMinutesRemaining}m remaining`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setActiveToken(g);
                    }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer text-center"
                  >
                    View Dossier
                  </button>
                  <button
                    onClick={() => handleTakeOwnership(g)}
                    disabled={takingOwnershipId === g.id}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer shadow-md text-center disabled:opacity-50"
                  >
                    {takingOwnershipId === g.id ? "Taking Over..." : "⚡ Take HQ Ownership"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Interface: Grievance Queue (Left) + Case Dossier & Reply (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Triage List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Inbound Anonymous Tokens</h2>
            <span className="text-xs text-slate-400">Total: {grievances.length}</span>
          </div>

          <div className="space-y-3">
            {grievances.map((g) => (
              <div
                key={g.id}
                onClick={() => setActiveToken(g)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  activeToken?.id === g.id
                    ? "border-rose-300 bg-rose-50/40 shadow-xs"
                    : "border-slate-200/70 bg-slate-50/50 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{g.tokenCode}</span>
                    {g.branchName && (
                      <span className="text-[10px] text-slate-400">({g.branchName})</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    g.severity === "critical"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {g.severity.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  &ldquo;{g.messageSnippet}&rdquo;
                </p>

                {g.status === "sa_intervention" ? (
                  <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 font-bold">
                    🏛️ Super Admin Ownership Active
                  </div>
                ) : g.severity === "critical" && g.status === "pending_triage" ? (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-[11px] text-rose-900 font-bold">
                    <span>⏳ 2-Hour SLA Timer:</span>
                    <span className="font-mono text-rose-700 animate-pulse">
                      {g.slaMinutesRemaining > 0 ? `${g.slaMinutesRemaining}m Remaining` : "SLA BREACHED"}
                    </span>
                  </div>
                ) : null}

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{g.submittedAt}</span>
                  <span className="font-semibold text-slate-700">
                    {g.status === "sa_intervention"
                      ? "✓ SA Intervention"
                      : g.status === "intervention_logged"
                      ? "✓ Intervention Active"
                      : "Action Required"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Case Details & Secure Anonymous Response */}
        {activeToken && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{activeToken.tokenCode}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Category: {activeToken.category.replace("_", " ").toUpperCase()}
                  </span>
                  {activeToken.branchName && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      Branch: {activeToken.branchName}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">Submitted: {activeToken.submittedAt} &bull; End-to-End Cryptographic Anonymity</div>
              </div>

              {activeToken.status === "sa_intervention" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  🏛️ Super Admin Ownership
                </span>
              ) : activeToken.status === "intervention_logged" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ SLA Satisfied
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  🚨 Escalation Pending
                </span>
              )}
            </div>

            {/* Original Student Statement */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Disclosed Statement:</div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                &ldquo;{activeToken.messageSnippet}&rdquo;
              </p>
            </div>

            {/* Counselor / Super Admin Intervention Action Box */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
              <div className="text-xs font-bold text-purple-900">
                {activeToken.status === "sa_intervention"
                  ? "Trust Super Admin Executive Intervention Note"
                  : "Counselor Intervention Audit Trail"}
              </div>
              {activeToken.interventionNote ? (
                <div className="text-xs text-slate-700 p-3 rounded-lg bg-white border border-purple-100 font-medium">
                  {activeToken.interventionNote}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Log mandatory intervention details (e.g. anti-bullying patrol assigned, scheduled 1-on-1 counselor chat, disciplinary committee hearing)..."
                    value={interventionText}
                    onChange={(e) => setInterventionText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-purple-200 bg-white focus:outline-hidden"
                  />
                  <button
                    onClick={handleLogIntervention}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Log Intervention &amp; Stop SLA Timer
                  </button>
                </div>
              )}
            </div>

            {/* Secure Reply Channel to Student Token */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-900">Secure Two-Way Anonymous Dialogue</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeToken.replyHistory.map((rep, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-100 text-xs text-slate-800 space-y-1">
                    <div className="flex justify-between font-semibold text-[10px] text-slate-500">
                      <span>
                        {rep.sender === "super_admin"
                          ? "Trust Super Admin (Executive)"
                          : rep.sender === "counselor"
                          ? "Official Counselor"
                          : "Student"}
                      </span>
                      <span>{rep.time}</span>
                    </div>
                    <div>{rep.message}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    isSuperAdmin
                      ? "Type official Super Admin directive or confidential note to student..."
                      : "Type confidential reassurance note to student..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                />
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Reply to Token
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
