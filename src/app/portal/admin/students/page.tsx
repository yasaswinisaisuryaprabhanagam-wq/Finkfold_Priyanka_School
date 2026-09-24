import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import MarkLeftButton from "./MarkLeftButton";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Student Registry · ${SCHOOL.name}`,
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

  // Medical Records for Allergy Alerts
  let medicalMap = new Map<string, any>();
  try {
    const studentIds = students.map((s: any) => s.id);
    if (studentIds.length > 0) {
      const { data: meds } = await adminClient
        .from("student_medical_records")
        .select("student_id, blood_group, known_allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone")
        .in("student_id", studentIds);

      (meds || []).forEach((m: any) => medicalMap.set(m.student_id, m));
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
  const medicalAlertCount = Array.from(medicalMap.values()).filter((m: any) => (m.known_allergies?.length > 0 || m.chronic_conditions?.length > 0)).length;

  return (
    <div className="space-y-6">
      {/* Header matching Student & Faculty Portal design */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            <span>👥</span>
            <span>Admin Control Panel &middot; {SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Student Registry
          </h1>
          <p className="text-slate-500 text-xs">
            {activeCount} active students enrolled · Academic Year {SCHOOL.academicYear}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/portal/admin/students/import" className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs">
            <span>📥</span>
            <span>Import CSV</span>
          </Link>
          <Link href="/portal/admin/admissions" className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs">
            <span>+</span>
            <span>New Admission</span>
          </Link>
        </div>
      </div>

      {/* Stats matching Student & Faculty Portal design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
            👥
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {students.length}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <span>Roster Count</span>
            </div>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
            ✓
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Enrolled</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {activeCount}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>In Good Standing</span>
            </div>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl flex-shrink-0">
            💬
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp Enabled</div>
            <div className="text-2xl font-bold text-green-600 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {whatsAppCount}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
              <span>Verified Parents</span>
            </div>
          </div>
        </div>

        <div className="stat-card flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0">
            🩺
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical Alerts</div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              {medicalAlertCount}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              <span>Allergies &amp; Care</span>
            </div>
          </div>
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
              📥 Import CSV
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{s.full_name}</span>
                        {(() => {
                          const med = medicalMap.get(s.id);
                          return med?.blood_group ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                              {med.blood_group}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      {(() => {
                        const med = medicalMap.get(s.id);
                        if (!med || (!med.known_allergies?.length && !med.chronic_conditions?.length)) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
                            {med.known_allergies?.map((a: string, i: number) => (
                              <span key={i} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                🛑 {a}
                              </span>
                            ))}
                            {med.chronic_conditions?.map((c: string, i: number) => (
                              <span key={i} className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                💊 {c}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
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
                        {s.consent_whatsapp ? "✓ Enabled" : "— Disabled"}
                      </span>
                    </td>
                    <td>
                      {pct !== null ? (
                        <span className={`badge ${pct >= 90 ? "badge-green" : pct >= 75 ? "badge-blue" : "badge-red"}`}>
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
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
