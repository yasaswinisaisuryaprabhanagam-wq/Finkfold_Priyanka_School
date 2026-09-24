"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  subject: string;
  className: string;
  topic: string;
  time: string;
  room: string;
  teacher: string;
}

export default function StudentLessonPlanModal({
  subject,
  className,
  topic,
  time,
  room,
  teacher,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-xs flex items-center gap-2 whitespace-nowrap cursor-pointer hover:opacity-95 transition"
      >
        <span>View Lesson Plan</span>
        <span>→</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
                  Day-Before Academic Sync &bull; Synced by Teacher at 04:15 PM
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {topic}
                </h3>
                <p className="text-xs text-slate-500">
                  Class {className} &bull; {subject} &bull; {time} &bull; {room} &bull; {teacher}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* School Bag Packing Checklist (The Real-World Requirement) */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <span>🎒</span>
                <span>Mandatory Student Bag Packing Checklist (Pack Tonight)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Mobile phones are not permitted at school. Review this list and pack all required materials tonight before 09:00 PM:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200/60 font-medium">
                  <span className="text-emerald-600">✓</span> <span>Long Ruled Math Vol. 2 Notebook</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200/60 font-medium">
                  <span className="text-emerald-600">✓</span> <span>Geometry Box (Compass &amp; Protractor)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200/60 font-medium">
                  <span className="text-emerald-600">✓</span> <span>NCERT Mathematics Textbook</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200/60 font-medium">
                  <span className="text-emerald-600">✓</span> <span>Completed HW (Exercise 4.3 in physical notebook)</span>
                </div>
              </div>
            </div>

            {/* Teacher's Planned Lesson Progression */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>📖</span>
                <span>Tomorrow&apos;s Planned Lesson Progression</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                  <div>
                    <span className="font-semibold text-slate-800">Review &amp; In-Class Notebook Inspection (10 Mins)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Teacher aisle walkthrough to digitally verify handwritten homework in notebooks.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                  <div>
                    <span className="font-semibold text-slate-800">Concept Derivation &amp; GeoGebra Simulation (20 Mins)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Deriving the parabolic axis of symmetry using completing-the-square method on smartboard.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                  <div>
                    <span className="font-semibold text-slate-800">Guided Problem Solving (15 Mins)</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Board problems from Exercise 4.4 Questions 3, 5, and 8.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Link
                href="/portal/student/timetable"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => setIsOpen(false)}
              >
                View Full Weekly Timetable &rarr;
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary px-4 py-2 text-xs font-semibold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
