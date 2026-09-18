"use client";

import { useState, useTransition } from "react";
import { createAcademicYear, setCurrentAcademicYear, createSubject, deleteSubject } from "@/actions/academics";
import type { AcademicYear, Subject, SubjectType } from "@/types/erp";

export default function AcademicsClient({
  schoolId,
  schoolName,
  initialYears,
  initialSubjects,
}: {
  schoolId: string;
  schoolName: string;
  initialYears: AcademicYear[];
  initialSubjects: Subject[];
}) {
  const [activeTab, setActiveTab] = useState<"years" | "subjects">("years");
  const [years, setYears] = useState<AcademicYear[]>(initialYears);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Year Form state
  const [yearName, setYearName] = useState("");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2027-04-30");
  const [isCurrent, setIsCurrent] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  // New Subject Form state
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectType, setSubjectType] = useState<SubjectType>("theory");
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  function handleCreateYear(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await createAcademicYear(schoolId, yearName, startDate, endDate, isCurrent);
      if (res.success && res.data) {
        setMessage({ type: "success", text: `Academic Year "${yearName}" created successfully.` });
        if (isCurrent) {
          setYears((prev) => [
            { ...res.data, is_current: true },
            ...prev.map((y) => ({ ...y, is_current: false })),
          ]);
        } else {
          setYears((prev) => [res.data, ...prev]);
        }
        setShowYearModal(false);
        setYearName("");
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create academic year" });
      }
    });
  }

  function handleSetCurrent(yearId: string) {
    setMessage(null);
    startTransition(async () => {
      const res = await setCurrentAcademicYear(schoolId, yearId);
      if (res.success) {
        setMessage({ type: "success", text: "Active academic session updated." });
        setYears((prev) =>
          prev.map((y) => ({ ...y, is_current: y.id === yearId }))
        );
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update active session" });
      }
    });
  }

  function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await createSubject(schoolId, subjectName, subjectCode, subjectType);
      if (res.success && res.data) {
        setMessage({ type: "success", text: `Subject "${subjectName}" added.` });
        setSubjects((prev) => [...prev, res.data]);
        setShowSubjectModal(false);
        setSubjectName("");
        setSubjectCode("");
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create subject" });
      }
    });
  }

  function handleDeleteSubject(subjectId: string, name: string) {
    if (!confirm(`Are you sure you want to remove subject "${name}"?`)) return;
    setMessage(null);
    startTransition(async () => {
      const res = await deleteSubject(subjectId);
      if (res.success) {
        setMessage({ type: "success", text: `Subject "${name}" deleted.` });
        setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      } else {
        setMessage({ type: "error", text: res.error || "Failed to delete subject" });
      }
    });
  }

  const filteredSubjects = selectedSubjectType === "all"
    ? subjects
    : subjects.filter((s) => s.type === selectedSubjectType);

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Academic Governance &middot; {schoolName}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            📚 Academic Setup & Subjects Master
          </h1>
          <p className="text-white/70 text-sm">
            Configure multi-year academic terms, session dates, and syllabus subject classifications.
          </p>
        </div>
      </div>

      {/* ── Notification Feedback ── */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Tab Switcher ── */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("years")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "years"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🗓️ Academic Years ({years.length})
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "subjects"
              ? "border-blue-600 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📖 Subjects Master ({subjects.length})
        </button>
      </div>

      {/* ── TAB 1: ACADEMIC YEARS ── */}
      {activeTab === "years" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Academic Sessions
              </h2>
              <p className="text-xs text-slate-500">Manage terms and switch the active operational school year</p>
            </div>
            <button
              onClick={() => setShowYearModal(true)}
              className="btn btn-primary btn-sm"
            >
              + Add Academic Year
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {years.map((y) => (
              <div
                key={y.id}
                className={`card p-5 space-y-3 transition-all ${
                  y.is_current ? "border-2 border-emerald-500 bg-emerald-50/20" : "border border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {y.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(y.start_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} –{" "}
                      {new Date(y.end_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {y.is_current ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ACTIVE CURRENT
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Archived / Upcoming
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Created: {new Date(y.created_at).toLocaleDateString("en-IN")}
                  </div>
                  {!y.is_current && (
                    <button
                      disabled={isPending}
                      onClick={() => handleSetCurrent(y.id)}
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                    >
                      Make Active Current →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: SUBJECTS MASTER ── */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Subject Catalog
              </h2>
              <p className="text-xs text-slate-500">Catalog of curricula taught across classes and sections</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectType}
                onChange={(e) => setSelectedSubjectType(e.target.value)}
                className="form-input text-xs py-1.5 px-3 w-auto"
              >
                <option value="all">All Types ({subjects.length})</option>
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="language">Language</option>
                <option value="activity">Activity</option>
              </select>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="btn btn-primary btn-sm flex-shrink-0"
              >
                + Add Subject
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Subject Code</th>
                    <th>Classification Type</th>
                    <th>Added On</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-sm">
                        No subjects registered under this category yet. Click "+ Add Subject" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((s) => (
                      <tr key={s.id}>
                        <td className="font-bold text-slate-800">{s.name}</td>
                        <td className="font-mono text-xs font-semibold text-slate-600">
                          {s.code || "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              s.type === "theory"
                                ? "badge-blue"
                                : s.type === "practical"
                                ? "badge-green"
                                : s.type === "language"
                                ? "badge-purple"
                                : "badge-slate"
                            }`}
                          >
                            {s.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(s.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="text-right">
                          <button
                            disabled={isPending}
                            onClick={() => handleDeleteSubject(s.id, s.name)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD ACADEMIC YEAR ── */}
      {showYearModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Add Academic Year
              </h3>
              <button onClick={() => setShowYearModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="form-label">Academic Year Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2027-2028"
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Session Start</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label">Session End</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentYear"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="isCurrentYear" className="text-xs text-slate-700 font-medium">
                  Set immediately as current active school session
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary btn-sm"
                >
                  {isPending ? "Creating..." : "Save Academic Year"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD SUBJECT ── */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Add Subject Master
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="form-label">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Science, Telugu"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Subject Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MATH, SCI-10, TEL"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="form-input font-mono uppercase text-xs"
                />
              </div>
              <div>
                <label className="form-label">Classification Type</label>
                <select
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value as SubjectType)}
                  className="form-input text-xs"
                >
                  <option value="theory">Theory Subject</option>
                  <option value="practical">Practical / Lab</option>
                  <option value="language">Language</option>
                  <option value="activity">Co-Curricular / Activity</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary btn-sm"
                >
                  {isPending ? "Adding..." : "Save Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
