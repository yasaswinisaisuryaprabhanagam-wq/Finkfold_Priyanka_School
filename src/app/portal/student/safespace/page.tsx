"use client";

import { useState, useEffect, useTransition } from "react";
import type { GrievanceReport, ConductEntry } from "@/types/self-service";
import { INITIAL_GRIEVANCES, INITIAL_CONDUCT_ENTRIES } from "@/types/self-service";
import { getSafeSpaceData, submitAnonymousGrievanceAction } from "@/actions/safespace";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  HelpCircle,
  Copy,
  Clock,
  EyeOff,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function SafeSpacePage() {
  const [activeTab, setActiveTab] = useState<"anonymous" | "conduct">("anonymous");
  const [grievances, setGrievances] = useState<GrievanceReport[]>(INITIAL_GRIEVANCES);
  const [conductEntries, setConductEntries] = useState<ConductEntry[]>(INITIAL_CONDUCT_ENTRIES);
  const [meritsTotal, setMeritsTotal] = useState(40);
  const [demeritsTotal, setDemeritsTotal] = useState(5);

  // Grievance form state
  const [category, setCategory] = useState<GrievanceReport["category"]>("bullying");
  const [urgency, setUrgency] = useState<GrievanceReport["urgency"]>("standard");
  const [locationDetails, setLocationDetails] = useState("");
  const [description, setDescription] = useState("");
  const [trackingSearch, setTrackingSearch] = useState("");

  const [notification, setNotification] = useState<string | null>(null);
  const [recentToken, setRecentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSafeSpaceData().then((res) => {
      if (res) {
        if (res.grievances) setGrievances(res.grievances);
        if (res.conductEntries) setConductEntries(res.conductEntries);
        setMeritsTotal(res.totalMerits);
        setDemeritsTotal(res.totalDemerits);
      }
    });
  }, []);

  const netScore = Math.max(0, 100 + meritsTotal - demeritsTotal * 2);

  function handleSubmitGrievance(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    startTransition(async () => {
      const res = await submitAnonymousGrievanceAction({
        category,
        urgency,
        locationDetails: locationDetails.trim() || undefined,
        description: description.trim(),
      });

      if (res.success) {
        setGrievances((prev) => [res.report, ...prev]);
        setRecentToken(res.trackingToken);
        setNotification(res.message);
        setDescription("");
        setLocationDetails("");
        setTimeout(() => setNotification(null), 10000);
      }
    });
  }

  const filteredGrievances = trackingSearch.trim()
    ? grievances.filter((g) =>
        g.trackingToken.toLowerCase().includes(trackingSearch.trim().toLowerCase())
      )
    : grievances;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner - Clean White & Soft Pastel Style */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-900 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            Zero-Identity Vault &amp; Student Standing
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Safe Space Drop-Box &amp; Conduct Ledger
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Report bullying, harassment, or emotional challenges with 100% cryptographic anonymity.
            Check counselor replies via secure token and review your live merits and leadership score.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("anonymous")}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "anonymous"
                ? "bg-slate-900 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <EyeOff className="w-4 h-4" />
            Anonymous Safe Space Drop-Box
          </button>
          <button
            onClick={() => setActiveTab("conduct")}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "conduct"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            Live Conduct Ledger &amp; Merits ({conductEntries.length})
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
          <div className="text-sm">
            <span className="font-semibold block mb-0.5">Success!</span>
            {notification}
          </div>
        </div>
      )}

      {/* TAB 1: ANONYMOUS SAFE SPACE */}
      {activeTab === "anonymous" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit Confidential Grievance
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Encrypted zero-log pipeline. Your name, email, and IP address are never recorded.
                  </p>
                </div>
              </div>

              {/* Zero-Identity Guarantee Callout */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 mb-5">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Cryptographic Privacy Shield:</strong> When you submit, our server issues a one-way tracking token (e.g. <code className="text-emerald-500 font-mono">SAFE-TOKEN-xxxx</code>). Save that token to check for counselor responses without logging in.
                </span>
              </div>

              <form onSubmit={handleSubmitGrievance} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Category of Issue
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="bullying">Bullying / Intimidation (Physical or Verbal)</option>
                    <option value="cyber_bullying">Cyber-Bullying / Online WhatsApp Group Harassment</option>
                    <option value="harassment">Campus Harassment / Discomfort</option>
                    <option value="counselor_private_chat">Confidential Counselor Chat (Mental Health / Board Stress)</option>
                    <option value="safety_hazard">Facility Hazard (Broken Window, Chemical Spill, Lab)</option>
                    <option value="vandalism">Campus Property Damage / Theft</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Urgency Level
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="standard">Standard (Reviewed within 24 hours)</option>
                      <option value="high">High Priority (Reviewed within 4 hours)</option>
                      <option value="critical">Critical / Immediate (Instant Principal Alert)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Campus Location (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd floor library hallway, bus route #4"
                      value={locationDetails}
                      onChange={(e) => setLocationDetails(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Detailed Account / Grievance Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe what happened or how you are feeling in detail. Do NOT include your name if you wish to remain 100% anonymous."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !description.trim()}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {isPending ? "Encrypting & Lodging..." : "Lodge Confidential Report"}
                </button>
              </form>
            </div>

            {/* If recent token generated */}
            {recentToken && (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-white space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Save Your Tracking Token
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 font-mono text-lg font-bold tracking-widest bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-700 text-emerald-400">
                    {recentToken}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(recentToken);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Copy Token"}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Keep this token safe. You will need it to retrieve the counselor&apos;s answer and ensure zero identity traces.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Track Existing Reports */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Track Report & Counselor Replies
                  </h2>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                  {filteredGrievances.length} Reports
                </span>
              </div>

              {/* Token Search Bar */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter SAFE-TOKEN-xxxx..."
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Reports List */}
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {filteredGrievances.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No reports match this token.
                  </div>
                ) : (
                  filteredGrievances.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {report.trackingToken}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {report.createdAt}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {report.description}
                      </p>

                      {report.locationDetails && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          📍 Location: {report.locationDetails}
                        </p>
                      )}

                      {/* Counselor Response Box */}
                      {report.counselorReply && (
                        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            Counselor Response:
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {report.counselorReply}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="capitalize text-slate-500">
                          Priority: <strong className="text-slate-700 dark:text-slate-300">{report.urgency}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          {report.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CONDUCT & MERIT LEDGER */}
      {activeTab === "conduct" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Merit Points
                </span>
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                +{meritsTotal}
              </div>
              <p className="text-xs text-slate-500 mt-1">Academics, integrity & sportsmanship</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Demerit Warnings
                </span>
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                -{demeritsTotal}
              </div>
              <p className="text-xs text-slate-500 mt-1">Punctuality & uniform adherence</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Conduct Standing
                </span>
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {netScore}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Exemplary standing rating</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Official Honors
                </span>
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                House Captain Candidate
              </div>
              <p className="text-xs text-slate-500 mt-1">Eligible for annual leadership council</p>
            </div>
          </div>

          {/* Chronological Conduct Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Chronological Conduct Ledger (2026-27)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every citation is entered directly by faculty and verified by the Discipline Committee.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {conductEntries.map((entry) => {
                const isMerit = entry.type === "merit";
                return (
                  <div
                    key={entry.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isMerit
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                        : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                        {entry.badgeIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              isMerit
                                ? "bg-emerald-600 text-white"
                                : "bg-amber-600 text-white"
                            }`}
                          >
                            {isMerit ? "Merit Award" : "Demerit Citation"}
                          </span>
                          <span className="text-xs text-slate-400">• {entry.date}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {entry.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          {entry.description}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                          Awarded / Recorded by: <span className="text-slate-700 dark:text-slate-200">{entry.issuedBy}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <div
                        className={`text-2xl font-black ${
                          isMerit ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isMerit ? `+${entry.points}` : entry.points} pts
                      </div>
                      <span className="text-[11px] text-slate-400">points impact</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
