"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  DoorOpen,
  ShieldAlert,
  Search,
  ShoppingBag,
  HelpCircle,
  HeartPulse,
  MessageSquare,
  X,
  Plus,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function StudentQuickActionModal() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      title: "Apply for Leave / On-Duty",
      description: "Submit sick, medical leave or OD for inter-school sports & competitions.",
      icon: Calendar,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      href: "/portal/student/leaves",
      badge: "Faculty Sync",
    },
    {
      title: "Request Digital Out-Pass",
      description: "Parent-authorized RFID gate pass for medical outing or weekend leave.",
      icon: DoorOpen,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      href: "/portal/student/outpass",
      badge: "Gate QR",
    },
    {
      title: "SafeSpace Confidential Report",
      description: "100% anonymous report directly to Principal and senior counselor.",
      icon: ShieldAlert,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      href: "/portal/student/safespace",
      badge: "Encrypted",
    },
    {
      title: "Claim Lost & Found Property",
      description: "Verify your unique mark to have misplaced items delivered to class.",
      icon: Search,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      href: "/portal/student/lost-found",
      badge: "Desk Delivery",
    },
    {
      title: "Campus Store & Uniform Order",
      description: "Pre-order blazers, notebooks, ties & lab kits for express pickup.",
      icon: ShoppingBag,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      href: "/portal/student/store",
      badge: "Counter Pickup",
    },
    {
      title: "Update Emergency Medical Alert",
      description: "Update severe allergies, chronic conditions, and pediatrician contact.",
      icon: HeartPulse,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      href: "/portal/student/health",
      badge: "Infirmary Sync",
    },
    {
      title: "Raise Helpdesk Ticket",
      description: "Direct request to transport, fee accounts, or administrative records.",
      icon: HelpCircle,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      href: "/portal/student/documents",
      badge: "SLA Tracked",
    },
    {
      title: "Message Teacher / PTM Slot",
      description: "Send official query within office hours or book parent-teacher meeting.",
      icon: MessageSquare,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      href: "/portal/student/ptm-messages",
      badge: "Office Hours",
    },
  ];

  return (
    <>
      {/* Plus Trigger Button in Topbar */}
      <button
        onClick={() => setIsOpen(true)}
        title="Student Quick Actions"
        aria-label="Student Quick Actions"
        className="h-8 w-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-sm font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  Instant Self-Service Desk
                </div>
                <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Quick Student Actions
                </h2>
                <p className="text-xs text-slate-500">
                  Select an action below to instantly initiate a request synced directly to Faculty and Administration.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {quickActions.map((action, i) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={i}
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                    className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all flex items-start gap-3 group shadow-2xs hover:shadow-xs"
                  >
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${action.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {action.title}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/70 whitespace-nowrap">
                          {action.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>All submissions update Supabase in real-time.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
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
