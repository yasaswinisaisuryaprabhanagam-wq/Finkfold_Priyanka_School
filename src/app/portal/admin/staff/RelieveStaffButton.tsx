"use client";

import { useState } from "react";
import { relieveStaff } from "@/actions/relieveStaff";

type Teacher = { id: string; full_name: string };

export default function RelieveStaffButton({
  teacherId,
  teacherName,
  otherTeachers,
}: {
  teacherId: string;
  teacherName: string;
  otherTeachers: Teacher[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await relieveStaff(fd);
    setLoading(false);
    if (res.success) { setDone(true); setTimeout(() => location.reload(), 1500); }
    else setError(res.error || "Something went wrong");
  }

  if (done) return <span className="text-xs text-emerald-600 font-semibold">✓ Relieved</span>;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-rose-600 hover:underline"
      >
        Relieve
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl">
                ⚠️
              </div>
              <div>
                <div className="font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Relieve Staff — {teacherName}
                </div>
                <div className="text-xs text-slate-500">This cannot be undone. Historical records are preserved.</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="teacherId" value={teacherId} />

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date of leaving *</label>
                <input
                  type="date"
                  name="relievedOn"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              {otherTeachers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Transfer classes to (optional)
                  </label>
                  <select name="replacementTeacherId" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                    <option value="">— No transfer —</option>
                    {otherTeachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 mt-1">
                    All current class assignments will transfer to the selected teacher.
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {loading ? "Processing..." : "✓ Relieve Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
