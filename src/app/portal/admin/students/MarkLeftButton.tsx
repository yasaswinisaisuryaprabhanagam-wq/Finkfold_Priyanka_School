"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { markStudentLeft } from "@/actions/markStudentLeft";

const REASONS = [
  { value: "tc_issued",          label: "TC Issued" },
  { value: "transferred",        label: "Transferred to another school" },
  { value: "family_relocation",  label: "Family relocated" },
  { value: "dropout",            label: "Dropout" },
  { value: "other",              label: "Other" },
];

export default function MarkLeftButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await markStudentLeft(fd);
    setLoading(false);
    if (res.success) {
      setDone(true);
      setOpen(false);
      setTimeout(() => location.reload(), 800);
    } else {
      setError(res.error || "Failed to update student");
    }
  }

  if (done) {
    return <span className="text-[11px] text-rose-600 font-semibold">Marked left ✓</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline"
        title="Mark student as left school"
      >
        Mark Left
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-scale-in">
            <div>
              <div className="text-base font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Mark Student as Left
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                <span className="font-semibold text-blue-900">{studentName}</span> will be removed from roll call.
                Historical attendance is preserved.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="hidden" name="studentId" value={studentId} />

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date of leaving *</label>
                <input
                  type="date"
                  name="leftOn"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reason *</label>
                <select
                  name="leftReason"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 rounded-xl p-3 border border-rose-200">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost flex-1">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {loading ? "Saving…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
