"use client";

import { useState } from "react";

interface MaintenanceWorkOrder {
  id: string;
  title: string;
  location: string;
  category: string;
  reportedBy: string;
  severity: "emergency" | "high" | "medium" | "low";
  assignedTechnician: string;
  status: "pending" | "assigned" | "technician_in_progress" | "resolved";
  reportedAt: string;
  assetId?: string;
}

interface SchoolAsset {
  assetId: string;
  name: string;
  location: string;
  repairCountPastYear: number;
  estReplacementCostInr: number;
  status: "good" | "under_watch" | "flagged_for_replacement";
}

const INITIAL_WORK_ORDERS: MaintenanceWorkOrder[] = [
  { id: "wo-104", title: "Split AC Water Leaking on Front Row Desks", location: "Room 101 - Primary Wing", category: "HVAC / Air Conditioning", reportedBy: "Mrs. Priyanka Devi", severity: "emergency", assignedTechnician: "Technician Ravi", status: "technician_in_progress", reportedAt: "Today at 08:30 AM", assetId: "AC-101-B" },
  { id: "wo-105", title: "Smartboard Display HDMI Flickering", location: "Room 302 - Senior Wing", category: "Electrical & Projector", reportedBy: "Mr. Sharma", severity: "high", assignedTechnician: "IT Team Lead Naresh", status: "assigned", reportedAt: "Today at 09:10 AM", assetId: "SB-4012" },
  { id: "wo-102", title: "Restroom Flush Valve Stuck Running", location: "Ground Floor Boys Washroom", category: "Plumbing", reportedBy: "Supervisor Srinu", severity: "medium", assignedTechnician: "Plumber Prasad", status: "resolved", reportedAt: "Yesterday at 02:00 PM" },
];

const SCHOOL_ASSETS: SchoolAsset[] = [
  { assetId: "SB-4012", name: "Interactive Smartboard 75\"", location: "Room 302", repairCountPastYear: 4, estReplacementCostInr: 65000, status: "flagged_for_replacement" },
  { assetId: "AC-101-B", name: "Daikin 2-Ton Inverter Split AC", location: "Room 101", repairCountPastYear: 3, estReplacementCostInr: 42000, status: "under_watch" },
  { assetId: "GEN-500KVA", name: "Kirloskar Diesel Generator", location: "Power Substation", repairCountPastYear: 1, estReplacementCostInr: 280000, status: "good" },
];

export default function AdminMaintenancePage() {
  const [orders, setOrders] = useState<MaintenanceWorkOrder[]>(INITIAL_WORK_ORDERS);
  const [assets, setAssets] = useState<SchoolAsset[]>(SCHOOL_ASSETS);
  const [activeTab, setActiveTab] = useState<"tickets" | "assets" | "preventative">("tickets");
  const [notification, setNotification] = useState<string | null>(null);

  function advanceStatus(orderId: string, nextStatus: MaintenanceWorkOrder["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    setNotification(`Work order #${orderId} updated to '${nextStatus.replace("_", " ").toUpperCase()}'`);
    setTimeout(() => setNotification(null), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                Section 5: Campus Operations
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Estate &amp; Facility Helpdesk
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Estate &amp; Facility Management Command
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-2xl">
              Centralized work order dispatch for campus plumbers, electricians, and IT staff. Track equipment depreciation and schedule automated quarterly preventative maintenance.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "tickets" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Work Orders
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "assets" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Asset Depreciation
            </button>
            <button
              onClick={() => setActiveTab("preventative")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "preventative" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Preventative Schedule
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Work Order Ticketing Board */}
      {activeTab === "tickets" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Campus Facility Repair Requests</h2>
            <span className="text-xs text-slate-400">Synced directly with teacher emergency buttons</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((wo) => (
              <div key={wo.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{wo.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      wo.severity === "emergency"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {wo.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Location: <strong className="text-slate-700">{wo.location}</strong> • Category: {wo.category}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Reported by: {wo.reportedBy} ({wo.reportedAt}) • Assigned: <strong className="text-slate-700">{wo.assignedTechnician}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    wo.status === "resolved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : wo.status === "technician_in_progress"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {wo.status === "resolved" ? "✓ Resolved" : wo.status === "technician_in_progress" ? "🔧 In Progress" : "⏳ Assigned"}
                  </span>

                  {wo.status !== "resolved" && (
                    <button
                      onClick={() => advanceStatus(wo.id, wo.status === "assigned" ? "technician_in_progress" : "resolved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs"
                    >
                      {wo.status === "assigned" ? "Start Repair" : "Mark Resolved ✓"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Asset Depreciation & Replacement Tracker */}
      {activeTab === "assets" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Capital Asset Health &amp; End-of-Life Radar</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assets with &gt;4 repair cycles in 12 months are auto-flagged for budget replacement.</p>
            </div>
            <span className="text-xs font-bold text-rose-700 px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
              1 Asset Flagged for FY27 Replacement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Asset ID</th>
                  <th className="pb-3">Equipment Name</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Repairs (Past 12M)</th>
                  <th className="pb-3">Est. Replacement Cost</th>
                  <th className="pb-3 text-right">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a) => (
                  <tr key={a.assetId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">{a.assetId}</td>
                    <td className="py-3.5 font-bold text-slate-800">{a.name}</td>
                    <td className="py-3.5 text-slate-600">{a.location}</td>
                    <td className="py-3.5">
                      <span className={`font-extrabold ${a.repairCountPastYear >= 4 ? "text-rose-600" : "text-slate-700"}`}>
                        {a.repairCountPastYear} Tickets
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">₹{a.estReplacementCostInr.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === "flagged_for_replacement"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : a.status === "under_watch"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {a.status === "flagged_for_replacement" ? "🚨 Flagged for Budget Replacement" : a.status === "under_watch" ? "⚠️ Under Watch" : "✓ Optimal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Preventative Maintenance Alerts */}
      {activeTab === "preventative" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Mandatory Quarterly Preventative Maintenance</h2>
            <span className="text-xs text-slate-400">Automated SLA Compliance</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">Overhead Drinking Water Tanks Cleaning &amp; Chlorination</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Mandatory health inspection • Target Date: Sep 25, 2026 (5 Days Remaining)</div>
              </div>
              <button
                onClick={() => {
                  setNotification("✓ Water Tank cleaning certificate logged and verified!");
                  setTimeout(() => setNotification(null), 4000);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
              >
                Log Certificate ✓
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">Campus Fire Extinguisher Pressure Audit</div>
                <div className="text-[11px] text-slate-500 mt-0.5">All 24 cylinders inspected across blocks A, B, and C • Next Due: Dec 10, 2026</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ Inspected Last Month
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
