import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import RelieveStaffButton from "./RelieveStaffButton";
import { redirect } from "next/navigation";

export const metadata = { title: `Staff Management " ${SCHOOL.name}` };

export default async function AdminStaffPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();

  // Fetch all teacher profiles
  let teachers: any[] = [];
  try {
    const { data } = await adminClient
      .from("profiles")
      .select("id, full_name, role, is_active, relieved_on, phone, employee_code, created_at")
      .eq("school_id", profile.school_id)
      .in("role", ["teacher", "school_admin"])
      .order("role")
      .order("full_name");
    teachers = data || [];
  } catch {}

  // Fetch class allocations for each teacher
  let allocMap = new Map<string, any[]>();
  try {
    const { data } = await adminClient
      .from("teacher_classes")
      .select("teacher_id, class_id, subject, is_class_teacher, academic_year, relieved_on, classes(name, section)")
      .is("relieved_on", null);
    (data || []).forEach((a: any) => {
      const list = allocMap.get(a.teacher_id) || [];
      list.push(a);
      allocMap.set(a.teacher_id, list);
    });
  } catch {}

  // Fallback
  if (teachers.length === 0) {
    teachers = [
      { id: "t1", full_name: "Kiran Sir", role: "teacher", is_active: true, phone: "+919876543210", employee_code: "EMP-001", created_at: new Date().toISOString() },
      { id: "t2", full_name: "Priya Ma'am", role: "teacher", is_active: true, phone: "+917654321098", employee_code: "EMP-002", created_at: new Date().toISOString() },
    ];
  }

  const activeTeachers = teachers.filter(t => t.is_active !== false);
  const relievedTeachers = teachers.filter(t => t.is_active === false);

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
            " Staff Management
          </h1>
          <p className="text-white/60 text-sm">{activeTeachers.length} active staff &middot; {relievedTeachers.length} relieved</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-900">{teachers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Staff</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-emerald-600">{activeTeachers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-400">{relievedTeachers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Relieved</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/portal/admin/staff/allocations" className="btn btn-primary">
           Class Allocations Grid
        </Link>
        <Link href="/portal/admin/staff/add" className="btn btn-ghost border border-dashed border-slate-300">
          + Add New Teacher
        </Link>
      </div>

      {/* Active staff */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Active Staff
          </h2>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Employee Code</th>
                <th>Phone</th>
                <th>Assigned Classes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTeachers.map((t: any) => {
                const allocs = allocMap.get(t.id) || [];
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900 font-bold text-sm flex-shrink-0">
                          {t.full_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{t.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.role === "school_admin" ? "badge-purple" : "badge-blue"}`}>
                        {t.role === "school_admin" ? "Admin" : "Teacher"}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-500">{t.employee_code || "-"}</td>
                    <td className="font-mono text-xs text-slate-500">{t.phone || "-"}</td>
                    <td>
                      {allocs.length === 0 ? (
                        <span className="text-xs text-slate-400">No classes assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {allocs.map((a: any, i: number) => (
                            <span key={i} className="text-[11px] bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded font-semibold">
                              {a.classes?.name}-{a.classes?.section}
                              {a.is_class_teacher && " [CT]"}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td><span className="badge badge-green">Active</span></td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/portal/admin/staff/allocations`}
                          className="text-xs font-semibold text-blue-700 hover:underline">
                          Assign &rarr;
                        </Link>
                        {t.role !== "school_admin" && (
                          <RelieveStaffButton
                            teacherId={t.id}
                            teacherName={t.full_name}
                            otherTeachers={activeTeachers.filter((x: any) => x.id !== t.id && x.role === "teacher")}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relieved staff */}
      {relievedTeachers.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-base font-bold text-slate-500" style={{ fontFamily: "Outfit, sans-serif" }}>
              Relieved Staff (Historical)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Preserved for historical attendance records</p>
          </div>
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Relieved On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {relievedTeachers.map((t: any) => (
                  <tr key={t.id} className="opacity-60">
                    <td className="font-semibold text-slate-700">{t.full_name}</td>
                    <td><span className="badge badge-slate">Teacher</span></td>
                    <td className="font-mono text-xs text-slate-500">
                      {t.relieved_on ? new Date(t.relieved_on).toLocaleDateString("en-IN") : ""}
                    </td>
                    <td><span className="badge badge-slate">Relieved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
