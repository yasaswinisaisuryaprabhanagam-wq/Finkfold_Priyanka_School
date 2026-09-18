"use client";

import { useState } from "react";
import {
  StudentScoreEntry,
  SyllabusLessonUnit,
} from "@/types/faculty";
import {
  saveClassMarksAction,
  bulkUploadOmrScoresAction,
  pushRemedialWorksheetAction,
  updateSyllabusProgressAction,
} from "@/actions/faculty";

interface Props {
  initialMarks: StudentScoreEntry[];
  initialSyllabus: SyllabusLessonUnit[];
  examName: string;
  subject: string;
  classAverage: number;
}

export default function FacultyAcademicsClient({
  initialMarks,
  initialSyllabus,
  examName,
  subject,
  classAverage: initialClassAvg,
}: Props) {
  const [activeTab, setActiveTab] = useState<"marks" | "radar" | "syllabus">("marks");
  const [marks, setMarks] = useState<StudentScoreEntry[]>(initialMarks);
  const [syllabus, setSyllabus] = useState<SyllabusLessonUnit[]>(initialSyllabus);
  const [csvText, setCsvText] = useState("");
  const [showOmrModal, setShowOmrModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const bottom15Students = marks.filter((m) => m.isFlaggedRemedial);

  function handleScoreChange(studentId: string, newMarks: number) {
    setMarks((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        const validMarks = Math.min(100, Math.max(0, newMarks || 0));
        let grade = "C2";
        if (validMarks >= 90) grade = "A1";
        else if (validMarks >= 80) grade = "A2";
        else if (validMarks >= 70) grade = "B1";
        else if (validMarks >= 60) grade = "B2";
        else if (validMarks >= 50) grade = "C1";

        return {
          ...s,
          marksObtained: validMarks,
          grade,
          isFlaggedRemedial: validMarks < 60,
        };
      })
    );
  }

  async function handleSaveMarks() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await saveClassMarksAction(marks);
      if (res.success) {
        setFeedback({ text: "Marks successfully published! Predictive remedial radar updated." });
      }
    } catch {
      setFeedback({ text: "Failed to save marks.", isError: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleOmrUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!csvText.trim()) {
      alert("Please paste or provide CSV scores.");
      return;
    }
    setSaving(true);
    try {
      const res = await bulkUploadOmrScoresAction(csvText);
      if (res.success && res.scores) {
        setMarks(res.scores);
        setShowOmrModal(false);
        setFeedback({ text: res.message });
      }
    } catch {
      alert("Failed to process OMR CSV.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePushWorksheet(student: StudentScoreEntry) {
    setPushingId(student.studentId);
    try {
      const topic = student.topicDeficits[0] || "Targeted Diagnostic Practice";
      const res = await pushRemedialWorksheetAction({
        studentId: student.studentId,
        studentName: student.studentName,
        topicName: topic,
      });
      if (res.success) {
        setFeedback({ text: res.message });
      }
    } catch {
      alert("Failed to push worksheet.");
    } finally {
      setPushingId(null);
    }
  }

  async function handleToggleSubtopic(unitId: string, subtopicId: string, currentlyCompleted: boolean) {
    try {
      const res = await updateSyllabusProgressAction({
        unitId,
        subtopicId,
        completed: !currentlyCompleted,
      });
      if (res.success && res.syllabus) {
        setSyllabus(res.syllabus);
        setFeedback({ text: res.message });
      }
    } catch {
      alert("Failed to update syllabus.");
    }
  }

  // Calculate syllabus stats
  const totalSubtopics = syllabus.reduce((acc, u) => acc + u.totalSubtopics, 0);
  const completedSubtopics = syllabus.reduce((acc, u) => acc + u.completedSubtopics, 0);
  const syllabusPercent = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Workspace &middot; Academics Engine
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            📈 Marks Entry, OMR Upload &amp; Predictive Remedial Radar
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Grade exams in seconds with OMR scanning, track lesson milestones, and auto-dispatch AI practice drills to students needing intervention.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-blue-900">{marks.length}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Students Enrolled</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-emerald-600">
            {Math.round(marks.reduce((acc, m) => acc + m.marksObtained, 0) / (marks.length || 1))}%
          </div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Class Average</div>
        </div>
        <div className="stat-card text-center">
          <div className={`text-2xl font-black ${bottom15Students.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {bottom15Students.length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Flagged for Remedial</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-blue-800">{syllabusPercent}%</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Syllabus Covered</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("marks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "marks"
              ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>📝 Marks Entry &amp; OMR</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{marks.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("radar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "radar"
              ? "bg-rose-700 text-white shadow-md shadow-rose-700/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🎯 Predictive Remedial Radar</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-rose-500 text-white rounded-full">
            {bottom15Students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("syllabus")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "syllabus"
              ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>📖 Syllabus &amp; Lesson Tracker</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{syllabusPercent}%</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* ── TAB 1: MARKS ENTRY & BULK OMR ── */}
      {activeTab === "marks" && (
        <div className="card">
          <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Class 10-A Marks Ledger &middot; {examName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Subject: {subject} &middot; Edit marks directly or click Bulk OMR to upload an optical scan CSV.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOmrModal(true)}
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span> Bulk OMR Upload
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={saving}
                className="btn btn-primary text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? "Saving..." : "✓ Save Marks Ledger"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-16 text-center">Roll #</th>
                  <th>Student Name</th>
                  <th className="w-32">Marks (out of 100)</th>
                  <th className="w-20 text-center">Grade</th>
                  <th className="w-28 text-center">AI Status</th>
                  <th>Diagnostic Topic Deficit</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((s) => (
                  <tr key={s.studentId} className={s.isFlaggedRemedial ? "bg-rose-50/30" : ""}>
                    <td className="font-bold text-center text-slate-700">#{s.rollNo}</td>
                    <td className="font-semibold text-slate-900">{s.studentName}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.marksObtained}
                        onChange={(e) => handleScoreChange(s.studentId, parseFloat(e.target.value))}
                        className="input text-xs w-24 py-1 font-bold text-center"
                      />
                    </td>
                    <td className="text-center">
                      <span className={`badge ${s.grade.startsWith("A") ? "badge-green" : s.grade.startsWith("B") ? "badge-blue" : "badge-amber"}`}>
                        {s.grade}
                      </span>
                    </td>
                    <td className="text-center">
                      {s.isFlaggedRemedial ? (
                        <span className="badge badge-rose text-[10px] font-bold">⚠️ Remedial</span>
                      ) : (
                        <span className="badge badge-green text-[10px]">On Track</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">
                      {s.topicDeficits.length > 0 ? (
                        <span className="text-rose-700 font-medium">{s.topicDeficits.join(", ")}</span>
                      ) : (
                        <span className="text-slate-400">Mastery verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: PREDICTIVE REMEDIAL RADAR (TEACHER VIEW) ── */}
      {activeTab === "radar" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-sm font-bold text-rose-950">
                  Predictive Remedial Intervention Roster (Bottom 15%)
                </h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  The AI has analyzed student exam patterns and flagged these students. Click &ldquo;Push AI Remedial Drill&rdquo; to send customized 15-question worksheets straight to their student portals.
                </p>
              </div>
            </div>
            <span className="badge badge-rose text-xs font-bold px-3 py-1">
              {bottom15Students.length} Students Need Support
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bottom15Students.map((s) => (
              <div key={s.studentId} className="card p-5 border-l-4 border-rose-500 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                        Roll #{s.rollNo}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{s.studentName}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-rose-600">{s.marksObtained}/100</div>
                      <span className="badge badge-amber text-[10px]">Grade {s.grade}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Targeted Skill Gaps Identified:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.topicDeficits.map((t) => (
                        <span key={t} className="text-xs px-2.5 py-0.5 rounded-md bg-rose-100/70 text-rose-900 font-semibold border border-rose-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePushWorksheet(s)}
                  disabled={pushingId === s.studentId}
                  className="btn btn-primary text-xs font-bold py-2 w-full flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {pushingId === s.studentId ? (
                    <>⏳ Generating &amp; Dispatching...</>
                  ) : (
                    <>⚡ Push 15-Q AI Remedial Drill to Student Portal</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SYLLABUS & LESSON TRACKER ── */}
      {activeTab === "syllabus" && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Academic Year Progress</h3>
                <p className="text-xs text-slate-500">
                  {completedSubtopics} of {totalSubtopics} topics completed across all units
                </p>
              </div>
              <span className="text-lg font-black text-blue-900">{syllabusPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${syllabusPercent}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            {syllabus.map((u) => (
              <div key={u.id} className="card p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      Unit {u.unitNo}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{u.unitTitle}</h4>
                  </div>
                  <span className={`badge ${u.status === "completed" ? "badge-green" : "badge-amber"}`}>
                    {u.completedSubtopics}/{u.totalSubtopics} Subtopics
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {u.subtopics.map((sub) => {
                    const isDone = Boolean(sub.completedAt);
                    return (
                      <div
                        key={sub.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isDone ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-slate-200"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleToggleSubtopic(u.id, sub.id, isDone)}
                            className="h-4 w-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${isDone ? "text-slate-800 line-through text-slate-400" : "text-slate-800"}`}>
                            {sub.title}
                          </span>
                        </label>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          {isDone ? (
                            <span className="text-emerald-700 font-bold">Completed on {sub.completedAt}</span>
                          ) : (
                            <span>{sub.hoursSpent} hrs planned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BULK OMR UPLOAD MODAL ── */}
      {showOmrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bulk OMR CSV Scanner Import</h3>
                  <p className="text-xs text-slate-500">Paste your exported scanner sheet data below</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOmrModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOmrUpload} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                Format: <code>RollNo,Marks</code> (e.g. <code>1,88</code>). One student per line.
              </div>

              <textarea
                rows={8}
                required
                placeholder={`1, 88\n2, 92\n3, 52\n4, 78\n5, 46`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="input text-xs w-full font-mono resize-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOmrModal(false)}
                  className="btn btn-secondary text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary text-xs font-bold px-5 py-2 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? "Processing CSV..." : "Process OMR Marks →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
