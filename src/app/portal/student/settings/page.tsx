import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: `My Account – ${SCHOOL.name}` };

export default async function StudentSettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
          Student Portal
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          👤 My Account
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Account security and personal information</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-violet-400 flex items-center justify-center text-white font-black text-2xl">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              {profile.full_name}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Parent / Guardian · {SCHOOL.name}</div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-800">🔒 Change Password</div>
              <div className="text-xs text-slate-500 mt-0.5">Reset your portal password via email</div>
            </div>
            <Link href="/reset-password" className="btn btn-primary btn-sm">
              Change →
            </Link>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60">
            <div className="text-sm font-semibold text-slate-800">🏫 {SCHOOL.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{SCHOOL.address}</div>
            <div className="text-xs text-slate-500">{SCHOOL.phone} · {SCHOOL.academicYear}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
