import Link from "next/link";
import { getProfile, getAllCampuses } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import SignOutButton from "@/components/SignOutButton";
import BranchSwitcher from "@/components/BranchSwitcher";
import { redirect } from "next/navigation";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getProfile();

  // ── HARD AUTH GATE ─────────────────────────────────────────
  if (!userProfile) {
    redirect("/login?from=admin");
  }

  // Teacher trying to access admin → redirect to their portal
  if (userProfile.role === "teacher") {
    redirect("/portal/faculty");
  }
  // Parent trying to access admin → redirect to student portal
  if (userProfile.role === "parent") {
    redirect("/portal/student");
  }
  // Only school_admin / super_admin reach below
  // ───────────────────────────────────────────────────────────

  const profile = userProfile;
  const isSuperAdmin =
    profile.role === "super_admin" ||
    profile.primary_role === "super_admin" ||
    (profile.roles && profile.roles.includes("super_admin"));

  const campuses = await getAllCampuses();

  const navItems = [
    // Section 1: Executive Intelligence & AI Forecasting
    { href: "/portal/admin",                       label: "Executive Overview",        icon: "📊", exact: true },
    { href: "/portal/admin/admissions/crm",        label: "AI Enrollment & Lead CRM",  icon: "🎯" },
    { href: "/portal/admin/treasury",              label: "Treasury & Tally-Sync",     icon: "🏛️" },
    { href: "/portal/admin/fees",                  label: "Fee Counter & Cash POS",    icon: "💳" },

    // Section 2: Smart Campus Logistics & Fleet Command
    { href: "/portal/admin/store-fulfillment",     label: "Store & Pick-Pack Indent",  icon: "📦" },
    { href: "/portal/admin/fleet",                 label: "Fleet Radar & RFID Gate",   icon: "🚌" },

    // Section 3: HR, Recruitment & Staff Appraisals
    { href: "/portal/admin/staff/recruitment",     label: "Careers ATS & Hiring",      icon: "💼" },
    { href: "/portal/admin/staff/appraisals",      label: "360° Faculty Appraisals",   icon: "⭐" },
    { href: "/portal/admin/staff",                 label: "Staff Directory",           icon: "👨‍🏫" },

    // Section 4: Academic Governance & NEP 2020 Compliance
    { href: "/portal/admin/academics/obe",         label: "NEP 2020 OBE Auditor",      icon: "🧠" },
    { href: "/portal/admin/safespace",             label: "SafeSpace Grievance Triage",icon: "🛡️" },
    { href: "/portal/admin/academics",             label: "Academic Curriculum",       icon: "📚" },
    { href: "/portal/admin/classes",               label: "Classes & Sections",        icon: "🏫" },
    { href: "/portal/admin/students",              label: "Student Registry",          icon: "👥" },
    { href: "/portal/admin/admissions",            label: "Admissions Desk",           icon: "📋" },

    // Section 5: Campus Maintenance & Helpdesk Operations
    { href: "/portal/admin/maintenance",           label: "Estate & Helpdesk Command", icon: "🛠️" },
    { href: "/portal/admin/broadcast",             label: "Waterfall Broadcast Studio",icon: "📡" },
    { href: "/portal/admin/circulars",             label: "Official Circulars",        icon: "📢" },
    { href: "/portal/admin/whatsapp",              label: "WhatsApp Audit Trail",      icon: "💬" },
    { href: "/portal/admin/settings",              label: "School Settings",           icon: "⚙️" },
  ];

  return (
    <div className="portal-shell">
      {/* ── Sidebar ── */}
      <aside className="portal-sidebar" style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #2d1b69 50%, #11998e 200%)"
      }}>
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
              <div className="text-white/50 text-[10px] font-medium mt-0.5">Admin Control Panel</div>
            </div>
          </Link>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-400 flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-xs font-semibold truncate">{profile.full_name}</div>
              <div className="text-white/50 text-[10px]">
                {profile.role === "super_admin" ? "Super Admin (Trust HQ)" : "Branch Admin"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav — ADMIN ONLY */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-nav-item">
              <span className="text-base w-5 flex-shrink-0 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom — sign out only, NO cross-portal links */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="portal-main">
        <header className="portal-topbar gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-sm font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
              Admin Control Panel
            </h2>
            <p className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Multi-Branch Switcher */}
            <BranchSwitcher
              currentSchoolId={profile.school_id}
              campuses={campuses}
              isSuperAdmin={!!isSuperAdmin}
            />
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </header>

        <main className="portal-content animate-fade-in">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-[11px] text-slate-400 text-center">
          {SCHOOL.name} • Admin Portal • Powered by Finkfold ERP
        </footer>
      </div>
    </div>
  );
}
