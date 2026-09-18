"use client";

import { useState, useEffect, useTransition } from "react";
import {
  INITIAL_OUTPASSES,
  INITIAL_MESS_MENU,
  OutPassRequest,
  getOutPassesData,
  submitOutPassAction,
  submitMessFeedbackAction,
} from "@/actions/outpass";

export default function StudentOutPassPage() {
  const [activeTab, setActiveTab] = useState<"outpass" | "mess">("outpass");
  const [passes, setPasses] = useState<OutPassRequest[]>(INITIAL_OUTPASSES);
  const [leaveType, setLeaveType] = useState<"weekend_home" | "medical" | "day_outing">("weekend_home");
  const [exitDateTime, setExitDateTime] = useState("Friday, 27 Sep • 04:30 PM");
  const [returnDateTime, setReturnDateTime] = useState("Sunday, 29 Sep • 06:00 PM");
  const [companionName, setCompanionName] = useState("Sri Goud (Parent)");
  const [reason, setReason] = useState("Weekend home visit for family gathering.");
  const [mealRating, setMealRating] = useState(5);
  const [selectedSpecialVote, setSelectedSpecialVote] = useState("Hyderabadi Dum Biryani");
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getOutPassesData().then((res) => {
      if (res && res.length > 0) {
        setPasses(res);
      }
    });
  }, []);

  function handleSubmitPass(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitOutPassAction({
        leaveType,
        exitDateTime,
        returnDateTime,
        companionName,
        reason,
      });

      if (res.success && res.pass) {
        setPasses((p) => [res.pass, ...p]);
        setNotification(res.message);
        setTimeout(() => setNotification(null), 6000);
      }
    });
  }

  function handleMessFeedback(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitMessFeedbackAction(mealRating, selectedSpecialVote);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-2">
          <span>🚪</span>
          <span>Hostel Security & Dining Self-Service</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Out-Pass & Campus Mess
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Multi-tier digital leave approval, security gate QR passes, and weekly cafeteria menu voting.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("outpass")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "outpass"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Digital Out-Passes</span>
          <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
            {passes.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("mess")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "mess"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Weekly Cafeteria Menu & Dining Poll
        </button>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
          <span className="text-lg">✅</span>
          <div className="font-medium flex-1">{notification}</div>
        </div>
      )}

      {/* ── Tab 1: Digital Out-Passes ── */}
      {activeTab === "outpass" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Request Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Request Digital Out-Pass</h2>
              <p className="text-xs text-slate-500">
                Auto-pings Parent WhatsApp for consent and notifies Hostel Warden.
              </p>
            </div>

            <form onSubmit={handleSubmitPass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="weekend_home">Weekend Home Visit (Family Pickup)</option>
                  <option value="medical">Medical Emergency / Specialist Visit</option>
                  <option value="day_outing">Day Outing with Authorized Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Exit Date & Time
                </label>
                <input
                  type="text"
                  value={exitDateTime}
                  onChange={(e) => setExitDateTime(e.target.value)}
                  placeholder="e.g. Friday, 27 Sep • 04:30 PM"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Expected Return Date & Time
                </label>
                <input
                  type="text"
                  value={returnDateTime}
                  onChange={(e) => setReturnDateTime(e.target.value)}
                  placeholder="e.g. Sunday, 29 Sep • 06:00 PM"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Accompanying Guardian / Escort
                </label>
                <input
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="e.g. Sri Goud (Father - +91 9440266743)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reason for Leave
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="State specific purpose of travel..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-800 hover:to-red-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>Submit Multi-Tier Leave Request</span>
              </button>
            </form>
          </div>

          {/* Active Passes & QR Codes */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Active Out-Passes & Security Approval Status
            </h2>

            {passes.map((p) => {
              const isApproved = p.parentApproval === "approved" && p.wardenApproval === "approved";

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-blue-950">
                        {p.passNumber}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Type: <strong className="capitalize text-slate-800">{p.leaveType.replace(/_/g, " ")}</strong> • Created {p.createdAt}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {isApproved ? "✓ Gate Pass Active" : "Approval In Progress"}
                    </span>
                  </div>

                  {/* Multi-Tier Approval Stepper */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium space-y-0.5">
                      <span className="text-base block">📱</span>
                      <span className="font-bold block">1. Parent WhatsApp</span>
                      <span className="text-[10px] text-emerald-700">Consent Verified</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl border font-medium space-y-0.5 ${
                        p.wardenApproval === "approved"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <span className="text-base block">🏢</span>
                      <span className="font-bold block">2. Hostel Warden</span>
                      <span className="text-[10px] font-semibold">
                        {p.wardenApproval === "approved" ? "Signed Off" : "Pending Signature"}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl border font-medium space-y-0.5 ${
                        isApproved
                          ? "bg-blue-50 border-blue-200 text-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <span className="text-base block">🛡️</span>
                      <span className="font-bold block">3. Gate QR Pass</span>
                      <span className="text-[10px] font-semibold">
                        {isApproved ? "Scan at Main Gate" : "Locked"}
                      </span>
                    </div>
                  </div>

                  {/* Pass Details & Security QR */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-xs text-slate-700 flex-1">
                      <div>
                        🛫 Departure: <strong>{p.exitDateTime}</strong>
                      </div>
                      <div>
                        🛬 Expected Return: <strong>{p.returnDateTime}</strong>
                      </div>
                      <div>
                        👤 Escort: <strong>{p.companionName}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 italic pt-1">
                        "{p.reason}"
                      </div>
                    </div>

                    {isApproved ? (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center w-36">
                        <div className="h-20 w-20 border border-slate-900 rounded p-1 flex items-center justify-center">
                          <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                          </svg>
                        </div>
                        <span className="font-mono text-[9px] font-bold text-slate-900 mt-1">
                          {p.gatePassQr}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600">Scan to Exit</span>
                      </div>
                    ) : (
                      <div className="text-center p-3 text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                        Gate pass will unlock once Warden signs off.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab 2: Weekly Cafeteria Mess Menu & Voting ── */}
      {activeTab === "mess" && (
        <div className="space-y-6">
          {/* Menu Table */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Weekly Nutri-Balanced Cafeteria Menu
                </h2>
                <p className="text-xs text-slate-500">
                  Prepared daily by certified institutional chefs. Vegetarian, hygienic & balanced nutritional intake.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                FSSAI Certified Kitchen
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-28">Day</th>
                    <th className="py-3 px-4">Breakfast (07:30 AM)</th>
                    <th className="py-3 px-4">Lunch (12:30 PM)</th>
                    <th className="py-3 px-4">Evening Snack (04:15 PM)</th>
                    <th className="py-3 px-4">Dinner (07:45 PM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {INITIAL_MESS_MENU.map((m) => (
                    <tr key={m.day} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {m.day}
                        {m.specialBadge && (
                          <span className="block mt-0.5 text-[10px] text-amber-700 font-semibold">
                            ★ {m.specialBadge}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{m.breakfast}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{m.lunch}</td>
                      <td className="py-3 px-4">{m.snacks}</td>
                      <td className="py-3 px-4">{m.dinner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Meal Feedback & Friday Special Poll */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rate Lunch */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Rate Today's Lunch</h3>
              <p className="text-xs text-slate-500">
                Help management ensure consistent culinary hygiene and taste quality.
              </p>

              <div className="flex items-center gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setMealRating(star)}
                    className="text-2xl transition-transform hover:scale-125 cursor-pointer"
                  >
                    {star <= mealRating ? "⭐" : "☆"}
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {mealRating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Friday Poll */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Vote for Friday's Special Dinner
              </h3>
              <p className="text-xs text-slate-500">
                The dish with the highest votes will be served to all residential and day-boarding students.
              </p>

              <div className="space-y-2 text-xs">
                {["Hyderabadi Dum Biryani", "Pav Bhaji with Extra Butter", "Chole Bhature & Gulab Jamun"].map((dish) => (
                  <label
                    key={dish}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedSpecialVote === dish
                        ? "border-rose-300 bg-rose-50/50 font-bold text-rose-950"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="specialVote"
                      value={dish}
                      checked={selectedSpecialVote === dish}
                      onChange={(e) => setSelectedSpecialVote(e.target.value)}
                      className="text-rose-600"
                    />
                    <span>{dish}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleMessFeedback}
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                Submit Rating & Cast Menu Vote →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
