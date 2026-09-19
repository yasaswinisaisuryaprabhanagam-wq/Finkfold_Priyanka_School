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
      {/* Top Header Banner - Clean White & Soft Pastel Style */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
          Faculty Workspace &middot; Announcements
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          📢 School Circulars &amp; Notices
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
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
