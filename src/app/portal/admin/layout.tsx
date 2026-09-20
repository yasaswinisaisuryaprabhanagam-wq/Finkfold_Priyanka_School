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

  const navSections = [
    {
      title: "Section 1: Executive Intelligence",
      items: [
        { href: "/portal/admin",                       label: "Executive Overview",        icon: "📊", exact: true },
        { href: "/portal/admin/admissions/crm",        label: "AI Enrollment & Lead CRM",  icon: "🎯", badge: "AI" },
        { href: "/portal/admin/treasury",              label: "Treasury & Tally-Sync",     icon: "🏛️", badge: "Sync" },
        { href: "/portal/admin/fees",                  label: "Fee Counter & Cash POS",    icon: "💳" },
      ],
    },
    {
      title: "Section 2: Logistics & Fleet",
      items: [
        { href: "/portal/admin/store-fulfillment",     label: "Store & Pick-Pack Indent",  icon: "📦" },
        { href: "/portal/admin/fleet",                 label: "Fleet Radar & RFID Gate",   icon: "🚌", badge: "Live" },
      ],
    },
    {
      title: "Section 3: HR & Staff Appraisals",
      items: [
        { href: "/portal/admin/staff/recruitment",     label: "Careers ATS & Hiring",      icon: "💼", badge: "ATS" },
        { href: "/portal/admin/staff/appraisals",      label: "360° Faculty Appraisals",   icon: "⭐" },
        { href: "/portal/admin/staff",                 label: "Staff Directory",           icon: "👨‍🏫" },
      ],
    },
    {
      title: "Section 4: Academic Governance & NEP",
      items: [
        { href: "/portal/admin/academics/obe",         label: "NEP 2020 OBE Auditor",      icon: "🧠", badge: "NEP" },
        { href: "/portal/admin/safespace",             label: "SafeSpace Grievance Triage",icon: "🛡️", badge: "Crisis" },
        { href: "/portal/admin/academics",             label: "Academic Curriculum",       icon: "📚" },
        { href: "/portal/admin/classes",               label: "Classes & Sections",        icon: "🏫" },
        { href: "/portal/admin/students",              label: "Student Registry",          icon: "👥" },
        { href: "/portal/admin/admissions",            label: "Admissions Desk",           icon: "📋" },
        { href: "/portal/admin/homework",              label: "Homework Hub",              icon: "📝" },
      ],
    },
    {
      title: "Section 5: Operations & Settings",
      items: [
        { href: "/portal/admin/maintenance",           label: "Estate & Helpdesk Command", icon: "🛠️" },
        { href: "/portal/admin/broadcast",             label: "Waterfall Broadcast Studio",icon: "📡" },
        { href: "/portal/admin/circulars",             label: "Official Circulars",        icon: "📢" },
        { href: "/portal/admin/whatsapp",              label: "WhatsApp Audit Trail",      icon: "💬" },
        { href: "/portal/admin/settings",              label: "School Settings",           icon: "⚙️" },
      ],
    },
  ];

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="portal-shell">
      {/* ── Sidebar (Clean White Theme matching Student & Faculty Portals) ── */}
      <aside className="portal-sidebar bg-white border-r border-slate-200/80 shadow-xs" id="admin-sidebar">
        {/* Brand / Institution Header */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <Link href="/" className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {SCHOOL.logoUrl ? (
                <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                  <img src={SCHOOL.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs">
                  {SCHOOL.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-slate-900 font-bold text-sm leading-tight truncate group-hover:text-indigo-600 transition" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {SCHOOL.name}
                </div>
                <div className="text-slate-400 text-[11px] font-medium">Admin Control Panel</div>
              </div>
            </div>
            <div className="text-slate-400 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </Link>
        </div>

        {/* User Capsule */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-slate-800 text-xs font-semibold truncate">{profile.full_name}</div>
                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                  {profile.role === "super_admin" ? "Super Admin (HQ)" : "School Principal"}
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  <span className="text-emerald-600 font-medium">Live</span>
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {profile.role === "super_admin" ? "HQ" : "Admin"}
            </span>
          </div>
        </div>

        {/* Grouped Navigation Sections */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="sidebar-nav-item flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base w-5 flex-shrink-0 text-center">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Signout */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-white">
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="portal-main">
        {/* Top Navigation Bar matching Student & Faculty Portals */}
        <header className="portal-topbar justify-between gap-4 flex-wrap">
          {/* Search Pill */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students, staff, classes, or invoices..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200/60 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-3">
            {/* Date Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 font-medium">
              <span>📅</span>
              <span>{todayStr}</span>
            </div>

            {/* Multi-Branch Switcher */}
            <BranchSwitcher
              currentSchoolId={profile.school_id}
              campuses={campuses}
              isSuperAdmin={!!isSuperAdmin}
            />

            {/* System Status Pill */}
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>

            {/* Notification Bell */}
            <Link
              href="/portal/admin/whatsapp"
              title="WhatsApp Audit & Alerts"
              className="relative h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center text-sm transition"
            >
              <span>🔔</span>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
            </Link>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="portal-content animate-fade-in">{children}</main>

        <footer className="border-t border-slate-200/70 bg-white px-6 py-3.5 text-[11px] text-slate-400 flex items-center justify-between">
          <div>{SCHOOL.name} &bull; Admin Control Panel</div>
          <div className="text-slate-400">Powered by Finkfold EdOS</div>
        </footer>
      </div>
    </div>
  );
}
