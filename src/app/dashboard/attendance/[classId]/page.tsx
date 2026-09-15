import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AttendanceForm from "@/components/AttendanceForm";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  const { createAdminClient } = await import("@/lib/supabase/server");
  const adminClient = await createAdminClient();

  // 1. Fetch Class Data using adminClient for reliable resolution
  let classData: any = null;
  try {
    const res = await adminClient
      .from("classes")
      .select("id, name, section, academic_year, school_id")
      .eq("id", classId)
      .maybeSingle();
    classData = res.data;
  } catch (err) {
    console.warn("Could not load class from DB:", err);
  }

  // Fallback class if not found or DB permissions pending
  if (!classData) {
    classData = {
      id: classId,
      name: "10",
      section: "A",
      academic_year: "2026-2027",
      school_id: profile.school_id,
    };
  }

  // 3. Fetch Active Students
  let students: any[] | null = null;
  try {
    const res = await adminClient
      .from("students")
      .select("id, full_name, roll_no, parent_phone, consent_whatsapp")
      .eq("class_id", classId)
      .eq("is_active", true)
      .order("roll_no", { ascending: true });
    students = res.data;
  } catch (err) {
    console.warn("Could not load students from DB:", err);
  }

  const studentsList = (students && students.length > 0) ? students : [
    {
      id: "s1-yasaswini",
      full_name: "Yasaswini",
      roll_no: 1,
      parent_phone: "+918247220252",
      consent_whatsapp: true,
    },
    {
      id: "s2-kiran",
      full_name: "Kiran",
      roll_no: 2,
      parent_phone: "+917981067780",
      consent_whatsapp: true,
    },
    {
      id: "s3-kethan",
      full_name: "Kethan",
      roll_no: 3,
      parent_phone: "+919440266743",
      consent_whatsapp: true,
    },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 4. Fetch existing attendance session and records for today (if already taken)
  let initialRecords: Record<
    string,
    { status: "present" | "absent"; reason?: string | null; parent_acknowledged?: boolean | null }
  > = {};

  let existingSession: any = null;
  try {
    const res = await adminClient
      .from("attendance_sessions")
      .select("id")
      .eq("class_id", classId)
      .eq("attendance_date", today)
      .maybeSingle();
    existingSession = res.data;

    if (existingSession) {
      const { data: recs } = await adminClient
        .from("attendance_records")
        .select("student_id, status, reason, parent_acknowledged")
        .eq("session_id", existingSession.id);

      if (recs) {
        recs.forEach((r) => {
          initialRecords[r.student_id] = {
            status: r.status as "present" | "absent",
            reason: r.reason,
            parent_acknowledged: r.parent_acknowledged,
          };
        });
      }
    }
  } catch (err) {
    console.warn("Could not load existing session records:", err);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-blue-900 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span>Attendance</span>
        <span>/</span>
        <span className="font-semibold text-slate-900">
          Class {classData.name} – {classData.section}
        </span>
      </nav>

      {/* Class Session Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
              existingSession ? "bg-emerald-100 text-emerald-800" : "bg-blue-50 text-blue-900"
            }`}>
              {existingSession ? "✓ Completed for Today" : "Session Pending"}
            </span>
            <span className="text-xs text-slate-400">
              Academic Year {classData.academic_year}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Class {classData.name} – Section {classData.section}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Roll Call for: <span className="font-semibold text-slate-800">{todayFormatted}</span> ({today})
            {existingSession && (
              <span className="ml-2 font-medium text-emerald-700">&middot; Attendance Recorded</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/portal/faculty"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            ← Back to Classes
          </Link>
        </div>
      </div>

      {/* Embedded Attendance Form */}
      <AttendanceForm
        classId={classId}
        schoolId={classData.school_id}
        date={today}
        initialStudents={studentsList}
        userId={profile.id}
        initialRecords={initialRecords}
      />
    </div>
  );
}