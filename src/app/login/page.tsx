"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { SCHOOL } from "@/lib/school-config";

type Role = "teacher" | "student" | "admin";

function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<Role>("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Show error from auth callback (e.g. expired password reset link)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "auth_callback_failed") {
      setError("The sign-in link has expired or is invalid. Please request a new password reset link.");
    }
  }, [searchParams]);

  const roles: { key: Role; label: string; icon: string; desc: string; color: string; bg: string; portal: string }[] = [
    {
      key: "teacher",
      label: "Faculty / Teacher",
      icon: "👨‍🏫",
      desc: "Attendance, roll-call, parent messaging",
      color: "text-blue-900",
      bg: "bg-blue-50 border-blue-300",
      portal: "/portal/faculty",
    },
    {
      key: "student",
      label: "Student",
      icon: "🎓",
      desc: "Attendance records, timetable, homework",
      color: "text-violet-900",
      bg: "bg-violet-50 border-violet-300",
      portal: "/portal/student",
    },
    {
      key: "admin",
      label: "School Admin",
      icon: "👑",
      desc: "Executive dashboard, reports, settings",
      color: "text-emerald-900",
      bg: "bg-emerald-50 border-emerald-300",
      portal: "/portal/admin",
    },
  ];

  const rolePortalMap: Record<string, string> = {
    teacher: "/portal/faculty",
    school_admin: "/portal/admin",
    super_admin: "/portal/admin",
    parent: "/portal/student",
    student: "/portal/student",
  };

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Fetch user profile to get role and redirect cleanly
      let role = selectedRole === "teacher" ? "teacher" : selectedRole === "admin" ? "school_admin" : "student";
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, primary_role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.primary_role) role = profile.primary_role;
        else if (profile?.role) role = profile.role;
      } catch {
        // Fallback to selected role
      }

      const destination = rolePortalMap[role] || "/portal/faculty";
      window.location.href = destination;
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  const selected = roles.find((r) => r.key === selectedRole)!;

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #123b6d 50%, #1a4d8f 100%)" }}>
      {/* ── Left Panel (brand) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-10 border-r border-white/10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          {SCHOOL.logoUrl && (
            <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              <img src={SCHOOL.logoUrl} alt="Logo" className="h-9 w-9 object-contain" />
            </div>
          )}
          <div>
            <div className="text-white font-bold text-base leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              {SCHOOL.name}
            </div>
            <div className="text-white/40 text-xs">School Management System</div>
          </div>
        </Link>

        {/* Illustration / features */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug" style={{ fontFamily: "Outfit, sans-serif" }}>
              Finkfold School<br />
              <span className="text-amber-300">ERP Platform</span>
            </h2>
            <p className="text-white/60 text-sm mt-3 leading-relaxed">
              India's most affordable school management system with real-time WhatsApp parent communication and AI-powered attendance analytics.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: "✅", text: "Instant WhatsApp absence alerts to parents" },
              { icon: "📊", text: "Real-time attendance tracking & analytics" },
              { icon: "🤖", text: "AI-powered anomaly detection & reports" },
              { icon: "🔒", text: "Role-based secure access for all users" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                <span className="text-base flex-shrink-0">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* School info */}
        <div className="text-white/30 text-xs space-y-1">
          <div>📍 {SCHOOL.address}</div>
          <div>📞 {SCHOOL.phone}</div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              {SCHOOL.logoUrl && (
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  <img src={SCHOOL.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                </div>
              )}
              <span className="text-white font-bold text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>{SCHOOL.name}</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to your school portal</p>
            </div>

            {/* Role Selector */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">I am a...</p>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setSelectedRole(role.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selectedRole === role.key
                        ? role.bg + " shadow-sm"
                        : "border-transparent bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl">{role.icon}</span>
                    <span className={`text-[10px] font-bold leading-tight text-center ${
                      selectedRole === role.key ? role.color : "text-slate-600"
                    }`}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === "teacher" ? "teacher@school.edu" : selectedRole === "admin" ? "admin@school.edu" : "student@school.edu"}
                  className="form-input"
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <Link href="/reset-password" className="text-xs text-blue-700 hover:text-blue-900 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
                  <span className="text-rose-500 flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isPending}
                className="btn btn-primary btn-lg w-full"
                style={{ justifyContent: "center" }}
              >
                {loading || isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  `Sign in as ${selected.label} →`
                )}
              </button>
            </form>

            {/* Contact Admin */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-400">
                New user? Contact your school admin for credentials.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/40 text-xs mt-6">
            {SCHOOL.name} · Powered by Finkfold ERP
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #123b6d 50%, #1a4d8f 100%)" }}>
        <div className="text-white text-sm opacity-60">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}