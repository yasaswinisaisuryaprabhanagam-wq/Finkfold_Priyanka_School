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
      {/* Top Header Banner matching Student & Faculty Portal design */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
            <span>📢</span>
            <span>Administration &middot; Communication Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            School Circulars &amp; Official Notices
          </h1>
          <p className="text-slate-500 text-xs">
            Publish official notices, event announcements, fees schedules, and urgent alerts across all student and parent portals.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 px-4 py-3 rounded-2xl flex-shrink-0">
          <div className="text-2xl">📡</div>
          <div>
            <div className="text-xs font-bold text-slate-800">Broadcast Channel</div>
            <div className="text-[11px] text-emerald-600 font-medium">Synced with Parent Portals</div>
          </div>
        </div>
      </div>

      <CircularsManager
        initialCirculars={circulars}
        canCreate={true}
        portal="admin"
      />
    </div>
  );
}
