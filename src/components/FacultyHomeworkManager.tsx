"use client";

import { useState } from "react";
import { addHomeworkAction, deleteHomeworkAction, saveHomeworkVerificationsAction } from "@/actions/homework";
import { HomeworkItem, HomeworkVerification } from "@/lib/homeworkStore";

const QUICK_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Telugu",
  "Social",
  "Hindi",
  "Computer",
  "General",
];

const QUICK_DUE_PRESETS = [
  { label: "Tomorrow Morning", days: 1 },
  { label: "In 2 Days", days: 2 },
  { label: "In 3 Days", days: 3 },
  { label: "In 1 Week", days: 7 },
];

function getDateAfterDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface StudentItem {
  id: string;
  full_name: string;
  roll_no: number;
  class_id: string;
}

export default function FacultyHomeworkManager({
  classes,
  initialHomework,
  teacherName,
  students = [],
}: {
  classes: { id: string; name: string; section: string; subject?: string }[];
  initialHomework: HomeworkItem[];
  teacherName: string;
  students?: StudentItem[];
}) {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || ""
  );
  const [subject, setSubject] = useState<string>(
    classes[0]?.subject || "Mathematics"
  );
  const [customSubject, setCustomSubject] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(getDateAfterDays(1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(initialHomework);

  // Aisle Walkthrough Verification State
  const [activeWalkthroughHw, setActiveWalkthroughHw] = useState<HomeworkItem | null>(null);
  const [verificationMap, setVerificationMap] = useState<Record<string, Record<string, { status: "verified" | "incomplete" | "missing"; notes?: string }>>>({
    "hw-seed-001": {
      "s2": { status: "verified", notes: "Full steps shown in 200-page notebook." },
      "s1": { status: "verified", notes: "Completed neatly." },
      "s3": { status: "verified", notes: "Completed." },
      "s4": { status: "verified", notes: "Completed." },
      "s5": { status: "incomplete", notes: "Exercise 4.3 Q8 pending." },
      "s6": { status: "verified", notes: "Completed." },
    },
    "hw-seed-002": {
      "s2": { status: "verified", notes: "2 pages of neat notes." },
      "s1": { status: "verified", notes: "Neat diagram." },
      "s3": { status: "verified", notes: "Completed." },
      "s4": { status: "verified", notes: "Completed." },
      "s5": { status: "verified", notes: "Completed." },
      "s6": { status: "verified", notes: "Completed." },
    },
    "hw-seed-004": {
      "s2": { status: "incomplete", notes: "State boundary coloring pending." },
    },
  });

  const [savingWalkthrough, setSavingWalkthrough] = useState(false);
  const [walkthroughSuccess, setWalkthroughSuccess] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const filteredHomework = homeworkList.filter(
    (h) => h.class_id === selectedClassId
  );

  const currentClassStudents = students.filter(
    (s) => s.class_id === selectedClassId || students.length <= 6
  );

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    const finalSubject = customSubject.trim() || subject;
    if (!task.trim()) {
      setMessage({ text: "Please enter the homework task details.", isError: true });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await addHomeworkAction({
        classId: selectedClassId,
        subject: finalSubject,
        task: task.trim(),
        dueDate,
      });

      if (res.success && res.homework) {
        setMessage({ text: "Homework published successfully before 4:30 PM SLA! Students will see this tonight at 6:00 PM to pack their bags." });
        setHomeworkList((prev) => [res.homework!, ...prev]);
        setTask("");
        setCustomSubject("");
      } else {
        setMessage({ text: res.message || "Failed to publish homework.", isError: true });
      }
    } catch (err: any) {
      setMessage({ text: err?.message || "An unexpected error occurred.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this homework assignment?")) return;
    try {
      const res = await deleteHomeworkAction(id);
      if (res.success) {
        setHomeworkList((prev) => prev.filter((h) => h.id !== id));
      } else {
        alert(res.message);
      }
    } catch {
      alert("Failed to delete homework.");
    }
  }

  function handleSetStudentStatus(hwId: string, studentId: string, status: "verified" | "incomplete" | "missing") {
    setVerificationMap((prev) => ({
      ...prev,
      [hwId]: {
        ...(prev[hwId] || {}),
        [studentId]: {
          status,
          notes: prev[hwId]?.[studentId]?.notes || (status === "verified" ? "Checked & verified in class" : status === "incomplete" ? "Needs completion" : "Notebook not brought to class"),
        },
      },
    }));
  }

  function handleMarkAll(hwId: string, status: "verified" | "incomplete" | "missing") {
    const updated: Record<string, { status: "verified" | "incomplete" | "missing"; notes?: string }> = {};
    currentClassStudents.forEach((s) => {
      updated[s.id] = {
        status,
        notes: status === "verified" ? "Checked & verified in class" : "Pending",
      };
    });
    setVerificationMap((prev) => ({
      ...prev,
      [hwId]: updated,
    }));
  }

  async function handleSaveWalkthrough() {
    if (!activeWalkthroughHw) return;
    setSavingWalkthrough(true);
    setWalkthroughSuccess(null);

    const hwVerifs = verificationMap[activeWalkthroughHw.id] || {};
    const recordsToSave: HomeworkVerification[] = currentClassStudents.map((s) => {
      const v = hwVerifs[s.id] || { status: "verified" as const, notes: "Checked & verified in class" };
      return {
        id: `hv-${activeWalkthroughHw.id}-${s.id}`,
        homework_id: activeWalkthroughHw.id,
        student_id: s.id,
        student_name: s.full_name,
        roll_no: s.roll_no,
        status: v.status,
        verified_by: teacherName,
        verified_at: new Date().toISOString(),
        notes: v.notes,
      };
    });

    try {
      await saveHomeworkVerificationsAction(activeWalkthroughHw.id, recordsToSave);
      setWalkthroughSuccess(
        `✓ All ${recordsToSave.length} notebook checks successfully recorded! Kiran Kumar and all classmates now have their chips updated to 'Checked & Completed' on their Student Portal, with WhatsApp notifications dispatched to parents.`
      );
      setTimeout(() => {
        setWalkthroughSuccess(null);
        setActiveWalkthroughHw(null);
      }, 3000);
    } catch {
      alert("Failed to sync verification records.");
    } finally {
      setSavingWalkthrough(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* SLA & Coordination Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg flex-shrink-0">
            ⏰
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
              <span>Rule 1 &amp; Rule 2 Coordination Protocol</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                4:30 PM SLA
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 mt-0.5">
              Students do not bring mobiles to school. Homework must be assigned before <strong>4:30 PM</strong> today so students review it at home tonight (06:00 PM – 09:00 PM) to complete work in their physical notebooks. Next morning, perform the <strong>Aisle Walkthrough</strong> to verify their physical notebooks.
            </p>
          </div>
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {classes.map((c) => {
          const isSelected = c.id === selectedClassId;
          const count = homeworkList.filter((h) => h.class_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedClassId(c.id);
                if (c.subject && c.subject !== "General") setSubject(c.subject);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Class {c.name}-{c.section}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count} tasks
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Homework Creator Form */}
        <div className="lg:col-span-5 card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Assign Physical Notebook Task &middot; Class {selectedClass?.name}-{selectedClass?.section}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pushed to student evening portal for packing &amp; home completion.
            </p>
          </div>

          <form onSubmit={handlePublish} className="card-body space-y-4">
            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  message.isError
                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                <span>{message.text}</span>
                <button
                  type="button"
                  onClick={() => setMessage(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSubject(s);
                      setCustomSubject("");
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      subject === s && !customSubject
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or enter custom subject..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="input text-xs w-full"
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Task Instructions &amp; Physical Notebook Specified *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Solve Quadratic Equations – Exercise 4.3 (Q1 to Q10) in 200-page ruled notebook. Bring to class tomorrow morning."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="input text-xs w-full resize-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Due Date *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_DUE_PRESETS.map((p) => {
                  const targetDate = getDateAfterDays(p.days);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setDueDate(targetDate)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        dueDate === targetDate
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input text-xs w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> Publishing...
                </>
              ) : (
                <>
                  <span>📝 Publish Homework Before 4:30 PM SLA</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Homework List with Walkthrough Verification Action */}
        <div className="lg:col-span-7 card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Active Assignments &middot; Class {selectedClass?.name}-{selectedClass?.section}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect physical notebooks in class and tap verification to update student portals.
              </p>
            </div>
            <span className="badge badge-blue">Class {selectedClass?.name}-{selectedClass?.section}</span>
          </div>

          <div className="card-body">
            {filteredHomework.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-xs font-bold text-slate-700">No Homework Posted</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use the form on the left to assign homework for Class {selectedClass?.name}-{selectedClass?.section}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHomework.map((hw) => {
                  const isPast = new Date(hw.due_date) < new Date(new Date().toISOString().slice(0, 10));
                  const hwVerifs = verificationMap[hw.id] || {};
                  const verifiedStudents = Object.values(hwVerifs).filter((v) => v.status === "verified").length;
                  const totalRoster = currentClassStudents.length || 25;

                  return (
                    <div
                      key={hw.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs font-bold text-blue-900 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                              {hw.subject}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                isPast
                                  ? "bg-slate-100 border-slate-200 text-slate-500"
                                  : "bg-amber-50 border-amber-200 text-amber-800"
                              }`}
                            >
                              Due: {new Date(hw.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ {verifiedStudents} / {totalRoster} Notebooks Verified
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed font-semibold mt-1">
                            {hw.task}
                          </p>

                          <div className="text-[10px] text-slate-400 mt-2">
                            Assigned: {new Date(hw.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} &bull; Teacher: {teacherName}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(hw.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0 cursor-pointer"
                          title="Delete assignment"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Prominent In-Class Walkthrough Button */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>🚶 Morning Aisle Check:</span>
                          <span className="font-semibold text-slate-700">Walk classroom &amp; verify physical books</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveWalkthroughHw(hw)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                          <span>📋</span>
                          <span>Verify Notebooks (Aisle Walk)</span>
                          <span className="bg-white/20 px-1.5 py-0.2 text-[10px] rounded-full">
                            {verifiedStudents}/{totalRoster}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aisle Walkthrough Modal / Drawer */}
      {activeWalkthroughHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-1">
                  Rule 2 &bull; Morning In-Class Notebook Verification
                </div>
                <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Aisle Walkthrough &bull; {activeWalkthroughHw.subject} (Class {selectedClass?.name}-{selectedClass?.section})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-lg truncate">
                  Task: {activeWalkthroughHw.task}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveWalkthroughHw(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions & Guidance */}
            <div className="px-5 py-3 bg-blue-50/60 border-b border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-[11px] text-blue-900 font-medium">
                Tap each student who presented their physical notebook.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll(activeWalkthroughHw.id, "verified")}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-2xs"
                >
                  ✓ Mark All Verified
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(activeWalkthroughHw.id, "incomplete")}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>

            {/* Student Roster Verification Checklist */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {walkthroughSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in">
                  {walkthroughSuccess}
                </div>
              )}

              {currentClassStudents.map((stu) => {
                const cur = verificationMap[activeWalkthroughHw.id]?.[stu.id] || {
                  status: "verified" as const,
                };

                return (
                  <div
                    key={stu.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {stu.roll_no || "•"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{stu.full_name}</span>
                          {stu.full_name.includes("Kiran") && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-sm font-semibold">
                              Demo Student
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">Roll No: {stu.roll_no || "N/A"}</div>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSetStudentStatus(activeWalkthroughHw.id, stu.id, "verified")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          cur.status === "verified"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50"
                        }`}
                      >
                        ✓ Verified
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStudentStatus(activeWalkthroughHw.id, stu.id, "incomplete")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          cur.status === "incomplete"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-amber-50"
                        }`}
                      >
                        ~ Incomplete
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStudentStatus(activeWalkthroughHw.id, stu.id, "missing")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          cur.status === "missing"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-rose-50"
                        }`}
                      >
                        ✗ Missing / No Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Instant sync: Updates Student Portal badge and dispatches parent WhatsApp alert.
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveWalkthroughHw(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingWalkthrough}
                  onClick={handleSaveWalkthrough}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {savingWalkthrough ? (
                    <>
                      <span className="animate-spin">⏳</span> Saving &amp; Syncing...
                    </>
                  ) : (
                    <>
                      <span>⚡ Save &amp; Push to Student Portal &amp; WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
