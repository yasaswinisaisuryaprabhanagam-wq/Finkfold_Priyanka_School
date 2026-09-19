import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Teaching Schedule | ${SCHOOL.name}`,
};

const PERIODS = [
  { no: 1, time: "08:30 - 09:15" },
  { no: 2, time: "09:15 - 10:00" },
  { no: 3, time: "10:15 - 11:00" },
  { no: 4, time: "11:00 - 11:45" },
  { no: 5, time: "12:30 - 01:15" },
  { no: 6, time: "01:15 - 02:00" },
  { no: 7, time: "02:15 - 03:00" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const FREE = { subject: "-", class: "-", room: "-" };

// Mock timetable until timetable table is implemented
const MOCK_SCHEDULE: Record<string, { subject: string; class: string; room: string }[]> = {
  Monday:    [{ subject: "Mathematics & Roll Call", class: "10-A", room: "Room 101" }, FREE, { subject: "Mathematics", class: "9-A", room: "Room 204" }, FREE, { subject: "Problem Solving Lab", class: "10-A", room: "Room 101" }, FREE, { subject: "Computer Science", class: "10-A", room: "Comp Lab" }],
  Tuesday:   [{ subject: "Mathematics", class: "10-A", room: "Room 101" }, { subject: "Mathematics", class: "9-A", room: "Room 204" }, FREE, { subject: "Problem Solving", class: "10-A", room: "Room 101" }, FREE, { subject: "Computer Science", class: "9-A", room: "Comp Lab" }, FREE],
  Wednesday: [{ subject: "Mathematics & Roll Call", class: "10-A", room: "Room 101" }, FREE, { subject: "Mathematics", class: "9-A", room: "Room 204" }, { subject: "Computer Science", class: "10-A", room: "Comp Lab" }, FREE, FREE, { subject: "Problem Solving", class: "10-A", room: "Room 101" }],
  Thursday:  [{ subject: "Mathematics", class: "10-A", room: "Room 101" }, { subject: "Mathematics", class: "9-A", room: "Room 204" }, FREE, FREE, { subject: "Computer Science", class: "10-A", room: "Comp Lab" }, FREE, { subject: "Problem Solving", class: "9-A", room: "Room 204" }],
  Friday:    [{ subject: "Mathematics & Roll Call", class: "10-A", room: "Room 101" }, FREE, { subject: "Mathematics", class: "9-A", room: "Room 204" }, FREE, { subject: "Problem Solving Lab", class: "10-A", room: "Room 101" }, { subject: "Computer Science", class: "10-A", room: "Comp Lab" }, FREE],
  Saturday:  [{ subject: "Mathematics", class: "10-A", room: "Room 101" }, { subject: "Mathematics", class: "9-A", room: "Room 204" }, FREE, FREE, FREE, FREE, FREE],
};

export default async function FacultySchedulePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const todayName = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header - Clean White & Soft Pastel Style */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
            Faculty Portal &middot; {SCHOOL.name}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🗓️ Teaching Schedule
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">Full weekly timetable &mdash; {profile.full_name}</p>
        </div>
      </div>

      {/* Today highlight */}
      <div className="card p-4 border-l-4 border-blue-600">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-blue">Today</span>
          <span className="text-sm font-bold text-slate-800">{todayFormatted}</span>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {(MOCK_SCHEDULE[todayName] || MOCK_SCHEDULE["Monday"]).map((slot, i) =>
            slot.class !== "-" && (
              <div key={i} className="text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                <span className="font-bold text-blue-900">P{PERIODS[i]?.no} &middot; {slot.subject}</span>
                <span className="text-blue-600"> &middot; {slot.class} &middot; {slot.room}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Full weekly grid */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Weekly Timetable
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Academic Year {SCHOOL.academicYear}</p>
        </div>
        <div className="overflow-auto">
          <table className="data-table min-w-[700px]">
            <thead>
              <tr>
                <th className="w-24">Period</th>
                <th>Time</th>
                {DAYS.map(d => (
                  <th key={d} className={d === todayName ? "bg-blue-50 text-blue-900 font-bold" : ""}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p, i) => (
                <tr key={p.no}>
                  <td className="font-bold text-slate-900 text-center">P{p.no}</td>
                  <td className="font-mono text-xs text-slate-500">{p.time}</td>
                  {DAYS.map(day => {
                    const slot = (MOCK_SCHEDULE[day] || [])[i];
                    return (
                      <td key={day} className={`text-xs ${day === todayName ? "bg-blue-50/40" : ""}`}>
                        {slot && slot.class !== "-" ? (
                          <div>
                            <div className="font-semibold text-slate-800">{slot.subject}</div>
                            <div className="text-slate-500">{slot.class} &middot; {slot.room}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300">&mdash;</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center">
        * Timetable is currently based on your assigned classes. Dynamic per-period timetable will be added in the next phase.
      </div>
    </div>
  );
}
