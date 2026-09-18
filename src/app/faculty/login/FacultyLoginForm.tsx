"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FacultyLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both your faculty email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        setError("Invalid email or password. Please check with the school administrator.");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      // Check profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, primary_role")
        .eq("id", data.user.id)
        .maybeSingle();

      const userRole = profile?.primary_role || profile?.role;

      if (userRole === "parent" || userRole === "student") {
        setError(
          "Access Notice: This account is registered as a Student/Parent. Please use the Student Portal to sign in."
        );
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (userRole === "super_admin" || userRole === "school_admin") {
        router.replace("/portal/admin");
      } else {
        router.replace("/portal/faculty");
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
      {/* Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <span>👨‍🏫</span>
          <span>Faculty & Staff Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Teacher Sign In
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Mark daily attendance, generate class reports & assign homework
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <span className="text-base mt-0.5">⚠️</span>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Faculty Email / Employee ID
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@priyanka.school"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
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
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Faculty Workspace</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Faculty Demo: <span className="font-semibold text-slate-700">teacher@priyanka.school</span> /{" "}
          <span className="font-semibold text-slate-700">Teacher@123</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link href="/student/login" className="hover:text-emerald-700 transition-colors">
            Student Portal →
          </Link>
          <span>•</span>
          <Link href="/admin/login" className="hover:text-emerald-700 transition-colors">
            Admin Console →
          </Link>
        </div>
      </div>
    </div>
  );
}
