"use client";

import { useState } from "react";

interface GrievanceToken {
  id: string;
  tokenCode: string;
  category: "severe_bullying" | "mental_distress" | "academic_pressure" | "facility_issue";
  severity: "critical" | "high" | "standard";
  messageSnippet: string;
  submittedAt: string;
  slaMinutesRemaining: number;
  status: "pending_triage" | "intervention_logged" | "resolved";
  interventionNote?: string;
  replyHistory: { sender: "counselor" | "student"; message: string; time: string }[];
}

const INITIAL_GRIEVANCES: GrievanceToken[] = [
  {
    id: "g-8819",
    tokenCode: "SAFE-TOKEN-8819",
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
];

export default function AdminSafeSpaceTriagePage() {
  const [grievances, setGrievances] = useState<GrievanceToken[]>(INITIAL_GRIEVANCES);
  const [activeToken, setActiveToken] = useState<GrievanceToken | null>(INITIAL_GRIEVANCES[0]);
  const [replyText, setReplyText] = useState("");
  const [interventionText, setInterventionText] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

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

    const newReply = { sender: "counselor" as const, message: replyText, time: "Just now" };
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

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100 mb-2">
              <span>Section 4: Safety & Governance</span>
              <span>·</span>
              <span>Principal & Counselor Clearance Only</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              The "SafeSpace" Grievance Triage Board
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Confidential student drop-box triage. Critical mental health and bullying reports trigger a mandatory 2-hour SLA countdown with automated escalation to the Trust Chairman.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
            <div className="text-xl font-bold text-rose-700 font-['Outfit']">1 Critical Case</div>
            <div className="text-[10px] text-rose-700 font-medium">Active SLA Clock</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface: Grievance Queue (Left) + Case Dossier & Reply (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Triage List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
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
                  <span className="font-mono text-xs font-bold text-slate-900">{g.tokenCode}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    g.severity === "critical"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {g.severity.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  "{g.messageSnippet}"
                </p>

                {g.severity === "critical" && g.status === "pending_triage" && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-[11px] text-rose-900 font-bold">
                    <span>⏳ 2-Hour SLA Timer:</span>
                    <span className="font-mono text-rose-700 animate-pulse">{g.slaMinutesRemaining}m 12s Remaining</span>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{g.submittedAt}</span>
                  <span className="font-semibold text-slate-700">
                    {g.status === "intervention_logged" ? "✓ Intervention Active" : "Action Required"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Case Details & Secure Anonymous Response */}
        {activeToken && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">{activeToken.tokenCode}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Category: {activeToken.category.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Submitted: {activeToken.submittedAt} • End-to-End Cryptographic Anonymity</div>
              </div>

              {activeToken.status === "intervention_logged" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ SLA Satisfied
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  🚨 Escalation Pending in {activeToken.slaMinutesRemaining}m
                </span>
              )}
            </div>

            {/* Original Student Statement */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Disclosed Statement:</div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                "{activeToken.messageSnippet}"
              </p>
            </div>

            {/* Counselor Intervention Action Box */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
              <div className="text-xs font-bold text-purple-900">Counselor Intervention Audit Trail</div>
              {activeToken.interventionNote ? (
                <div className="text-xs text-slate-700 p-3 rounded-lg bg-white border border-purple-100 font-medium">
                  {activeToken.interventionNote}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Log mandatory intervention details (e.g. anti-bullying patrol assigned, scheduled 1-on-1 counselor chat)..."
                    value={interventionText}
                    onChange={(e) => setInterventionText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-purple-200 bg-white focus:outline-hidden"
                  />
                  <button
                    onClick={handleLogIntervention}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
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
                      <span>{rep.sender === "counselor" ? "Official Counselor" : "Student"}</span>
                      <span>{rep.time}</span>
                    </div>
                    <div>{rep.message}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type confidential reassurance note to student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden"
                />
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
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
