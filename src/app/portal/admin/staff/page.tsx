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
      {/* Header matching Student & Faculty Portal design */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <span>👨‍🏫</span>
            <span>Admin Control Panel &middot; {SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Staff Management
          </h1>
          <p className="text-slate-500 text-xs">
            {activeTeachers.length} active faculty &middot; {relievedTeachers.length} relieved
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/portal/admin/staff/allocations" className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs">
            <span>📋</span>
            <span>Allocations Grid</span>
          </Link>
          <Link href="/portal/admin/staff/add" className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs">
            <span>+</span>
            <span>Add Staff Member</span>
          </Link>
        </div>
      </div>

      {/* Stats matching Student & Faculty Portal design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
            👨‍🏫
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Staff</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {teachers.length}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <span>All Registered</span>
            </div>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
            ✓
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Faculty</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {activeTeachers.length}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>Teaching &amp; Admin</span>
            </div>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center text-2xl flex-shrink-0">
            📁
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Relieved</div>
            <div className="text-2xl font-bold text-slate-500 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {relievedTeachers.length}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <span>Past Records</span>
            </div>
          </div>
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
