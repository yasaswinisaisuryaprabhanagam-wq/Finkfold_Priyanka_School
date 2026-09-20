import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import { getHomeworkList } from "@/lib/homeworkStore";
import FacultyHomeworkManager from "@/components/FacultyHomeworkManager";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Homework Oversight – Admin – ${SCHOOL.name}`,
  description: "Monitor and manage homework assignments across all classes.",
};

export default async function AdminHomeworkPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=admin");

  const adminClient = await createAdminClient();

  // Fetch all classes in the school
  let schoolClasses: { id: string; name: string; section: string }[] = [];
  try {
    const { data } = await adminClient
      .from("classes")
      .select("id, name, section")
      .eq("school_id", profile.school_id)
      .order("name");
    if (data && data.length > 0) {
      schoolClasses = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        section: c.section,
      }));
    }
  } catch {}

  const homework = await getHomeworkList({ schoolId: profile.school_id });

  return (
    <div className="space-y-6">
      {/* Top Header Banner matching Student & Faculty Portal design */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <span>📝</span>
            <span>Administration &middot; Academic Oversight</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class Homework Hub
          </h1>
          <p className="text-slate-500 text-xs">
            View, assign, and manage daily homework assignments across all classes and sections in {SCHOOL.name}.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 px-4 py-3 rounded-2xl flex-shrink-0">
          <div className="text-2xl">📚</div>
          <div>
            <div className="text-xs font-bold text-slate-800">Classroom Homework</div>
            <div className="text-[11px] text-indigo-600 font-medium">{schoolClasses.length} Active Classes</div>
          </div>
        </div>
      </div>

      <FacultyHomeworkManager
        classes={schoolClasses}
        initialHomework={homework}
        teacherName={profile.full_name}
      />
    </div>
  );
}
