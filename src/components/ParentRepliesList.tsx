"use client";

import { useState } from "react";
import { markReplyHandled } from "@/actions/markReplyHandled";

type ParentReply = {
  id: string;
  from_phone: string;
  message_text: string | null;
  handled: boolean;
  created_at: string;
};

export default function ParentRepliesList({
  initialReplies,
}: {
  initialReplies: ParentReply[];
}) {
  const [replies, setReplies] = useState(initialReplies);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleMarkHandled(id: string) {
    setLoadingId(id);
    const res = await markReplyHandled(id);
    setLoadingId(null);

    if (res.success) {
      setReplies((prev) =>
        prev.map((r) => (r.id === id ? { ...r, handled: true } : r))
      );
    }
  }

  if (replies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
        No inbound parent WhatsApp replies yet today.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {replies.map((reply) => {
        const dateFormatted = new Date(reply.created_at).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
        });

        return (
          <div
            key={reply.id}
            className={`rounded-2xl border p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              reply.handled
                ? "bg-slate-50/60 border-slate-200"
                : "bg-white border-amber-200 shadow-2xs"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  📱 {reply.from_phone}
                </span>
                <span className="text-[11px] text-slate-400">• {dateFormatted}</span>
                {reply.handled ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ✓ Handled
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                &ldquo;{reply.message_text || "No message text"}&rdquo;
              </p>
            </div>

            {!reply.handled && (
              <button
                type="button"
                onClick={() => handleMarkHandled(reply.id)}
                disabled={loadingId === reply.id}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors disabled:opacity-50"
              >
                {loadingId === reply.id ? "Updating..." : "Mark as Handled"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
