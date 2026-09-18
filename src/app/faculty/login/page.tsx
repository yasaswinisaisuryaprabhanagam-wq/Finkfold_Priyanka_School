import { Metadata } from "next";
import Link from "next/link";
import FacultyLoginForm from "./FacultyLoginForm";
import { SCHOOL } from "@/lib/school-config";

export const metadata: Metadata = {
  title: `Faculty & Staff Portal | ${SCHOOL.name}`,
  description: `Teacher and faculty portal for attendance submission and classroom management.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function FacultyLoginPage() {
  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {SCHOOL.logoUrl && (
              <img
                src={SCHOOL.logoUrl}
                alt={`${SCHOOL.name} Logo`}
                className="h-9 w-9 object-contain"
              />
            )}
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">
                {SCHOOL.name}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                Faculty & Academic Workspace
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span>Back to School Website</span>
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <FacultyLoginForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-500 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            Internal Faculty Workspace • Unauthorized access is strictly logged & monitored.
          </p>
          <p className="text-slate-400">
            Powered by Finkfold EdOS. Need assistance? Contact School IT Coordinator.
          </p>
        </div>
      </footer>
    </div>
  );
}
