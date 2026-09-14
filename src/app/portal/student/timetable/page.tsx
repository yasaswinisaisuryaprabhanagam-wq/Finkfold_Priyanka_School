import { SCHOOL } from "@/lib/school-config";
import { getProfile } from "@/lib/auth";

export const metadata = { title: `Timetable – ${SCHOOL.name}` };

const PERIODS = [
  { no: 1, time: "08:30 – 09:15" },
  { no: 2, time: "09:15 – 10:00" },
  { no: 3, time: "10:15 – 11:00" },
  { no: 4, time: "11:00 – 11:45" },
  { no: 5, time: "12:30 – 01:15" },
  { no: 6, time: "01:15 – 02:00" },
  { no: 7, time: "02:15 – 03:00" },
];

const TIMETABLE = [
  { period: 1, subject: "Mathematics",        teacher: "Kiran Sir",    room: "Room 101" },
  { period: 2, subject: "English Language",   teacher: "Priya Ma'am",  room: "Room 102" },
  { period: 3, subject: "Science",            teacher: "Ravi Sir",     room: "Lab 1"    },
  { period: 4, subject: "Social Studies",     teacher: "Suma Ma'am",   room: "Room 103" },
  { period: 5, subject: "Telugu Language",    teacher: "Rao Sir",      room: "Room 104" },
  { period: 6, subject: "Computer Science",   teacher: "Kiran Sir",    room: "Comp Lab" },
  { period: 7, subject: "Physical Education", teacher: "Coach Babu",   room: "Ground"   },
];

export default async function StudentTimetablePage() {
  const userProfile = await getProfile();
  const todayName = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Which period is active right now?
  const now = new Date();
  const currentHour = now.getHours() * 60 + now.getMinutes();
  const periodRanges = [
    [510, 555], [555, 600], [615, 660], [660, 705],
    [750, 795], [795, 840], [855, 900],
  ];
  const activePeriod = periodRanges.findIndex(([start, end]) => currentHour >= start && currentHour < end) + 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
        <div className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">Student Portal</div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>🗓️ Today's Timetable</h1>
        <p className="text-white/60 text-sm mt-1">{todayFormatted}</p>
      </div>

      {activePeriod > 0 && (
        <div className="card p-4 border-l-4 border-emerald-500 bg-emerald-50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-emerald-800">
              Currently: Period {activePeriod} — {TIMETABLE[activePeriod - 1]?.subject}
            </span>
            <span className="text-xs text-emerald-600">with {TIMETABLE[activePeriod - 1]?.teacher} · {TIMETABLE[activePeriod - 1]?.room}</span>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class 10-A · {todayName} Schedule
          </h2>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {TIMETABLE.map((row, i) => (
                <tr key={row.period} className={activePeriod === row.period ? "bg-emerald-50/60" : ""}>
                  <td className="font-bold text-slate-900">
                    P{row.period}
                    {activePeriod === row.period && <span className="ml-2 text-emerald-600 text-xs">●</span>}
                  </td>
                  <td className="font-mono text-xs text-slate-500">{PERIODS[i]?.time}</td>
                  <td className="font-semibold text-blue-900">{row.subject}</td>
                  <td className="text-xs text-slate-600">{row.teacher}</td>
                  <td className="font-mono text-xs text-slate-500">{row.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
