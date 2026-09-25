"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  BookOpen,
  LineChart,
  ShieldAlert,
  HeartPulse,
  PackageSearch,
  Box,
  Wrench,
  BellRing,
  Palmtree,
  X,
  Plus,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function FacultyQuickActionModal() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      title: "Daily Attendance & Roll Call",
      description: "Mark morning session roll call for your homeroom and assigned sections.",
      icon: ClipboardCheck,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      href: "/portal/faculty",
      badge: "Morning Session",
    },
    {
      title: "Assign Homework & Study Materials",
      description: "Post classwork, physical-to-digital assignments, and reference documents.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      href: "/portal/faculty/homework",
      badge: "Evening Diary",
    },
    {
      title: "Enter Exam Marks & AI Radar",
      description: "Input student assessment scores, import bulk OMR CSV, and trigger remedial drills.",
      icon: LineChart,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      href: "/portal/faculty/academics",
      badge: "AI Remedial",
    },
    {
      title: "Issue Conduct & Merit Points",
      description: "Award student stars or issue disciplinary infractions with parent e-sign lock.",
      icon: ShieldAlert,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      href: "/portal/faculty/conduct",
      badge: "Parent E-Sign",
    },
    {
      title: "Log Infirmary & Trauma Visit",
      description: "Report playground injuries or fever with instant WhatsApp parent notifications.",
      icon: HeartPulse,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      href: "/portal/faculty/infirmary",
      badge: "Nurse Alert",
    },
    {
      title: "Snap Lost & Found Item",
      description: "Photograph and catalog misplaced articles for classroom locker retrieval.",
      icon: PackageSearch,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      href: "/portal/faculty/lost-found",
      badge: "Desk Delivery",
    },
    {
      title: "Store Indent Requisition",
      description: "Order whiteboard markers, lab consumables, and classroom stationery.",
      icon: Box,
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      href: "/portal/faculty/store-indent",
      badge: "Store Pickup",
    },
    {
      title: "Campus Helpdesk / Repair",
      description: "Report electrical, AC, or smartboard faults directly to Facility Estate Manager.",
      icon: Wrench,
      color: "bg-orange-50 text-orange-700 border-orange-200",
      href: "/portal/faculty/maintenance",
      badge: "SLA Tracked",
    },
    {
      title: "Publish School Circular",
      description: "Broadcast official academic circulars, exam notifications, and event news.",
      icon: BellRing,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      href: "/portal/faculty/circulars",
      badge: "Broadcast",
    },
    {
      title: "Apply for Faculty Leave",
      description: "Submit casual, sick, or earned leave requests directly to Principal's desk.",
      icon: Palmtree,
      color: "bg-lime-50 text-lime-700 border-lime-200",
      href: "/portal/faculty/hr",
      badge: "HR Balance",
    },
  ];

  return (
    <>
      {/* Plus Trigger Button in Topbar */}
      <button
        onClick={() => setIsOpen(true)}
        title="Faculty Quick Actions"
        aria-label="Faculty Quick Actions"
        className="h-8 w-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-sm font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Modal Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 space-y-4 max-h-[85vh] overflow-y-auto relative animate-scale-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Faculty Command Center &bull; Fast Action Hub
                </div>
                <h2
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  ⚡ One-Tap Classroom &amp; Campus Workflows
                </h2>
                <p className="text-xs text-slate-500">
                  Instantly execute daily pedagogical tasks, issue conduct marks, or requisition campus supplies.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                    className="group p-3.5 rounded-2xl border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-start gap-3 relative shadow-2xs hover:shadow-xs"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${action.color}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 overflow-hidden pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                          {action.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                          {action.badge}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Open <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Modal Footer Note */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>All updates sync in real time across Student, Parent, and Admin portals.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
