"use client";

import { useState } from "react";
import { addHomeworkAction, deleteHomeworkAction } from "@/actions/homework";
import { HomeworkItem } from "@/lib/homeworkStore";

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
  { label: "Tomorrow", days: 1 },
  { label: "In 2 Days", days: 2 },
  { label: "In 3 Days", days: 3 },
  { label: "In 1 Week", days: 7 },
];

function getDateAfterDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function FacultyHomeworkManager({
  classes,
  initialHomework,
  teacherName,
}: {
  classes: { id: string; name: string; section: string; subject?: string }[];
  initialHomework: HomeworkItem[];
  teacherName: string;
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

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const filteredHomework = homeworkList.filter(
    (h) => h.class_id === selectedClassId
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
        setMessage({ text: "Homework published successfully! Students can now see it in their portal." });
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

  return (
    <div className="space-y-6">
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
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Homework Creator Form */}
        <div className="lg:col-span-6 card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Assign Homework &middot; Class {selectedClass?.name}-{selectedClass?.section}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assignments will immediately appear in the student & parent portal.
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
                Task Description & Instructions *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Solve Quadratic Equations – Exercise 4.3 (Q1 to Q10). Bring notebook tomorrow."
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
              className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> Publishing...
                </>
              ) : (
                <>
                  <span>📝 Publish Homework</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Homework List for this Class */}
        <div className="lg:col-span-6 card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Active Assignments &middot; Class {selectedClass?.name}-{selectedClass?.section}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredHomework.length} assignment{filteredHomework.length === 1 ? "" : "s"} currently posted
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
              <div className="space-y-3">
                {filteredHomework.map((hw) => {
                  const isPast = new Date(hw.due_date) < new Date(new Date().toISOString().slice(0, 10));
                  return (
                    <div
                      key={hw.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md">
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
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
                          {hw.task}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-2">
                          Posted: {new Date(hw.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
