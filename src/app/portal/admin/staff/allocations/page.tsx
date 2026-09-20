import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AllocationGrid from "./AllocationGrid";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: `Class Allocations · ${SCHOOL.name}` };

export default async function AllocationPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();

  // Fetch active teachers
  let teachers: any[] = [];
  try {
    const { data } = await adminClient
      .from("profiles")
      .select("id, full_name, role")
      .eq("school_id", profile.school_id)
      .eq("role", "teacher")
      .eq("is_active", true)
      .order("full_name");
    teachers = data || [];
  } catch {}

  // Fetch all classes
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

  // Fetch current allocations (active only)
  let allocations: any[] = [];
  try {
    const { data } = await adminClient
      .from("teacher_classes")
      .select("teacher_id, class_id, subject, is_class_teacher")
      .is("relieved_on", null);
    allocations = data || [];
  } catch {}

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
            <span>📋 Staff Management</span>
            <span>·</span>
            <span>{SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class Allocation Grid
          </h1>
          <p className="text-slate-500 text-sm mt-1">Assign or remove classes from teachers – changes take effect immediately</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portal/admin/staff" className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
            ← Back to Staff
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal/admin" className="hover:text-blue-700">Dashboard</Link>
        <span>›</span>
        <Link href="/portal/admin/staff" className="hover:text-blue-700">Staff</Link>
        <span>›</span>
        <span className="font-semibold text-slate-800">Allocations</span>
      </div>

      <div className="card p-5 text-xs text-slate-600">
        <span className="font-bold">How to use:</span> Click a cell to toggle assignment.{" "}
        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">* Green</span> = assigned as class teacher (roll call).{" "}
        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">Blue</span> = subject teacher.
        Changes are saved instantly.
      </div>

      <AllocationGrid
        teachers={teachers}
        classes={classes}
        allocations={allocations}
        academicYear={SCHOOL.academicYear}
      />
    </div>
  );
}
