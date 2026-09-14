import { SCHOOL } from "@/lib/school-config";

export const metadata = { title: `School Circulars – ${SCHOOL.name}` };

const today = new Date().toISOString().slice(0, 10);
const circulars = [
  { id: 1, date: today, title: "Annual Day Celebrations 2026", category: "Event", urgent: true,
    desc: "Annual Day is scheduled for 25th October 2026. All students must participate in at least one cultural activity. Practice sessions begin from 1st October. Parents are cordially invited." },
  { id: 2, date: today, title: "Unit Test Schedule – October 2026", category: "Exam", urgent: true,
    desc: "Unit tests will be held from 10th–15th October. Prepare chapters 1–5 for all subjects. Students must bring their own stationery. No leave will be granted during test days." },
  { id: 3, date: today, title: "Library Books Return Notice", category: "Library", urgent: false,
    desc: "All borrowed library books must be returned by Friday, September 19. Late returns will attract a fine of ₹5 per day per book." },
  { id: 4, date: today, title: "Sports Day Registration", category: "Sports", urgent: false,
    desc: "Sports Day registration is open until September 20. Students can register for Track & Field, Cricket, Kabaddi, Chess, and Carrom. Register with your class teacher." },
  { id: 5, date: today, title: "Fee Payment Reminder", category: "Finance", urgent: false,
    desc: "Second term fee payment is due by September 30. Late payments attract a fine. Contact the school office for any payment assistance queries." },
];

const categoryColors: Record<string, string> = {
  Event:   "bg-purple-100 text-purple-800",
  Exam:    "bg-rose-100   text-rose-800",
  Library: "bg-blue-100   text-blue-800",
  Sports:  "bg-green-100  text-green-800",
  Finance: "bg-amber-100  text-amber-800",
};

export default function StudentCircularsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <div className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">Student Portal</div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>📢 School Circulars</h1>
        <p className="text-white/60 text-sm mt-1">{circulars.filter(c => c.urgent).length} urgent notices</p>
      </div>

      <div className="space-y-4">
        {circulars.map((c) => (
          <div key={c.id} className={`card p-5 ${c.urgent ? "border-l-4 border-amber-400" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {c.urgent && <span className="badge badge-amber">🔔 Urgent</span>}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${categoryColors[c.category] || "-"}`}>
                  {c.category}
                </span>
                <span className="text-sm font-bold text-slate-800">{c.title}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                {new Date(c.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
