"use client";

import { useState } from "react";
import { PtmConsultationNote } from "@/types/faculty";
import { PtmSlot, TeacherChatMessage } from "@/types/self-service";
import { toggleOfficeHoursAction, savePtmMeetingNotesAction } from "@/actions/faculty";
import ParentRepliesList from "@/components/ParentRepliesList";

interface Props {
  initialOfficeHours: boolean;
  slots: PtmSlot[];
  initialNotes: PtmConsultationNote[];
  messages: TeacherChatMessage[];
  parentReplies: any[];
}

export default function FacultyPtmMessagesClient({
  initialOfficeHours,
  slots,
  initialNotes,
  messages,
  parentReplies,
}: Props) {
  const [activeTab, setActiveTab] = useState<"chat" | "ptm" | "whatsapp">("chat");
  const [isOfficeHoursActive, setIsOfficeHoursActive] = useState(initialOfficeHours);
  const [notes, setNotes] = useState<PtmConsultationNote[]>(initialNotes);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || "");
  const [currentNote, setCurrentNote] = useState("");
  const [currentPlan, setCurrentPlan] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const existingNote = notes.find((n) => n.slotId === selectedSlotId);

  async function handleToggleHours() {
    const nextState = !isOfficeHoursActive;
    setIsOfficeHoursActive(nextState);
    const res = await toggleOfficeHoursAction(nextState);
    setFeedback(res.message);
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!currentNote.trim()) {
      alert("Please enter meeting notes.");
      return;
    }
    setSavingNote(true);
    try {
      const res = await savePtmMeetingNotesAction({
        slotId: selectedSlotId,
        notes: currentNote.trim(),
        actionPlan: currentPlan.trim(),
      });
      if (res.success) {
        setNotes((prev) => [
          ...prev.filter((n) => n.slotId !== selectedSlotId),
          {
            slotId: selectedSlotId,
            studentId: "s-10a-01",
            studentName: selectedSlot ? selectedSlot.teacherName : "Student",
            parentName: "Parent",
            timeSlot: selectedSlot ? selectedSlot.timeSlot : "",
            status: "completed",
            privateMeetingNotes: currentNote.trim(),
            agreedActionPlan: currentPlan.trim(),
          },
        ]);
        setFeedback("Consultation notes safely recorded to student's master academic dossier!");
        setCurrentNote("");
        setCurrentPlan("");
      }
    } catch {
      alert("Failed to save notes.");
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Office Hours Toggle */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Faculty Workspace &middot; Regulated Parent Communications
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              💬 Office Hours Chat &amp; Calendly PTM Hub
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              Protect your personal family time with automated office hours windows and run seamless 10-minute PTM consultations.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
            <div className="text-right">
              <div className="text-xs font-bold text-white">Office Hours Status</div>
              <div className="text-[11px] text-white/70">3:45 PM – 5:00 PM Window</div>
            </div>
            <button
              type="button"
              onClick={handleToggleHours}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isOfficeHoursActive
                  ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  : "bg-rose-500 text-white hover:bg-rose-400"
              }`}
            >
              {isOfficeHoursActive ? "🟢 AVAILABLE (Online)" : "🔴 OFFLINE (Auto-Queue)"}
            </button>
          </div>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "chat"
              ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>💬 Office Hours Direct Chat</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{messages.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ptm")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "ptm"
              ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🗓️ Calendly PTM Itinerary</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{slots.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "whatsapp"
              ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>📱 Inbound WhatsApp Absence Replies</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{parentReplies.length}</span>
        </button>
      </div>

      {/* ── TAB 1: OFFICE HOURS REGULATED CHAT ── */}
      {activeTab === "chat" && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Protected Office Hours Inbox</h2>
              <p className="text-xs text-slate-500">
                Messages sent outside 3:45 PM – 5:00 PM are queued so your personal evenings remain private.
              </p>
            </div>
            <span className={`badge ${isOfficeHoursActive ? "badge-green" : "badge-slate"}`}>
              {isOfficeHoursActive ? "Auto-Response Active" : "Queued Outside Office Hours"}
            </span>
          </div>

          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border max-w-xl ${
                  m.senderRole === "teacher"
                    ? "ml-auto bg-blue-50/80 border-blue-200 text-blue-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] mb-1 font-bold">
                  <span>{m.senderRole === "teacher" ? "You (Teacher)" : "Sri Goud (Parent of Arjun Reddy)"}</span>
                  <span className="text-slate-400 font-normal">{m.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: CALENDLY-STYLE PTM DASHBOARD ── */}
      {activeTab === "ptm" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Slots Itinerary */}
          <div className="lg:col-span-6 card p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Saturday PTM Consultation Itinerary</h2>
              <p className="text-xs text-slate-500">
                10-minute time slots booked by parents for Class 10-A.
              </p>
            </div>

            <div className="space-y-2.5">
              {slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const isBooked = slot.status === "booked";
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{slot.timeSlot}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isBooked ? "Booked: Sri Goud (Father of Arjun Reddy)" : "Open for parent booking"}
                      </div>
                    </div>
                    <span className={`badge ${isBooked ? "badge-blue" : "badge-green"}`}>
                      {isBooked ? "Reserved" : "Available"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consultation Notes Form */}
          <div className="lg:col-span-6 card p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Private Consultation Notes &middot; {selectedSlot?.timeSlot}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Notes entered here are permanently appended to the student&apos;s master confidential dossier.
            </p>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Summary &amp; Academic Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Discussed SA-1 performance. Commended strong algebra work, addressed frustum volume confusion..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="input text-xs w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agreed Home Action Plan</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Father will ensure student completes 15-question targeted remedial drill over the weekend."
                  value={currentPlan}
                  onChange={(e) => setCurrentPlan(e.target.value)}
                  className="input text-xs w-full resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {savingNote ? "Saving Dossier..." : "✓ Save Consultation Notes to Student Master File"}
              </button>
            </form>

            {existingNote && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="font-bold text-slate-900 mb-1">Previous Consultation Record:</div>
                <p className="italic">&ldquo;{existingNote.privateMeetingNotes}&rdquo;</p>
                {existingNote.agreedActionPlan && (
                  <p className="mt-1 font-semibold text-blue-900">Plan: {existingNote.agreedActionPlan}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: INBOUND WHATSAPP ABSENCE REPLIES ── */}
      {activeTab === "whatsapp" && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">WhatsApp Inbound Absence Replies</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically captured when parents reply to morning absence WhatsApp templates.
              </p>
            </div>
            <span className="badge badge-green">Gateway Connected</span>
          </div>
          <div className="p-5">
            <ParentRepliesList initialReplies={parentReplies} />
          </div>
        </div>
      )}
    </div>
  );
}
