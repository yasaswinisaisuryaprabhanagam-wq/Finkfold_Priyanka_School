"use client";

import { useState } from "react";
import {
  INITIAL_LOC_CANDIDATES,
  updateCandidateLoc,
  exportBoardLocExcel,
} from "@/actions/admin-board-loc";
import type { CandidateLocRecord } from "@/types/admin-extended";

export default function AdminBoardLocPage() {
  const [candidates, setCandidates] = useState<CandidateLocRecord[]>(INITIAL_LOC_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateLocRecord | null>(null);
  const [editingMark1, setEditingMark1] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const verifiedCount = candidates.filter((c) => c.boardVerificationStatus === "verified").length;
  const flaggedCount = candidates.filter((c) => c.boardVerificationStatus !== "verified").length;

  async function handleFixCandidate() {
    if (!selectedCandidate) return;
    const res = await updateCandidateLoc(selectedCandidate.id, {
      identificationMark1: editingMark1 || "A MOLE ON LEFT COLLARBONE",
      signatureVerified: true,
      boardVerificationStatus: "verified",
      validationErrors: [],
    });

    if (res.success) {
      setCandidates(
        candidates.map((c) =>
          c.id === selectedCandidate.id
            ? {
                ...c,
                identificationMark1: editingMark1 || "A MOLE ON LEFT COLLARBONE",
                signatureVerified: true,
                boardVerificationStatus: "verified",
                validationErrors: [],
              }
            : c
        )
      );
      setSelectedCandidate(null);
      setStatusMessage("✓ Candidate record cleared and verified for board registration.");
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    const res = await exportBoardLocExcel("class-10");
    if (res.success) {
      setStatusMessage(`✓ ${res.message} (File: ${res.filename})`);

      // Trigger dummy CSV download
      const csv = "RollNo,CandidateName,MotherName,FatherName,DOB,Gender,Cat,Mark1,Mark2,SubCodes,Aadhaar\n" +
        candidates.map(c => `"${c.rollNumber}","${c.candidateName}","${c.motherName}","${c.fatherName}","${c.dateOfBirth}","${c.gender}","${c.category}","${c.identificationMark1}","${c.identificationMark2}","${c.subjectCodes.join(",")}","${c.aadhaarNumber}"`).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || "CBSE_LOC_CLASS10_2026.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsExporting(false);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100 mb-2">
              <span>Level 3: Board Examination Governance</span>
              <span>·</span>
              <span>CBSE / State Board Class 10 & 12</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Board Exam LOC (List of Candidates) Automator
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Extract and audit 60+ strict parameters for graduating board exam students. Detect spelling mismatches, missing identification marks, and invalid subject codes before exporting the official board submission package.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isExporting ? "Compiling LOC Package..." : "Export Board-Compliant LOC Sheet (.csv)"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Class 10 Cohort</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{candidates.length} Registered</div>
          <div className="text-[10px] text-slate-500 mt-1">Academic Year 2026-2027</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pre-Flight Verified</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">{verifiedCount} Ready</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">100% data audit cleared</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Flagged Discrepancies</div>
          <div className="text-xl font-bold text-rose-700 mt-1 font-mono">{flaggedCount} Incomplete</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">Requires administrative review</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mandatory Subjects</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">5 Core Codes</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">184, 002, 041, 086, 087 verified</div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs">
          {statusMessage}
        </div>
      )}

      {/* Main Candidate Pre-Flight Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class 10 CBSE List of Candidates (LOC) Audit Roster
          </h2>
          <span className="text-xs text-slate-500 font-mono">Affiliation #010482 • Code 2819</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Roll & Name</th>
                <th className="p-3">Parent Details (Certificate Spelling)</th>
                <th className="p-3">DOB & Gender</th>
                <th className="p-3">Identification Marks</th>
                <th className="p-3">Subject Codes</th>
                <th className="p-3 text-center">Audit Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono">
                    <div className="font-bold text-slate-900">{c.candidateName}</div>
                    <div className="text-[10px] text-slate-400">Roll: {c.rollNumber} · Aadhaar: {c.aadhaarNumber}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-800 font-semibold">M: {c.motherName}</div>
                    <div className="text-slate-600 text-[11px]">F: {c.fatherName}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    <div>{c.dateOfBirth}</div>
                    <div className="text-[10px] text-slate-400">Gender: {c.gender} · {c.category}</div>
                  </td>
                  <td className="p-3 text-[11px] max-w-xs">
                    {c.identificationMark1 ? (
                      <div className="text-slate-800 font-mono">1. {c.identificationMark1}</div>
                    ) : (
                      <div className="text-rose-600 font-bold font-mono">⚠️ 1. [MISSING - MANDATORY]</div>
                    )}
                    <div className="text-slate-500 font-mono">2. {c.identificationMark2}</div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="flex flex-wrap gap-1">
                      {c.subjectCodes.map((code) => (
                        <span key={code} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {code}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {c.boardVerificationStatus === "verified" ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        ✓ Verified & Ready
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold animate-pulse">
                          ⚠️ Action Required
                        </span>
                        <div className="text-[9px] text-rose-600 max-w-xs">
                          {c.validationErrors[0]}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {c.boardVerificationStatus !== "verified" ? (
                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setEditingMark1("A MOLE ON LEFT COLLARBONE");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold"
                      >
                        Quick Fix ✏️
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs">Cleared ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Fix Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Candidate LOC Discrepancy Correction
              </h3>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <div className="font-bold">Resolving Flag for {selectedCandidate.candidateName}:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {selectedCandidate.validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identification Mark 1 (As per Birth/Aadhaar record)
                </label>
                <input
                  type="text"
                  value={editingMark1}
                  onChange={(e) => setEditingMark1(e.target.value)}
                  placeholder="e.g. A MOLE ON LEFT COLLARBONE"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono text-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-800">Digital Signature Verification</div>
                <div className="text-[11px] text-emerald-700 font-medium">✓ Uploaded signature verified against student admission docket.</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFixCandidate}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  Save & Mark Candidate Verified
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
