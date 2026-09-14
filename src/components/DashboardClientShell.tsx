"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AdminPortalView, {
  AdminClassItem,
  AdminStudentSummary,
  AdminNotificationItem,
} from "./AdminPortalView";
import StudentPortalView, { StudentAttendanceSummary } from "./StudentPortalView";
import ParentRepliesList from "./ParentRepliesList";

export type DashboardClientShellProps = {
  school: {
    id: string;
    name: string;
    supportPhone: string;
  };
  profile: {
    id: string;
    full_name: string;
    role: string;
  };
  todayFormatted: string;
  todayDate: string;
  teacherClasses: any[];
  allClasses: AdminClassItem[];
  allStudents: AdminStudentSummary[];
  studentAttendanceSummaries: StudentAttendanceSummary[];
  whatsappNotifications: AdminNotificationItem[];
  parentReplies: any[];
  initialView?: "faculty" | "admin" | "student";
  initialStudentId?: string;
};

export default function DashboardClientShell({
  school,
  profile,
  todayFormatted,
  todayDate,
  teacherClasses,
  allClasses,
  allStudents,
  studentAttendanceSummaries,
  whatsappNotifications,
  parentReplies,
  initialView,
  initialStudentId,
}: DashboardClientShellProps) {
  const defaultView =
    initialView ||
    (profile.role === "school_admin" || profile.role === "super_admin"
      ? "admin"
      : "faculty");

  const [activeView, setActiveView] = useState<"faculty" | "admin" | "student">(defaultView);
  const [facultySubTab, setFacultySubTab] = useState<"classes" | "schedule" | "homework" | "messages" | "security">("classes");

  // Faculty Password Reset State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();
  
  // Default to Kiran (PRIY-2026-002) if available
  const defaultStudentId =
    initialStudentId ||
    studentAttendanceSummaries.find((s) => s.student.admission_no === "PRIY-2026-002")?.student.id ||
    studentAttendanceSummaries[0]?.student.id ||
    "";

  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudentId);

  function handleViewChange(view: "faculty" | "admin" | "student", studentId?: string) {
    setActiveView(view);
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    const params = new URLSearchParams(window.location.search);
    params.set("view", view);
    if (studentId) {
      params.set("studentId", studentId);
    } else if (view !== "student") {
      params.delete("studentId");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, "", newUrl);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const studentParam = params.get("studentId");
    if (viewParam === "faculty" || viewParam === "admin" || viewParam === "student") {
      setActiveView(viewParam);
    }
    if (studentParam) {
      setSelectedStudentId(studentParam);
    }
  }, []);

  async function handleFacultyPasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPassLoading(true);
    setPassMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPassLoading(false);

    if (error) {
      setPassMessage({ type: "error", text: error.message });
    } else {
      setPassMessage({ type: "success", text: "Faculty account password has been successfully updated!" });
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  // Sample Faculty Teaching Schedule
  const teacherSchedule = [
    { period: 1, time: "08:30 AM - 09:15 AM", class: "Class 10-A", subject: "Mathematics & Roll Call", room: "Room 101" },
    { period: 3, time: "10:15 AM - 11:00 AM", class: "Class 9-B", subject: "Mathematics", room: "Room 204" },
    { period: 5, time: "12:30 PM - 01:15 PM", class: "Class 10-A", subject: "Problem Solving Lab", room: "Room 101" },
    { period: 7, time: "02:15 PM - 03:00 PM", class: "Class 10-A", subject: "Computer Science & IT", room: "Comp Lab" },
  ];

  return (
    <div className="space-y-8">
      {/* Universal Role & Portal Switcher Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-2 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden md:inline">
              Portals:
            </span>

            {/* 1. Faculty Tab */}
            <button
              onClick={() => handleViewChange("faculty")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeView === "faculty"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>👨‍🏫</span>
              <span>Faculty Portal</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeView === "faculty" ? "bg-blue-800 text-blue-100" : "bg-slate-200 text-slate-700"
                }`}
              >
                {teacherClasses.length} {teacherClasses.length === 1 ? "Class" : "Classes"}
              </span>
            </button>

            {/* 2. School Admin Tab */}
            <button
              onClick={() => handleViewChange("admin")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeView === "admin"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>👑</span>
              <span>School Admin Portal</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeView === "admin" ? "bg-blue-800 text-blue-100" : "bg-slate-200 text-slate-700"
                }`}
              >
                Executive
              </span>
            </button>

            {/* 3. Student Portal Tab */}
            <button
              onClick={() => handleViewChange("student")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeView === "student"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>🎓</span>
              <span>Student Portal</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeView === "student" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
                }`}
              >
                Attendance %
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 pr-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Logged in as: <strong className="text-slate-800">{profile.full_name}</strong> ({profile.role})</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Faculty / Teacher Portal */}
      {activeView === "faculty" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Faculty Workspace • {school.name}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, {profile.full_name}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Today is {todayFormatted} • Daily Attendance & Homework Desk
                </p>
              </div>

              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Meta WhatsApp Gateway: Operational ({school.supportPhone})</span>
              </div>
            </div>
          </div>

          {/* Teacher Sub-navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setFacultySubTab("classes")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                facultySubTab === "classes"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              📋 Assigned Classes ({teacherClasses.length})
            </button>
            <button
              onClick={() => setFacultySubTab("schedule")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                facultySubTab === "schedule"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              🗓️ Today's Teaching Schedule
            </button>
            <button
              onClick={() => setFacultySubTab("messages")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                facultySubTab === "messages"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              💬 Parent WhatsApp Replies ({parentReplies.length})
            </button>
            <button
              onClick={() => setFacultySubTab("security")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                facultySubTab === "security"
                  ? "bg-blue-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              🔒 Change Password
            </button>
          </div>

          {/* Subtab 1: Classes */}
          {facultySubTab === "classes" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Your Assigned Classes
                </h2>
                <p className="text-xs text-slate-500">
                  Select a class to mark daily roll-call. Absences automatically dispatch WhatsApp notifications to parent phones.
                </p>
              </div>

              {teacherClasses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                  <span className="text-3xl">📋</span>
                  <h3 className="text-base font-semibold text-slate-800">
                    No Classes Configured Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Please ensure the database has been seeded.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {teacherClasses.map((item: any) => {
                    const cls = item.classes || item;
                    if (!cls) return null;
                    return (
                      <div
                        key={cls.id || item.class_id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                              Class {cls.name} – {cls.section}
                            </span>
                            <span className="text-xs text-slate-400">
                              {cls.academic_year}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Class {cls.name} (Section {cls.section})
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            English Medium • Daily Session Ready
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/attendance/${cls.id || item.class_id}`}
                          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-900 text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-2xs active:scale-[0.98]"
                        >
                          <span>Mark Roll Call</span>
                          <span>→</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subtab 2: Today's Schedule */}
          {facultySubTab === "schedule" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Today's Faculty Teaching Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  Assigned classroom and laboratory periods for {todayFormatted}.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Period</th>
                      <th className="px-4 py-3.5">Time</th>
                      <th className="px-4 py-3.5">Class</th>
                      <th className="px-4 py-3.5">Subject</th>
                      <th className="px-4 py-3.5">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {teacherSchedule.map((ts, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">Period {ts.period}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{ts.time}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{ts.class}</td>
                        <td className="px-4 py-3 font-semibold text-blue-900">{ts.subject}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{ts.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 3: Parent WhatsApp Messages */}
          {facultySubTab === "messages" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Parent WhatsApp Responses
                </h2>
                <p className="text-xs text-slate-500">
                  Inbound replies received from parents via WhatsApp number {school.supportPhone}.
                </p>
              </div>
              <ParentRepliesList initialReplies={parentReplies || []} />
            </div>
          )}

          {/* Subtab 4: Change Password */}
          {facultySubTab === "security" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4 max-w-xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Update Faculty Account Password
                </h2>
                <p className="text-xs text-slate-500">
                  Update your portal credentials. Minimum 6 characters required.
                </p>
              </div>

              {passMessage && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-start gap-2 border ${
                    passMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}
                >
                  <span>{passMessage.type === "success" ? "✓" : "⚠️"}</span>
                  <span>{passMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleFacultyPasswordUpdate} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {passLoading ? "Updating Password..." : "Save New Password →"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: School Admin Portal */}
      {activeView === "admin" && (
        <AdminPortalView
          schoolName={school.name}
          todayFormatted={todayFormatted}
          todayDate={todayDate}
          classes={allClasses}
          students={allStudents}
          notifications={whatsappNotifications}
          parentReplies={parentReplies}
          onViewStudent={(studentId) => handleViewChange("student", studentId)}
        />
      )}

      {/* VIEW 3: Student Academic & Attendance Portal */}
      {activeView === "student" && (
        <StudentPortalView
          allStudentsData={studentAttendanceSummaries}
          currentStudentId={selectedStudentId}
        />
      )}
    </div>
  );
}
