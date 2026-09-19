import { SCHOOL } from "@/lib/school-config";
import { getProfile } from "@/lib/auth";
import { getCircularsList } from "@/lib/circularsStore";

export const metadata = { title: `School Circulars – ${SCHOOL.name}` };

const categoryColors: Record<string, string> = {
  Event:   "bg-purple-100 text-purple-800",
  Exam:    "bg-rose-100   text-rose-800",
  Library: "bg-blue-100   text-blue-800",
  Sports:  "bg-emerald-100 text-emerald-800",
  Finance: "bg-amber-100  text-amber-800",
  General: "bg-slate-100  text-slate-800",
};

export default async function StudentCircularsPage() {
  const profile = await getProfile();
  const circulars = await getCircularsList(profile?.school_id);
  const urgentCount = circulars.filter((c) => c.urgent).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
          Student Portal
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          📢 School Circulars
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{urgentCount} urgent notice{urgentCount === 1 ? "" : "s"}</p>
      </div>

      <div className="space-y-4">
        {circulars.length === 0 ? (
          <div className="card p-8 text-center bg-slate-50 border-dashed border-slate-200">
            <div className="text-4xl mb-2">📢</div>
            <div className="text-sm font-bold text-slate-700">No Circulars Published</div>
            <p className="text-xs text-slate-500 mt-1">
              Check back later for school announcements and circulars.
            </p>
          </div>
        ) : (
          circulars.map((c) => (
            <div key={c.id} className={`card p-5 ${c.urgent ? "border-l-4 border-amber-400" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {c.urgent && <span className="badge badge-amber">🔔 Urgent</span>}
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${categoryColors[c.category] || categoryColors.General}`}>
                    {c.category}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{c.title}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                  {new Date(c.publish_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{c.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
