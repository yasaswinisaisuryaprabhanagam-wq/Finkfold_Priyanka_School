import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AllocationGrid from "./AllocationGrid";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: `Class Allocations "“ ${SCHOOL.name}` };

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

  // Fallback
  if (teachers.length === 0) {
    teachers = [
      { id: "t1", full_name: "Kiran Sir", role: "teacher" },
      { id: "t2", full_name: "Priya Ma'am", role: "teacher" },
    ];
    classes = [
      { id: "c1a00000-0000-0000-0000-000000000001", name: "10", section: "A", academic_year: "2026-2027" },
      { id: "c9a00000-0000-0000-0000-000000000003", name: "9", section: "A", academic_year: "2026-2027" },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}>
        <div className="relative z-10">
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Admin Control Panel &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
             Class Allocation Grid
          </h1>
          <p className="text-white/60 text-sm">Assign or remove classes from teachers – changes take effect immediately</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal/admin" className="hover:text-blue-700">Dashboard</Link>
        <span>"º</span>
        <Link href="/portal/admin/staff" className="hover:text-blue-700">Staff</Link>
        <span>"º</span>
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
