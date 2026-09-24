"use client";

import { useState } from "react";

interface SubjectObeBreakdown {
  subject: string;
  grade: string;
  remembering: number;
  understanding: number;
  applying: number;
  analyzing: number;
  evaluating: number;
  creating: number;
  complianceStatus: "compliant" | "needs_adjustment" | "critical_gap";
  directive?: string;
}

interface CampusCognitiveIndex {
  campus: string;
  code: string;
  remembering: number;
  understanding: number;
  applying: number;
  analyzing: number;
  evaluating: number;
  creating: number;
  gradeScore: string;
  status: "Compliant" | "Action Required" | "Critical Review";
  note: string;
}

const OBE_DATA: SubjectObeBreakdown[] = [
  { subject: "Mathematics", grade: "Class 10-A", remembering: 18, understanding: 24, applying: 36, analyzing: 14, evaluating: 6, creating: 2, complianceStatus: "compliant" },
  { subject: "Physical Science", grade: "Class 8-B", remembering: 74, understanding: 16, applying: 10, analyzing: 0, evaluating: 0, creating: 0, complianceStatus: "critical_gap", directive: "Curriculum is 74% rote memorization. Zero evaluating/analyzing tasks logged in unit plans." },
  { subject: "English Literature", grade: "Class 9-A", remembering: 20, understanding: 30, applying: 15, analyzing: 20, evaluating: 10, creating: 5, complianceStatus: "compliant" },
  { subject: "Robotics & STEM", grade: "Class 10-A", remembering: 10, understanding: 15, applying: 35, analyzing: 20, evaluating: 10, creating: 10, complianceStatus: "compliant" },
  { subject: "Social Studies", grade: "Class 7-A", remembering: 60, understanding: 25, applying: 10, analyzing: 5, evaluating: 0, creating: 0, complianceStatus: "needs_adjustment", directive: "Increase analytical case studies and comparative historical critiques." },
];

const TRUST_CAMPUS_INDICES: CampusCognitiveIndex[] = [
  {
    campus: "Main Campus",
    code: "HYD-01",
    remembering: 22,
    understanding: 26,
    applying: 28,
    analyzing: 13,
    evaluating: 7,
    creating: 4,
    gradeScore: "Grade A+ (Exemplary)",
    status: "Compliant",
    note: "Optimal HOTS (Higher Order Thinking Skills) ratio. High STEM robotics application.",
  },
  {
    campus: "North Campus",
    code: "HYD-02",
    remembering: 34,
    understanding: 28,
    applying: 22,
    analyzing: 10,
    evaluating: 4,
    creating: 2,
    gradeScore: "Grade B+ (Satisfactory)",
    status: "Action Required",
    note: "Middle school sciences skewed towards recall. Needs more lab inquiry assessments.",
  },
  {
    campus: "East City Campus",
    code: "HYD-03",
    remembering: 42,
    understanding: 24,
    applying: 18,
    analyzing: 9,
    evaluating: 4,
    creating: 3,
    gradeScore: "Grade C+ (Intervention)",
    status: "Critical Review",
    note: "Rote memorization exceeds 40% cap. NEP 2020 pedagogical coaching mandated.",
  },
];

export default function ObeClient({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) {
  const [data] = useState<SubjectObeBreakdown[]>(OBE_DATA);
  const [notification, setNotification] = useState<string | null>(null);

  function sendDirective(sub: SubjectObeBreakdown) {
    setNotification(`⚡ NEP Coaching Directive dispatched to ${sub.subject} Department Head for ${sub.grade}!`);
    setTimeout(() => setNotification(null), 4000);
  }

  function handleSendTrustDirective(campusName: string) {
    setNotification(`🏛️ Super Admin NEP 2020 Pedagogical Directive dispatched to Principal of ${campusName}! Mandatory lesson plan audit scheduled.`);
    setTimeout(() => setNotification(null), 5000);
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Section 4: Academic Governance</span>
              <span>&bull;</span>
              <span>Camu &amp; ManageBac Engine</span>
              {isSuperAdmin && (
                <>
                  <span>&bull;</span>
                  <span className="text-indigo-700 font-bold">🏛️ Super Admin Cross-Campus Audit</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              NEP 2020 Outcome-Based Education (OBE) Auditor
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Audit the cognitive rigor of classroom lessons. Bloom&apos;s Taxonomy tags entered by teachers in the Faculty Portal are synthesized into a global institutional heatmap to prevent rote learning.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              CBSE &amp; NEP 2020 Compliant
            </span>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN ONLY: Multi-Campus Cognitive Quality Index & Heatmap */}
      {isSuperAdmin && (
        <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>TRUST COGNITIVE QUALITY INDEX &bull; MULTI-CAMPUS AUDIT</span>
              </div>
              <h2 className="text-lg font-black text-white mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                🏛️ Cross-Campus Bloom&apos;s Taxonomy Heatmap &amp; Rote-Learning Prevention
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                NEP 2020 mandates that Higher Order Thinking Skills (HOTS: Analyzing, Evaluating, Creating) constitute at least 25% of all instructional and assessment items across every Trust branch.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-indigo-300">
              Trust Overall: <strong className="text-emerald-400">76.4% Compliance</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRUST_CAMPUS_INDICES.map((camp, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{camp.campus}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{camp.code}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      camp.status === "Compliant"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : camp.status === "Action Required"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}>
                      {camp.status}
                    </span>
                  </div>

                  {/* Multi-tier Bloom's stacked bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-300">
                      <span>Rote (Recall): <strong className={camp.remembering > 35 ? "text-rose-400" : "text-emerald-400"}>{camp.remembering}%</strong></span>
                      <span>HOTS (Apply/Critique): <strong className="text-indigo-300">{camp.applying + camp.analyzing + camp.evaluating + camp.creating}%</strong></span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 flex overflow-hidden">
                      <div style={{ width: `${camp.remembering}%` }} className="bg-rose-500" title={`Remembering: ${camp.remembering}%`} />
                      <div style={{ width: `${camp.understanding}%` }} className="bg-sky-500" title={`Understanding: ${camp.understanding}%`} />
                      <div style={{ width: `${camp.applying}%` }} className="bg-emerald-500" title={`Applying: ${camp.applying}%`} />
                      <div style={{ width: `${camp.analyzing}%` }} className="bg-amber-500" title={`Analyzing: ${camp.analyzing}%`} />
                      <div style={{ width: `${camp.evaluating}%` }} className="bg-purple-500" title={`Evaluating: ${camp.evaluating}%`} />
                      <div style={{ width: `${camp.creating}%` }} className="bg-pink-500" title={`Creating: ${camp.creating}%`} />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-0.5">
                      <span>■ Remember</span>
                      <span>■ Understand</span>
                      <span>■ Apply</span>
                      <span>■ HOTS</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                    {camp.note}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">{camp.gradeScore}</span>
                  {camp.status !== "Compliant" && (
                    <button
                      onClick={() => handleSendTrustDirective(camp.campus)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
                    >
                      Issue Trust Directive ⚡
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Cognitive Distribution Summary */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Active Campus Bloom&apos;s Taxonomy Cognitive Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
            <div className="text-[10px] text-blue-700 font-bold uppercase">Remembering</div>
            <div className="text-xl font-extrabold text-blue-900 mt-1">28%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Target: &lt;30%</div>
          </div>
          <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200">
            <div className="text-[10px] text-sky-700 font-bold uppercase">Understanding</div>
            <div className="text-xl font-extrabold text-sky-900 mt-1">24%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Concepts</div>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="text-[10px] text-emerald-700 font-bold uppercase">Applying</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-1">26%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Problem Solving</div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="text-[10px] text-amber-700 font-bold uppercase">Analyzing</div>
            <div className="text-xl font-extrabold text-amber-900 mt-1">12%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Deconstruction</div>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200">
            <div className="text-[10px] text-purple-700 font-bold uppercase">Evaluating</div>
            <div className="text-xl font-extrabold text-purple-900 mt-1">6%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Critical Review</div>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
            <div className="text-[10px] text-rose-700 font-bold uppercase">Creating</div>
            <div className="text-xl font-extrabold text-rose-900 mt-1">4%</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Original Project</div>
          </div>
        </div>
      </div>

      {/* Class-by-Class OBE Heatmap Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Grade &amp; Subject Outcome Heatmap</h2>
          <span className="text-xs text-slate-400">Audited from active unit plans &amp; OMR question banks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Subject &amp; Grade</th>
                <th className="pb-3">Remember (Rote)</th>
                <th className="pb-3">Understand</th>
                <th className="pb-3">Apply</th>
                <th className="pb-3">Analyze</th>
                <th className="pb-3">Evaluate</th>
                <th className="pb-3">Create</th>
                <th className="pb-3">NEP Status</th>
                <th className="pb-3 text-right">Academic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5">
                    <div className="font-bold text-slate-900">{sub.subject}</div>
                    <div className="text-[10px] text-slate-500">{sub.grade}</div>
                  </td>
                  <td className="py-3.5">
                    <span className={`font-bold ${sub.remembering > 50 ? "text-rose-600" : "text-slate-700"}`}>
                      {sub.remembering}%
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-700">{sub.understanding}%</td>
                  <td className="py-3.5 font-bold text-emerald-700">{sub.applying}%</td>
                  <td className="py-3.5 text-slate-700">{sub.analyzing}%</td>
                  <td className="py-3.5 text-slate-700">{sub.evaluating}%</td>
                  <td className="py-3.5 text-slate-700">{sub.creating}%</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.complianceStatus === "compliant"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : sub.complianceStatus === "needs_adjustment"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {sub.complianceStatus === "compliant" ? "✓ Balanced" : sub.complianceStatus === "needs_adjustment" ? "⚠️ Skewed" : "🚨 Rote Heavy"}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {sub.directive ? (
                      <button
                        onClick={() => sendDirective(sub)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shadow-xs cursor-pointer"
                      >
                        Send Directive
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">No action needed</span>
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
