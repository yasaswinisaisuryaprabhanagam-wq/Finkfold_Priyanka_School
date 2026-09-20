"use client";

import { useState } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  studentName: string;
  targetClass: string;
  parentName: string;
  parentPhone: string;
  referredBy: string;
  stage: "lead" | "tour_scheduled" | "doc_verification" | "enrolled";
  estAnnualFee: number;
  dateAdded: string;
}

const INITIAL_LEADS: Lead[] = [
  { id: "lead-101", studentName: "Ananya Sharma", targetClass: "Class 1", parentName: "Srikanth Sharma", parentPhone: "+91 98480 12345", referredBy: "Highway Billboard 01", stage: "tour_scheduled", estAnnualFee: 45000, dateAdded: "Sep 15, 2026" },
  { id: "lead-102", studentName: "Rohan Varma", targetClass: "Class 6", parentName: "Kishore Varma", parentPhone: "+91 94402 67890", referredBy: "Facebook Digital Ads", stage: "lead", estAnnualFee: 52000, dateAdded: "Sep 16, 2026" },
  { id: "lead-103", studentName: "Tanvi Reddy", targetClass: "Class 1", parentName: "Pradeep Reddy", parentPhone: "+91 82472 34567", referredBy: "Alumni / Word-of-Mouth", stage: "doc_verification", estAnnualFee: 45000, dateAdded: "Sep 12, 2026" },
  { id: "lead-104", studentName: "Aarav Gupta", targetClass: "Class 9", parentName: "Manish Gupta", parentPhone: "+91 79810 56789", referredBy: "Highway Billboard 01", stage: "enrolled", estAnnualFee: 60000, dateAdded: "Sep 08, 2026" },
  { id: "lead-105", studentName: "Diya Krishna", targetClass: "Class 1", parentName: "Sunil Krishna", parentPhone: "+91 94901 23456", referredBy: "Facebook Digital Ads", stage: "tour_scheduled", estAnnualFee: 45000, dateAdded: "Sep 17, 2026" },
  { id: "lead-106", studentName: "Karthik Nair", targetClass: "Class 1", parentName: "Ramesh Nair", parentPhone: "+91 91234 56780", referredBy: "Newspaper Pamphlets", stage: "lead", estAnnualFee: 45000, dateAdded: "Sep 18, 2026" },
];

const CAMPAIGN_ROI = [
  { source: "Highway Billboard 01", spend: 45000, inquiries: 18, tours: 14, enrolled: 12, revenue: 540000, roi: "12.0x", status: "High Performer" },
  { source: "Facebook Digital Ads", spend: 15000, inquiries: 42, tours: 18, enrolled: 6, revenue: 270000, roi: "18.0x", status: "High ROI" },
  { source: "Alumni / Word-of-Mouth", spend: 2000, inquiries: 24, tours: 20, enrolled: 16, revenue: 760000, roi: "380.0x", status: "Exceptional" },
  { source: "Newspaper Pamphlets", spend: 20000, inquiries: 4, tours: 2, enrolled: 1, revenue: 45000, roi: "2.25x", status: "Underperforming" },
];

export default function AdminAdmissionsCrmPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState<"funnel" | "roi" | "capacity">("funnel");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  function moveLeadStage(id: string, newStage: Lead["stage"]) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage: newStage } : l))
    );
    setNotification(`Updated pipeline stage for candidate #${id}`);
    setTimeout(() => setNotification(null), 4000);
  }

  const stageColumns: { id: Lead["stage"]; label: string; color: string; bg: string }[] = [
    { id: "lead", label: "New Leads", color: "text-blue-700", bg: "bg-blue-50/80 border-blue-200" },
    { id: "tour_scheduled", label: "Campus Tour", color: "text-amber-700", bg: "bg-amber-50/80 border-amber-200" },
    { id: "doc_verification", label: "Doc Verification", color: "text-purple-700", bg: "bg-purple-50/80 border-purple-200" },
    { id: "enrolled", label: "Final Enrolled", color: "text-emerald-700", bg: "bg-emerald-50/80 border-emerald-200" },
  ];

  const totalCapacityClass1 = 40;
  const currentEnrolledClass1 = 38; // 95%
  const capacityPct = Math.round((currentEnrolledClass1 / totalCapacityClass1) * 100);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>✨ {notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Section 1: Executive Intelligence</span>
              <span>·</span>
              <span>PowerSchool & Tableau Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              AI Enrollment Forecasting & Lead CRM
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Track prospective parents from billboard impression to classroom desk. Measure exact marketing ROI per rupee spent and leverage predictive capacity forecasting.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveTab("funnel")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "funnel" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setActiveTab("roi")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "roi" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Marketing ROI
            </button>
            <button
              onClick={() => setActiveTab("capacity")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "capacity" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Predictive Capacity
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl text-indigo-600 flex-shrink-0">
            📋
          </div>
          <div>
            <div className="text-2xl font-bold font-['Outfit'] text-slate-900">148</div>
            <div className="text-xs font-medium text-slate-600">Active Inquiries</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">+22% vs last year</div>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-xl text-sky-600 flex-shrink-0">
            🏫
          </div>
          <div>
            <div className="text-2xl font-bold font-['Outfit'] text-slate-900">92</div>
            <div className="text-xs font-medium text-slate-600">Tours Completed</div>
            <div className="text-[10px] text-slate-400 mt-0.5">62.1% tour rate</div>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl text-emerald-600 flex-shrink-0">
            🎓
          </div>
          <div>
            <div className="text-2xl font-bold font-['Outfit'] text-slate-900">58</div>
            <div className="text-xs font-medium text-slate-600">Confirmed Enrolled</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">₹26.1L Est. Revenue</div>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-xl text-purple-600 flex-shrink-0">
            ⚡
          </div>
          <div>
            <div className="text-2xl font-bold font-['Outfit'] text-slate-900">39.2%</div>
            <div className="text-xs font-medium text-slate-600">Conversion Rate</div>
            <div className="text-[10px] text-purple-600 font-medium mt-0.5">Industry avg: 28%</div>
          </div>
        </div>
      </div>

      {/* TAB 1: Pipeline Kanban */}
      {activeTab === "funnel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stageColumns.map((col) => {
            const stageLeads = leads.filter((l) => l.stage === col.id);
            return (
              <div key={col.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[320px]">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 italic">No candidates in this stage</div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div key={lead.id} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900">{lead.studentName}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                            {lead.targetClass}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Parent: <strong className="text-slate-700">{lead.parentName}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.parentPhone}</div>
                        <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 truncate max-w-[120px]">{lead.referredBy}</span>
                          <span className="font-bold text-emerald-700">₹{(lead.estAnnualFee / 1000).toFixed(0)}k</span>
                        </div>

                        {/* Quick Advance Controls */}
                        <div className="pt-1 flex items-center gap-1.5">
                          {col.id !== "lead" && (
                            <button
                              onClick={() => moveLeadStage(lead.id, col.id === "enrolled" ? "doc_verification" : col.id === "doc_verification" ? "tour_scheduled" : "lead")}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium"
                            >
                              ← Back
                            </button>
                          )}
                          {col.id !== "enrolled" && (
                            <button
                              onClick={() => moveLeadStage(lead.id, col.id === "lead" ? "tour_scheduled" : col.id === "tour_scheduled" ? "doc_verification" : "enrolled")}
                              className="text-[10px] px-2 py-0.5 rounded bg-purple-600 text-white hover:bg-purple-700 font-semibold ml-auto"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Marketing ROI Tracker */}
      {activeTab === "roi" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Marketing Channel ROI &amp; Revenue Attribution</h2>
              <p className="text-xs text-slate-500 mt-0.5">Correlating admission inquiries with referral sources to eliminate ad spend waste.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Total Revenue Generated: ₹16,15,000
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Ad Campaign Source</th>
                  <th className="pb-3">Spend (INR)</th>
                  <th className="pb-3">Inquiries</th>
                  <th className="pb-3">Campus Tours</th>
                  <th className="pb-3">Enrolled</th>
                  <th className="pb-3">Revenue Attribution</th>
                  <th className="pb-3">ROI Ratio</th>
                  <th className="pb-3 text-right">AI Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CAMPAIGN_ROI.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-slate-800">{c.source}</td>
                    <td className="py-3.5 text-slate-600 font-mono">₹{c.spend.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 text-slate-700 font-semibold">{c.inquiries}</td>
                    <td className="py-3.5 text-slate-700 font-semibold">{c.tours}</td>
                    <td className="py-3.5 font-bold text-emerald-700">{c.enrolled}</td>
                    <td className="py-3.5 font-bold text-slate-900">₹{c.revenue.toLocaleString("en-IN")}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        {c.roi}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "High Performer" || c.status === "Exceptional"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : c.status === "High ROI"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {c.status === "Underperforming" ? "Defund Campaign" : "Scale Budget"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Predictive Capacity Engine */}
      {activeTab === "capacity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Historical Dropout &amp; Retention Analytics</h3>
            <p className="text-xs text-slate-500">
              The AI engine analyzed 3 academic years of student roll retention across Primary and Middle wings.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Class 1 Capacity Utilization</span>
                  <span className="text-amber-700 font-bold">{currentEnrolledClass1} / {totalCapacityClass1} Seats ({capacityPct}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${capacityPct}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <span>⚠️</span>
                  <span>Critical Capacity Threshold Reached (95%)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Historical models indicate that Class 1 experiences a 4.2% relocation transfer attrition in May. AI projects exactly 2 vacant seats remaining for the incoming batch.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-semibold text-[11px]">Digital Admission Waitlist:</span>
                  <button
                    onClick={() => {
                      setWaitlistOpen(!waitlistOpen);
                      setNotification(waitlistOpen ? "Closed waitlist" : "Digital Waitlist automatically opened on public portal!");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      waitlistOpen ? "bg-rose-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {waitlistOpen ? "Disable Waitlist" : "Open Digital Waitlist Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Projected Intake 2027</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600">Nursery / LKG</span>
                <span className="font-bold text-emerald-700">75 / 80 (93%)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600">Class 6 (Middle Wing)</span>
                <span className="font-bold text-slate-800">48 / 50 (96%)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-600">Class 9 (Secondary)</span>
                <span className="font-bold text-purple-700">42 / 45 (93%)</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-[11px] text-purple-900">
              💡 <strong>AI Forecast</strong>: Total projected fee revenue for 2027–2028 is ₹1.42 Crores (+14.8% growth).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
