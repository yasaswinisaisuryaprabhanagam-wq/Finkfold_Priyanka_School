"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type StudentAttendanceSummary = {
  student: {
    id: string;
    full_name: string;
    roll_no: number;
    admission_no: string;
    parent_name: string | null;
    parent_phone: string | null;
    class_name: string;
    class_section: string;
    academic_year: string;
  };
  stats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
  history: {
    id: string;
    date: string;
    status: "present" | "absent";
    note: string | null;
  }[];
};

export default function StudentPortalView({
  allStudentsData,
  currentStudentId,
}: {
  allStudentsData: StudentAttendanceSummary[];
  currentStudentId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string>(
    currentStudentId || allStudentsData[0]?.student.id || "-"
  );
  const [activeTab, setActiveTab] = useState<"attendance" | "timetable" | "homework" | "circulars" | "security">("attendance");

  // In-portal password reset states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const activeData =
    allStudentsData.find((s) => s.student.id === selectedId) ||
    allStudentsData[0];

  if (!activeData) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        No student records found.
      </div>
    );
  }

  const { student, stats, history } = activeData;

  const isGoodAttendance = stats.percentage >= 75;
  const isExcellent = stats.percentage >= 90;

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "Password must be at least 6 characters." });
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
      setPassMessage({ type: "success", text: "Password successfully updated! Keep your new credentials safe." });
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  // Sample Daily Timetable for Class 10-A
  const timetable = [
    { period: 1, time: "08:30 AM - 09:15 AM", subject: "Mathematics", teacher: "Mr. K. Rao", room: "Room 101" },
    { period: 2, time: "09:15 AM - 10:00 AM", subject: "Physical Science", teacher: "Mrs. Sarita", room: "Physics Lab" },
    { period: 3, time: "10:15 AM - 11:00 AM", subject: "English Language", teacher: "Ms. Lakshmi", room: "Room 101" },
    { period: 4, time: "11:00 AM - 11:45 AM", subject: "First Language (Telugu / Hindi)", teacher: "Mr. Srinivas", room: "Room 101" },
    { period: 5, time: "12:30 PM - 01:15 PM", subject: "Social Studies", teacher: "Mrs. Anasuya", room: "Room 101" },
    { period: 6, time: "01:15 PM - 02:00 PM", subject: "Biological Science", teacher: "Dr. P. V. Reddy", room: "Bio Lab" },
    { period: 7, time: "02:15 PM - 03:00 PM", subject: "Computer Science & IT", teacher: "Mr. Kiran (Faculty)", room: "Comp Lab" },
    { period: 8, time: "03:00 PM - 03:45 PM", subject: "Sports & Physical Education", teacher: "Coach Naidu", room: "Main Ground" },
  ];

  // Active Homework Assignments
  const homeworkList = [
    {
      subject: "Mathematics",
      topic: "Quadratic Equations: Exercise 4.2 Problems 1 to 10",
      dueDate: "Tomorrow, 8:30 AM",
      status: "pending",
      assignedBy: "Mr. K. Rao",
    },
    {
      subject: "Physical Science",
      topic: "Refraction of Light: Diagram and Laboratory Observation Report",
      dueDate: "Sep 15, 2026",
      status: "submitted",
      assignedBy: "Mrs. Sarita",
    },
    {
      subject: "Social Studies",
      topic: "National Movement: Timeline Chart (1919 - 1947)",
      dueDate: "Sep 16, 2026",
      status: "pending",
      assignedBy: "Mrs. Anasuya",
    },
  ];

  // Official Circulars
  const circulars = [
    {
      date: "Sep 12, 2026",
      title: "Quarterly Examination Schedule Notification",
      category: "Academic",
      content: "Quarterly examinations for Class 10 will commence from September 22, 2026. Detailed subject-wise syllabus has been distributed in class.",
    },
    {
      date: "Sep 10, 2026",
      title: "Mandatory NEP 2020 Vocational Bagless Day",
      category: "NEP Mandate",
      content: "As per NEP 2020 guidelines, Saturday September 19 will be a Bagless Vocational Day focusing on Science Robotics and Carpentry crafts.",
    },
    {
      date: "Sep 05, 2026",
      title: "WhatsApp Attendance Alert Verification Completed",
      category: "Administration",
      content: "All parent WhatsApp contact numbers have been verified with Meta Cloud API. Instant notification will be dispatched if student is absent.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Student Switcher */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-semibold">
              🎓 Student Academic & ERP Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {student.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Class {student.class_name} – Section {student.class_section} • Roll No: #{student.roll_no} • Admission No: {student.admission_no} • {student.academic_year}
            </p>
          </div>

          {/* Student Selector */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 self-start lg:self-center">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Switch Student Record:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-900/90 text-white text-xs font-semibold rounded-xl px-3 py-2 border border-white/20 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              {allStudentsData.map((item) => (
                <option key={item.student.id} value={item.student.id} className="bg-slate-900 text-white">
                  #{item.student.roll_no} {item.student.full_name} ({item.student.admission_no})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "attendance"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📊 Attendance & Insights ({stats.percentage}%)
        </button>
        <button
          onClick={() => setActiveTab("timetable")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "timetable"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🗓️ Daily Timetable
        </button>
        <button
          onClick={() => setActiveTab("homework")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "homework"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📝 Homework & Tasks ({homeworkList.length})
        </button>
        <button
          onClick={() => setActiveTab("circulars")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "circulars"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📢 Announcements ({circulars.length})
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "security"
              ? "bg-blue-900 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🔒 Reset Password
        </button>
      </div>

      {/* TAB 1: Attendance Analytics */}
      {activeTab === "attendance" && (
        <div className="space-y-8">
          {/* Primary Metric: Attendance Percentage Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Large Attendance Percentage Dial Card */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall Attendance Rate
              </p>

              <div className="relative flex items-center justify-center">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 192 192">
                    <circle
                      cx="96"
                      cy="96"
                      r="72"
                      className="stroke-slate-100"
                      strokeWidth="14"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="72"
                      className={`transition-all duration-1000 ease-out ${
                        isExcellent
                          ? "stroke-emerald-500"
                          : isGoodAttendance
                          ? "stroke-blue-600"
                          : "stroke-rose-500"
                      }`}
                      strokeWidth="14"
                      strokeDasharray={452.4}
                      strokeDashoffset={452.4 - (452.4 * Math.min(Math.max(stats.percentage, 0), 100)) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {stats.percentage}%
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {stats.presentDays} of {stats.totalDays} Days
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {isExcellent ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    ⭐ Outstanding Attendance
                  </span>
                ) : isGoodAttendance ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                    ✓ Good Standing (Meets 75% Board Rule)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                    ⚠️ Below 75% Requirement
                  </span>
                )}
              </div>
            </div>

            {/* Breakdown Statistics Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Working Days
                </span>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-slate-900">{stats.totalDays}</p>
                  <p className="text-xs text-slate-500 mt-1">Conducted sessions in {student.academic_year}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Days Present
                </span>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-emerald-900">{stats.presentDays}</p>
                  <p className="text-xs text-emerald-700 mt-1">Full-day attendance recorded</p>
                </div>
              </div>

              <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                  Days Absent
                </span>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-rose-900">{stats.absentDays}</p>
                  <p className="text-xs text-rose-700 mt-1">Notifications dispatched to WhatsApp</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Parent Contact
                </span>
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900">{student.parent_name || "Parent"}</p>
                  <p className="text-emerald-700 font-medium">💬 {student.parent_phone || "No phone"}</p>
                  <p className="text-[11px] text-slate-400">Meta Cloud Alert Enabled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date-by-Date Attendance Log */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Daily Attendance Record
                </h2>
                <p className="text-xs text-slate-500">
                  Session-by-session history for Academic Year {student.academic_year}
                </p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No attendance sessions recorded yet for this student.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Notes / WhatsApp Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((record) => {
                      const isPresent = record.status === "present";
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {record.date}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                isPresent
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-50 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {isPresent ? "✓ Present" : "✕ Absent"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {isPresent ? (
                              <span className="text-slate-400">Regular attendance</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">
                                🔔 WhatsApp Absence Alert sent to {student.parent_phone}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Timetable */}
      {activeTab === "timetable" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Class {student.class_name} – Section {student.class_section} Daily Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Monday through Saturday period rotation and assigned faculty mentors.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Period</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Teacher</th>
                  <th className="px-4 py-3.5">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {timetable.map((t) => (
                  <tr key={t.period} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">Period {t.period}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{t.time}</td>
                    <td className="px-4 py-3 font-semibold text-blue-900">{t.subject}</td>
                    <td className="px-4 py-3 text-slate-700">{t.teacher}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{t.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Homework & Learning Tasks */}
      {activeTab === "homework" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Class Homework & Digital Assignments
            </h2>
            <p className="text-xs text-slate-500">
              Track active syllabus tasks assigned by your class teachers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.map((hw, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                    {hw.subject}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      hw.status === "submitted"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {hw.status === "submitted" ? "✓ Submitted" : "⏳ Pending Submission"}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{hw.topic}</h4>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned by: <strong>{hw.assignedBy}</strong></span>
                  <span className="text-rose-600 font-medium">Due: {hw.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Announcements */}
      {activeTab === "circulars" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Official School Circulars & Board Updates
            </h2>
            <p className="text-xs text-slate-500">
              Notifications from the Principal's office and academic coordinators.
            </p>
          </div>

          <div className="space-y-3">
            {circulars.map((c, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 p-5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {c.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{c.date}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Password Reset */}
      {activeTab === "security" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4 max-w-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Change Account Password
            </h2>
            <p className="text-xs text-slate-500">
              Keep your student portal account secure. Password must be at least 6 characters.
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

          <form onSubmit={handlePasswordReset} className="space-y-4 pt-2">
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
  );
}
