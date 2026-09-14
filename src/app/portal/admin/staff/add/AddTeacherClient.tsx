"use client";

import { useState } from "react";
import { addTeacher } from "@/actions/addTeacher";
import { assignClass } from "@/actions/assignClass";

type Class = { id: string; name: string; section: string };

export default function AddTeacherClient({
  schoolId,
  classes,
}: {
  schoolId: string;
  classes: Class[];
}) {
  const [step, setStep] = useState<"form" | "classes" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [savingClasses, setSavingClasses] = useState(false);

  // Track show/hide password
  const [showPwd, setShowPwd] = useState(false);

  async function handleCreateTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    setTeacherName(fd.get("full_name") as string);
    const res = await addTeacher(fd);
    setLoading(false);
    if (res.success && res.teacherId) {
      setTeacherId(res.teacherId);
      setStep("classes");
    } else {
      setError(res.error || "Failed to create teacher");
    }
  }

  async function handleAssignClasses() {
    if (selectedClasses.size === 0) { setStep("done"); return; }
    setSavingClasses(true);
    for (const classId of selectedClasses) {
      const fd = new FormData();
      fd.append("teacherId", teacherId);
      fd.append("classId", classId);
      fd.append("action", "assign");
      fd.append("isClassTeacher", "false");
      fd.append("academicYear", "2026-2027");
      await assignClass(fd);
    }
    setSavingClasses(false);
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="text-center space-y-5 py-6">
        <div className="text-5xl">🎉</div>
        <div>
          <div className="text-xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            {teacherName} added successfully!
          </div>
          <div className="text-sm text-slate-500 mt-1">
            They can now log in to the teacher portal with their email and password.
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left text-sm space-y-2">
          <div className="font-bold text-emerald-900">✅ What was set up:</div>
          <div className="text-emerald-700">• Supabase Auth account created (login ready)</div>
          <div className="text-emerald-700">• Teacher profile linked to school</div>
          {selectedClasses.size > 0 && (
            <div className="text-emerald-700">• {selectedClasses.size} class(es) assigned</div>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <a href="/portal/admin/staff" className="btn btn-primary">
            View Staff List →
          </a>
          <button
            onClick={() => { setStep("form"); setTeacherId(""); setSelectedClasses(new Set()); setError(""); }}
            className="btn btn-ghost"
          >
            Add Another Teacher
          </button>
        </div>
      </div>
    );
  }

  if (step === "classes") {
    return (
      <div className="space-y-5">
        <div>
          <div className="text-base font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            ✅ Account created! Now assign classes
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Select which classes <strong>{teacherName}</strong> will teach. You can change this later from the Allocations grid.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {classes.map((cls) => {
            const key = cls.id;
            const selected = selectedClasses.has(key);
            return (
              <button
                key={cls.id}
                onClick={() => {
                  const next = new Set(selectedClasses);
                  if (selected) next.delete(key);
                  else next.add(key);
                  setSelectedClasses(next);
                }}
                className={`rounded-xl border-2 p-3 text-sm font-bold transition-all text-left
                  ${selected
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}
              >
                <div className="text-base">Class {cls.name}</div>
                <div className={`text-xs mt-0.5 ${selected ? "text-blue-600" : "text-slate-400"}`}>
                  Section {cls.section} {selected ? "✓" : ""}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAssignClasses}
            disabled={savingClasses}
            className="btn btn-primary flex-1"
          >
            {savingClasses ? "Saving…" : selectedClasses.size > 0 ? `Assign ${selectedClasses.size} Class(es) & Finish` : "Skip — Assign Later"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreateTeacher} className="space-y-4">
      <input type="hidden" name="schoolId" value={schoolId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            required
            placeholder="e.g. Kiran Babu"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Employee Code
          </label>
          <input
            type="text"
            name="employee_code"
            placeholder="e.g. EMP-003"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Email (used to login) <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="e.g. kiran@priyanka.school"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            WhatsApp / Mobile <span className="text-rose-500">*</span>
          </label>
          <div className="flex">
            <div className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-600 font-semibold">
              +91
            </div>
            <input
              type="tel"
              name="phone"
              required
              maxLength={10}
              pattern="\d{10}"
              placeholder="9876543210"
              className="flex-1 border border-slate-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Role</label>
          <select
            name="role"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="teacher">Teacher / Faculty</option>
            <option value="school_admin">School Admin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            name="password"
            required
            minLength={8}
            placeholder="Minimum 8 characters"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-sm"
          >
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Share this password with the teacher directly — they can change it after first login.
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
          ⚠️ {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-3 text-base font-bold"
        >
          {loading ? "Creating account…" : "✅ Create Teacher Account →"}
        </button>
      </div>
    </form>
  );
}
