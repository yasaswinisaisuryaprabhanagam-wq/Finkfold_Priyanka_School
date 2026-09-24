import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { getHomeworkList } from "@/lib/homeworkStore";
import FacultyHomeworkManager from "@/components/FacultyHomeworkManager";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Assign Homework – Faculty Portal – ${SCHOOL.name}`,
  description: "Create and manage daily homework assignments for your classes.",
};

export default async function FacultyHomeworkPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const adminClient = await createAdminClient();

  // Fetch teacher's assigned classes
  let assignedClasses: { id: string; name: string; section: string; subject?: string }[] = [];
  try {
    const { data } = await adminClient
      .from("teacher_classes")
      .select("class_id, subject, is_class_teacher, classes(id, name, section)")
      .eq("teacher_id", profile.id);

    if (data && data.length > 0) {
      assignedClasses = data
        .filter((d: any) => d.classes)
        .map((d: any) => ({
          id: d.classes.id,
          name: d.classes.name,
          section: d.classes.section,
          subject: d.subject || "General",
        }));
    }
  } catch {}

  // Fallback: If no explicit classes mapped in teacher_classes, fetch school classes
  if (assignedClasses.length === 0) {
    try {
      const { data: allCls } = await adminClient
        .from("classes")
        .select("id, name, section")
        .eq("school_id", profile.school_id)
        .order("name");
      if (allCls && allCls.length > 0) {
        assignedClasses = allCls.map((c: any) => ({
          id: c.id,
          name: c.name,
          section: c.section,
          subject: "General",
        }));
      }
    } catch {}
  }

  // Load existing homework
  const homework = await getHomeworkList({ schoolId: profile.school_id });

  // Fetch students for assigned classes
  let students: { id: string; full_name: string; roll_no: number; class_id: string }[] = [];
  try {
    const classIds = assignedClasses.map((c) => c.id);
    const { data: stuData } = await adminClient
      .from("students")
      .select("id, full_name, roll_no, class_id")
      .eq("school_id", profile.school_id)
      .eq("is_active", true)
      .in("class_id", classIds)
      .order("roll_no");
    if (stuData && stuData.length > 0) {
      students = stuData.map((s: any) => ({
        id: s.id,
        full_name: s.full_name,
        roll_no: s.roll_no || 0,
        class_id: s.class_id,
      }));
    }
  } catch {}

  if (students.length === 0) {
    const targetClassId = assignedClasses[0]?.id || "c10a2026-1701-4cc0-9c59-8812324eb396";
    students = [
      { id: "s1", full_name: "Yasaswini Sai", roll_no: 1, class_id: targetClassId },
      { id: "s2", full_name: "Kiran Kumar Kotapuri", roll_no: 11, class_id: targetClassId },
      { id: "s3", full_name: "Rohit Verma", roll_no: 12, class_id: targetClassId },
      { id: "s4", full_name: "Ananya Sharma", roll_no: 15, class_id: targetClassId },
      { id: "s5", full_name: "Deepa Reddy", roll_no: 18, class_id: targetClassId },
      { id: "s6", full_name: "Kethan Varma", roll_no: 22, class_id: targetClassId },
    ];
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner - Clean White & Soft Pastel Style */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
          Faculty Workspace &middot; Rule 2: Physical-to-Digital Homework Loop
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          📝 Class Homework &amp; Morning Notebook Verification
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Assign daily physical notebook tasks before 4:30 PM, then conduct morning in-class aisle walkthroughs to tap and verify student submissions. Instant sync with Student Portal and WhatsApp parent push.
        </p>
      </div>

      <FacultyHomeworkManager
        classes={assignedClasses}
        initialHomework={homework}
        teacherName={profile.full_name}
        students={students}
      />
    </div>
  );
}

