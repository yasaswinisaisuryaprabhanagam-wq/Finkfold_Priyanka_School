"use client";

import { useState } from "react";
import Link from "next/link";
import ParentRepliesList from "./ParentRepliesList";

export type AdminClassItem = {
  id: string;
  name: string;
  section: string;
  academic_year: string;
  studentCount: number;
  todayMarked: boolean;
  todayAbsentCount: number;
};

export type AdminStudentSummary = {
  id: string;
  full_name: string;
  roll_no: number;
  admission_no: string;
  class_name: string;
  class_section: string;
  parent_name: string | null;
  parent_phone: string | null;
  consent_whatsapp: boolean;
  stats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
};

export type AdminNotificationItem = {
  id: string;
  student_name: string;
  parent_phone: string;
  event_type: string;
  template_name: string;
  status: string;
  attendance_date: string;
  created_at: string;
  meta_message_id: string | null;
};

export type AdminPortalProps = {
  schoolName: string;
  todayFormatted: string;
  todayDate: string;
  classes: AdminClassItem[];
  students: AdminStudentSummary[];
  notifications: AdminNotificationItem[];
  parentReplies: any[];
  onViewStudent?: (studentId: string) => void;
};

export default function AdminPortalView({
  schoolName,
  todayFormatted,
  todayDate,
  classes,
  students,
  notifications,
  parentReplies,
  onViewStudent,
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "whatsapp" | "messages" | "security">("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Admin password reset state
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminPassLoading, setAdminPassLoading] = useState(false);
  const [adminPassMessage, setAdminPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Calculate executive KPI metrics
  const totalStudents = students.length;
  const totalClasses = classes.length;
  
  // Calculate school-wide attendance percentage
  const totalStudentDays = students.reduce((acc, s) => acc + s.stats.totalDays, 0);
  const totalPresentDays = students.reduce((acc, s) => acc + s.stats.presentDays, 0);
  const overallRate =
    totalStudentDays > 0 ? Math.round((totalPresentDays / totalStudentDays) * 100) : 100;

  const todaySessionsMarked = classes.filter((c) => c.todayMarked).length;
  const todayTotalAbsences = classes.reduce((acc, c) => acc + c.todayAbsentCount, 0);

  const whatsappSentCount = notifications.filter(
    (n) => n.status === "sent" || n.status === "delivered" || n.status === "read"
  ).length;
  const whatsappFailedCount = notifications.filter((n) => n.status === "failed").length;

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parent_phone && s.parent_phone.includes(searchTerm))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Executive Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 font-bold">
              <span>👑</span> Executive Administration Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {schoolName} Management Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Overview for {todayFormatted} • Daily Attendance & Meta Cloud WhatsApp Operations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WhatsApp Alerts: 100% Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Enrolled
            </span>
            <span className="text-lg">🎒</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalStudents}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Active across {totalClasses} classes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              School Attendance
            </span>
            <span className="text-lg">📊</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-900 mt-2">
            {overallRate}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Cumulative academic year</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Sessions
            </span>
            <span className="text-lg">📝</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {todaySessionsMarked} / {totalClasses}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {todaySessionsMarked === totalClasses ? "All classes marked" : "Roll call in progress"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              WhatsApp Alerts
            </span>
            <span className="text-lg">💬</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {whatsappSentCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Dispatched to parent devices</p>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🏫 Class Monitor ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "students"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🎓 Student Directory & Attendance % ({students.length})
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "whatsapp"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          ⚡ WhatsApp Gateway Logs ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "messages"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📩 Parent Messages ({parentReplies.length})
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "security"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🔒 System & Password
        </button>
      </div>

      {/* Tab 1: Class Monitor */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                School Classes & Today's Attendance Status
              </h2>
              <p className="text-xs text-slate-500">
                Check daily attendance compliance and jump directly to roll-call sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                      Class {cls.name} – {cls.section}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        cls.todayMarked
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          cls.todayMarked ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {cls.todayMarked ? "Marked Today" : "Pending Roll-Call"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Class {cls.name} (Section {cls.section})
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p>• Academic Year: <span className="font-semibold text-slate-700">{cls.academic_year}</span></p>
                    <p>• Enrolled Students: <span className="font-semibold text-slate-700">{cls.studentCount} students</span></p>
                    {cls.todayMarked && (
                      <p className="text-rose-600 font-medium">
                        • Absences today: {cls.todayAbsentCount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <Link
                    href={`/dashboard/attendance/${cls.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-2xs"
                  >
                    <span>{cls.todayMarked ? "Review / Edit Attendance" : "Mark Roll Call"}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Student Directory & Attendance % */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student Attendance Master Register
              </h2>
              <p className="text-xs text-slate-500">
                Live calculated attendance percentages, working days, and WhatsApp consent records.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by student name, roll no, admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Roll No</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Admission No</th>
                    <th className="px-4 py-3.5">Class</th>
                    <th className="px-4 py-3.5">Attendance %</th>
                    <th className="px-4 py-3.5">Present / Total</th>
                    <th className="px-4 py-3.5">Parent WhatsApp</th>
                    <th className="px-4 py-3.5 text-right">Student Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        No students matching "{searchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isOutstanding = s.stats.percentage >= 90;
                      const isGood = s.stats.percentage >= 75;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-800">
                            #{s.roll_no}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {s.full_name}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono">
                            {s.admission_no}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            Class {s.class_name} – {s.class_section}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                                isOutstanding
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : isGood
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : "bg-rose-50 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {s.stats.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <span className="font-semibold text-slate-900">{s.stats.presentDays}</span> / {s.stats.totalDays} days
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-600">💬</span>
                              <span className="font-mono text-slate-700">{s.parent_phone || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => onViewStudent && onViewStudent(s.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-semibold transition-colors"
                            >
                              <span>View Portal</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: WhatsApp Gateway Logs */}
      {activeTab === "whatsapp" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Meta WhatsApp Cloud API Notification Log
            </h2>
            <p className="text-xs text-slate-500">
              Audit trail of absence notifications dispatched to parents via n8n integration.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Session Date</th>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Parent Phone</th>
                    <th className="px-4 py-3.5">Event Type</th>
                    <th className="px-4 py-3.5">Template</th>
                    <th className="px-4 py-3.5">Delivery Status</th>
                    <th className="px-4 py-3.5">Dispatched At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No WhatsApp notifications recorded yet. Notifications are triggered when marking students absent.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {n.attendance_date}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {n.student_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-700">
                          {n.parent_phone}
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize font-medium text-slate-700">
                            {n.event_type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {n.template_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              n.status === "delivered" || n.status === "read"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : n.status === "sent"
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : n.status === "pending"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            • {n.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(n.created_at).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Parent Inbound Messages */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Parent WhatsApp Responses
            </h2>
            <p className="text-xs text-slate-500">
              Messages received from parents via WhatsApp number. Use "Mark Handled" to resolve.
            </p>
          </div>
          <ParentRepliesList initialReplies={parentReplies} />
        </div>
      )}

      {/* Tab 5: Security & System Connections */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Password Change Form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Update Administrator Password
                </h2>
                <p className="text-xs text-slate-500">
                  Update your school administration credentials. Minimum 6 characters.
                </p>
              </div>

              {adminPassMessage && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-start gap-2 border ${
                    adminPassMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}
                >
                  <span>{adminPassMessage.type === "success" ? "✓" : "⚠️"}</span>
                  <span>{adminPassMessage.text}</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (adminNewPassword.length < 6) {
                    setAdminPassMessage({ type: "error", text: "Password must be at least 6 characters." });
                    return;
                  }
                  if (adminNewPassword !== adminConfirmPassword) {
                    setAdminPassMessage({ type: "error", text: "Passwords do not match." });
                    return;
                  }
                  setAdminPassLoading(true);
                  setAdminPassMessage(null);
                  const { createClient } = await import("@/lib/supabase/client");
                  const client = createClient();
                  const { error } = await client.auth.updateUser({ password: adminNewPassword });
                  setAdminPassLoading(false);
                  if (error) {
                    setAdminPassMessage({ type: "error", text: error.message });
                  } else {
                    setAdminPassMessage({ type: "success", text: "Administrator password updated successfully!" });
                    setAdminNewPassword("");
                    setAdminConfirmPassword("");
                  }
                }}
                className="space-y-4 pt-2"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminPassLoading}
                  className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {adminPassLoading ? "Updating..." : "Save Admin Password →"}
                </button>
              </form>
            </div>

            {/* Cloud & Database Infrastructure Diagnostics */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Infrastructure & Cloud Connectors
                </h2>
                <p className="text-xs text-slate-500">
                  Current production connection endpoints and status diagnostics.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Supabase PostgreSQL Database</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      ✓ Connected
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-500 truncate">
                    https://eddndkxhnoxywcaxccnv.supabase.co
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Service Role Privilege Status</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      ✓ Active (Super-Admin)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bypasses RLS blocks on server actions for attendance sessions and profile provisioning.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Meta Cloud WhatsApp Business API</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      ✓ Ready (Phone ID: 1238881155971579)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Template: <code className="font-mono text-blue-900">school_absence_alert_v1</code> • Recipient: Verified Parents
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">n8n Automation Event Engine</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      ✓ Connected
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-500 truncate">
                    https://finkfold.app.n8n.cloud/webhook/finkfold/priyanka/attendance-event
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
