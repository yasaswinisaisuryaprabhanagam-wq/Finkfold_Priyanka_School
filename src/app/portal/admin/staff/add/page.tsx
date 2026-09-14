import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AddTeacherClient from "./AddTeacherClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: `Add Staff Member "“ ${SCHOOL.name}` };

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
      <div
        className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Admin Control Panel &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            âž• Add New Staff Member
          </h1>
          <p className="text-white/60 text-sm">
            Creates a login account + teacher profile in one step
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal/admin" className="hover:text-blue-700">Dashboard</Link>
        <span>"º</span>
        <Link href="/portal/admin/staff" className="hover:text-blue-700">Staff</Link>
        <span>"º</span>
        <span className="font-semibold text-slate-800">Add Member</span>
      </div>

      {/* Info card */}
      <div className="card p-4 text-sm text-slate-600 space-y-2">
        <div className="font-bold text-slate-800"> How login is created:</div>
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
