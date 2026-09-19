import { SCHOOL } from "@/lib/school-config";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getHomeworkList, HomeworkItem } from "@/lib/homeworkStore";

export const metadata = { title: `Homework – ${SCHOOL.name}` };

const colorMap: Record<string, string> = {
  rose:  "bg-rose-50  border-rose-200  text-rose-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  blue:  "bg-blue-50  border-blue-200  text-blue-700",
  slate: "bg-slate-50 border-slate-200 text-slate-700",
};

function getDueInfo(dueDateStr: string): { label: string; color: "rose" | "amber" | "blue" | "slate" } {
  if (!dueDateStr) return { label: "Upcoming", color: "blue" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", color: "rose" };
  if (diffDays === 0) return { label: "Today", color: "rose" };
  if (diffDays === 1) return { label: "Tomorrow", color: "rose" };
  if (diffDays === 2) return { label: "2 days", color: "amber" };
  if (diffDays === 3) return { label: "3 days", color: "blue" };
  if (diffDays <= 7) return { label: `${diffDays} days`, color: "blue" };

  return {
    label: due.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    color: "slate",
  };
}

export default async function StudentHomeworkPage() {
  const profile = await getProfile();

  let studentClassId: string | undefined;
  let className = "10";
  let classSection = "A";

  if (profile) {
    try {
      const admin = await createAdminClient();
      const { data: stu } = await admin
        .from("students")
        .select("class_id, classes(id, name, section)")
        .eq("school_id", profile.school_id)
        .eq("parent_phone", profile.phone)
        .eq("is_active", true)
        .maybeSingle();

      if (stu && stu.class_id) {
        studentClassId = stu.class_id;
        if (stu.classes) {
          className = (stu.classes as any).name;
          classSection = (stu.classes as any).section;
        }
      }
    } catch {}
  }

  const homeworkList = await getHomeworkList({
    schoolId: profile?.school_id,
    classId: studentClassId,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
          Student Portal &middot; Class {className}-{classSection}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          📝 Pending Homework
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{homeworkList.length} assignment{homeworkList.length === 1 ? "" : "s"} pending</p>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
            This Week&apos;s Homework
          </h2>
          <span className="badge badge-blue">Class {className}-{classSection}</span>
        </div>
        <div className="card-body space-y-3">
          {homeworkList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-sm font-bold text-slate-700">No Pending Homework!</div>
              <p className="text-xs text-slate-500 mt-1">
                You&apos;re all caught up on your assignments. Enjoy your day!
              </p>
            </div>
          ) : (
            homeworkList.map((hw, i) => {
              const dueInfo = getDueInfo(hw.due_date);
              return (
                <div
                  key={hw.id || i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                    📚
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                        {hw.subject}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${colorMap[dueInfo.color]}`}>
                        Due: {dueInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{hw.task}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center">
        * Homework assignments are updated by your class teacher. Check daily for new tasks.
      </div>
    </div>
  );
}
