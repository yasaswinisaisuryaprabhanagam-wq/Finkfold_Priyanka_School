import { SCHOOL } from "@/lib/school-config";

export const metadata = { title: `Homework – ${SCHOOL.name}` };

const homework = [
  { subject: "Mathematics",  task: "Solve Quadratic Equations – Exercise 4.3 (Q1–Q10)", due: "Tomorrow", dueColor: "rose" },
  { subject: "Science",      task: "Write notes on Newton's Laws of Motion (2 pages)",   due: "2 days",  dueColor: "amber" },
  { subject: "English",      task: "Write a paragraph on 'My Favourite Season' (100 words)", due: "3 days", dueColor: "blue" },
  { subject: "Social",       task: "Draw a map of India and mark state capitals",         due: "5 days",  dueColor: "blue" },
  { subject: "Telugu",       task: "Learn poem 'Vande Mataram' by heart",                due: "1 week",  dueColor: "slate" },
];

const colorMap: Record<string, string> = {
  rose:  "bg-rose-50  border-rose-200  text-rose-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  blue:  "bg-blue-50  border-blue-200  text-blue-700",
  slate: "bg-slate-50 border-slate-200 text-slate-700",
};

export default function StudentHomeworkPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <div className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">Student Portal</div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>📝 Pending Homework</h1>
        <p className="text-white/60 text-sm mt-1">{homework.length} assignments pending</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
            This Week's Homework
          </h2>
        </div>
        <div className="card-body space-y-3">
          {homework.map((hw, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">📚</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">{hw.subject}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${colorMap[hw.dueColor]}`}>
                    Due: {hw.due}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-1.5">{hw.task}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center">
        * Homework assignments are updated by your class teacher. Check daily for new tasks.
      </div>
    </div>
  );
}
