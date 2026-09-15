import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getCircularsList } from "@/lib/circularsStore";
import CircularsManager from "@/components/CircularsManager";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Circulars & Notices – Faculty Portal – ${SCHOOL.name}`,
  description: "View school notices, announcements, and circulars.",
};

export default async function FacultyCircularsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const circulars = await getCircularsList(profile.school_id);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
          Faculty Workspace &middot; Announcements
        </div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          📢 School Circulars & Notices
        </h1>
        <p className="text-white/70 text-xs mt-0.5">
          View all official administrative notices, schedules, and circulars issued by {SCHOOL.name}.
        </p>
      </div>

      <CircularsManager
        initialCirculars={circulars}
        canCreate={true}
        portal="faculty"
      />
    </div>
  );
}
