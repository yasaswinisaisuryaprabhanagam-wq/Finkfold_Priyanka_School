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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
            <span>👥 Student Registry</span>
            <span>·</span>
            <span>{SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Bulk Student Import
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload a CSV file to enroll up to 500 students in one transaction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portal/admin/students" className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
            ← Back to Students
          </Link>
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
