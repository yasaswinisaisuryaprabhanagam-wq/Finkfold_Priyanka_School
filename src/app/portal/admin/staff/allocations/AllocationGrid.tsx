"use client";

import { useState } from "react";
import { assignClass } from "@/actions/assignClass";

type Teacher = { id: string; full_name: string };
type Class = { id: string; name: string; section: string; academic_year: string };
type Allocation = { teacher_id: string; class_id: string; subject?: string; is_class_teacher?: boolean };

export default function AllocationGrid({
  teachers,
  classes,
  allocations,
  academicYear,
}: {
  teachers: Teacher[];
  classes: Class[];
  allocations: Allocation[];
  academicYear: string;
}) {
  // Track allocations as a set: "teacherId|classId"
  const initialSet = new Set(allocations.map((a) => `${a.teacher_id}|${a.class_id}`));
  const initialClassTeacher = new Set(
    allocations.filter((a) => a.is_class_teacher).map((a) => `${a.teacher_id}|${a.class_id}`)
  );

  const [assigned, setAssigned] = useState<Set<string>>(initialSet);
  const [classTeachers, setClassTeachers] = useState<Set<string>>(initialClassTeacher);
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function toggle(teacherId: string, classId: string) {
    const key = `${teacherId}|${classId}`;
    const isCurrentlyAssigned = assigned.has(key);
    setLoading(key);
    setErrorMsg(null);

    const fd = new FormData();
    fd.append("teacherId", teacherId);
    fd.append("classId", classId);
    fd.append("action", isCurrentlyAssigned ? "remove" : "assign");
    fd.append("isClassTeacher", "false");
    fd.append("academicYear", academicYear);

    const res = await assignClass(fd);

    if (res.success) {
      const next = new Set(assigned);
      if (isCurrentlyAssigned) {
        next.delete(key);
        const ct = new Set(classTeachers);
        ct.delete(key);
        setClassTeachers(ct);
      } else {
        next.add(key);
      }
      setAssigned(next);
      setSaved(key);
      setTimeout(() => setSaved(null), 1500);
    } else {
      setErrorMsg(res.error || "Failed to update allocation. Please try again.");
    }
    setLoading(null);
  }

  async function toggleClassTeacher(teacherId: string, classId: string) {
    const key = `${teacherId}|${classId}`;
    if (!assigned.has(key)) return; // must be assigned first
    const isClassTeacher = classTeachers.has(key);

    setLoading(`ct-${key}`);
    const fd = new FormData();
    fd.append("teacherId", teacherId);
    fd.append("classId", classId);
    fd.append("action", "assign");
    fd.append("isClassTeacher", String(!isClassTeacher));
    fd.append("academicYear", academicYear);

    const res = await assignClass(fd);
    if (res.success) {
      const ct = new Set(classTeachers);
      if (isClassTeacher) ct.delete(key);
      else ct.add(key);
      setClassTeachers(ct);
    } else {
      setErrorMsg(res.error || "Failed to update Class Teacher status.");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            type="button"
            className="text-rose-500 hover:text-rose-800 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="card overflow-auto">
      <table className="min-w-max w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-4 py-3 text-slate-600 font-bold border-b border-r border-slate-200 min-w-[160px]">
              Teacher
            </th>
            {classes.map((cls) => (
              <th key={cls.id} className="px-3 py-3 text-center text-slate-600 font-bold border-b border-r border-slate-200 min-w-[100px]">
                <div className="font-black text-slate-800">Class {cls.name}</div>
                <div className="text-slate-500">Sec {cls.section}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, ti) => (
            <tr key={teacher.id} className={ti % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
              <td className="px-4 py-3 border-r border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {teacher.full_name.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-800">{teacher.full_name}</span>
                </div>
              </td>
              {classes.map((cls) => {
                const key = `${teacher.id}|${cls.id}`;
                const isAssigned = assigned.has(key);
                const isCT = classTeachers.has(key);
                const isLoading = loading === key || loading === `ct-${key}`;
                const isSaved = saved === key;

                return (
                  <td key={cls.id} className="border-r border-b border-slate-200 p-2 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {/* Toggle assignment */}
                      <button
                        onClick={() => toggle(teacher.id, cls.id)}
                        disabled={isLoading}
                        title={isAssigned ? "Click to remove" : "Click to assign"}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all
                          ${isLoading ? "opacity-50 cursor-wait" :
                            isSaved ? "scale-110" : ""}
                          ${isAssigned
                            ? isCT
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                      >
                        {isLoading ? "…" : isAssigned ? (isCT ? "★" : "✓") : "+"}
                      </button>

                      {/* Class teacher toggle — only if assigned */}
                      {isAssigned && (
                        <button
                          onClick={() => toggleClassTeacher(teacher.id, cls.id)}
                          disabled={isLoading}
                          title={isCT ? "Remove class teacher role" : "Set as class teacher (roll call)"}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all
                            ${isCT
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-400 border border-slate-200 hover:border-emerald-300"}`}
                        >
                          {isCT ? "★ CT" : "Set CT"}
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-xs">✓</div>
          <span>Subject teacher assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">★</div>
          <span>Class teacher (marks roll call)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">+</div>
          <span>Not assigned</span>
        </div>
        <span className="ml-auto text-blue-700 font-semibold">Changes save automatically ✓</span>
      </div>
      </div>
    </div>
  );
}
