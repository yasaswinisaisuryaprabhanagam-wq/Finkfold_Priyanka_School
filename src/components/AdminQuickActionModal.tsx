"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  UserPlus,
  Users,
  Printer,
  Radio,
  ShieldCheck,
  Target,
  Wrench,
  FileSpreadsheet,
  Building,
  Plus,
  X,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function AdminQuickActionModal() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      title: "Fee Counter & Cash POS",
      description: "Collect counter payments, print dual-copy receipts, and balance active cash drawer.",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      href: "/portal/admin/fees",
      badge: "Cash / UPI POS",
    },
    {
      title: "Student Registry & Enrollment",
      description: "Enroll newly admitted students, assign sections, and update roll numbers.",
      icon: UserPlus,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      href: "/portal/admin/students",
      badge: "Admission Desk",
    },
    {
      title: "AI Enrollment & Lead CRM",
      description: "Capture parent walk-in inquiries, schedule campus walk-throughs, and convert leads.",
      icon: Target,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      href: "/portal/admin/admissions/crm",
      badge: "Lead Pipeline",
    },
    {
      title: "Staff Directory & Faculty Roster",
      description: "Manage teaching staff, review class-teacher allocations, and update HR profiles.",
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      href: "/portal/admin/staff",
      badge: "Faculty HR",
    },
    {
      title: "Certificate & Print Studio",
      description: "Generate Study, Bonafide, Character, and Bank Education Loan fee estimate sheets.",
      icon: Printer,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      href: "/portal/admin/documents",
      badge: "QR Tamper-Proof",
    },
    {
      title: "Central Treasury & Tally Sync",
      description: "Audit multi-branch collections, review drawer variances, and export Tally XML.",
      icon: Building,
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      href: "/portal/admin/treasury",
      badge: "Multi-Campus",
    },
    {
      title: "Defaulter Engine & Waiver Desk",
      description: "Compute daily late fees, dispatch WhatsApp payment links, and issue Chairman waivers.",
      icon: FileSpreadsheet,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      href: "/portal/admin/fees/defaulters",
      badge: "Auto Late-Fee",
    },
    {
      title: "Visitor Management (VMS)",
      description: "Log visitor identity at front gate, issue digital badges, and record check-out times.",
      icon: ShieldCheck,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      href: "/portal/admin/visitors",
      badge: "Gatepass VMS",
    },
    {
      title: "Waterfall Broadcast Studio",
      description: "Dispatch urgent campus alerts, parent notices, and WhatsApp circular announcements.",
      icon: Radio,
      color: "bg-violet-50 text-violet-700 border-violet-200",
      href: "/portal/admin/broadcast",
      badge: "WhatsApp Broadcast",
    },
    {
      title: "BoD Executive Pitch Deck",
      description: "Autonomously compile live cross-campus telemetry into an executive Boardroom packet.",
      icon: Wrench,
      color: "bg-slate-100 text-slate-800 border-slate-300",
      href: "/portal/admin/hq-reporting",
      badge: "BoD Deck",
    },
  ];

  return (
    <>
      {/* Plus Trigger Button in Topbar */}
      <button
        onClick={() => setIsOpen(true)}
        title="Admin Quick Actions"
        aria-label="Admin Quick Actions"
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
                  Admin Executive Command &bull; Rapid Action Hub
                </div>
                <h2
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  ⚡ One-Tap Administrative &amp; Leadership Operations
                </h2>
                <p className="text-xs text-slate-500">
                  Quick shortcuts to high-frequency actions across revenue, student records, HR, and institutional compliance.
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
              <span>All updates sync securely with Finkfold EdOS database in real time.</span>
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
