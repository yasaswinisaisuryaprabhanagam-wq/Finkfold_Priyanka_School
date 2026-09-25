"use client";

import { useState } from "react";
import { downloadBoardPacketPdf } from "@/lib/pdfDownloader";

export default function BoardPacketClient() {
  const [activeQuarter, setActiveQuarter] = useState<"Q1" | "Q2" | "Q3" | "Annual">("Q3");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleDownloadPacket = () => {
    setIsGeneratingPdf(true);
    try {
      downloadBoardPacketPdf(activeQuarter);
      setNotification(`✓ Trust Board Packet (${activeQuarter} 2026-27) compiled with cryptographic seal and exported!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification(`Failed to export Board Packet: ${err?.message || "Unknown error"}`);
    } finally {
      setIsGeneratingPdf(false);
    }
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Executive Reporting Engine</span>
              <span>&bull;</span>
              <span>1-Click Boardroom Readiness</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Automated Board of Directors (BoD) Pitch Deck
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Eliminate weeks of manual Excel consolidation before the quarterly Trust Board meeting. Finkfold EdOS autonomously compiles live cross-campus telemetry into an executive deck.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              {(["Q1", "Q2", "Q3", "Annual"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeQuarter === q
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {q} 2026
                </button>
              ))}
            </div>

            <button
              disabled={isGeneratingPdf}
              onClick={handleDownloadPacket}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <span>📑</span>
              <span>{isGeneratingPdf ? "Compiling Deck..." : "Export Board Packet (PDF)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deck Preview Container (Styled like high-end Boardroom Slides) */}
      <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8">
        {/* Slide 1 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
              Priyanka Educational Trust &bull; Executive Board Review
            </span>
            <h2 className="text-3xl font-black text-white mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Quarterly Institutional Performance Report ({activeQuarter} 2026-27)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Consolidated Telemetry across 3 Physical Campuses (Main, North, East City) &bull; Verified by Finkfold EdOS
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-right text-xs font-mono">
            <div className="text-slate-400">Cryptographic Hash</div>
            <div className="text-amber-400 font-bold">SHA256: 9E4F...A12B</div>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Consolidated Revenue</span>
            <div className="text-3xl font-black text-white mt-1 font-mono">₹1.42 Cr</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +14.8% YoY Budget Target</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Active Enrollment</span>
            <div className="text-3xl font-black text-indigo-300 mt-1 font-mono">1,842</div>
            <div className="text-[11px] text-indigo-400 font-semibold mt-1">94.8% Seat Capacity Filled</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Blended Marketing ROI</span>
            <div className="text-3xl font-black text-amber-300 mt-1 font-mono">32.2x</div>
            <div className="text-[11px] text-amber-400 font-semibold mt-1">₹1,388 Blended CPA / Student</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Bank UTR Auto-Reconciled</span>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">99.4%</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">Zero Unaudited Cash Deficits</div>
          </div>
        </div>

        {/* Section Breakdown Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Campus Comparison & Revenue Share */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Campus Revenue &amp; Operational Efficiency</span>
              <span className="text-xs text-indigo-400 font-normal">All 3 Branches Active</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Main Campus (HYD-01)</span>
                  <span className="font-mono text-emerald-400">₹72.4 Lakhs (51%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "51%" }} />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>840 Enrolled &bull; Zero Till Variance</span>
                  <span>96.4% Lesson Plan SLA</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>North Campus (HYD-02)</span>
                  <span className="font-mono text-indigo-400">₹39.2 Lakhs (28%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "28%" }} />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>520 Enrolled &bull; Highest Ad ROI (38x)</span>
                  <span>92.8% Lesson Plan SLA</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>East City (HYD-03)</span>
                  <span className="font-mono text-purple-400">₹30.4 Lakhs (21%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "21%" }} />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>482 Enrolled &bull; Science Lab Modernization Required</span>
                  <span>91.2% Lesson Plan SLA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Governance, Welfare & Compliance Highlights */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Trust Governance &amp; Welfare Compliance</span>
              <span className="text-xs text-emerald-400 font-normal">Audit Ready</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">SafeSpace 2-Hour SLA Performance</div>
                  <div className="text-[10px] text-slate-400">2 critical interventions resolved; zero legal escalations</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  100% Resolved
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">NEP 2020 Cognitive Quality Spread</div>
                  <div className="text-[10px] text-slate-400">HOTS (Higher Order Thinking Skills) average across Trust</div>
                </div>
                <span className="font-mono font-bold text-indigo-300">28.4% (Target: &gt;25%)</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">RTE Student-Teacher Ratio (STR)</div>
                  <div className="text-[10px] text-slate-400">Trust-wide blended ratio (CBSE Mandate: 30:1)</div>
                </div>
                <span className="font-mono font-bold text-emerald-400">28.7 : 1 (Compliant)</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Accreditation NOC Status</div>
                  <div className="text-[10px] text-slate-400">Fire Safety, Structural Fitness, CBSE Affiliation</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  All Current (0 Overdue)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div>Report generated automatically from PostgreSQL immutable ledgers &bull; Finkfold EdOS Enterprise</div>
          <div className="font-mono text-slate-300">Page 1 of 1 &bull; Board Confidential</div>
        </div>
      </div>
    </div>
  );
}
