import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";

export const metadata = {
  title: `Account Settings – ${SCHOOL.name}`,
};

export default async function FacultySettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}>
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Portal · {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            ⚙️ Account Settings
          </h1>
          <p className="text-white/70 text-sm">Manage your account security and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-900 font-black text-2xl flex-shrink-0">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              {profile.full_name}
            </div>
            <div className="text-xs text-slate-500 capitalize mt-0.5">
              {profile.role?.replace("_", " ")} · {SCHOOL.name}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Security Settings</h3>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-800">🔒 Change Password</div>
              <div className="text-xs text-slate-500 mt-0.5">Reset your portal login password via secure email link</div>
            </div>
            <Link href="/reset-password" className="btn btn-primary btn-sm">
              Change Password →
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-200/60">
            <div>
              <div className="text-sm font-semibold text-slate-800">🏫 School Information</div>
              <div className="text-xs text-slate-500 mt-0.5">{SCHOOL.name} · {SCHOOL.address}</div>
              <div className="text-xs text-slate-500">{SCHOOL.phone} · {SCHOOL.email}</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <div>
              <div className="text-sm font-semibold text-slate-800">📅 Academic Year</div>
              <div className="text-xs text-slate-500 mt-0.5">{SCHOOL.academicYear} · {SCHOOL.affiliation}</div>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="card p-5 text-center">
        <div className="text-2xl mb-2">🆘</div>
        <div className="text-sm font-bold text-slate-800 mb-1">Need Help?</div>
        <div className="text-xs text-slate-500">
          Contact your school admin or reach us at{" "}
          <a href={`mailto:${SCHOOL.email}`} className="text-blue-700 font-semibold hover:underline">
            {SCHOOL.email}
          </a>
        </div>
      </div>
    </div>
  );
}
