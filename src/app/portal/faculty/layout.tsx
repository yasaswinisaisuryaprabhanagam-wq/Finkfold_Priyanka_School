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
  // Not logged in → send to login
  if (!userProfile) {
    redirect("/login?from=faculty");
  }

  // Wrong role → send to their correct portal
  if (userProfile.role === "school_admin" || userProfile.role === "super_admin") {
    redirect("/portal/admin");
  }
  if (userProfile.role === "parent") {
    redirect("/portal/student");
  }
  // Only 'teacher' role reaches below
  // ───────────────────────────────────────────────────────────

  const profile = userProfile;

  // Query unhandled parent replies for notification bubble
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
        { href: "/portal/faculty/settings",    label: "Account Settings",     icon: "⚙️" },
      ],
    },
  ];

  return (
    <div className="portal-shell">
      {/* ── Sidebar ── */}
      <aside className="portal-sidebar" id="faculty-sidebar">
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
              <div className="text-white/50 text-[10px] font-medium mt-0.5">Faculty Command Center</div>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-xs font-semibold truncate">{profile.full_name}</div>
              <div className="text-white/50 text-[10px] flex items-center gap-1">
                Teacher
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Navigation with Categories */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => (
                <Link key={item.href} href={item.href} className="sidebar-nav-item flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm w-4 flex-shrink-0 text-center">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom — sign out only, NO cross-portal links */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="portal-main">
        <header className="portal-topbar gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
                Faculty Dashboard
              </h2>
              <p className="text-[11px] text-slate-400">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Active
            </span>
          </div>
        </header>

        <main className="portal-content animate-fade-in">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-[11px] text-slate-400 text-center">
          {SCHOOL.name} • Faculty Portal • Powered by Finkfold ERP
        </footer>
      </div>
    </div>
  );
}
