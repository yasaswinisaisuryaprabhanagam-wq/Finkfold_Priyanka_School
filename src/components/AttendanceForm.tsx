"use client";

import { useState, useMemo } from "react";
import { submitAttendance } from "@/actions/submitAttendance";

type Student = {
  id: string;
  full_name: string;
  roll_no: number;
  parent_phone: string | null;
  consent_whatsapp: boolean;
};

export default function AttendanceForm({
  classId,
  schoolId,
  date,
  initialStudents,
  userId,
  initialRecords = {},
}: {
  classId: string;
  schoolId: string;
  date: string;
  initialStudents: Student[];
  userId: string;
  initialRecords?: Record<
    string,
    { status: "present" | "absent"; reason?: string | null; parent_acknowledged?: boolean | null }
  >;
}) {
  const hasInitialSubmission = useMemo(
    () => Object.keys(initialRecords).length > 0,
    [initialRecords]
  );

  const [students, setStudents] = useState<
    {
      id: string;
      full_name: string;
      roll_no: number;
      parent_phone: string | null;
      consent_whatsapp: boolean;
      status: "present" | "absent";
      reason?: string | null;
      parent_acknowledged?: boolean | null;
    }[]
  >(
    initialStudents.map((s) => {
      const rec = initialRecords[s.id];
      return {
        id: s.id,
        full_name: s.full_name,
        roll_no: s.roll_no,
        parent_phone: s.parent_phone,
        consent_whatsapp: s.consent_whatsapp,
        status: rec ? rec.status : "present",
        reason: rec?.reason || null,
        parent_acknowledged: rec?.parent_acknowledged || false,
      };
    })
  );

  const [savedSnapshot, setSavedSnapshot] = useState(students);
  const [isCompleted, setIsCompleted] = useState(hasInitialSubmission);
  const [isEditing, setIsEditing] = useState(!hasInitialSubmission);

  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    absentCount?: number;
    alertsDispatched?: number;
  } | null>(null);

  function toggleStatus(id: string) {
    if (!isEditing) {
      // If teacher clicks while in completed view, automatically enter edit mode
      setIsEditing(true);
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s
      )
    );
  }

  function markAll(status: "present" | "absent") {
    if (!isEditing) setIsEditing(true);
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  }

  function cancelEdit() {
    setStudents(savedSnapshot);
    setIsEditing(false);
    setResult(null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);

    const payload = {
      classId,
      schoolId,
      date,
      userId,
      records: students.map((s) => ({
        studentId: s.id,
        status: s.status,
      })),
    };

    const res = await submitAttendance(payload);

    setSubmitting(false);
    setResult(res);

    if (res.success) {
      setIsCompleted(true);
      setIsEditing(false);
      setSavedSnapshot(students);
    }
  }

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.length - presentCount;
  const attendanceRate =
    students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Track which students have been modified during edit
  const modifiedMap = useMemo(() => {
    const map = new Map<string, { original: "present" | "absent"; current: "present" | "absent" }>();
    if (!isCompleted) return map;
    for (const s of students) {
      const original = savedSnapshot.find((orig) => orig.id === s.id);
      if (original && original.status !== s.status) {
        map.set(s.id, { original: original.status, current: s.status });
      }
    }
    return map;
  }, [students, savedSnapshot, isCompleted]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(query) ||
        s.roll_no.toString().includes(query)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">

      {/* ── STATUS BANNER: COMPLETED VS EDIT MODE ── */}
      {isCompleted && !isEditing ? (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs flex-shrink-0 font-bold">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-emerald-950">
                  Attendance Completed for Today
                </h2>
                <span className="badge badge-green">✓ Saved in Database</span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Roll call recorded for this class ({presentCount} Present &middot; {absentCount} Absent). You do not need to submit again.
              </p>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  <strong>Student came late with parent permission?</strong> Click &ldquo;Edit Attendance&rdquo; to change them to Present.
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setResult(null);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-xs font-bold text-emerald-900 shadow-2xs transition-all flex-shrink-0 self-start sm:self-center"
          >
            <span>✏️ Edit Attendance / Late Arrival</span>
          </button>
        </div>
      ) : isCompleted && isEditing ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="text-2xl flex-shrink-0">✏️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">
                  Edit Mode Active
                </h3>
                <span className="badge badge-amber">Editing Mode</span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                You can now update student statuses (e.g. change a latecomer who brought parent permission from Absent to Present). Click <strong>Save Changes</strong> when finished.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              {submitting ? "Saving Changes..." : "✓ Save Changes"}
            </button>
          </div>
        </div>
      ) : null}

      {/* ── ATTENDANCE STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Students
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{students.length}</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Present
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{presentCount}</p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            Absent
          </p>
          <p className="mt-1 text-2xl font-bold text-rose-800">{absentCount}</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Attendance Rate
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-blue-900">{attendanceRate}%</p>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── ACTION CONTROLS & SEARCH FILTER ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Quick Bulk Actions (enabled in edit mode or initial session) */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => markAll("present")}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  ✓ Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("absent")}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
                >
                  ✕ Mark All Absent
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <span>✏️ Unlock to Edit</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-sm focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
            <span className="absolute left-3 top-2 text-slate-400 text-sm">🔍</span>
          </div>
        </div>

        {/* ── STUDENT ROSTER LIST ── */}
        <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No students match your search query.
            </div>
          ) : (
            filteredStudents.map((s) => {
              const isPresent = s.status === "present";
              const modified = modifiedMap.get(s.id);
              return (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 px-3 rounded-xl transition-colors ${
                    modified
                      ? "bg-amber-50/70 border border-amber-200 my-1"
                      : !isPresent
                      ? "bg-rose-50/40"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5 mb-2 sm:mb-0">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      #{s.roll_no}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {s.full_name}
                        </span>
                        {modified && (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                            ✏️ Changed to {modified.current.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {!isPresent ? (
                          s.parent_acknowledged ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-md shadow-2xs">
                              <span>✓</span> Acknowledged by Parent: <strong className="text-emerald-950">{s.reason || "Sick Leave"}</strong>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <span>⏳</span> Absence alert dispatched &middot; Awaiting WhatsApp reply
                            </span>
                          )
                        ) : s.consent_whatsapp && s.parent_phone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <span>💬</span> WhatsApp Alert Active ({s.parent_phone})
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            No WhatsApp consent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Action / Indicator */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(s.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                          isPresent
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-rose-600 text-white hover:bg-rose-700"
                        }`}
                        title="Click to toggle status"
                      >
                        {isPresent ? (
                          <>
                            <span>✓</span> Present
                          </>
                        ) : (
                          <>
                            <span>✕</span> Absent
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleStatus(s.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isPresent
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                        title="Click to edit"
                      >
                        {isPresent ? (
                          <>
                            <span>✓</span> Present
                          </>
                        ) : (
                          <>
                            <span>✕</span> Absent
                          </>
                        )}
                        <span className="text-[10px] text-slate-400 ml-1">✏️</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── SUBMISSION / UPDATE CONTROLS ── */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isCompleted ? (
              <span className="text-emerald-700 font-medium">
                ✓ Attendance is saved in the school registry. Edits update the existing session without creating duplicate data.
              </span>
            ) : (
              <span>
                * Absent students with WhatsApp consent will automatically trigger an alert to parents.
              </span>
            )}
          </div>

          {isCompleted && !isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setResult(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 shadow-2xs transition-colors"
            >
              <span>✏️ Edit Attendance Records</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isCompleted && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || students.length === 0}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 transition-all active:scale-98 ${
                  isCompleted
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {isCompleted ? "Updating Attendance..." : "Saving Attendance..."}
                  </>
                ) : (
                  <>
                    <span>
                      {isCompleted ? "✓ Save Attendance Changes" : "Save Attendance Session"}
                    </span>
                    <span className="text-white/70">→</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── RESULT NOTIFICATION FEEDBACK ── */}
        {result && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm border ${
              result.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <span>{result.success ? "✅" : "⚠️"}</span>
              <span>{result.message}</span>
            </div>
            {result.success && result.absentCount !== undefined && (
              <p className="mt-1 text-xs text-slate-700">
                Marked {result.absentCount} student(s) absent.{" "}
                {result.absentCount > 0 ? (
                  result.alertsDispatched !== undefined && result.alertsDispatched > 0 ? (
                    <span className="font-semibold text-emerald-800">
                      ⚡ Successfully dispatched {result.alertsDispatched} WhatsApp alert(s) to parent(s).
                    </span>
                  ) : (
                    <span className="text-amber-800 font-medium">
                      (Absence recorded in database. WhatsApp webhook pending/retrying.)
                    </span>
                  )
                ) : (
                  <span className="text-emerald-700 font-medium">
                    All students marked present.
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}