"use client";

import { useState } from "react";

interface BroadcastHistory {
  id: string;
  title: string;
  category: "emergency_closure" | "fee_reminder" | "exam_notice" | "event";
  message: string;
  dispatchedAt: string;
  appPushCount: number;
  whatsappCount: number;
  smsCount: number;
  totalDelivered: number;
  status: "delivered" | "broadcasting";
}

const PAST_BROADCASTS: BroadcastHistory[] = [
  {
    id: "bc-1",
    title: "Heavy Rainfall Unscheduled Closure Alert",
    category: "emergency_closure",
    message: "URGENT: As per District Collector orders, Priyanka EM School will remain closed tomorrow due to heavy rainfall.",
    dispatchedAt: "Sep 12, 2026 at 06:15 PM",
    appPushCount: 780,
    whatsappCount: 195,
    smsCount: 25,
    totalDelivered: 1000,
    status: "delivered",
  },
  {
    id: "bc-2",
    title: "Annual Sports Day Schedule & Bus Timings",
    category: "event",
    message: "Annual Athletic Meet commences this Saturday at 08:30 AM. Special transport routes are published in portal.",
    dispatchedAt: "Sep 08, 2026 at 02:30 PM",
    appPushCount: 840,
    whatsappCount: 160,
    smsCount: 0,
    totalDelivered: 1000,
    status: "delivered",
  },
];

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastHistory[]>(PAST_BROADCASTS);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<BroadcastHistory["category"]>("emergency_closure");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{
    push: number;
    whatsapp: number;
    sms: number;
    total: number;
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  async function handleStartBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsBroadcasting(true);
    setBroadcastProgress({ push: 0, whatsapp: 0, sms: 0, total: 1000 });

    // Simulate Waterfall Broadcast progression: Push -> WhatsApp -> SMS
    setTimeout(() => {
      setBroadcastProgress({ push: 780, whatsapp: 0, sms: 0, total: 1000 });
    }, 800);

    setTimeout(() => {
      setBroadcastProgress({ push: 780, whatsapp: 190, sms: 0, total: 1000 });
    }, 1800);

    setTimeout(() => {
      setBroadcastProgress({ push: 780, whatsapp: 190, sms: 30, total: 1000 });
      setIsBroadcasting(false);
      const newEntry: BroadcastHistory = {
        id: "bc-" + Math.floor(100 + Math.random() * 900),
        title,
        category,
        message,
        dispatchedAt: "Just now",
        appPushCount: 780,
        whatsappCount: 190,
        smsCount: 30,
        totalDelivered: 1000,
        status: "delivered",
      };
      setBroadcasts([newEntry, ...broadcasts]);
      setNotification("⚡ Waterfall Broadcast completed! 100% verified parent reach achieved.");
      setTitle("");
      setMessage("");
    }, 2800);
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
                Section 5: Campus Communications
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Triple-Tier Delivery Cascade
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              The Omnichannel Broadcast Studio
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-2xl">
              Execute urgent school-wide broadcasts through a cost-optimized waterfall: Instant App Push $\rightarrow$ Meta WhatsApp Message (if unread after 5 mins) $\rightarrow$ Failover Telecom SMS.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
            <span>🛡️</span>
            <span>DLT Filter &amp; Scrubbing Bypass</span>
          </div>
        </div>
      </div>

      {/* Composer & Active Telemetry Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Composer */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Compose Urgent Waterfall Broadcast</h2>

          <form onSubmit={handleStartBroadcast} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Broadcast Subject / Title</label>
              <input
                type="text"
                placeholder="e.g. Cyclone Michaung Heavy Rain School Closure..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category &amp; Priority</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
              >
                <option value="emergency_closure">🚨 Emergency School Closure (Overrides Quiet Hours)</option>
                <option value="fee_reminder">💳 Term Fee Payment Reminder</option>
                <option value="exam_notice">📝 Examination Schedule Release</option>
                <option value="event">🎉 Cultural &amp; Sports Event Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Body (Supports WhatsApp Formatting)</label>
              <textarea
                rows={4}
                placeholder="Type emergency alert message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-hidden leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isBroadcasting}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isBroadcasting ? "⚡ Executing Waterfall Delivery..." : "🚀 Launch Waterfall Broadcast (1,000 Parents)"}</span>
            </button>
          </form>
        </div>

        {/* Right Col: Live Delivery Waterfall Funnel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Live Delivery Telemetry Funnel</h2>
          <p className="text-xs text-slate-500">
            Visual cascade tracking message delivery across all three delivery tiers in real time.
          </p>

          <div className="space-y-4 pt-2">
            {/* Step 1: App Push */}
            <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-sky-900">Tier 1: Parent Portal App Push Notification</span>
                <span className="text-sky-700 font-mono">
                  {broadcastProgress ? broadcastProgress.push : 780} / 1,000 (78%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sky-200/60 overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full transition-all duration-500" style={{ width: `${broadcastProgress ? (broadcastProgress.push / 10) : 78}%` }} />
              </div>
              <div className="text-[10px] text-sky-800">Delivered instantly • Zero SMS telecom cost</div>
            </div>

            {/* Step 2: Meta WhatsApp */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-900">Tier 2: Meta WhatsApp Cloud API (5m Fallback)</span>
                <span className="text-emerald-700 font-mono">
                  {broadcastProgress ? broadcastProgress.whatsapp : 190} / 220 (86%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-200/60 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${broadcastProgress ? (broadcastProgress.whatsapp / 220 * 100) : 86}%` }} />
              </div>
              <div className="text-[10px] text-emerald-800">Dispatched to parents who did not open app within 5 minutes</div>
            </div>

            {/* Step 3: Telecom SMS Fallback */}
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-purple-900">Tier 3: Final Telecom SMS Failover</span>
                <span className="text-purple-700 font-mono">
                  {broadcastProgress ? broadcastProgress.sms : 30} / 30 (100%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-200/60 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: "100%" }} />
              </div>
              <div className="text-[10px] text-purple-800">Guaranteed delivery to feature phones or offline data devices</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <span className="font-bold">Total Verified Reach:</span>
              <span className="font-mono text-emerald-400 font-black text-sm">1,000 / 1,000 (100.0%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Past Broadcast Audits</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Notice Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">App Push</th>
                <th className="pb-3">WhatsApp</th>
                <th className="pb-3">SMS Fallback</th>
                <th className="pb-3">Dispatched At</th>
                <th className="pb-3 text-right">Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((bc) => (
                <tr key={bc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-slate-800">{bc.title}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {bc.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 text-sky-700 font-bold">{bc.appPushCount}</td>
                  <td className="py-3.5 text-emerald-700 font-bold">{bc.whatsappCount}</td>
                  <td className="py-3.5 text-purple-700 font-bold">{bc.smsCount}</td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">{bc.dispatchedAt}</td>
                  <td className="py-3.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ 100% Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
