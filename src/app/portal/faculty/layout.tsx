import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import SignOutButton from "@/components/SignOutButton";
import { redirect } from "next/navigation";

export default async function FacultyPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getProfile();

  // ── HARD AUTH GATE ─────────────────────────────────────────
  if (!userProfile) {
    redirect("/login?from=faculty");
  }

  if (userProfile.role === "school_admin" || userProfile.role === "super_admin") {
    redirect("/portal/admin");
  }
  if (userProfile.role === "parent") {
    redirect("/portal/student");
  }

  const profile = userProfile;

  let unhandledReplies = 0;
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const admin = await createAdminClient();
    const { count } = await admin
      .from("parent_reply_log")
      .select("id", { count: "exact", head: true })
      .eq("handled", false);
    unhandledReplies = count || 0;
  } catch {}

  const navSections = [
    {
      title: "Daily Classroom",
      items: [
        { href: "/portal/faculty",           label: "My Classes & Roll Call", icon: "📋", exact: true },
        { href: "/portal/faculty/homework",  label: "Assign Homework",        icon: "📝" },
        { href: "/portal/faculty/academics", label: "Academics & AI Radar",   icon: "📈", badge: "AI" },
        { href: "/portal/faculty/conduct",   label: "Conduct & Merits",       icon: "🛡️" },
      ],
    },
    {
      title: "Advanced Pedagogy",
      items: [
        { href: "/portal/faculty/curriculum",    label: "Unit Planner & OBE",  icon: "🧠", badge: "NEP" },
        { href: "/portal/faculty/voice-grader",   label: "Voice Grader & AI",   icon: "🎙️", badge: "New" },
        { href: "/portal/faculty/group-projects", label: "Group Projects Hub",  icon: "🧩" },
      ],
    },
    {
      title: "Classroom Control",
      items: [
        { href: "/portal/faculty/seating-chart", label: "Seating Chart & Lock", icon: "🗺️", badge: "Live" },
      ],
    },
    {
      title: "Inclusive Education",
      items: [
        { href: "/portal/faculty/sen", label: "SEN & Accommodations", icon: "🤝", badge: "⭐" },
      ],
    },
    {
      title: "Student Care & Chat",
      items: [
        { href: "/portal/faculty/messages",  label: "Office Hours & PTM",     icon: "💬", badge: unhandledReplies > 0 ? unhandledReplies : undefined },
        { href: "/portal/faculty/infirmary", label: "Infirmary & Trauma",     icon: "🏥" },
        { href: "/portal/faculty/lost-found",label: "Lost & Found Snap",      icon: "🎒" },
      ],
    },
    {
      title: "School Operations",
      items: [
        { href: "/portal/faculty/clubs",       label: "Clubs & Dossier",      icon: "🏆" },
        { href: "/portal/faculty/relief",      label: "Relief Desk",          icon: "🔄", badge: "2" },
        { href: "/portal/faculty/field-trips", label: "Field Trip Manifests", icon: "🚌" },
        { href: "/portal/faculty/schedule",    label: "Teaching Schedule",    icon: "🗓️" },
        { href: "/portal/faculty/circulars",   label: "School Circulars",     icon: "📢" },
        { href: "/portal/faculty/students",    label: "Student Roster",       icon: "👥" },
      ],
    },
    {
      title: "Faculty HR & Services",
      items: [
        { href: "/portal/faculty/hr",           label: "Staff HR & Payroll",   icon: "🌴" },
        { href: "/portal/faculty/store-indent",  label: "Store Indent Requisition", icon: "📦" },
        { href: "/portal/faculty/maintenance",   label: "Campus Helpdesk",      icon: "🛠️" },
        { href: "/portal/faculty/settings",      label: "Account Settings",     icon: "⚙️" },
      ],
    },
  ];

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="portal-shell">
      {/* ── Sidebar (Clean White Theme matching screenshots) ── */}
      <aside className="portal-sidebar bg-white border-r border-slate-200/80 shadow-xs" id="faculty-sidebar">
        {/* Brand / Institute Header */}
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
                <div className="text-slate-400 text-[11px] font-medium">Faculty Portal</div>
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
                  Faculty Teacher
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  <span className="text-emerald-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation with Categories */}
        <nav className="flex-1 p-2.5 space-y-3.5 overflow-y-auto">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-sm w-4 flex-shrink-0 text-center">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/60 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom Signout */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-white">
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="portal-main">
        {/* Top Navigation Bar matching Screenshots 1, 2, 3 */}
        <header className="portal-topbar justify-between gap-4">
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
                placeholder="Search classes, students, or resources..."
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

            {/* Quick Action (+) Button */}
            <button
              title="Quick Action"
              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center text-sm font-semibold transition"
            >
              +
            </button>

            {/* Notification Bell with Badge */}
            <Link
              href="/portal/faculty/messages"
              title="Notifications & Messages"
              className="relative h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center text-sm transition"
            >
              <span>🔔</span>
              {unhandledReplies > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unhandledReplies}
                </span>
              )}
            </Link>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="portal-content animate-fade-in">{children}</main>

        <footer className="border-t border-slate-200/70 bg-white px-6 py-3.5 text-[11px] text-slate-400 flex items-center justify-between">
          <div>{SCHOOL.name} &bull; Faculty Command Center</div>
          <div className="text-slate-400">Powered by Finkfold EdOS</div>
        </footer>
      </div>
    </div>
  );
}
