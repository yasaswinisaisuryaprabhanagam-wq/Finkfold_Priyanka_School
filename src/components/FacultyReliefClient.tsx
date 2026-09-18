"use client";

import { useState } from "react";
import { ReliefPeriodRequest } from "@/types/faculty";
import { acceptReliefCoverageAction } from "@/actions/faculty";

interface Props {
  initialRequests: ReliefPeriodRequest[];
}

export default function FacultyReliefClient({ initialRequests }: Props) {
  const [requests, setRequests] = useState<ReliefPeriodRequest[]>(initialRequests);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const availableCount = requests.filter((r) => r.status === "available").length;

  async function handleAccept(id: string) {
    setAcceptingId(id);
    try {
      const res = await acceptReliefCoverageAction(id);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "accepted", acceptedByTeacher: "You (Accepted)" } : r
          )
        );
        setFeedback(res.message);
      }
    } catch {
      alert("Failed to accept coverage.");
    } finally {
      setAcceptingId(null);
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
            Faculty Workspace &middot; Smart Morning Operations
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🔄 Substitution &amp; Relief Desk
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Eliminate morning timetable chaos. Review relief requests matching your free periods and accept class coverage in 1 click.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Requests Card */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Today&apos;s Active Substitution Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted notifications matched to your free periods today.
            </p>
          </div>
          <span className={`badge ${availableCount > 0 ? "badge-amber" : "badge-green"}`}>
            {availableCount} Coverage Needed
          </span>
        </div>

        <div className="card-body space-y-4">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No substitution coverage needed today. All periods staffed!
            </div>
          ) : (
            requests.map((req) => {
              const isAvailable = req.status === "available";
              const isAccepted = req.status === "accepted";

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    isAvailable
                      ? "bg-amber-50/40 border-amber-300 shadow-2xs"
                      : isAccepted
                      ? "bg-emerald-50/40 border-emerald-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Period {req.periodNo} ({req.periodTime})
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900">
                        {req.classGrade} - Section {req.section}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Room: {req.room}</span>
                      <span
                        className={`badge ${
                          isAccepted ? "badge-green" : isAvailable ? "badge-amber" : "badge-slate"
                        }`}
                      >
                        {isAccepted ? "✓ Coverage Confirmed" : "⚠️ Substitute Needed"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>Absent Faculty:</strong> {req.absentTeacherName} &middot; Subject:{" "}
                      <strong>{req.absentTeacherSubject}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-700">
                      <strong className="text-slate-900">Lesson Instructions:</strong> {req.lessonInstructions}
                    </div>

                    {isAccepted && (
                      <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 mt-1">
                        <span>✓</span> Assigned to: {req.acceptedByTeacher} &middot; Updated on Principal Morning Dashboard
                      </div>
                    )}
                  </div>

                  {isAvailable && (
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.id)}
                        disabled={acceptingId === req.id}
                        className="btn btn-primary text-xs font-bold px-5 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        {acceptingId === req.id ? "Accepting..." : "✓ Accept Period Coverage"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
