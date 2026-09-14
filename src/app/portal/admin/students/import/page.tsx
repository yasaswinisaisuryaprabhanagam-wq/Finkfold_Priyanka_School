import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import BulkImportClient from "./BulkImportClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Bulk Student Import " ${SCHOOL.name}`,
};

export default async function BulkImportPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}>
        <div className="relative z-10">
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Admin Control Panel &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
             Bulk Student Import
          </h1>
          <p className="text-white/60 text-sm">
            Upload a CSV file to enroll up to 500 students in one transaction
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal/admin" className="hover:text-blue-700">Dashboard</Link>
        <span>".</span>
        <Link href="/portal/admin/students" className="hover:text-blue-700">Students</Link>
        <span>".</span>
        <span className="text-slate-800 font-semibold">Bulk Import</span>
      </div>

      {/* How it works */}
      <div className="card p-5">
        <div className="text-sm font-bold text-slate-800 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
           How it works - 3 simple steps
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: "1", icon: "Download", title: "Download Template", desc: "Get the pre-formatted Excel/CSV template with correct column headers" },
            { n: "2", icon: "Edit", title: "Fill Student Data", desc: "Add student names, class, roll numbers and parent phone numbers offline" },
            { n: "3", icon: "&#128640;", title: "Upload & Confirm", desc: "Drag & drop the file - system validates and imports all students instantly" },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-900 font-black text-sm flex items-center justify-center flex-shrink-0">
                {s.n}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{s.icon} {s.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import wizard */}
      <div className="card p-6">
        <BulkImportClient schoolId={profile.school_id} />
      </div>
    </div>
  );
}
