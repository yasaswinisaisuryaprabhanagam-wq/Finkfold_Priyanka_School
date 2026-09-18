import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import SignOutButton from "@/components/SignOutButton";
import { redirect } from "next/navigation";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getProfile();

  // ── HARD AUTH GATE ─────────────────────────────────────────
  if (!userProfile) {
    redirect("/login?from=student");
  }

  // Admin logged in → send to admin portal
  if (userProfile.role === "school_admin" || userProfile.role === "super_admin") {
    redirect("/portal/admin");
  }
  // Teacher logged in → send to faculty portal
  if (userProfile.role === "teacher") {
    redirect("/portal/faculty");
  }
  // Only 'parent' role reaches below (student view is for parents/guardians)
  // ───────────────────────────────────────────────────────────

  const profile = userProfile;

  const navItems = [
    { href: "/portal/student",                label: "Attendance",      icon: "📊", exact: true },
    { href: "/portal/student/fees",           label: "Fee Receipts & Dues", icon: "🧾" },
    { href: "/portal/student/timetable",      label: "Timetable",       icon: "🗓️" },
    { href: "/portal/student/homework",       label: "Homework",        icon: "📝" },
    { href: "/portal/student/circulars",      label: "Circulars",       icon: "📢" },
    { href: "/portal/student/settings",       label: "My Account",      icon: "👤" },
  ];

  return (
    <div className="portal-shell">
      {/* ── Sidebar ── */}
      <aside className="portal-sidebar" style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}>
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            {SCHOOL.logoUrl && (
              <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={SCHOOL.logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm leading-tight truncate" style={{ fontFamily: "Outfit, sans-serif" }}>
                {SCHOOL.name}
              </div>
              <div className="text-white/50 text-[10px] font-medium mt-0.5">Student / Parent Portal</div>
            </div>
          </Link>
        </div>

        {/* Student info */}
        <div className="px-4 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-violet-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-xs font-semibold truncate">{profile.full_name}</div>
              <div className="text-white/50 text-[10px] flex items-center gap-1">
                Parent / Guardian
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation — STUDENT/PARENT ONLY links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-nav-item">
              <span className="text-base w-5 flex-shrink-0 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom — sign out only */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="portal-main">
        <header className="portal-topbar gap-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
              Student Dashboard
            </h2>
            <p className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </header>

        <main className="portal-content animate-fade-in">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-[11px] text-slate-400 text-center">
          {SCHOOL.name} • Student Portal • Powered by Finkfold ERP
        </footer>
      </div>
    </div>
  );
}
