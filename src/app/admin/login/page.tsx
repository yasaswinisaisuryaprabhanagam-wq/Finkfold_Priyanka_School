import { Metadata } from "next";
import Link from "next/link";
import AdminLoginForm from "./AdminLoginForm";
import { SCHOOL } from "@/lib/school-config";

export const metadata: Metadata = {
  title: `Executive Management Console | Finkfold EdOS`,
  description: `Administrative control plane for multi-campus school management.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-base shadow-sm">
              🛡️
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block">
                Finkfold EdOS
              </span>
              <span className="text-xs text-amber-400/90 font-medium block">
                Multi-Campus Administrative Console • {SCHOOL.name}
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span>Public Site</span>
          </Link>
        </div>
      </header>

      {/* Main Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <AdminLoginForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-xs text-slate-500 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>
            RESTRICTED SYSTEM • All login attempts, sessions, and multi-branch actions are audited.
          </p>
          <p className="text-slate-600">
            Finkfold Autonomous EdOS Enterprise Edition v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
