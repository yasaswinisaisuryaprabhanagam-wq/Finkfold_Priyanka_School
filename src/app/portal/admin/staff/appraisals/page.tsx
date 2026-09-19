"use client";

import { useState } from "react";

interface TeacherAppraisal {
  id: string;
  name: string;
  subject: string;
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
}

const APPRAISAL_DATA: TeacherAppraisal[] = [
  {
    id: "t-1",
    name: "Mrs. Priyanka Devi",
    subject: "Mathematics (CBSE 10)",
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
  },
  {
    id: "t-2",
    name: "Mr. K. R. Sharma",
    subject: "Physical Sciences",
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
  },
  {
    id: "t-3",
    name: "Mrs. S. Latha",
    subject: "Social Sciences",
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
  },
];

export default function AdminStaffAppraisalsPage() {
  const [appraisals, setAppraisals] = useState<TeacherAppraisal[]>(APPRAISAL_DATA);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherAppraisal | null>(APPRAISAL_DATA[0]);
  const [notification, setNotification] = useState<string | null>(null);

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
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
                Section 3: HR &amp; Staff Appraisals
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Empirical Evaluation Matrix
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              360° Faculty Appraisal Matrix
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-2xl">
              Eliminate subjective evaluation and favoritism. Performance scores are mathematically synthesized from biometric punctuality (25%), academic class gains (35%), parent feedback sentiment (20%), and relief cooperation (20%).
            </p>
          </div>

          <button
            onClick={() => {
              setNotification("Generated Annual Appraisal Summary PDF with institutional seal!");
              setTimeout(() => setNotification(null), 4000);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs self-start md:self-auto"
          >
            Export Appraisal Ledger (PDF)
          </button>
        </div>
      </div>

      {/* Main Grid: Teacher Ranking (Left) + Detailed Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Faculty Performance Index (Academic Year 2026-2027)</h2>
            <span className="text-xs text-slate-400">Weights: 25% Bio • 35% Acad • 20% PTM • 20% Relief</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Faculty Member</th>
                  <th className="pb-3">Punctuality (25%)</th>
                  <th className="pb-3">Academics (35%)</th>
                  <th className="pb-3">PTM Sentiment (20%)</th>
                  <th className="pb-3">Relief (20%)</th>
                  <th className="pb-3">Total Score</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appraisals.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTeacher(t)}
                    className={`cursor-pointer transition-colors ${
                      selectedTeacher?.id === t.id ? "bg-purple-50/50" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.subject}</div>
                    </td>
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
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Audit Dossier</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTeacher.name}</h3>
              <p className="text-xs text-slate-500">{selectedTeacher.subject} • {selectedTeacher.classesTaught}</p>
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

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Recommended Increment:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {selectedTeacher.tier === "Outstanding" ? "+15% Band A" : selectedTeacher.tier === "Exceeds Expectations" ? "+10% Band B" : "+7% Standard"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
