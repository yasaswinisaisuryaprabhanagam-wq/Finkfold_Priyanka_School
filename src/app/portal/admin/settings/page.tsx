import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Admin Settings – ${SCHOOL.name}`,
};

export default async function AdminSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
            <span>⚙️ Admin Control Panel</span>
            <span>·</span>
            <span>{SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            School Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">System configuration and account security</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Environment: Production
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-xs">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              {profile.full_name}
            </div>
            <div className="text-xs text-slate-500 capitalize mt-0.5">
              Role: {profile.role?.replace("_", " ")} · {SCHOOL.name}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Account Security</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-800">🔒 Change Admin Password</div>
              <div className="text-xs text-slate-500 mt-0.5">Reset your admin portal password via secure email</div>
            </div>
            <Link href="/reset-password" className="btn btn-primary btn-sm">
              Change Password →
            </Link>
          </div>
        </div>
      </div>

      {/* School Configuration */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
          🏫 School Configuration
        </h3>
        <div className="space-y-3">
          {[
            { label: "School Name",     value: SCHOOL.name },
            { label: "School Code",     value: SCHOOL.code },
            { label: "Address",         value: SCHOOL.address },
            { label: "Phone",           value: SCHOOL.phone },
            { label: "Email",           value: SCHOOL.email },
            { label: "Academic Year",   value: SCHOOL.academicYear },
            { label: "Affiliation",     value: SCHOOL.affiliation },
            { label: "Working Hours",   value: SCHOOL.workingHours },
            { label: "WhatsApp Number", value: SCHOOL.supportPhone },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-xs font-semibold text-slate-500 w-36 flex-shrink-0">{label}</span>
              <span className="text-sm text-slate-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          ⚠️ To change school configuration, contact your Finkfold ERP system administrator.
        </div>
      </div>

      {/* Quick Links */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Admin Links</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/portal/admin/students",  icon: "👥", label: "Student Registry",  sub: "Manage all students" },
            { href: "/portal/admin/classes",   icon: "🏫", label: "Class Management",  sub: "View and manage classes" },
            { href: "/portal/admin/whatsapp",  icon: "💬", label: "WhatsApp Log",      sub: "Notification audit trail" },
            { href: "/portal/admin/staff",     icon: "👨‍🏫", label: "Staff Management",  sub: "Manage teachers" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card card-hover p-4 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-xs font-bold text-slate-800">{item.label}</div>
                <div className="text-[10px] text-slate-500">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
