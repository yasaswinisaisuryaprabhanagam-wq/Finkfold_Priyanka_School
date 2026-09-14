"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SCHOOL } from "@/lib/school-config";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Check if user has an active recovery session from Supabase reset link or is logged in
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsRecoverySession(true);
      }
    }
    checkSession();

    // Listen for PASSWORD_RECOVERY auth state change
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Request password reset email
  async function handleSendResetLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/auth/callback?type=recovery&next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: `Password reset link has been dispatched to ${email}. Please check your inbox or spam folder.`,
      });
    }
  }

  // Update to new password
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Password updated successfully! Redirecting to your portal...",
      });
      setTimeout(() => {
        router.push("/portal/faculty");
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-slate-900 via-[#123B6D] to-slate-900 px-4 py-12 selection:bg-blue-900 selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back Link */}
      <div className="mb-6 z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Portal Sign In</span>
        </Link>
      </div>

      {/* Reset Card */}
      <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-2xl border border-white/20 z-10 space-y-6">
        <div className="text-center space-y-2">
          {SCHOOL.logoUrl && (
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 p-2 shadow-xs mb-1">
              <img
                src={SCHOOL.logoUrl}
                alt={`${SCHOOL.name} Logo`}
                className="h-8 w-8 object-contain"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isRecoverySession ? "Set New Password" : "Reset Portal Password"}
          </h1>
          <p className="text-xs text-slate-500">
            {isRecoverySession
              ? "Enter your new secure password for student or faculty portal access."
              : "Enter your registered portal email to receive a password recovery link."}
          </p>
        </div>

        {message && (
          <div
            className={`rounded-xl p-3.5 text-xs flex items-start gap-2.5 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
          >
            <span className="font-bold">{message.type === "success" ? "✓" : "⚠️"}</span>
            <span className="leading-relaxed">{message.text}</span>
          </div>
        )}

        {isRecoverySession ? (
          /* Set New Password Form */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-blue-900 hover:underline font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
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
                type={showPassword ? "text" : "password"}
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
              disabled={loading}
              className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? "Updating Password..." : "Update Password →"}
            </button>
          </form>
        ) : (
          /* Request Reset Link Form */
          <form onSubmit={handleSendResetLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kiran@priyanka.em"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-900 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? "Dispatching Reset Link..." : "Send Reset Link →"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsRecoverySession(true)}
                className="text-[11px] text-slate-500 hover:text-blue-900 font-medium"
              >
                Already have a reset session or token? Click here to set password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
