import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AddTeacherClient from "./AddTeacherClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: `Add Staff Member · ${SCHOOL.name}` };

export default async function AddTeacherPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();

  let classes: any[] = [];
  try {
    const { data } = await adminClient
      .from("classes")
      .select("id, name, section, academic_year")
      .eq("school_id", profile.school_id)
      .order("name")
      .order("section");
    classes = data || [];
  } catch {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
            <span>👨‍🏫 Staff Management</span>
            <span>·</span>
            <span>{SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Add New Staff Member
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Creates a secure login account and faculty profile in one step
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portal/admin/staff" className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
            ← Back to Staff
          </Link>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal/admin" className="hover:text-blue-700">Dashboard</Link>
        <span>›</span>
        <Link href="/portal/admin/staff" className="hover:text-blue-700">Staff</Link>
        <span>›</span>
        <span className="font-semibold text-slate-800">Add Member</span>
      </div>

      {/* Info card */}
      <div className="card p-4 text-sm text-slate-600 space-y-2">
        <div className="font-bold text-slate-800">🔑 How login is created:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n: "1", t: "Fill this form", d: "Enter teacher's name, email, and set an initial password" },
            { n: "2", t: "Account created instantly", d: "No email confirmation needed - login is ready immediately" },
            { n: "3", t: "Share credentials", d: "Tell the teacher their email + password to log in at the faculty portal" },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center flex-shrink-0">
                {s.n}
              </div>
              <div>
                <div className="font-semibold text-slate-800">{s.t}</div>
                <div className="text-xs text-slate-500">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="card p-6">
        <AddTeacherClient schoolId={profile.school_id} classes={classes} />
      </div>
    </div>
  );
}
