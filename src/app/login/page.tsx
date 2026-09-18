"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveStudentIdentifier } from "@/actions/studentAuth";
import { SCHOOL } from "@/lib/school-config";

function UniversalLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth_callback_failed") {
      setError("The sign-in link has expired or is invalid. Please request a new password reset link.");
    }
  }, [searchParams]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please enter your email or student ID and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. If student admission ID or shorthand provided, resolve to email
      let targetEmail = identifier.trim().toLowerCase();
      if (!targetEmail.includes("@")) {
        const resolved = await resolveStudentIdentifier(identifier);
        targetEmail = resolved.email;
      }

      // 2. Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (signInError) {
        setError(
          signInError.message.includes("Invalid login credentials")
            ? "Invalid email/ID or password. Please verify your credentials."
            : signInError.message
        );
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      // 3. Inspect user profile and route to the corresponding portal
      let destination = "/portal/faculty";
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, primary_role, roles")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = profile?.primary_role || profile?.role || "teacher";
        if (
          role === "super_admin" ||
          role === "school_admin" ||
          role === "branch_admin" ||
          profile?.roles?.includes("super_admin") ||
          profile?.roles?.includes("school_admin")
        ) {
          destination = "/portal/admin";
        } else if (role === "student" || role === "parent") {
          destination = "/portal/student";
        } else {
          destination = "/portal/faculty";
        }
      } catch {
        // Default destination
      }

      window.location.href = destination;
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(135deg, #0c2d5a 0%, #123b6d 50%, #1a4d8f 100%)",
      }}
    >
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] p-10 border-r border-white/10">
        <Link href="/" className="flex items-center gap-3">
          {SCHOOL.logoUrl && (
            <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              <img src={SCHOOL.logoUrl} alt="Logo" className="h-9 w-9 object-contain" />
            </div>
          )}
          <div>
            <div
              className="text-white font-bold text-base leading-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {SCHOOL.name}
            </div>
            <div className="text-white/50 text-xs">Educational Operating System</div>
          </div>
        </Link>

        {/* Feature List */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold mb-3">
              <span>⚡</span>
              <span>Unified Gateway</span>
            </div>
            <h2
              className="text-3xl font-bold text-white leading-snug"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Finkfold EdOS<br />
              <span className="text-amber-300">Institutional Portals</span>
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">
              Enterprise role-based routing. The system automatically verifies your identity and launches your specialized workspace.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/student/login"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-white group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Student & Parent Portal
                  </div>
                  <div className="text-xs text-white/60">
                    Attendance, fee receipts & report cards
                  </div>
                </div>
              </div>
              <span className="text-white/40 group-hover:text-white transition-colors">→</span>
            </Link>

            <Link
              href="/faculty/login"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-white group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👨‍🏫</span>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Faculty Workspace
                  </div>
                  <div className="text-xs text-white/60">
                    Class roll-call & academic analytics
                  </div>
                </div>
              </div>
              <span className="text-white/40 group-hover:text-white transition-colors">→</span>
            </Link>

            <Link
              href="/admin/login"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-white group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Executive Admin Console
                  </div>
                  <div className="text-xs text-white/60">
                    Multi-campus treasury & branch controls
                  </div>
                </div>
              </div>
              <span className="text-white/40 group-hover:text-white transition-colors">→</span>
            </Link>
          </div>
        </div>

        {/* School info */}
        <div className="text-white/40 text-xs space-y-1">
          <div>📍 {SCHOOL.address}</div>
          <div>📞 {SCHOOL.phone}</div>
        </div>
      </div>

      {/* ── Right Panel (Universal Smart Form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              {SCHOOL.logoUrl && (
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  <img src={SCHOOL.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                </div>
              )}
              <span
                className="text-white font-bold text-lg"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {SCHOOL.name}
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6">
            <div>
              <h1
                className="text-2xl font-extrabold text-slate-900"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Sign In
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access your designated portal
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
                <span className="text-rose-500 flex-shrink-0 text-sm mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address or Student ID
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. your@school.edu or PRIY-2026-001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm font-medium"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-blue-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span>Sign in to Portal →</span>
                )}
              </button>
            </form>

            {/* Quick Links to Dedicated Portals */}
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Dedicated Portals
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Link
                  href="/student/login"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-blue-900 font-medium transition-all"
                >
                  <div className="text-base mb-0.5">🎓</div>
                  <div className="text-[11px] font-semibold">Student</div>
                </Link>
                <Link
                  href="/faculty/login"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-slate-700 hover:text-emerald-900 font-medium transition-all"
                >
                  <div className="text-base mb-0.5">👨‍🏫</div>
                  <div className="text-[11px] font-semibold">Faculty</div>
                </Link>
                <Link
                  href="/admin/login"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 text-slate-700 hover:text-amber-900 font-medium transition-all"
                >
                  <div className="text-base mb-0.5">🛡️</div>
                  <div className="text-[11px] font-semibold">Admin</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/50 text-xs">
            {SCHOOL.name} • Finkfold EdOS Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0c2d5a 0%, #123b6d 50%, #1a4d8f 100%)",
          }}
        >
          <div className="text-white text-sm opacity-60">Loading...</div>
        </div>
      }
    >
      <UniversalLoginForm />
    </Suspense>
  );
}