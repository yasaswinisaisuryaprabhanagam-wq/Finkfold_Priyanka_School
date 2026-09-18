"use client";

import { useState, useEffect, useTransition } from "react";
import {
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  getElectivesData,
  saveLanguageRankingAction,
  bidForClubAction,
  registerForEventAction,
} from "@/actions/electives";

export default function StudentElectivesPage() {
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [events] = useState(INITIAL_EVENTS);
  const [enrolledClubs, setEnrolledClubs] = useState<string[]>(["club-robotics"]);
  const [languageRanking, setLanguageRanking] = useState({
    first: "Sanskrit",
    second: "Hindi",
    third: "French",
  });
  const [eventRegistrations, setEventRegistrations] = useState<Record<string, string>>({
    "event-sports-2026": "100m Sprint",
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getElectivesData().then((res) => {
      if (res) {
        if (res.languageRanking) setLanguageRanking(res.languageRanking);
        if (res.enrolledClubs) setEnrolledClubs(res.enrolledClubs);
        if (res.eventRegistrations) setEventRegistrations(res.eventRegistrations);
      }
    });
  }, []);

  function handleSaveLanguages(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveLanguageRankingAction(languageRanking);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  function handleClubBid(clubId: string, clubName: string, isWaitlist: boolean) {
    startTransition(async () => {
      const res = await bidForClubAction(clubId, clubName, isWaitlist);
      if (!isWaitlist) {
        setEnrolledClubs((prev) => [...prev, clubId]);
      }
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  function handleEventRegister(eventId: string, category: string) {
    startTransition(async () => {
      const res = await registerForEventAction(eventId, category);
      setEventRegistrations((prev) => ({ ...prev, [eventId]: category }));
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-semibold mb-2">
          <span>🎯</span>
          <span>Self-Service Academic Allocation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Electives, Clubs & Event Bidding
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Rank elective languages, bid for high-capacity clubs, and register for annual campus championships.
        </p>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
          <span className="text-lg">✅</span>
          <div className="font-medium flex-1">{notification}</div>
        </div>
      )}

      {/* ── Section 1: Language Preference Ranking ── */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Second Language Choice Filling (Academic Term 2026-27)
            </h2>
            <p className="text-xs text-slate-500">
              Rank your preferences for second language. The system runs an automated capacity allocation algorithm.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
            Allocation Round 1
          </span>
        </div>

        <form onSubmit={handleSaveLanguages} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Choice 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1st Preference (Highest)
              </span>
              <span className="text-xs">🥇</span>
            </div>
            <select
              value={languageRanking.first}
              onChange={(e) => setLanguageRanking((p) => ({ ...p, first: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 cursor-pointer"
            >
              <option value="Sanskrit">Sanskrit (State Board High-Scorer)</option>
              <option value="Hindi">Hindi (National Curriculum)</option>
              <option value="French">French (Introductory Conversational)</option>
            </select>
            <p className="text-[11px] text-slate-400">Grammar, shlokas & classical comprehension.</p>
          </div>

          {/* Choice 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2nd Preference
              </span>
              <span className="text-xs">🥈</span>
            </div>
            <select
              value={languageRanking.second}
              onChange={(e) => setLanguageRanking((p) => ({ ...p, second: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 cursor-pointer"
            >
              <option value="Hindi">Hindi (National Curriculum)</option>
              <option value="Sanskrit">Sanskrit (State Board High-Scorer)</option>
              <option value="French">French (Introductory Conversational)</option>
            </select>
            <p className="text-[11px] text-slate-400">Literature, essay writing & speaking drills.</p>
          </div>

          {/* Choice 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3rd Preference (Fallback)
              </span>
              <span className="text-xs">🥉</span>
            </div>
            <select
              value={languageRanking.third}
              onChange={(e) => setLanguageRanking((p) => ({ ...p, third: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 cursor-pointer"
            >
              <option value="French">French (Introductory Conversational)</option>
              <option value="Sanskrit">Sanskrit (State Board High-Scorer)</option>
              <option value="Hindi">Hindi (National Curriculum)</option>
            </select>
            <p className="text-[11px] text-slate-400">Global language basics & phonetics.</p>
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              Save Elective Language Preferences →
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Extracurricular Club Bidding & Capacity Gauges ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Capacity-Driven Extracurricular Club Bidding
          </h2>
          <p className="text-xs text-slate-500">
            Each club has strict seat limits. Once full, applicants are placed on an automated digital waitlist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clubs.map((club) => {
            const isEnrolled = enrolledClubs.includes(club.id);
            const isFull = club.enrolled >= club.capacity;
            const percentage = Math.round((club.enrolled / club.capacity) * 100);

            return (
              <div
                key={club.id}
                className={`bg-white rounded-3xl p-6 shadow-xs border transition-all flex flex-col justify-between space-y-4 ${
                  isEnrolled
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{club.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Mentor: <strong className="text-slate-700">{club.facultyLead}</strong>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <span>✓</span> Enrolled
                      </span>
                    ) : isFull ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                        Waitlist Only
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                        Seats Open
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{club.description}</p>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <div>🕒 {club.schedule}</div>
                    <div>📍 Venue: {club.room}</div>
                  </div>

                  {/* Seat Capacity Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Seat Occupancy:</span>
                      <span className={isFull ? "text-rose-600" : "text-blue-900"}>
                        {club.enrolled} / {club.capacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? "bg-rose-500"
                            : percentage > 85
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bidding Button */}
                <div className="pt-3 border-t border-slate-100">
                  {isEnrolled ? (
                    <div className="text-center text-xs font-bold text-emerald-700 py-2">
                      Active Member • Attendance recorded during session
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClubBid(club.id, club.name, isFull)}
                      disabled={isPending}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer ${
                        isFull
                          ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                          : "bg-blue-900 hover:bg-blue-800 text-white"
                      }`}
                    >
                      {isFull ? "Join Automated Waitlist →" : "Bid & Enroll in Club →"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Annual Event Registrations ── */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Annual Campus Event Registrations
          </h2>
          <p className="text-xs text-slate-500">
            Register your events directly. The physical education and STEM department manifests are generated automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            const registeredCategory = eventRegistrations[evt.id];

            return (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>📅 {evt.date}</span>
                    <span>📍 {evt.venue}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Choose Participating Category:
                  </label>
                  <select
                    defaultValue={registeredCategory || evt.categories[0]}
                    id={`cat-${evt.id}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600 cursor-pointer"
                  >
                    {evt.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                  {registeredCategory ? (
                    <span className="text-xs font-bold text-emerald-700">
                      ✓ Registered for: {registeredCategory}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Not registered yet</span>
                  )}

                  <button
                    onClick={() => {
                      const select = document.getElementById(`cat-${evt.id}`) as HTMLSelectElement;
                      handleEventRegister(evt.id, select.value);
                    }}
                    disabled={isPending}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer ml-auto"
                  >
                    {registeredCategory ? "Update Entry" : "Register to Participate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
