"use client";

import { useState } from "react";
import { format } from "date-fns";
import { acknowledgeParentReply, acknowledgeWithReason } from "@/actions/parentReplies";

export default function ParentRepliesList({ replies: initialReplies }: { replies: any[] }) {
  const [replies, setReplies] = useState(initialReplies);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAcknowledge = async (id: string, reason?: string) => {
    setLoadingId(id);
    let res;
    if (reason) {
      res = await acknowledgeWithReason(id, reason);
    } else {
      res = await acknowledgeParentReply(id);
    }

    if (res.success) {
      setReplies((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, handled: true, readable_reason: reason || r.readable_reason } : r
        )
      );
    } else {
      alert("Failed to acknowledge: " + res.message);
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={`p-4 rounded-xl border ${
            reply.handled
              ? "bg-slate-50 border-slate-200"
              : "bg-white border-blue-200 shadow-sm ring-1 ring-blue-50"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-900">
                  {reply.student_name}
                </span>
                <span className="text-sm text-slate-500">
                  ({reply.class_label})
                </span>
                {!reply.handled && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium animate-pulse">
                    New Reply
                  </span>
                )}
                {reply.message_type === "interactive" && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                    Button Tap
                  </span>
                )}
              </div>
              
              <div className="text-sm text-slate-600 mb-2">
                Phone: {reply.from_phone} • {format(new Date(reply.created_at), "MMM d, h:mm a")}
              </div>

              <div className="p-3 bg-slate-100 rounded-lg text-slate-800 text-sm italic border-l-4 border-slate-300">
                "{reply.message_body}"
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 min-w-[140px] shrink-0">
              {reply.handled ? (
                <div className="text-sm font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg justify-center border border-emerald-100">
                  ✓ Handled
                  {reply.readable_reason && (
                    <span className="text-xs font-normal text-emerald-700 ml-1">
                      ({reply.readable_reason})
                    </span>
                  )}
                </div>
              ) : reply.message_type === "interactive" ? (
                <button
                  onClick={() => handleAcknowledge(reply.id)}
                  disabled={loadingId === reply.id}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loadingId === reply.id ? "Saving..." : "Acknowledge"}
                </button>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <div className="text-xs text-slate-500 text-center font-medium">Assign Reason:</div>
                  <button
                    onClick={() => handleAcknowledge(reply.id, "Sick Leave")}
                    disabled={loadingId === reply.id}
                    className="w-full px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-medium transition-colors border border-rose-200"
                  >
                    Sick Leave
                  </button>
                  <button
                    onClick={() => handleAcknowledge(reply.id, "Family Event")}
                    disabled={loadingId === reply.id}
                    className="w-full px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors border border-amber-200"
                  >
                    Family Event
                  </button>
                  <button
                    onClick={() => handleAcknowledge(reply.id, "Other")}
                    disabled={loadingId === reply.id}
                    className="w-full px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300"
                  >
                    Other (Dismiss)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {replies.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No parent replies yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            When parents respond to WhatsApp absence alerts by tapping buttons or sending messages, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
