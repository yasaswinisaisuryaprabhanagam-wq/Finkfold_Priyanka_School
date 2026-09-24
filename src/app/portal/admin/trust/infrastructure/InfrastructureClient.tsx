"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  BookOpen,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Scale,
  Maximize2,
  Wrench,
  Download
} from "lucide-react";

interface CampusInfraMetric {
  campusCode: string;
  campusName: string;
  enrolledStudents: number;
  totalTeachers: number;
  strRatio: number;
  strStatus: "compliant" | "warning" | "breach";
  avgClassroomSqFtPerStudent: number;
  sqFtStatus: "compliant" | "warning" | "breach";
  libraryTitlesPerStudent: number;
  libraryStatus: "compliant" | "warning" | "breach";
  scienceLabRatio: string;
  sanitationPointsRatio: string;
  cwsnRampsAccessible: boolean;
  overallRteScore: number;
  deficits: string[];
}

const CAMPUS_INFRA_DATA: CampusInfraMetric[] = [
  {
    campusCode: "HYD-01",
    campusName: "Main Campus (Jubilee Hills)",
    enrolledStudents: 1420,
    totalTeachers: 68,
    strRatio: 20.8, // compliant <= 30
    strStatus: "compliant",
    avgClassroomSqFtPerStudent: 14.5, // compliant >= 12
    sqFtStatus: "compliant",
    libraryTitlesPerStudent: 8.6, // compliant >= 5
    libraryStatus: "compliant",
    scienceLabRatio: "1:1 Individual Workstation",
    sanitationPointsRatio: "1 Urinal / 25 Boys; 1 WC / 20 Girls",
    cwsnRampsAccessible: true,
    overallRteScore: 98,
    deficits: [],
  },
  {
    campusCode: "HYD-02",
    campusName: "North Campus (Kompally)",
    enrolledStudents: 1180,
    totalTeachers: 37,
    strRatio: 31.8, // breach > 30:1
    strStatus: "breach",
    avgClassroomSqFtPerStudent: 9.8, // breach < 12
    sqFtStatus: "breach",
    libraryTitlesPerStudent: 4.2, // warning < 5
    libraryStatus: "warning",
    scienceLabRatio: "1:2 Shared Workstations (Deficit: 8 Microscopes)",
    sanitationPointsRatio: "1 Urinal / 32 Boys; 1 WC / 24 Girls",
    cwsnRampsAccessible: true,
    overallRteScore: 74,
    deficits: [
      "Student-Teacher Ratio exceeds statutory RTE ceiling (31.8:1 vs 30:1 threshold). Need 3 TGT faculty hires.",
      "Classroom density in Section 9A & 9B exceeds capacity (9.8 sq.ft/child vs 12 sq.ft norm). Recommend bifurcating into Section 9C.",
      "Library volume deficit of 944 titles to satisfy CBSE SARAS 4.0 standard.",
    ],
  },
  {
    campusCode: "HYD-03",
    campusName: "East City (Uppal)",
    enrolledStudents: 620,
    totalTeachers: 29,
    strRatio: 21.3,
    strStatus: "compliant",
    avgClassroomSqFtPerStudent: 15.2,
    sqFtStatus: "compliant",
    libraryTitlesPerStudent: 9.4,
    libraryStatus: "compliant",
    scienceLabRatio: "1:1 Individual Workstation",
    sanitationPointsRatio: "1 Urinal / 20 Boys; 1 WC / 18 Girls",
    cwsnRampsAccessible: true,
    overallRteScore: 96,
    deficits: [],
  },
];

export default function InfrastructureClient() {
  const [infraData] = useState<CampusInfraMetric[]>(CAMPUS_INFRA_DATA);
  const [selectedCampus, setSelectedCampus] = useState<CampusInfraMetric>(CAMPUS_INFRA_DATA[1]);
  const [remediationModalOpen, setRemediationModalOpen] = useState(false);

  const totalStudents = infraData.reduce((acc, c) => acc + c.enrolledStudents, 0);
  const totalTeachers = infraData.reduce((acc, c) => acc + c.totalTeachers, 0);
  const avgStr = (totalStudents / totalTeachers).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-cyan-950/40 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-3.5 h-3.5" />
              PowerSchool & CBSE SARAS 4.0 Architecture
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Institutional Asset & Infrastructure Audit (RTE)
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Real-time audit engine monitoring statutory RTE 2009 & CBSE Affiliation Bye-Laws.
              Tracks Student-Teacher Ratio (STR 30:1), classroom square footage per child, lab workstations, and library title ratios.
            </p>
          </div>

          <button
            onClick={() => setRemediationModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Generate RTE Remediation Plan
          </button>
        </div>

        {/* Global Infra KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-500" />
              Trust Student Enrollment
            </div>
            <div className="text-2xl font-bold text-foreground">3,220 Students</div>
            <div className="text-[11px] text-muted-foreground">Across 3 physical campuses</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-500" />
              Trust Average STR
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgStr}:1</div>
            <div className="text-[11px] text-muted-foreground">CBSE Norm: Max 30:1</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
              Classroom Floor Space
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">13.1 Sq.Ft / Child</div>
            <div className="text-[11px] text-muted-foreground">Benchmark: &gt;12.0 Sq.Ft</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              Overall RTE Compliance
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">89.3%</div>
            <div className="text-[11px] text-muted-foreground">1 Campus requires remediation</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Campus Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {infraData.map((campus) => {
          const isSelected = selectedCampus.campusCode === campus.campusCode;
          const hasBreach = campus.strStatus === "breach" || campus.sqFtStatus === "breach";

          return (
            <div
              key={campus.campusCode}
              onClick={() => setSelectedCampus(campus)}
              className={`cursor-pointer rounded-2xl border p-5 shadow-sm space-y-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-cyan-500 bg-cyan-500/5 shadow-md"
                  : hasBreach
                  ? "border-red-500/40 bg-card hover:border-red-500/70"
                  : "border-border/80 bg-card hover:border-cyan-500/40"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {campus.campusCode}
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-0.5">{campus.campusName}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      campus.overallRteScore >= 90
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse"
                    }`}
                  >
                    RTE Score: {campus.overallRteScore}%
                  </span>
                </div>

                {/* Statutory Checkpoints */}
                <div className="space-y-2 text-xs">
                  {/* STR Checkpoint */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> Student-Teacher Ratio:
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        campus.strStatus === "breach"
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {campus.strRatio}:1
                      {campus.strStatus === "breach" ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>

                  {/* Floor Space Checkpoint */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Classroom Sq.Ft/Child:
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        campus.sqFtStatus === "breach"
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {campus.avgClassroomSqFtPerStudent} sq.ft
                      {campus.sqFtStatus === "breach" ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>

                  {/* Library Ratio Checkpoint */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Library Titles/Student:
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        campus.libraryStatus === "warning"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {campus.libraryTitlesPerStudent} titles
                      {campus.libraryStatus === "warning" ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>

                  {/* CWSN Accessibility */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> CWSN Barrier-Free Ramps:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      100% Fitted <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Deficit Alert if any */}
                {campus.deficits.length > 0 && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-[11px] space-y-1">
                    <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {campus.deficits.length} Statutory Action Items
                    </div>
                    <div className="text-muted-foreground line-clamp-2">
                      {campus.deficits[0]}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedCampus(campus);
                  setRemediationModalOpen(true);
                }}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  hasBreach
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                {hasBreach ? "Inspect & Remediate Deficits" : "View Full Audit Details"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Remediation Action Plan Modal */}
      {remediationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-cyan-500/50 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    RTE 2009 & CBSE Statutory Remediation Blueprint
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedCampus.campusName}</p>
                </div>
              </div>
              <button
                onClick={() => setRemediationModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Breakdown */}
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-muted/40 p-4 border border-border/70 space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Identified Statutory Gaps & Rectification Steps:
                </h4>
                {selectedCampus.deficits.length === 0 ? (
                  <div className="text-emerald-600 font-semibold py-2">
                    ✅ No statutory deficits detected for {selectedCampus.campusName}. All metrics exceed CBSE SARAS 4.0 and RTE 2009 standards.
                  </div>
                ) : (
                  <ul className="space-y-2 list-disc pl-4 text-muted-foreground">
                    {selectedCampus.deficits.map((deficit, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <strong className="text-foreground">{deficit.split(".")[0]}.</strong>
                        {deficit.split(".").slice(1).join(".")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recommended CAPEX / Budget Allocation */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-2">
                <div className="font-bold text-foreground text-xs">Recommended CAPEX Remittance:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-background/80 p-2 rounded-lg border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Faculty Additions (3 TGTs)</div>
                    <div className="font-bold text-foreground mt-0.5">₹1.80L / Mo</div>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Library Acquisition (944 Books)</div>
                    <div className="font-bold text-foreground mt-0.5">₹2.85L (One-time)</div>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border/50">
                    <div className="text-muted-foreground text-[10px]">Section 9C Bifurcation</div>
                    <div className="font-bold text-foreground mt-0.5">Zero (Utilize Room 204)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setRemediationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Remediation Plan exported as PDF for Board of Directors review.");
                  setRemediationModalOpen(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Remediation PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
