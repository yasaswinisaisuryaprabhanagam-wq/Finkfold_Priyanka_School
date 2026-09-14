"use client";

import { useState } from "react";
import { approveAdmission, rejectAdmission } from "@/actions/admissions";

type Class = { id: string; name: string; section: string; academic_year: string };

export default function AdmissionReviewClient({
  admission,
  classes,
  schoolId,
  reviewedBy,
}: {
  admission: any;
  classes: Class[];
  schoolId: string;
  reviewedBy: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");

  async function handleApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await approveAdmission(new FormData(e.currentTarget));
    setLoading(false);
    if (res.success) { setDone("approved"); setShowApprove(false); }
    else setError(res.error || "Approval failed");
  }

  async function handleReject() {
    if (!confirm(`Reject application from ${admission.full_name}?`)) return;
    setLoading(true);
    await rejectAdmission(admission.id, reviewedBy);
    setLoading(false);
    setDone("rejected");
  }

  if (done) {
    return (
      <div className={`card p-4 flex items-center gap-3 ${done === "approved" ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"} border`}>
        <span className="text-2xl">{done === "approved" ? "✅" : "❌"}</span>
        <div>
          <span className="font-bold text-slate-800">{admission.full_name}</span>
          <span className="text-sm text-slate-500 ml-2">{done === "approved" ? "Enrolled successfully!" : "Application rejected"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border border-slate-200">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-11 w-11 rounded-full bg-blue-100 text-blue-900 font-black text-base flex items-center justify-center flex-shrink-0">
          {admission.full_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900">{admission.full_name}</div>
          <div className="text-xs text-slate-500">
            Applying for Class {admission.applying_for_class}
            {admission.applying_for_section ? `-${admission.applying_for_section}` : ""} ·
            Parent: {admission.parent_name} · {admission.parent_phone}
          </div>
        </div>
        <div className="text-xs text-slate-400 flex-shrink-0">
          {new Date(admission.submitted_at).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
          })}
        </div>
        <span className="text-slate-400 text-sm">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              { label: "Full Name", value: admission.full_name },
              { label: "Date of Birth", value: admission.date_of_birth ? new Date(admission.date_of_birth).toLocaleDateString("en-IN") : "—" },
              { label: "Gender", value: admission.gender || "—" },
              { label: "Applying for Class", value: `Class ${admission.applying_for_class}${admission.applying_for_section ? `-${admission.applying_for_section}` : ""}` },
              { label: "Previous School", value: admission.previous_school || "—" },
              { label: "Parent Name", value: admission.parent_name },
              { label: "WhatsApp", value: admission.parent_phone },
              { label: "Alt. Phone", value: admission.second_parent_phone || "—" },
              { label: "Address", value: admission.address || "—" },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{f.label}</div>
                <div className="text-slate-800 font-semibold mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowApprove(true)}
              disabled={loading}
              className="btn btn-primary flex-1 sm:flex-none"
            >
              ✅ Approve & Enroll
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="btn btn-ghost border border-rose-200 text-rose-600 hover:bg-rose-50 flex-1 sm:flex-none"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}

      {/* Approve modal */}
      {showApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-lg font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Enroll {admission.full_name}
            </div>

            <form onSubmit={handleApprove} className="space-y-3">
              <input type="hidden" name="admissionId" value={admission.id} />
              <input type="hidden" name="schoolId" value={schoolId} />
              <input type="hidden" name="approvedBy" value={reviewedBy} />

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Assign to Class <span className="text-rose-500">*</span>
                </label>
                <select
                  name="classId"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Class {c.name} – Section {c.section} ({c.academic_year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Admission No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="admissionNo"
                    required
                    placeholder={`ADM-${new Date().getFullYear()}-001`}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Roll No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="rollNo"
                    required
                    min={1}
                    placeholder="1"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 rounded-xl p-3">{error}</div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowApprove(false)} className="btn btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? "Enrolling…" : "Confirm Enroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
