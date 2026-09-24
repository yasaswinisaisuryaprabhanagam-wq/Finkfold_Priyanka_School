import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import SignOutButton from "@/components/SignOutButton";
import StudentQuickActionModal from "@/components/StudentQuickActionModal";
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

  if (userProfile.role === "school_admin" || userProfile.role === "super_admin") {
    redirect("/portal/admin");
  }
  if (userProfile.role === "teacher") {
    redirect("/portal/faculty");
  }

  const profile = userProfile;

  const navSections = [
    {
      title: "Academics & Analytics",
      items: [
        { href: "/portal/student", label: "Attendance Record", icon: "📊" },
        { href: "/portal/student/subjects", label: "Subjects & Teachers", icon: "📖" },
        { href: "/portal/student/academics", label: "Exams & AI Skill Gaps", icon: "📈" },
        { href: "/portal/student/timetable", label: "Class Timetable", icon: "🗓️" },
        { href: "/portal/student/homework", label: "Daily Homework", icon: "📝" },
        { href: "/portal/student/circulars", label: "Official Circulars", icon: "📢" },
      ],
    },
    {
      title: "Communication & Safety",
      items: [
        { href: "/portal/student/ptm-messages", label: "Teacher Chat & PTM", icon: "💬" },
        { href: "/portal/student/safespace", label: "Safe Space & Conduct", icon: "🛡️" },
        { href: "/portal/student/lost-found", label: "Digital Lost & Found", icon: "🎒" },
      ],
    },
    {
      title: "Self-Service Logistics",
      items: [
        { href: "/portal/student/transport", label: "Transport & Commute", icon: "🚌" },
        { href: "/portal/student/leaves", label: "Leaves & On-Duty (OD)", icon: "📅" },
        { href: "/portal/student/store", label: "Campus Store & Uniforms", icon: "🛍️" },
        { href: "/portal/student/electives", label: "Electives & Club Bidding", icon: "🎯" },
        { href: "/portal/student/outpass", label: "Out-Pass & Mess Menu", icon: "🚪" },
      ],
    },
    {
      title: "Services & Vault",
      items: [
        { href: "/portal/student/fees", label: "Fee Receipts & Refunds", icon: "🧾" },
        { href: "/portal/student/documents", label: "Document Vault & E-Certs", icon: "🏛️" },
        { href: "/portal/student/health", label: "Health & Infirmary", icon: "🩺" },
        { href: "/portal/student/settings", label: "Account Settings", icon: "👤" },
      ],
    },
  ];

  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="portal-shell">
      {/* ── Sidebar (Clean White Theme matching screenshots) ── */}
      <aside className="portal-sidebar bg-white border-r border-slate-200/80 shadow-xs" id="student-sidebar">
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
                <div className="text-slate-400 text-[11px] font-medium">Student & Parent Portal</div>
              </div>
            </div>
            <div className="text-slate-400 text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </Link>
        </div>

        {/* User Info & Reward Points Chip */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-violet-100 border border-violet-200 text-violet-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-slate-800 text-xs font-semibold truncate">{profile.full_name}</div>
              <div className="text-slate-400 text-[10px] flex items-center gap-1">
                Parent / Student
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                <span className="text-emerald-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/60 text-[11px] text-amber-800 font-medium">
            <span className="flex items-center gap-1">⭐ Merit Points</span>
            <span className="font-bold text-amber-900">150 Pts</span>
          </div>
        </div>

        {/* Navigation — Categorized Self-Service Sections */}
        <nav className="flex-1 p-2.5 space-y-3.5 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sec.title}
              </div>
              {sec.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                >
                  <span className="text-sm w-4 flex-shrink-0 text-center">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
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
        {/* Top Navigation Bar matching Screenshots 1, 2, 3, 4 */}
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
                placeholder="Search subjects, homework, timetable..."
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
            <StudentQuickActionModal />

            {/* Notification Bell */}
            <Link
              href="/portal/student/circulars"
              title="Circulars & Alerts"
              className="relative h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center text-sm transition"
            >
              <span>🔔</span>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-600" />
            </Link>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="portal-content animate-fade-in">{children}</main>

        <footer className="border-t border-slate-200/70 bg-white px-6 py-3.5 text-[11px] text-slate-400 flex items-center justify-between">
          <div>{SCHOOL.name} &bull; Student Self-Service Portal</div>
          <div className="text-slate-400">Powered by Finkfold EdOS</div>
        </footer>
      </div>
    </div>
  );
}
