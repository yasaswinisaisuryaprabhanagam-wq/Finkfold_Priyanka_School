import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getProfile();
  const profile = userProfile || {
    id: "preview-faculty-id",
    school_id: SCHOOL.id,
    full_name: "Kiran Sir (Faculty)",
    role: "teacher" as const,
  };

  const isPreview = !userProfile;

  const roleLabel =
    profile.role === "teacher"
      ? "Faculty / Teacher"
      : profile.role === "school_admin"
      ? "School Administrator"
      : "Super Admin";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Dashboard Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          {/* School Brand & Portal Label */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              {SCHOOL.logoUrl && (
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                  <img
                    src={SCHOOL.logoUrl}
                    alt={`${SCHOOL.name} Logo`}
                    className="h-6 w-6 object-contain"
                  />
                </div>
              )}
              <span className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors text-base hidden sm:inline">
                {SCHOOL.name}
              </span>
            </Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-1 text-xs">
              <Link
                href="/portal/faculty"
                className="px-2.5 py-1 rounded-md font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-colors"
              >
                Faculty
              </Link>
              <Link
                href="/portal/admin"
                className="px-2.5 py-1 rounded-md font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-colors"
              >
                Admin
              </Link>
              <Link
                href="/portal/student"
                className="px-2.5 py-1 rounded-md font-semibold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-colors"
              >
                Student
              </Link>
            </div>
          </div>

          {/* User Profile & Auth Action */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {profile.full_name}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {roleLabel} {isPreview && <span className="text-amber-600 font-bold">(Preview)</span>}
              </p>
            </div>
            {isPreview ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <span>🔑</span>
                <span>Sign In</span>
              </Link>
            ) : (
              <SignOutButton />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500 text-center">
        <span>{SCHOOL.name} Attendance Management System • Powered by Finkfold</span>
      </footer>
    </div>
  );
}