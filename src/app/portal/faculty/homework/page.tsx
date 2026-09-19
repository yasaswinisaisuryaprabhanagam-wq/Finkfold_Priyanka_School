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

  return (
    <div className="space-y-6">
      {/* Top Header Banner - Clean White & Soft Pastel Style */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
          Faculty Workspace &middot; Homework Hub
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          📝 Class Homework Manager
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Assign daily exercises, project work, and tasks to your students. Real-time sync with Student &amp; Parent Portal.
        </p>
      </div>

      <FacultyHomeworkManager
        classes={assignedClasses}
        initialHomework={homework}
        teacherName={profile.full_name}
      />
    </div>
  );
}
