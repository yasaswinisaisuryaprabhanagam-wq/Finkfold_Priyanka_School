"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resolveStudentIdentifier } from "@/actions/studentAuth";
import { SCHOOL } from "@/lib/school-config";

export default function StudentLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedInfo, setResolvedInfo] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your Admission Number or Student Email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError(null);
    setResolvedInfo(null);

    try {
      // 1. Resolve admission number or phone to email
      const resolved = await resolveStudentIdentifier(identifier);
      if (resolved.admissionNo) {
        setResolvedInfo(`Resolved ID: ${resolved.admissionNo}`);
      }

      // 2. Sign in via Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: resolved.email,
        password,
      });

      if (authError) {
        // Clearer error message for students
        if (authError.message.includes("Invalid login credentials")) {
          setError(
            "Invalid Admission Number or password. Please verify your credentials or contact the school office."
          );
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      // 3. Clean redirect directly to Student & Parent Portal
      router.replace("/portal/student");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign-in.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-3">
          <span>🎓</span>
          <span>Student & Parent Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Access your attendance records, fee dues & academic reports
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <span className="text-base mt-0.5">⚠️</span>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Admission Number or Student Email
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. PRIY-2026-001 or student@priyanka.school"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm font-medium"
            />
          </div>
          {resolvedInfo && (
            <p className="text-xs text-blue-600 mt-1 font-medium">{resolvedInfo}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            You can enter your Admission ID (e.g. PRIY-2026-001) or registered email.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Verifying & Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Student Portal</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Hint */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Demo Student Account:{" "}
          <span className="font-semibold text-slate-700">student@priyanka.school</span> /{" "}
          <span className="font-semibold text-slate-700">Student@123</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link href="/faculty/login" className="hover:text-blue-600 transition-colors">
            Faculty Login →
          </Link>
          <span>•</span>
          <Link href="/admin/login" className="hover:text-blue-600 transition-colors">
            Admin Console →
          </Link>
        </div>
      </div>
    </div>
  );
}
