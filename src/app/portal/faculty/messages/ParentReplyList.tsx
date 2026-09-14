"use client";

import { useState } from "react";
import { acknowledgeParentReply, acknowledgeWithReason } from "@/actions/parentReplies";

export interface ParentReplyItem {
  id: string;
  from_phone: string;
  message_type: "interactive" | "text" | "image" | "unknown" | string;
  button_payload: string | null;
  message_body: string | null;
  readable_reason: string | null;
  handled: boolean;
  handled_at?: string | null;
  created_at: string;
  student?: {
    id: string;
    full_name: string;
    roll_no?: string | null;
    admission_no?: string | null;
    class_name?: string | null;
    section?: string | null;
  } | null;
}

const PRESET_REASONS = [
  "Sick Leave",
  "Family Event",
  "Doctor Appointment",
  "Transport Delay",
  "Personal / Other",
];

export default function ParentReplyList({
  initialReplies,
}: {
  initialReplies: ParentReplyItem[];
}) {
  const [replies, setReplies] = useState<ParentReplyItem[]>(initialReplies);
  const [activeTab, setActiveTab] = useState<"all" | "unhandled" | "handled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Record<string, string>>({});
  const [customReasons, setCustomReasons] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper to trigger temporary toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Quick acknowledge without changing reason
  async function handleQuickAcknowledge(replyId: string) {
    setLoadingId(replyId);
    try {
      const res = await acknowledgeParentReply(replyId);
      if (res.success) {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === replyId
              ? { ...r, handled: true, handled_at: new Date().toISOString() }
              : r
          )
        );
        showToast("Marked as acknowledged.");
      } else {
        showToast(res.message || "Failed to acknowledge", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  // 2. Set attendance reason + acknowledge
  async function handleSetReason(replyId: string) {
    const selected = selectedReasons[replyId] || "Sick Leave";
    const reasonToSave = selected === "Personal / Other" && customReasons[replyId]?.trim()
      ? customReasons[replyId].trim()
      : selected;

    setLoadingId(replyId);
    try {
      const res = await acknowledgeWithReason(replyId, reasonToSave);
      if (res.success) {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === replyId
              ? {
                  ...r,
                  handled: true,
                  readable_reason: reasonToSave,
                  handled_at: new Date().toISOString(),
                }
              : r
          )
        );
        showToast(`Attendance updated: ${reasonToSave}`);
      } else {
        showToast(res.message || "Failed to update reason", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoadingId(null);
    }
  }

  // Filter logic
  const filteredReplies = replies.filter((reply) => {
    // Tab filter
    if (activeTab === "unhandled" && reply.handled) return false;
    if (activeTab === "handled" && !reply.handled) return false;

    // Search filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const studentName = reply.student?.full_name?.toLowerCase() || "";
    const phone = reply.from_phone.toLowerCase();
    const message = (reply.message_body || "").toLowerCase();
    const reason = (reply.readable_reason || "").toLowerCase();
    return (
      studentName.includes(q) ||
      phone.includes(q) ||
      message.includes(q) ||
      reason.includes(q)
    );
  });

  const unhandledCount = replies.filter((r) => !r.handled).length;
  const handledCount = replies.filter((r) => r.handled).length;

  return (
    <div className="space-y-4">
      {/* Toast alert */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({replies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unhandled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "unhandled"
                ? "bg-white text-rose-700 shadow-2xs"
                : "text-slate-600 hover:text-rose-600"
            }`}
          >
            <span>Action Needed</span>
            {unhandledCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {unhandledCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("handled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "handled"
                ? "bg-white text-emerald-700 shadow-2xs"
                : "text-slate-600 hover:text-emerald-600"
            }`}
          >
            Acknowledged ({handledCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, phone, or reason..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredReplies.length === 0 && (
        <div className="card text-center py-12 px-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-3">
            💬
          </div>
          <h3 className="text-sm font-bold text-slate-800">No parent messages found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No results matching "${searchQuery}". Try clearing your search.`
              : activeTab === "unhandled"
              ? "Great job! All parent absence replies have been acknowledged."
              : "Inbound WhatsApp replies from parents will appear here automatically."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs rounded-lg font-medium transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Replies List */}
      <div className="space-y-3">
        {filteredReplies.map((reply) => {
          const isButtonTap = reply.message_type === "interactive";
          const isAutoHandled = isButtonTap && reply.button_payload && reply.button_payload !== "REASON_OTHER";
          const currentReason = selectedReasons[reply.id] || "Sick Leave";
          const dateFormatted = new Date(reply.created_at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "short",
          });

          return (
            <div
              key={reply.id}
              className={`rounded-2xl border transition-all duration-200 p-4 ${
                reply.handled
                  ? "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                  : "bg-amber-50/20 border-amber-300/80 shadow-xs ring-1 ring-amber-300/30"
              }`}
            >
              {/* Header: Student / Phone + Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Student Avatar / Initial */}
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      reply.student
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {reply.student?.full_name ? reply.student.full_name.charAt(0).toUpperCase() : "📱"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {reply.student?.full_name || "Unlinked Student"}
                      </span>
                      {reply.student?.class_name && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Class {reply.student.class_name}
                          {reply.student.section ? `-${reply.student.section}` : ""}
                        </span>
                      )}
                      {reply.student?.roll_no && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Roll #{reply.student.roll_no}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <a
                        href={`https://wa.me/${reply.from_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-600 flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span className="text-emerald-500">💬</span>
                        {reply.from_phone}
                      </a>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">{dateFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Message source badge */}
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      isButtonTap
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {isButtonTap ? "⚡ Quick Reply" : "✉️ WhatsApp Text"}
                  </span>

                  {/* Handling status badge */}
                  {reply.handled ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span>✓</span>
                      <span>{isAutoHandled ? "Auto-Acknowledged" : "Acknowledged"}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span>Action Needed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="mt-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700">
                  <span className="text-slate-400 font-serif text-sm mr-1">&ldquo;</span>
                  <span className="font-medium text-slate-800">
                    {reply.message_body || "No message text received"}
                  </span>
                  <span className="text-slate-400 font-serif text-sm ml-1">&rdquo;</span>
                </div>

                {/* Stored Reason Display (if already assigned) */}
                {reply.readable_reason && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Recorded Reason:</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      📋 {reply.readable_reason}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Form: Displayed for Unhandled Messages (Text or REASON_OTHER) */}
              {!reply.handled && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 bg-amber-50/30 -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <span>⚡ Select Official Absence Reason:</span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {PRESET_REASONS.map((r) => {
                      const isSelected = currentReason === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() =>
                            setSelectedReasons((prev) => ({ ...prev, [reply.id]: r }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-brand-600 text-white shadow-2xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom reason input if "Personal / Other" selected */}
                  {currentReason === "Personal / Other" && (
                    <div className="mb-2.5">
                      <input
                        type="text"
                        placeholder="Type specific reason for attendance record..."
                        value={customReasons[reply.id] || ""}
                        onChange={(e) =>
                          setCustomReasons((prev) => ({
                            ...prev,
                            [reply.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={loadingId === reply.id}
                      onClick={() => handleSetReason(reply.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingId === reply.id ? (
                        <>
                          <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Set Reason & Acknowledge</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === reply.id}
                      onClick={() => handleQuickAcknowledge(reply.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      Quick Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
