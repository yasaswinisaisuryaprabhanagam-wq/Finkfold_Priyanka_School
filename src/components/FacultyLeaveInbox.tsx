"use client";

import { useState } from "react";
import { StudentLeave } from "@/types/self-service";
import { reviewLeaveApplicationAction } from "@/actions/faculty";

interface Props {
  initialLeaves: StudentLeave[];
}

export default function FacultyLeaveInbox({ initialLeaves }: Props) {
  const [leaves, setLeaves] = useState<StudentLeave[]>(initialLeaves);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pendingLeaves = leaves.filter((l) => l.status === "pending");

  async function handleReview(leaveId: string, status: "approved" | "rejected") {
    setProcessingId(leaveId);
    try {
      const res = await reviewLeaveApplicationAction({ leaveId, status });
      if (res.success) {
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status } : l))
        );
        setFeedback(res.message);
      }
    } catch {
      alert("Failed to update leave status.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            📋 Digital Leave &amp; On-Duty (OD) Approval Inbox
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Approving leaves here automatically updates today&apos;s morning attendance register.
          </p>
        </div>
        <span className={`badge ${pendingLeaves.length > 0 ? "badge-amber" : "badge-green"}`}>
          {pendingLeaves.length} Pending Approval
        </span>
      </div>

      {feedback && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      <div className="p-5 space-y-3">
        {leaves.map((l) => {
          const isPending = l.status === "pending";
          const isApproved = l.status === "approved";

          return (
            <div
              key={l.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                isPending
                  ? "bg-amber-50/50 border-amber-300 shadow-2xs"
                  : isApproved
                  ? "bg-emerald-50/30 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {l.leaveType === "on_duty" ? "⚡ On Duty (OD)" : l.leaveType === "medical_leave" ? "🩺 Medical Leave" : "🤒 Sick Leave"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {l.startDate} &mdash; {l.endDate} ({l.totalDays} Day{l.totalDays > 1 ? "s" : ""})
                  </span>
                  <span
                    className={`badge ${
                      isApproved ? "badge-green" : isPending ? "badge-amber" : "badge-rose"
                    }`}
                  >
                    {isApproved ? "✓ Approved" : isPending ? "⏳ Review Needed" : "Rejected"}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-normal leading-relaxed">{l.reason}</p>

                {l.medicalDocName && (
                  <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                    <span>📎</span> Medical Attachment: <u>{l.medicalDocName}</u> (Doctor Verified)
                  </div>
                )}
              </div>

              {isPending ? (
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReview(l.id, "rejected")}
                    disabled={processingId === l.id}
                    className="btn btn-secondary text-xs px-3 py-1.5 text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(l.id, "approved")}
                    disabled={processingId === l.id}
                    className="btn btn-primary text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {processingId === l.id ? "Approving..." : "✓ Approve & Sync Attendance"}
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic self-end sm:self-center">
                  Logged in School Attendance Register
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
