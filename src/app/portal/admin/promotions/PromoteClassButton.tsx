"use client";

import { useState } from "react";
import { promoteStudents } from "@/actions/promoteStudents";

export default function PromoteClassButton({
  schoolId,
  fromClassId,
  fromClassName,
  toClassId,
  toClassName,
  studentCount,
  academicYearFrom,
  academicYearTo,
  promotedBy,
  disabled,
}: {
  schoolId: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  studentCount: number;
  academicYearFrom: string;
  academicYearTo: string;
  promotedBy: string;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const isPassingOut = toClassId === "passed_out";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await promoteStudents(fd);
    setLoading(false);
    if (res.success) {
      setResult({ ok: true, msg: `✅ ${res.promoted} students ${isPassingOut ? "graduated" : "promoted"} successfully!` });
    } else {
      setResult({ ok: false, msg: res.error || "Promotion failed" });
    }
  }

  if (result?.ok) {
    return (
      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
        {result.msg}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={`btn btn-sm ${isPassingOut ? "btn-ghost border-amber-300 text-amber-700" : "btn-primary"}`}
      >
        {isPassingOut ? "🎓 Graduate Class" : "→ Promote Class"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-3">{isPassingOut ? "🎓" : "🚀"}</div>
              <div className="text-lg font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                {isPassingOut ? "Graduate Students" : "Promote Students"}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                <span className="font-semibold text-blue-900">{fromClassName}</span>
                {" "}{isPassingOut ? "→ Passed Out" : `→ ${toClassName}`}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-slate-900">{studentCount}</div>
              <div className="text-xs text-slate-500">students will be {isPassingOut ? "marked as graduated" : "moved to " + toClassName}</div>
            </div>

            {result && !result.ok && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
                {result.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="hidden" name="schoolId" value={schoolId} />
              <input type="hidden" name="fromClassId" value={fromClassId} />
              <input type="hidden" name="toClassId" value={toClassId} />
              <input type="hidden" name="academicYearFrom" value={academicYearFrom} />
              <input type="hidden" name="academicYearTo" value={academicYearTo} />
              <input type="hidden" name="promotedBy" value={promotedBy} />

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder={isPassingOut ? "e.g. Board exam results declared" : "e.g. Annual promotion 2026"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost flex-1">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn flex-1 font-bold text-white ${isPassingOut ? "bg-amber-500 hover:bg-amber-600" : "btn-primary"}`}
                >
                  {loading ? "Processing…" : isPassingOut ? "Confirm Graduate" : "Confirm Promote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
