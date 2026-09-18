"use client";

import { useState, useEffect, useTransition } from "react";
import type {
  MultiTierExamRecord,
  EarlierYearMarksArchive,
  AiSkillCompetency,
  AiWorksheet,
} from "@/types/self-service";
import {
  INITIAL_EXAM_RECORDS,
  INITIAL_EARLIER_YEARS,
  INITIAL_SKILL_GAPS,
  INITIAL_WORKSHEETS,
} from "@/types/self-service";
import {
  getAcademicsExamData,
  generateRemedialWorksheetAction,
  downloadReportCardAction,
} from "@/actions/academics";

export default function AcademicsExamPage() {
  const [activeTab, setActiveTab] = useState<"current_exams" | "earlier_archive" | "ai_skills">("current_exams");
  const [selectedExamType, setSelectedExamType] = useState<"all" | "sa" | "fa" | "weekly">("all");
  const [selectedEarlierYear, setSelectedEarlierYear] = useState<string>("2025-26");
  const [exams, setExams] = useState<MultiTierExamRecord[]>(INITIAL_EXAM_RECORDS);
  const [earlierYears] = useState<EarlierYearMarksArchive[]>(INITIAL_EARLIER_YEARS);
  const [skillGaps, setSkillGaps] = useState<AiSkillCompetency[]>(INITIAL_SKILL_GAPS);
  const [worksheets, setWorksheets] = useState<AiWorksheet[]>(INITIAL_WORKSHEETS);
  const [feeDuesCleared, setFeeDuesCleared] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAcademicsExamData().then((res) => {
      if (res) {
        if (res.exams) setExams(res.exams);
        if (res.skillGaps) setSkillGaps(res.skillGaps);
        if (res.worksheets) setWorksheets(res.worksheets);
        setFeeDuesCleared(res.feeDuesCleared);
      }
    });
  }, []);

  const activeEarlierData = earlierYears.find((y) => y.academicYear === selectedEarlierYear) || earlierYears[0];

  const filteredExams = selectedExamType === "all"
    ? exams
    : exams.filter((e) => e.examType === selectedExamType);

  function handleGenerateWorksheet(gap: AiSkillCompetency) {
    startTransition(async () => {
      const res = await generateRemedialWorksheetAction(gap.topicName, gap.subject);
      if (res.success && res.worksheet) {
        setWorksheets((prev) => [res.worksheet, ...prev]);
        setNotification(res.message);
        setTimeout(() => setNotification(null), 6000);
      }
    });
  }

  function handleDownloadReportCard(examId: string) {
    if (!feeDuesCleared) {
      alert("Institutional Fee Clearance Policy: Digital signed report cards can only be generated once outstanding term fees are cleared. Please visit the Fee Portal to clear dues.");
      return;
    }
    startTransition(async () => {
      const res = await downloadReportCardAction(examId);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-semibold mb-2">
            <span>📊</span>
            <span>Continuous Evaluation & Learning AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academics & Examination Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Multi-tier exam breakdowns, historical grade archives, and AI-powered skill diagnostics.
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab("current_exams")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "current_exams"
                ? "bg-white text-violet-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📝 Exam Results
          </button>
          <button
            onClick={() => setActiveTab("ai_skills")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "ai_skills"
                ? "bg-white text-violet-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🤖 AI Skill & Gap
          </button>
          <button
            onClick={() => setActiveTab("earlier_archive")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "earlier_archive"
                ? "bg-white text-violet-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🏛️ Earlier Marks Archive
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-violet-950 text-sm font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✨</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-violet-700 hover:text-violet-950 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: CURRENT EXAMS */}
      {activeTab === "current_exams" && (
        <div className="space-y-6">
          {/* Exam Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Evaluations" },
              { id: "sa", label: "Summative Assessments (SA)" },
              { id: "fa", label: "Formative Assessments (FA)" },
              { id: "weekly", label: "Weekly Chapter Tests" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedExamType(t.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedExamType === t.id
                    ? "bg-violet-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {filteredExams.map((exam) => (
            <div key={exam.id} className="card p-6 border border-slate-200/80 space-y-5">
              {/* Exam Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {exam.examName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold border border-violet-200">
                      {exam.term}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Evaluated on {exam.date} · Class 10-A</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Class Rank</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      #{exam.rankInClass} <span className="text-xs font-normal text-slate-400">/ {exam.totalStudents}</span>
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Overall Score</div>
                    <div className="text-base font-black text-violet-950">
                      {exam.overallPercentage}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadReportCard(exam.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>📄</span>
                    <span>Download Report Card</span>
                  </button>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Subject & Code</th>
                      <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                      <th className="py-2.5 px-3 text-center">Max Marks</th>
                      <th className="py-2.5 px-3 text-center">Class Average</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-right">Percentile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exam.subjects.map((sub, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {sub.subject}
                          <span className="text-[10px] text-slate-400 font-mono ml-2 font-normal">
                            ({sub.code})
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">
                          {sub.marksObtained}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-medium">
                          {sub.maxMarks}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500 font-medium">
                          {sub.classAverage}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                              sub.grade === "A1"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.grade === "A2"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-600">
                          {sub.percentile}th %ile
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: AI SKILL & GAP ANALYTICS */}
      {activeTab === "ai_skills" && (
        <div className="space-y-6">
          {/* AI Banner */}
          <div
            className="rounded-3xl p-6 text-white relative overflow-hidden shadow-lg"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)" }}
          >
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-violet-200 text-xs font-semibold backdrop-blur-sm">
                <span>🧠</span>
                <span>Automated Formative Diagnostics</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                AI-Powered Learning Gap Analysis
              </h2>
              <p className="text-xs sm:text-sm text-violet-100/80 leading-relaxed">
                Rather than generic percentages, our machine learning engine examines exam answer sheets to detect exact chapter vulnerabilities and synthesizes tailored practice sheets for the weekend.
              </p>
            </div>
          </div>

          {/* Competency Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillGaps.map((gap) => (
              <div
                key={gap.id}
                className="card p-5 flex flex-col justify-between border border-slate-200/80 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-lg border border-violet-200">
                      {gap.subject}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        gap.status === "strong"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : gap.status === "developing"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {gap.status === "strong"
                        ? "🟢 Mastery (Strong)"
                        : gap.status === "developing"
                        ? "🔵 Developing Concept"
                        : "🔴 Critical Gap Detected"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {gap.topicName}
                  </h3>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Concept Retention</span>
                      <span>{gap.masteryScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          gap.masteryScore >= 80
                            ? "bg-emerald-500"
                            : gap.masteryScore >= 60
                            ? "bg-blue-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${gap.masteryScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagnostic Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4">
                    <div>
                      <strong className="text-slate-800">Diagnostic:</strong> {gap.diagnosticSummary}
                    </div>
                    <div className="text-violet-900 font-medium">
                      💡 <strong>Action:</strong> {gap.actionableRecommendation}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateWorksheet(gap)}
                  disabled={isPending}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                    gap.status === "critical_gap"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-violet-900 hover:bg-violet-800 text-white"
                  }`}
                >
                  <span>⚡</span>
                  <span>Generate Remedial Worksheet ({gap.remedialWorksheetsAvailable} Avail)</span>
                </button>
              </div>
            ))}
          </div>

          {/* Generated Worksheets Repository */}
          <div className="card p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekend Remedial Worksheets Vault</h3>
                <p className="text-xs text-slate-500">Custom practice sheets compiled for Arjun Reddy based on exam diagnostics.</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {worksheets.length} Sheets Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {worksheets.map((ws) => (
                <div key={ws.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                      {ws.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">⏱️ {ws.estimatedMinutes} mins</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{ws.title}</h4>
                  <div className="text-[11px] text-slate-500 font-medium">
                    📝 {ws.questionsCount} Targeted Questions + Answer Key
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${ws.title} with complete diagnostic explanations!`)}
                    className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>📥</span>
                    <span>Download PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EARLIER MARKS ARCHIVE */}
      {activeTab === "earlier_archive" && (
        <div className="space-y-6">
          <div className="card p-6 border border-slate-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Historical Marks & Cumulative Dossier</h3>
                <p className="text-xs text-slate-500">Access previous academic years without submitting office requests.</p>
              </div>

              {/* Year Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Select Academic Year:</span>
                <select
                  value={selectedEarlierYear}
                  onChange={(e) => setSelectedEarlierYear(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {earlierYears.map((y) => (
                    <option key={y.academicYear} value={y.academicYear}>
                      {y.academicYear} ({y.classGrade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Archive Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-semibold">Annual CGPA</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{activeEarlierData.annualGpa}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">Distinction Grade</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-semibold">Aggregate Percentage</div>
                <div className="text-xl font-black text-violet-950 mt-0.5">{activeEarlierData.percentage}%</div>
                <div className="text-[10px] text-slate-500 mt-1">Class Rank #2</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-semibold">Annual Attendance</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{activeEarlierData.attendancePercent}%</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1">Regular Compliance</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-400 font-semibold">Conduct & Character</div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">{activeEarlierData.conductGrade}</div>
                <div className="text-[10px] text-slate-500 mt-1">Zero Disciplinary Notes</div>
              </div>
            </div>

            {/* Honors & Remarks */}
            <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-200/70 space-y-1">
              <div className="text-xs font-bold text-violet-950">🏆 Recorded Academic Honors & Accolades:</div>
              <div className="text-xs text-violet-900 leading-relaxed font-medium">
                {activeEarlierData.keyHonors}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => alert(`Downloading archived final report card for ${activeEarlierData.academicYear} (${activeEarlierData.classGrade})`)}
                className="px-4 py-2.5 rounded-xl bg-violet-900 hover:bg-violet-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>📜</span>
                <span>Download Archived Annual Marksheet (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
