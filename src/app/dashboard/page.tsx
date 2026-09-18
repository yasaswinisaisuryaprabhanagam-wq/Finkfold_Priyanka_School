import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import DashboardClientShell from "@/components/DashboardClientShell";
import { AdminClassItem, AdminStudentSummary, AdminNotificationItem } from "@/components/AdminPortalView";
import { StudentAttendanceSummary } from "@/components/StudentPortalView";

export default async function DashboardPage(props: {
  searchParams: Promise<{ view?: string; studentId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialView = (searchParams.view as "faculty" | "admin" | "student") || undefined;
  const initialStudentId = searchParams.studentId || undefined;

  const rawProfile = await getProfile();
  const profile = rawProfile || {
    id: "preview-user-id",
    organization_id: null,
    school_id: SCHOOL.id,
    full_name: initialView === "student" ? "Kiran (Student)" : initialView === "admin" ? "School Administrator" : "Kiran Sir (Faculty)",
    role: (initialView === "admin" ? "school_admin" : initialView === "student" ? "student" : "teacher") as any,
    roles: [(initialView === "admin" ? "school_admin" : initialView === "student" ? "student" : "teacher")],
    primary_role: (initialView === "admin" ? "school_admin" : initialView === "student" ? "student" : "teacher"),
    phone: null,
    avatar_url: null,
  };

  const adminClient = await createAdminClient();

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Fetch Classes in the school
  let rawClasses: any[] | null = null;
  try {
    const res = await adminClient
      .from("classes")
      .select("id, name, section, academic_year, school_id")
      .eq("school_id", profile.school_id)
      .order("name", { ascending: true });
    rawClasses = res.data;
  } catch (err) {
    console.warn("Could not load classes from DB:", err);
  }

  // Fallback classes if database table is not yet populated or permissions pending
  const defaultClassId = "c1a00000-0000-0000-0000-000000000001";
  const classesList = (rawClasses && rawClasses.length > 0) ? rawClasses : [
    { id: defaultClassId, school_id: profile.school_id, name: "10", section: "A", academic_year: "2026-2027" },
    { id: "09a00000-0000-0000-0000-000000000003", school_id: profile.school_id, name: "9",  section: "A", academic_year: "2026-2027" },
  ];

  // 2. Fetch Teacher-Class assignments (if teacher)
  let teacherClassesData: any[] = [];
  if (profile.role === "teacher") {
    try {
      const { data: assigned } = await adminClient
        .from("teacher_classes")
        .select("class_id, classes(id, name, section, academic_year)")
        .eq("teacher_id", profile.id);

      if (assigned && assigned.length > 0) {
        teacherClassesData = assigned;
      } else {
        teacherClassesData = classesList.map((c) => ({
          class_id: c.id,
          classes: c,
        }));
      }
    } catch {
      teacherClassesData = classesList.map((c) => ({
        class_id: c.id,
        classes: c,
      }));
    }
  } else {
    teacherClassesData = classesList.map((c) => ({
      class_id: c.id,
      classes: c,
    }));
  }

  // 3. Fetch Students in the school
  let rawStudents: any[] | null = null;
  try {
    const res = await adminClient
      .from("students")
      .select("id, school_id, class_id, admission_no, full_name, roll_no, parent_name, parent_phone, consent_whatsapp, is_active")
      .eq("school_id", profile.school_id)
      .eq("is_active", true)
      .order("roll_no", { ascending: true });
    rawStudents = res.data;
  } catch (err) {
    console.warn("Could not load students from DB:", err);
  }

  const studentsList = (rawStudents && rawStudents.length > 0) ? rawStudents : [
    { id: "d1000000-0000-0000-0000-000000000001", school_id: profile.school_id, class_id: classesList[0].id, admission_no: "ADM-2026-001", full_name: "Yasaswini", roll_no: 1, parent_name: "Ramesh Babu", parent_phone: "+918247220252", consent_whatsapp: true, is_active: true },
    { id: "d2000000-0000-0000-0000-000000000002", school_id: profile.school_id, class_id: classesList[0].id, admission_no: "ADM-2026-002", full_name: "Kiran",     roll_no: 2, parent_name: "Srinivas Rao",  parent_phone: "+917981067780", consent_whatsapp: true, is_active: true },
    { id: "d3000000-0000-0000-0000-000000000003", school_id: profile.school_id, class_id: classesList[0].id, admission_no: "ADM-2026-003", full_name: "Kethan",    roll_no: 3, parent_name: "Venkata Raman", parent_phone: "+919440266743", consent_whatsapp: true, is_active: true },
  ];

  const classMap = new Map(classesList.map((c) => [c.id, c]));

  // 4. Fetch Attendance Sessions & Records
  let rawSessions: any[] | null = null;
  try {
    const res = await adminClient
      .from("attendance_sessions")
      .select("id, class_id, attendance_date, marked_by, created_at")
      .eq("school_id", profile.school_id)
      .order("attendance_date", { ascending: false });
    rawSessions = res.data;
  } catch (err) {
    console.warn("Could not load sessions from DB:", err);
  }

  // Generate 10 days of sample sessions if none exist
  const mockDates = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (9 - i));
    return d.toISOString().slice(0, 10);
  });

  const sessionsList = (rawSessions && rawSessions.length > 0) ? rawSessions : mockDates.map((date, idx) => ({
    id: `sess-${idx}`,
    class_id: classesList[0].id,
    attendance_date: date,
    marked_by: profile.id,
    created_at: `${date}T09:00:00Z`,
  }));

  const sessionMap = new Map(sessionsList.map((s) => [s.id, s]));
  const sessionIds = sessionsList.map((s) => s.id);

  let recordsList: any[] = [];
  if (rawSessions && rawSessions.length > 0) {
    try {
      const { data: rawRecords } = await adminClient
        .from("attendance_records")
        .select("id, session_id, student_id, status, note, created_at")
        .in("session_id", sessionIds);
      recordsList = rawRecords || [];
    } catch (err) {
      console.warn("Could not load records from DB:", err);
    }
  }

  // Fallback realistic attendance records (Yasaswini 90%, Kiran 90%, Kethan 80%)
  if (recordsList.length === 0) {
    sessionsList.forEach((sess, dayIdx) => {
      // Yasaswini: absent on day index 3
      recordsList.push({
        id: `rec-s1-${dayIdx}`,
        session_id: sess.id,
        student_id: studentsList[0].id,
        status: dayIdx === 3 ? "absent" : "present",
        note: dayIdx === 3 ? "Family function" : "Regular attendance",
        created_at: `${sess.attendance_date}T09:05:00Z`,
      });

      // Kiran: absent on day index 6
      recordsList.push({
        id: `rec-s2-${dayIdx}`,
        session_id: sess.id,
        student_id: studentsList[1].id,
        status: dayIdx === 6 ? "absent" : "present",
        note: dayIdx === 6 ? "Mild fever" : "Regular attendance",
        created_at: `${sess.attendance_date}T09:05:00Z`,
      });

      // Kethan: absent on day index 2 and 8
      recordsList.push({
        id: `rec-s3-${dayIdx}`,
        session_id: sess.id,
        student_id: studentsList[2].id,
        status: (dayIdx === 2 || dayIdx === 8) ? "absent" : "present",
        note: (dayIdx === 2 || dayIdx === 8) ? "WhatsApp alert dispatched" : "Regular attendance",
        created_at: `${sess.attendance_date}T09:05:00Z`,
      });
    });
  }

  // Group records by student
  const studentRecordsMap = new Map<string, any[]>();
  recordsList.forEach((r) => {
    const current = studentRecordsMap.get(r.student_id) || [];
    current.push(r);
    studentRecordsMap.set(r.student_id, current);
  });

  // 5. Compute Class Admin Data (studentCount, today's roll-call status)
  const todaySessionByClass = new Map<string, string>();
  sessionsList
    .filter((s) => s.attendance_date === todayDate)
    .forEach((s) => todaySessionByClass.set(s.class_id, s.id));

  const adminClasses: AdminClassItem[] = classesList.map((cls) => {
    const enrolledStudents = studentsList.filter((st) => st.class_id === cls.id);
    const todaySessionId = todaySessionByClass.get(cls.id);
    const todayMarked = !!todaySessionId;
    let todayAbsentCount = 0;
    if (todaySessionId) {
      todayAbsentCount = recordsList.filter(
        (r) => r.session_id === todaySessionId && r.status === "absent"
      ).length;
    }

    return {
      id: cls.id,
      name: cls.name,
      section: cls.section,
      academic_year: cls.academic_year,
      studentCount: enrolledStudents.length,
      todayMarked,
      todayAbsentCount,
    };
  });

  // 6. Compute Student Summaries for Admin and Student Portals
  const adminStudents: AdminStudentSummary[] = [];
  const studentAttendanceSummaries: StudentAttendanceSummary[] = [];

  studentsList.forEach((st) => {
    const cls = classMap.get(st.class_id);
    const className = cls?.name || "10";
    const classSection = cls?.section || "A";
    const academicYear = cls?.academic_year || "2026-2027";

    const stRecords = studentRecordsMap.get(st.id) || [];
    const totalDays = stRecords.length;
    const presentDays = stRecords.filter((r) => r.status === "present").length;
    const absentDays = stRecords.filter((r) => r.status === "absent").length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const history = stRecords
      .map((r) => {
        const sess = sessionMap.get(r.session_id);
        return {
          id: r.id,
          date: sess?.attendance_date || todayDate,
          status: (r.status as "present" | "absent") || "present",
          note: r.note || null,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    // Summary for Admin Portal table
    adminStudents.push({
      id: st.id,
      full_name: st.full_name,
      roll_no: st.roll_no,
      admission_no: st.admission_no,
      class_name: className,
      class_section: classSection,
      parent_name: st.parent_name,
      parent_phone: st.parent_phone,
      consent_whatsapp: st.consent_whatsapp,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        percentage,
      },
    });

    // Summary for Student Portal dial and detailed view
    studentAttendanceSummaries.push({
      student: {
        id: st.id,
        full_name: st.full_name,
        roll_no: st.roll_no,
        admission_no: st.admission_no,
        parent_name: st.parent_name,
        parent_phone: st.parent_phone,
        class_name: className,
        class_section: classSection,
        academic_year: academicYear,
      },
      stats: {
        totalDays,
        presentDays,
        absentDays,
        percentage,
      },
      history,
    });
  });

  // 7. Fetch WhatsApp Notifications
  let rawNotifs: any[] | null = null;
  try {
    const res = await adminClient
      .from("whatsapp_notifications")
      .select("id, student_id, parent_phone, event_type, template_name, status, attendance_date, created_at, meta_message_id")
      .eq("school_id", profile.school_id)
      .order("created_at", { ascending: false })
      .limit(50);
    rawNotifs = res.data;
  } catch (err) {
    console.warn("Could not load notifications from DB:", err);
  }

  const studentNameMap = new Map(studentsList.map((s) => [s.id, s.full_name]));
  const sampleNotifs: AdminNotificationItem[] = [
    {
      id: "notif-1",
      student_name: "Yasaswini",
      parent_phone: "+918247220252",
      event_type: "absent",
      template_name: "school_absence_alert_v1",
      status: "delivered",
      attendance_date: todayDate,
      created_at: `${todayDate}T09:12:00Z`,
      meta_message_id: "wamid.HBgMOTE4MjQ3MjIwMjUyFQIAEhggRDQwRDgyN0U3ODU5NEFBQzhCNjAxRTJFM0VFMDE1MzkA",
    },
    {
      id: "notif-2",
      student_name: "Kiran",
      parent_phone: "+917981067780",
      event_type: "absent",
      template_name: "school_absence_alert_v1",
      status: "delivered",
      attendance_date: todayDate,
      created_at: `${todayDate}T09:14:00Z`,
      meta_message_id: "wamid.HBgMOTE3OTgxMDY3NzgAFQIAEhggRkJDMDgwOUQ2QzZGNEM2Mzk2ODFDQTc5RDBDNzg1RkMA",
    },
    {
      id: "notif-3",
      student_name: "Kethan",
      parent_phone: "+919440266743",
      event_type: "absent",
      template_name: "school_absence_alert_v1",
      status: "delivered",
      attendance_date: todayDate,
      created_at: `${todayDate}T09:15:00Z`,
      meta_message_id: "wamid.HBgMOTE5NDQwMjY2NzQzFQIAEhggRTE0MDcyNEM0QjYwNDY2M0E2N0U3ODQ5MEE5OTI0MTIA",
    },
  ];

  const whatsappNotifications: AdminNotificationItem[] = (rawNotifs && rawNotifs.length > 0)
    ? rawNotifs.map((n) => ({
        id: n.id,
        student_name: studentNameMap.get(n.student_id) || "Student",
        parent_phone: n.parent_phone,
        event_type: n.event_type,
        template_name: n.template_name,
        status: n.status,
        attendance_date: n.attendance_date,
        created_at: n.created_at,
        meta_message_id: n.meta_message_id,
      }))
    : sampleNotifs;

  // 8. Fetch Parent Replies
  let rawReplies: any[] | null = null;
  try {
    const res = await adminClient
      .from("parent_reply_log")
      .select("id, from_phone, message_text, handled, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    rawReplies = res.data;
  } catch (err) {
    console.warn("Could not load parent replies from DB:", err);
  }

  const sampleReplies = [
    {
      id: "rep-1",
      from_phone: "+917981067780",
      message_text: "Good morning teacher, Kiran had a mild fever yesterday. He is feeling better today and will attend classes tomorrow. Thank you.",
      handled: true,
      created_at: `${todayDate}T10:15:00Z`,
    },
    {
      id: "rep-2",
      from_phone: "+918247220252",
      message_text: "Yes ma'am, Yasaswini was attending her cousin's wedding out of town. She will submit her pending homework assignments tomorrow.",
      handled: false,
      created_at: `${todayDate}T11:30:00Z`,
    },
  ];

  const parentReplies = (rawReplies && rawReplies.length > 0) ? rawReplies : sampleReplies;

  return (
    <DashboardClientShell
      school={{
        id: SCHOOL.id,
        name: SCHOOL.name,
        supportPhone: SCHOOL.supportPhone,
      }}
      profile={{
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
      }}
      todayFormatted={todayFormatted}
      todayDate={todayDate}
      teacherClasses={teacherClassesData}
      allClasses={adminClasses}
      allStudents={adminStudents}
      studentAttendanceSummaries={studentAttendanceSummaries}
      whatsappNotifications={whatsappNotifications}
      parentReplies={parentReplies}
      initialView={initialView}
      initialStudentId={initialStudentId}
    />
  );
}