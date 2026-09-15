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
      {/* Top Header Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #0f3460 100%)" }}
      >
        <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
          Administration &middot; Academic Oversight
        </div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          📝 Class Homework Hub
        </h1>
        <p className="text-white/70 text-xs mt-0.5">
          View, assign, and manage daily homework assignments across all classes and sections in {SCHOOL.name}.
        </p>
      </div>

      <FacultyHomeworkManager
        classes={schoolClasses}
        initialHomework={homework}
        teacherName={profile.full_name}
      />
    </div>
  );
}
