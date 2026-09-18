"use client";

import { useState, useEffect, useTransition } from "react";
import type { TeacherContact, TeacherChatMessage, PtmSlot } from "@/types/self-service";
import { INITIAL_TEACHERS, INITIAL_MESSAGES, INITIAL_PTM_SLOTS } from "@/types/self-service";
import {
  getPtmAndMessagingData,
  sendTeacherMessageAction,
  bookPtmSlotAction,
} from "@/actions/ptm-messages";
import {
  MessageSquare,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Video,
  UserCheck,
  ShieldCheck,
  Building,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";

export default function PtmAndMessagingPage() {
  const [activeTab, setActiveTab] = useState<"messaging" | "ptm">("messaging");
  const [teachers, setTeachers] = useState<TeacherContact[]>(INITIAL_TEACHERS);
  const [messages, setMessages] = useState<TeacherChatMessage[]>(INITIAL_MESSAGES);
  const [ptmSlots, setPtmSlots] = useState<PtmSlot[]>(INITIAL_PTM_SLOTS);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("tch-radhika");
  const [typedMessage, setTypedMessage] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPtmAndMessagingData().then((res) => {
      if (res) {
        if (res.teachers) setTeachers(res.teachers);
        if (res.messages) setMessages(res.messages);
        if (res.ptmSlots) setPtmSlots(res.ptmSlots);
      }
    });
  }, []);

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];
  const teacherMessages = messages.filter((m) => m.teacherId === currentTeacher?.id);

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!typedMessage.trim() || !currentTeacher) return;

    const text = typedMessage.trim();
    startTransition(async () => {
      const res = await sendTeacherMessageAction({
        teacherId: currentTeacher.id,
        messageText: text,
      });

      if (res.success) {
        setMessages((prev) => [...prev, res.message]);
        setNotification(res.notice);
        setTypedMessage("");
        setTimeout(() => setNotification(null), 8000);
      }
    });
  }

  function handleBookSlot(slot: PtmSlot) {
    if (slot.status === "booked") return;

    startTransition(async () => {
      const res = await bookPtmSlotAction(slot.id);
      if (res.success) {
        setPtmSlots((prev) =>
          prev.map((s) => (s.id === slot.id ? { ...s, status: "booked" } : s))
        );
        setNotification(res.message);
        setTimeout(() => setNotification(null), 7000);
      }
    });
  }

  const filteredSlots = ptmSlots.filter((s) => {
    if (selectedSubjectFilter === "all") return true;
    return s.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
  });

  const myBookedSlots = ptmSlots.filter((s) => s.status === "booked");

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white border border-blue-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold uppercase tracking-wider w-fit mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            Regulated Faculty Comms & PTM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Teacher Office Hours & PTM Slot Booking
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Message your child&apos;s subject teachers within regulated office hours (3:45 PM – 5:00 PM)
            and reserve 1-on-1 parent-teacher conference slots without phone tag or queuing.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("messaging")}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "messaging"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-semibold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Teacher Office Hours Chat
          </button>
          <button
            onClick={() => setActiveTab("ptm")}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "ptm"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            PTM Slot Scheduler (28 Sep 2026)
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-sm">
            <span className="font-semibold block mb-0.5">Status Update:</span>
            {notification}
          </div>
        </div>
      )}

      {/* TAB 1: TEACHER OFFICE HOURS MESSAGING */}
      {activeTab === "messaging" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Teacher Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Class 10-A Subject Faculty
              </h2>
              <div className="space-y-2.5">
                {teachers.map((t) => {
                  const isSelected = t.id === currentTeacher?.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeacherId(t.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500/50 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                      }`}
                    >
                      <div className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm">
                        {t.photoEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {t.name}
                          </h3>
                        </div>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                          {t.subject}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              t.isOfficeHoursActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          <span>
                            {t.isOfficeHoursActive ? "Office Hours Open" : "Closed until 3:45 PM"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Office Hours Policy Note */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                School Safeguarding & Work-Life Charter
              </div>
              <p className="leading-relaxed">
                Teachers receive notifications only during designated office hours (typically 3:45 PM – 5:00 PM). Messages submitted outside this window are safely held in our server queue and delivered automatically next morning.
              </p>
            </div>
          </div>

          {/* Right Column: Active Chat Stream */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
              {/* Teacher Header Card */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentTeacher.photoEmoji}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {currentTeacher.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentTeacher.subject} • {currentTeacher.designation}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      currentTeacher.isOfficeHoursActive
                        ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        currentTeacher.isOfficeHoursActive ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {currentTeacher.officeHoursWindow}
                  </span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
                {teacherMessages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No communication yet. Start a discussion regarding homework, exam feedback, or attendance.
                  </div>
                ) : (
                  teacherMessages.map((msg) => {
                    const isParent = msg.senderRole === "parent";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isParent ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-4 rounded-2xl text-sm ${
                            isParent
                              ? "bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-900/20"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700/60 shadow-sm"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <div
                            className={`flex items-center gap-1.5 mt-2 text-[11px] ${
                              isParent ? "text-blue-200 justify-end" : "text-slate-400 justify-start"
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isParent && (
                              <span>
                                {msg.status === "delivered" ? "• Delivered" : "• Queued (Office Hours)"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder={`Write message to ${currentTeacher.name}...`}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending || !typedMessage.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PTM SLOT SCHEDULER */}
      {activeTab === "ptm" && (
        <div className="space-y-8">
          {/* PTM Announcement Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border border-indigo-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                Upcoming Mandatory Conference
              </div>
              <h2 className="text-xl font-bold">Class 10 Mid-Term Parent-Teacher Meeting (PTM)</h2>
              <p className="text-slate-300 text-xs mt-1">
                Date: <strong>Saturday, 28 September 2026</strong> • Time: 09:00 AM – 01:00 PM • Format: 10-Minute One-on-One Slots
              </p>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold text-indigo-200 border border-white/10">
              ⚡ Instant Digital Reservation
            </div>
          </div>

          {/* Subject Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
              Filter Faculty:
            </span>
            {[
              { id: "all", label: "All Subjects" },
              { id: "Mathematics", label: "Mathematics" },
              { id: "Physical Science", label: "Physical Science" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedSubjectFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedSubjectFilter === f.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSlots.map((slot) => {
              const isBooked = slot.status === "booked";
              return (
                <div
                  key={slot.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isBooked
                      ? "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-800 opacity-80"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {slot.subject}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isBooked
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {isBooked ? "Reserved" : "Slot Open"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {slot.teacherName}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {slot.timeSlot}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {slot.meetingType}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={isBooked || isPending}
                      onClick={() => handleBookSlot(slot)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isBooked
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20"
                      }`}
                    >
                      {isBooked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Reserved by You
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Reserve This 10-Min Slot
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirmed Itinerary Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Your Confirmed PTM Schedule (Saturday, 28 Sep)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please arrive 5 minutes before your scheduled window to prevent delays for other parents.
            </p>

            {myBookedSlots.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-400">
                You have not booked any slots yet. Choose an open slot above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myBookedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        {slot.subject}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {slot.teacherName}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1">
                        ⏱️ {slot.timeSlot}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
