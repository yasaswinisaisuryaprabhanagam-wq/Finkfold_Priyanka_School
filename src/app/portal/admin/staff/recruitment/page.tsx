"use client";

import { useState } from "react";

interface Candidate {
  id: string;
  name: string;
  subject: string;
  experienceYears: number;
  qualifications: string;
  currentSchool: string;
  email: string;
  phone: string;
  stage: "applied" | "shortlisted" | "demo_scheduled" | "principal_interview" | "hired";
  rating: number;
  demoTopic?: string;
}

const INITIAL_CANDIDATES: Candidate[] = [
  { id: "cand-1", name: "Dr. S. Ramanujan", subject: "Senior Physics (CBSE 11-12)", experienceYears: 8, qualifications: "M.Sc. Physics, B.Ed., Ph.D.", currentSchool: "Narayana Olympiad School", email: "ramanujan.physics@gmail.com", phone: "+91 98480 11223", stage: "demo_scheduled", rating: 4.8, demoTopic: "Electromagnetic Induction & Faraday Laws" },
  { id: "cand-2", name: "Mrs. Meenakshi Sundaram", subject: "Middle School English", experienceYears: 5, qualifications: "M.A. English Literature, B.Ed.", currentSchool: "St. Joseph's Convent", email: "meenakshi.sundaram@gmail.com", phone: "+91 94402 33445", stage: "shortlisted", rating: 4.4 },
  { id: "cand-3", name: "Mr. Rajesh Khanna", subject: "STEM Robotics & AI Lab", experienceYears: 4, qualifications: "B.Tech Robotics, Certified LEGO Educator", currentSchool: "Vikas Global Academy", email: "rajesh.robotics@gmail.com", phone: "+91 82472 55667", stage: "applied", rating: 4.6 },
  { id: "cand-4", name: "Mrs. Aruna Kumari", subject: "Primary Telugu & Environmental Studies", experienceYears: 10, qualifications: "M.A. Telugu, TPT", currentSchool: "Sri Chaitanya School", email: "aruna.kumari@gmail.com", phone: "+91 79810 77889", stage: "hired", rating: 4.9 },
];

export default function AdminStaffRecruitmentPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [notification, setNotification] = useState<string | null>(null);

  function advanceStage(candId: string, nextStage: Candidate["stage"]) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: nextStage } : c))
    );

    if (nextStage === "hired") {
      setNotification(`🎉 1-Click Onboarding Complete! Generated Employee ID for candidate #${candId}, created faculty credentials, and registered in campus biometric machine.`);
    } else {
      setNotification(`Candidate advanced to '${nextStage.replace("_", " ").toUpperCase()}'`);
    }
    setTimeout(() => setNotification(null), 5000);
  }

  const columns: { id: Candidate["stage"]; label: string; color: string }[] = [
    { id: "applied", label: "Applied (Portal Sync)", color: "text-slate-700" },
    { id: "shortlisted", label: "Resume Screened", color: "text-blue-700" },
    { id: "demo_scheduled", label: "Demo Class", color: "text-amber-700" },
    { id: "principal_interview", label: "Interview", color: "text-purple-700" },
    { id: "hired", label: "Hired & Onboarded", color: "text-emerald-700" },
  ];

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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Section 3: HR & Staff Appraisals</span>
              <span>·</span>
              <span>Darwinbox & Workday Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Applicant Tracking System (ATS) & Faculty Hiring
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Sync applications from the public careers page, parse qualifications with AI, manage demo class scheduling, and execute 1-click biometric onboarding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
              <div className="text-xl font-bold text-purple-700 font-['Outfit']">34</div>
              <div className="text-[10px] text-purple-700 font-medium">Open Resumes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recruitment Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {columns.map((col) => {
          const colCandidates = candidates.filter((c) => c.stage === col.id);
          return (
            <div key={col.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                  {colCandidates.length}
                </span>
              </div>

              <div className="space-y-2.5 min-h-[360px]">
                {colCandidates.length === 0 ? (
                  <div className="text-center py-12 text-[11px] text-slate-400 italic">No candidates</div>
                ) : (
                  colCandidates.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2 text-xs">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900">{c.name}</h4>
                          <span className="text-[10px] text-amber-600 font-bold">★ {c.rating}</span>
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold mt-0.5">{c.subject}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{c.qualifications}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.experienceYears} Years Exp • Ex: {c.currentSchool}</div>
                      </div>

                      {c.demoTopic && (
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900">
                          <strong>Demo:</strong> {c.demoTopic}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {col.id !== "hired" ? (
                          <button
                            onClick={() => {
                              const stages: Candidate["stage"][] = ["applied", "shortlisted", "demo_scheduled", "principal_interview", "hired"];
                              const currIdx = stages.indexOf(c.stage);
                              advanceStage(c.id, stages[currIdx + 1]);
                            }}
                            className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                              c.stage === "principal_interview"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                          >
                            {c.stage === "principal_interview" ? "1-Click Onboard 🚀" : "Advance Stage →"}
                          </button>
                        ) : (
                          <span className="w-full text-center py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-200">
                            ✓ Onboarded &amp; Biometrics Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
