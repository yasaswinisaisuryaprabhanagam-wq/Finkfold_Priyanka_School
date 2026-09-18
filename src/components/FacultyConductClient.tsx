"use client";

import { useState } from "react";
import { FacultyConductAction, StudentRosterItem } from "@/types/faculty";
import { issueConductRecordAction } from "@/actions/faculty";

interface Props {
  initialEntries: FacultyConductAction[];
  students: StudentRosterItem[];
}

const MERIT_PRESETS = [
  { label: "+5 Peer Assistance", points: 5, category: "Peer Support", type: "merit" as const },
  { label: "+10 Exemplary Assignment", points: 10, category: "Academic Excellence", type: "merit" as const },
  { label: "+15 Clean Campus Ambassador", points: 15, category: "Integrity & Civic Duty", type: "merit" as const },
  { label: "+25 Star Student of Week", points: 25, category: "Leadership & Conduct", type: "merit" as const },
];

const DEMERIT_PRESETS = [
  { label: "-5 Late to Class / Assembly", points: -5, category: "Punctuality Warning", type: "demerit" as const },
  { label: "-10 Classroom Disruption", points: -10, category: "Classroom Etiquette", type: "demerit" as const },
  { label: "-15 Incomplete Uniform Code", points: -15, category: "Uniform & Grooming", type: "demerit" as const },
  { label: "-20 Academic Misconduct / Truancy", points: -20, category: "Major Infraction", type: "demerit" as const, requiresSign: true },
];

export default function FacultyConductClient({ initialEntries, students }: Props) {
  const [entries, setEntries] = useState<FacultyConductAction[]>(initialEntries);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [pointsType, setPointsType] = useState<"merit" | "demerit">("merit");
  const [category, setCategory] = useState("Peer Support");
  const [points, setPoints] = useState(5);
  const [reason, setReason] = useState("");
  const [requireSignature, setRequireSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a brief reason or context note.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await issueConductRecordAction({
        studentId: selectedStudentId,
        type: pointsType,
        category,
        points: pointsType === "merit" ? Math.abs(points) : -Math.abs(points),
        reason: reason.trim(),
        requireParentSignature: requireSignature,
      });

      if (res.success && res.entry) {
        setEntries((prev) => [res.entry, ...prev]);
        setFeedback({ text: res.message });
        setReason("");
        setRequireSignature(false);
      }
    } catch {
      setFeedback({ text: "Failed to record conduct entry.", isError: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Workspace &middot; Behavioral Governance
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🛡️ Conduct Ledger &amp; The &ldquo;Merit Economy&rdquo;
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Award positive conduct points in 1 click or log disciplinary infractions with an automated Parent E-Signature lock.
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Award Form */}
        <div className="lg:col-span-6 card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Issue Conduct Entry &middot; Class 10-A
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a student and choose a preset or customize points and parent e-signature requirements.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-4">
            {/* Student Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Student *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="input text-xs w-full font-semibold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    Roll #{s.rollNo} — {s.fullName} ({s.admissionNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Action Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPointsType("merit");
                    setPoints(5);
                    setCategory("Peer Support");
                    setRequireSignature(false);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pointsType === "merit"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>⭐ Award Merit (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPointsType("demerit");
                    setPoints(-10);
                    setCategory("Classroom Etiquette");
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pointsType === "demerit"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>⚠️ Issue Demerit (-)</span>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Quick 1-Click Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {(pointsType === "merit" ? MERIT_PRESETS : DEMERIT_PRESETS).map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setCategory(p.category);
                      setPoints(p.points);
                      if ("requiresSign" in p && p.requiresSign) {
                        setRequireSignature(true);
                      }
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Points & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Points Value</label>
                <input
                  type="number"
                  required
                  value={Math.abs(points)}
                  onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                  className="input text-xs w-full font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input text-xs w-full font-medium"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Teacher&apos;s Context &amp; Incident Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what occurred (e.g. Voluntarily stayed back to organize laboratory glassware / Repeatedly spoke out of turn during lecture)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input text-xs w-full resize-none"
              />
            </div>

            {/* E-Signature Lock Trigger Checkbox */}
            {pointsType === "demerit" && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireSignature}
                    onChange={(e) => setRequireSignature(e.target.checked)}
                    className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    🔒 Mandatory Parent E-Signature Lock
                  </span>
                </label>
                <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                  Checking this locks the student&apos;s portal until the parent logs in and digitally acknowledges this incident, replacing physical paper diary signatures.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`btn w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                pointsType === "merit" ? "btn-primary" : "bg-rose-600 hover:bg-rose-700 text-white"
              }`}
            >
              {submitting ? "Publishing to Student Portal..." : `✓ Submit Conduct Record to ${selectedStudent?.fullName}`}
            </button>
          </form>
        </div>

        {/* Conduct Ledger Feed */}
        <div className="lg:col-span-6 card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Recent Conduct Log &middot; Class 10-A
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {entries.length} recent actions logged by faculty
              </p>
            </div>
            <span className="badge badge-blue">Live Sync</span>
          </div>

          <div className="card-body space-y-3">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No conduct records logged today.</div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    entry.type === "merit"
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-rose-50/40 border-rose-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{entry.studentName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          entry.type === "merit"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {entry.points > 0 ? `+${entry.points}` : entry.points} Points
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">({entry.category})</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{entry.reason}</p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span>Logged: {entry.issuedAt}</span>
                      {entry.requireParentSignature && (
                        <span className={`badge ${entry.parentSigned ? "badge-green" : "badge-amber"}`}>
                          {entry.parentSigned ? "✓ Parent Digitally Signed" : "⏳ Awaiting Parent E-Sign"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
