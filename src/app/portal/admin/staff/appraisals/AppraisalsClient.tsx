"use client";

import { useState } from "react";

interface TeacherAppraisal {
  id: string;
  name: string;
  subject: string;
  campus?: string;
  classesTaught: string;
  punctualityScore: number; // 25% weight
  academicImpactScore: number; // 35% weight
  parentFeedbackScore: number; // 20% weight
  reliefCooperationScore: number; // 20% weight
  totalScore: number;
  tier: "Outstanding" | "Exceeds Expectations" | "Meets Expectations" | "Needs Improvement";
  metricDetails: {
    lateArrivals: number;
    avgClassGain: string;
    parentRating: number;
    reliefPeriodsCovered: number;
  };
  recommendation?: string;
}

const APPRAISAL_DATA: TeacherAppraisal[] = [
  {
    id: "t-1",
    name: "Mrs. Priyanka Devi",
    subject: "Mathematics (CBSE 10)",
    campus: "Main Campus",
    classesTaught: "Class 10-A, Class 9-A",
    punctualityScore: 98,
    academicImpactScore: 94,
    parentFeedbackScore: 96,
    reliefCooperationScore: 100,
    totalScore: 96.6,
    tier: "Outstanding",
    metricDetails: {
      lateArrivals: 1,
      avgClassGain: "+12.8% vs last year",
      parentRating: 4.8,
      reliefPeriodsCovered: 14,
    },
    recommendation: "+18% Band A+ (Chairman's Star Award)",
  },
  {
    id: "t-2",
    name: "Mr. K. R. Sharma",
    subject: "Physical Sciences",
    campus: "Main Campus",
    classesTaught: "Class 10-A, Class 8-B",
    punctualityScore: 92,
    academicImpactScore: 88,
    parentFeedbackScore: 90,
    reliefCooperationScore: 85,
    totalScore: 88.8,
    tier: "Exceeds Expectations",
    metricDetails: {
      lateArrivals: 4,
      avgClassGain: "+8.4% vs last year",
      parentRating: 4.5,
      reliefPeriodsCovered: 8,
    },
    recommendation: "+10% Band B Increment",
  },
  {
    id: "t-3",
    name: "Mrs. S. Latha",
    subject: "Social Sciences",
    campus: "Main Campus",
    classesTaught: "Class 9-A, Class 7-A",
    punctualityScore: 84,
    academicImpactScore: 82,
    parentFeedbackScore: 85,
    reliefCooperationScore: 75,
    totalScore: 81.7,
    tier: "Meets Expectations",
    metricDetails: {
      lateArrivals: 8,
      avgClassGain: "+4.1% vs last year",
      parentRating: 4.2,
      reliefPeriodsCovered: 5,
    },
    recommendation: "+7% Standard Band C",
  },
];

const TRUST_TOP_10: TeacherAppraisal[] = [
  {
    id: "tt-1",
    name: "Mrs. Priyanka Devi",
    subject: "Mathematics (CBSE 10)",
    campus: "Main Campus",
    classesTaught: "Class 10-A, Class 9-A",
    punctualityScore: 98,
    academicImpactScore: 94,
    parentFeedbackScore: 96,
    reliefCooperationScore: 100,
    totalScore: 96.6,
    tier: "Outstanding",
    metricDetails: { lateArrivals: 1, avgClassGain: "+12.8%", parentRating: 4.8, reliefPeriodsCovered: 14 },
    recommendation: "+18% Band A+ &amp; Chairman's Shield",
  },
  {
    id: "tt-2",
    name: "Dr. Ramesh Sundaram",
    subject: "Physics (CBSE 11-12)",
    campus: "North Campus",
    classesTaught: "Class 12-A, Class 11-A",
    punctualityScore: 99,
    academicImpactScore: 96,
    parentFeedbackScore: 94,
    reliefCooperationScore: 92,
    totalScore: 95.8,
    tier: "Outstanding",
    metricDetails: { lateArrivals: 0, avgClassGain: "+14.2%", parentRating: 4.9, reliefPeriodsCovered: 11 },
    recommendation: "+16% Band A &amp; Research Grant",
  },
  {
    id: "tt-3",
    name: "Mrs. Kavitha Balaji",
    subject: "Biology & Life Sciences",
    campus: "East City",
    classesTaught: "Class 10-A, Class 12-B",
    punctualityScore: 96,
    academicImpactScore: 95,
    parentFeedbackScore: 93,
    reliefCooperationScore: 94,
    totalScore: 94.7,
    tier: "Outstanding",
    metricDetails: { lateArrivals: 2, avgClassGain: "+11.5%", parentRating: 4.7, reliefPeriodsCovered: 13 },
    recommendation: "+15% Band A Promotion",
  },
  {
    id: "tt-4",
    name: "Mr. Anirudh Nair",
    subject: "English Literature",
    campus: "Main Campus",
    classesTaught: "Class 9-A, Class 10-A",
    punctualityScore: 95,
    academicImpactScore: 92,
    parentFeedbackScore: 95,
    reliefCooperationScore: 90,
    totalScore: 93.2,
    tier: "Outstanding",
    metricDetails: { lateArrivals: 2, avgClassGain: "+10.1%", parentRating: 4.8, reliefPeriodsCovered: 10 },
    recommendation: "+15% Band A Increment",
  },
  {
    id: "tt-5",
    name: "Mrs. Sunita Deshmukh",
    subject: "Chemistry & Laboratory",
    campus: "North Campus",
    classesTaught: "Class 11-B, Class 12-B",
    punctualityScore: 91,
    academicImpactScore: 93,
    parentFeedbackScore: 90,
    reliefCooperationScore: 92,
    totalScore: 91.5,
    tier: "Exceeds Expectations",
    metricDetails: { lateArrivals: 3, avgClassGain: "+9.0%", parentRating: 4.6, reliefPeriodsCovered: 9 },
    recommendation: "+12% Band B Increment",
  },
  {
    id: "tt-6",
    name: "Mr. K. R. Sharma",
    subject: "Physical Sciences",
    campus: "Main Campus",
    classesTaught: "Class 10-A, Class 8-B",
    punctualityScore: 92,
    academicImpactScore: 88,
    parentFeedbackScore: 90,
    reliefCooperationScore: 85,
    totalScore: 88.8,
    tier: "Exceeds Expectations",
    metricDetails: { lateArrivals: 4, avgClassGain: "+8.4%", parentRating: 4.5, reliefPeriodsCovered: 8 },
    recommendation: "+10% Band B Increment",
  },
  {
    id: "tt-7",
    name: "Mrs. Deepa Menon",
    subject: "Hindi & Sanskrit",
    campus: "East City",
    classesTaught: "Class 6-A, Class 8-A",
    punctualityScore: 90,
    academicImpactScore: 86,
    parentFeedbackScore: 89,
    reliefCooperationScore: 88,
    totalScore: 88.2,
    tier: "Exceeds Expectations",
    metricDetails: { lateArrivals: 4, avgClassGain: "+7.8%", parentRating: 4.5, reliefPeriodsCovered: 9 },
    recommendation: "+10% Band B Increment",
  },
  {
    id: "tt-8",
    name: "Mr. R. Joshi",
    subject: "Computer Science & AI",
    campus: "East City",
    classesTaught: "Class 11-A, Class 12-A",
    punctualityScore: 89,
    academicImpactScore: 88,
    parentFeedbackScore: 87,
    reliefCooperationScore: 86,
    totalScore: 87.5,
    tier: "Exceeds Expectations",
    metricDetails: { lateArrivals: 5, avgClassGain: "+7.2%", parentRating: 4.4, reliefPeriodsCovered: 7 },
    recommendation: "+10% Band B Increment",
  },
  {
    id: "tt-9",
    name: "Mrs. Shilpa Rao",
    subject: "Commerce & Accountancy",
    campus: "North Campus",
    classesTaught: "Class 11-C, Class 12-C",
    punctualityScore: 88,
    academicImpactScore: 87,
    parentFeedbackScore: 86,
    reliefCooperationScore: 87,
    totalScore: 86.9,
    tier: "Exceeds Expectations",
    metricDetails: { lateArrivals: 5, avgClassGain: "+6.8%", parentRating: 4.4, reliefPeriodsCovered: 7 },
    recommendation: "+10% Band B Increment",
  },
  {
    id: "tt-10",
    name: "Mrs. S. Latha",
    subject: "Social Sciences",
    campus: "Main Campus",
    classesTaught: "Class 9-A, Class 7-A",
    punctualityScore: 84,
    academicImpactScore: 82,
    parentFeedbackScore: 85,
    reliefCooperationScore: 75,
    totalScore: 81.7,
    tier: "Meets Expectations",
    metricDetails: { lateArrivals: 8, avgClassGain: "+4.1%", parentRating: 4.2, reliefPeriodsCovered: 5 },
    recommendation: "+7% Standard Band C",
  },
];

export default function AppraisalsClient({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"branch" | "trust_top10">(
    isSuperAdmin ? "trust_top10" : "branch"
  );
  const [appraisals] = useState<TeacherAppraisal[]>(APPRAISAL_DATA);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherAppraisal | null>(
    isSuperAdmin ? TRUST_TOP_10[0] : APPRAISAL_DATA[0]
  );
  const [notification, setNotification] = useState<string | null>(null);

  const displayList = activeTab === "trust_top10" ? TRUST_TOP_10 : appraisals;

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
              <span>Section 3: HR &amp; Staff Appraisals</span>
              <span>&bull;</span>
              <span>Empirical Evaluation Matrix</span>
              {isSuperAdmin && (
                <>
                  <span>&bull;</span>
                  <span className="text-amber-700 font-bold">🏛️ Super Admin Multi-Campus</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              360&deg; Faculty Appraisal &amp; Merit Matrix
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Eliminate subjective evaluation and favoritism. Performance scores are mathematically synthesized from biometric punctuality (25%), academic class gains (35%), parent feedback sentiment (20%), and relief cooperation (20%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNotification(
                  activeTab === "trust_top10"
                    ? "Generated Trust HQ Top 10 Executive Honours List PDF with Chairman's Seal!"
                    : "Generated Branch Annual Appraisal Summary PDF with institutional seal!"
                );
                setTimeout(() => setNotification(null), 4000);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs self-start md:self-auto cursor-pointer"
            >
              Export Appraisal Ledger (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selector when Super Admin */}
      {isSuperAdmin && (
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 w-fit">
          <button
            onClick={() => {
              setActiveTab("trust_top10");
              setSelectedTeacher(TRUST_TOP_10[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "trust_top10"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🏆</span>
            <span>Trust Top 10 Faculty Leaderboard (All 3 Campuses)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("branch");
              setSelectedTeacher(APPRAISAL_DATA[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "branch"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🏫</span>
            <span>Current Branch Roster</span>
          </button>
        </div>
      )}

      {/* Main Grid: Teacher Ranking (Left) + Detailed Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                {activeTab === "trust_top10"
                  ? "🏆 Trust-Wide Cross-Campus Merit Leaderboard"
                  : "Faculty Performance Index (Active Branch)"}
              </h2>
              <span className="text-[11px] text-slate-400">
                Formula: 25% Biometric &bull; 35% Acad Gain &bull; 20% PTM Feedback &bull; 20% Relief Support
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              {displayList.length} Teachers Ranked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {activeTab === "trust_top10" && <th className="pb-3 text-center">Rank</th>}
                  <th className="pb-3">Faculty Member</th>
                  {activeTab === "trust_top10" && <th className="pb-3">Campus</th>}
                  <th className="pb-3">Punctuality (25%)</th>
                  <th className="pb-3">Academics (35%)</th>
                  <th className="pb-3">PTM Sentiment (20%)</th>
                  <th className="pb-3">Relief (20%)</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3 text-right">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList.map((t, idx) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTeacher(t)}
                    className={`cursor-pointer transition-colors ${
                      selectedTeacher?.id === t.id ? "bg-purple-50/60" : "hover:bg-slate-50/80"
                    }`}
                  >
                    {activeTab === "trust_top10" && (
                      <td className="py-3.5 text-center font-bold">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </td>
                    )}
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.subject}</div>
                    </td>
                    {activeTab === "trust_top10" && (
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {t.campus}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 font-bold text-slate-700">{t.punctualityScore}%</td>
                    <td className="py-3.5 font-bold text-emerald-700">{t.academicImpactScore}%</td>
                    <td className="py-3.5 font-bold text-slate-700">{t.parentFeedbackScore}%</td>
                    <td className="py-3.5 font-bold text-purple-700">{t.reliefCooperationScore}%</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800">
                        {t.totalScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.tier === "Outstanding"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : t.tier === "Exceeds Expectations"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {t.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Selected Teacher Empirical Dossier */}
        {selectedTeacher && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Audit Dossier</span>
                {selectedTeacher.campus && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {selectedTeacher.campus}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {selectedTeacher.name}
              </h3>
              <p className="text-xs text-slate-500">{selectedTeacher.subject} &bull; {selectedTeacher.classesTaught}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Biometric Punctuality</span>
                  <span className="text-emerald-700">{selectedTeacher.punctualityScore}%</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Late gate punches: <strong>{selectedTeacher.metricDetails.lateArrivals} days</strong> in 180 sessions.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Academic Subject Growth</span>
                  <span className="text-emerald-700">{selectedTeacher.academicImpactScore}%</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Class average trajectory: <strong>{selectedTeacher.metricDetails.avgClassGain}</strong>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>PTM Parent Feedback</span>
                  <span className="text-purple-700">{selectedTeacher.parentFeedbackScore}%</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Average parent rating: <strong>★ {selectedTeacher.metricDetails.parentRating} / 5.0</strong>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Relief &amp; Substitution</span>
                  <span className="text-purple-700">{selectedTeacher.reliefCooperationScore}%</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Accepted coverage: <strong>{selectedTeacher.metricDetails.reliefPeriodsCovered} periods</strong>.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
              <span className="text-slate-500">Super Admin &amp; Trust Recommendation:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {selectedTeacher.recommendation || (
                  selectedTeacher.tier === "Outstanding"
                    ? "+15% Band A"
                    : selectedTeacher.tier === "Exceeds Expectations"
                    ? "+10% Band B"
                    : "+7% Standard"
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
