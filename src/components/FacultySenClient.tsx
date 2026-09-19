"use client";

import { useState, useTransition } from "react";
import { SenAccommodationProfile } from "@/types/faculty";
import { updateSenAccommodationAction } from "@/actions/faculty";

interface Props {
  initialProfiles: SenAccommodationProfile[];
  totalSenStudents: number;
}

export default function FacultySenClient({ initialProfiles, totalSenStudents }: Props) {
  const [profiles, setProfiles] = useState<SenAccommodationProfile[]>(initialProfiles);
  const [selectedStudent, setSelectedStudent] = useState<SenAccommodationProfile>(initialProfiles[0]);
  const [newAccommodation, setNewAccommodation] = useState("");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddAccommodation = () => {
    if (!newAccommodation || !selectedStudent) return;
    startTransition(async () => {
      const res = await updateSenAccommodationAction({
        studentId: selectedStudent.studentId,
        newAccommodation,
      });
      if (res.success) {
        setNotification(res.message);
        setSelectedStudent((prev) => ({
          ...prev,
          actionableAccommodations: [...prev.actionableAccommodations, newAccommodation],
        }));
        setNewAccommodation("");
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-amber-600 hover:text-amber-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner - Clean Reference Style */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                PowerSchool IEP &amp; SEN Vault
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Strictly Confidential (Faculty &amp; Counselors Only)
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              SEN &amp; Accommodations Vault
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Ensure every child with Dyslexia, ADHD, or anxiety receives fair, counselor-approved classroom accommodations without social stigma.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50/80 border border-amber-200 px-4 py-2.5 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-amber-700">{totalSenStudents}</div>
              <div className="text-[10px] text-amber-800 uppercase font-semibold">Active IEP Profiles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: SEN Students List + Accommodations Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Confidential Roster with Yellow Star */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Confidential IEP Profiles</h3>
            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
              <span>⭐</span> Flagged
            </span>
          </div>

          <div className="space-y-2">
            {profiles.map((p) => (
              <button
                key={p.studentId}
                onClick={() => setSelectedStudent(p)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  p.studentId === selectedStudent.studentId
                    ? "border-amber-500 bg-amber-500/10 shadow-xs"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                    <span className="text-amber-400">⭐</span>
                    <span>{p.studentName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Roll #{p.rollNo}</span>
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate mt-1">
                  {p.primaryDiagnosis}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Actionable Classroom & Exam Accommodations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Individualized Education Program (IEP)</span>
                <h2 className="text-base font-bold text-foreground mt-0.5">{selectedStudent.studentName}</h2>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Diagnosis: <strong className="text-foreground">{selectedStudent.primaryDiagnosis}</strong> • Certified by {selectedStudent.counselorName}
                </div>
              </div>

              {selectedStudent.safePassGranted && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <span>🕊️</span> Safe Exit Pass Authorized
                </span>
              )}
            </div>

            {/* Daily Classroom Actionable Guidelines */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <span>📋</span> Daily Classroom Instructions (For All Subject Teachers)
              </h3>
              <ul className="space-y-2 mt-2">
                {selectedStudent.actionableAccommodations.map((acc, idx) => (
                  <li key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-foreground flex items-start gap-2.5">
                    <span className="text-amber-500 font-bold mt-0.5">✓</span>
                    <span className="leading-relaxed">{acc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Examination & Testing Accommodations */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <span>⏱️</span> Official Board & Exam Accommodations
              </h3>
              <ul className="space-y-2 mt-2">
                {selectedStudent.examAccommodations.map((examAcc, idx) => (
                  <li key={idx} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-foreground flex items-start gap-2.5">
                    <span className="text-blue-500 font-bold mt-0.5">✓</span>
                    <span className="leading-relaxed">{examAcc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add New Observation / Accommodation */}
            <div className="pt-4 border-t border-border space-y-2">
              <label className="block text-xs font-medium text-foreground">
                Add Faculty Observation or Suggest Adjustment (Sent to Counselor)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Student responds very well to color-coded whiteboard mindmaps."
                  value={newAccommodation}
                  onChange={(e) => setNewAccommodation(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-lg border border-border bg-background"
                />
                <button
                  onClick={handleAddAccommodation}
                  disabled={isPending || !newAccommodation}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Add to IEP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
