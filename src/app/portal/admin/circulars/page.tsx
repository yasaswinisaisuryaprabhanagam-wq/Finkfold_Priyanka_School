import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getCircularsList } from "@/lib/circularsStore";
import CircularsManager from "@/components/CircularsManager";
import { redirect } from "next/navigation";

export const metadata = {
  title: `School Circulars & Announcements – Admin – ${SCHOOL.name}`,
  description: "Publish and manage school-wide circulars, notices, and exam schedules.",
};

export default async function AdminCircularsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=admin");

  const circulars = await getCircularsList(profile.school_id);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #0f3460 100%)" }}
      >
        <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
          Administration &middot; Communication Hub
        </div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          📢 School Circulars & Official Notices
        </h1>
        <p className="text-white/70 text-xs mt-0.5">
          Publish official notices, event announcements, fees schedules, and urgent alerts across all student and parent portals.
        </p>
      </div>

      <CircularsManager
        initialCirculars={circulars}
        canCreate={true}
        portal="admin"
      />
    </div>
  );
}
