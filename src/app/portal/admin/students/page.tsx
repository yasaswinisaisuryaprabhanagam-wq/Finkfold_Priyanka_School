import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import MarkLeftButton from "./MarkLeftButton";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Student Registry " ${SCHOOL.name}`,
};

export default async function AdminStudentsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();

  // Fetch all students (including left_on for inactive display)
  let students: any[] = [];
  try {
    const { data } = await adminClient
      .from("students")
      .select("id, full_name, roll_no, admission_no, class_id, parent_name, parent_phone, consent_whatsapp, is_active, left_on, left_reason")
      .eq("school_id", profile.school_id)
      .order("class_id")
      .order("roll_no");
    students = data || [];
  } catch {}

  // Class map
  let classMap = new Map<string, any>();
  try {
    const { data } = await adminClient
      .from("classes")
      .select("id, name, section")
      .eq("school_id", profile.school_id);
    (data || []).forEach((c: any) => classMap.set(c.id, c));
  } catch {}

  // Attendance stats per student (last 30 days)
  let attendanceMap = new Map<string, { present: number; total: number }>();
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: sessions } = await adminClient
      .from("attendance_sessions")
      .select("id")
      .eq("school_id", profile.school_id)
      .gte("attendance_date", since.toISOString().slice(0, 10));

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s: any) => s.id);
      const { data: records } = await adminClient
        .from("attendance_records")
        .select("student_id, status")
        .in("session_id", sessionIds);

      (records || []).forEach((r: any) => {
        const cur = attendanceMap.get(r.student_id) || { present: 0, total: 0 };
        cur.total++;
        if (r.status === "present") cur.present++;
        attendanceMap.set(r.student_id, cur);
      });
    }
  } catch {}

  // Fallback
  if (students.length === 0) {
    students = [
      { id: "s1", full_name: "Yasaswini", roll_no: 1, admission_no: "ADM-2026-001", class_id: "c10a2026-1701-4cc0-9c59-8812324eb396", parent_name: "Ramesh Babu",    parent_phone: "+918247220252", consent_whatsapp: true, is_active: true },
      { id: "s2", full_name: "Kiran",     roll_no: 2, admission_no: "ADM-2026-002", class_id: "c10a2026-1701-4cc0-9c59-8812324eb396", parent_name: "Srinivas Rao",   parent_phone: "+917981067780", consent_whatsapp: true, is_active: true },
      { id: "s3", full_name: "Kethan",    roll_no: 3, admission_no: "ADM-2026-003", class_id: "c10a2026-1701-4cc0-9c59-8812324eb396", parent_name: "Venkata Raman",  parent_phone: "+919440266743", consent_whatsapp: true, is_active: true },
    ];
    classMap.set("c10a2026-1701-4cc0-9c59-8812324eb396", { id: "c10a2026-1701-4cc0-9c59-8812324eb396", name: "10", section: "A" });
  }

  const activeCount = students.filter(s => s.is_active).length;
  const whatsAppCount = students.filter(s => s.consent_whatsapp).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}>
        <div className="relative z-10">
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Admin Control Panel &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
             Student Registry
          </h1>
          <p className="text-white/60 text-sm">{activeCount} active students enrolled " {SCHOOL.academicYear}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-900">{students.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Students</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-emerald-600">{activeCount}</div>
          <div className="text-xs text-slate-500 mt-1">Active</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-green-600">{whatsAppCount}</div>
          <div className="text-xs text-slate-500 mt-1">WhatsApp Enabled</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-black text-slate-700">{students.length - whatsAppCount}</div>
          <div className="text-xs text-slate-500 mt-1">No WhatsApp</div>
        </div>
      </div>

      {/* Full Student Table */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            All Students
          </h2>
          <div className="flex items-center gap-2">
            <Link href="/portal/admin/students/import" className="btn btn-primary btn-sm">
               Import CSV
            </Link>
            <span className="badge badge-blue">{activeCount} Active</span>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Admission No</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Phone</th>
                <th>WhatsApp</th>
                <th>Attendance (30d)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: any) => {
                const cls = classMap.get(s.class_id);
                const att = attendanceMap.get(s.id);
                const pct = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : null;
                return (
                  <tr key={s.id} className={!s.is_active ? "opacity-60 bg-slate-50/60" : ""}>
                    <td className="font-bold text-center text-slate-700">#{s.roll_no}</td>
                    <td className="font-semibold text-slate-800">
                      {s.full_name}
                      {!s.is_active && s.left_on && (
                        <div className="text-[10px] text-rose-500 mt-0.5">
                          Left: {new Date(s.left_on).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </td>
                    <td className="font-mono text-xs text-slate-500">{s.admission_no}</td>
                    <td className="text-xs font-semibold text-blue-900">
                      {cls ? `Class ${cls.name}-${cls.section}` : ""}
                    </td>
                    <td className="text-xs text-slate-600">{s.parent_name}</td>
                    <td className="font-mono text-xs text-slate-500">{s.parent_phone}</td>
                    <td>
                      <span className={`badge ${s.consent_whatsapp ? "badge-green" : "badge-slate"}`}>
                        {s.consent_whatsapp ? "âœ" : "âœ-"}
                      </span>
                    </td>
                    <td>
                      {pct !== null ? (
                        <span className={`badge ${pct >= 90 ? "badge-green" : pct >= 75 ? "badge-blue" : "badge-red"}`}>
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">"</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${s.is_active ? "badge-green" : "badge-slate"}`}>
                        {s.is_active ? "Active" : s.left_reason ? s.left_reason.replace("_", " ") : "Left"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/attendance/${s.class_id}`}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Roll &rarr;
                        </Link>
                        {s.is_active && (
                          <MarkLeftButton studentId={s.id} studentName={s.full_name} />
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
    </div>
  );
}
