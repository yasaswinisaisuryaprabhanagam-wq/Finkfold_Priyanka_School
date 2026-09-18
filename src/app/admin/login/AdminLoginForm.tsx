"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide your administrative email and password.");
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
        setError(
          authError.message.includes("Invalid login credentials")
            ? "Invalid administrative email or password. Please verify your credentials."
            : authError.message
        );
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Administrative sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      // Verify administrative role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, primary_role, roles")
        .eq("id", data.user.id)
        .maybeSingle();

      const userRole = profile?.primary_role || profile?.role;
      const isAdmin =
        userRole === "super_admin" ||
        userRole === "school_admin" ||
        userRole === "branch_admin" ||
        profile?.roles?.includes("super_admin") ||
        profile?.roles?.includes("school_admin");

      if (!isAdmin) {
        await supabase.auth.signOut();
        setError(
          "Access Denied: This account lacks administrative clearance. Please use the Student or Faculty Portal."
        );
        setLoading(false);
        return;
      }

      // Successful admin login -> route to admin portal
      router.replace("/portal/admin");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during administrative authentication.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-8 sm:p-10 relative overflow-hidden text-white">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
          <span>🛡️</span>
          <span>Finkfold EdOS Management Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Executive Sign In
        </h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Super Admin & Branch Administrative Control Plane
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <span className="text-base mt-0.5">⚠️</span>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Administrator Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="superadmin@priyanka.school"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Master Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Reset credentials?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-slate-950"
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
              <span>Verifying Administrative Authority...</span>
            </>
          ) : (
            <>
              <span>Authenticate to Admin Console</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Hint */}
      <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-1.5 text-xs text-slate-400">
        <p>
          <strong className="text-amber-300">Super Admin:</strong>{" "}
          superadmin@priyanka.school / Admin@123
        </p>
        <p>
          <strong className="text-slate-200">Branch Admin:</strong>{" "}
          admin@priyanka.school / Teacher@123
        </p>
        <div className="mt-4 pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link href="/student/login" className="hover:text-amber-400 transition-colors">
            Student Portal →
          </Link>
          <span>•</span>
          <Link href="/faculty/login" className="hover:text-amber-400 transition-colors">
            Faculty Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
