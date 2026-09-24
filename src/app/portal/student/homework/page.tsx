import { SCHOOL } from "@/lib/school-config";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getHomeworkList, getStudentHomeworkVerifications, HomeworkItem, HomeworkVerification } from "@/lib/homeworkStore";

export const metadata = { title: `Daily Homework – ${SCHOOL.name}` };

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

  if (diffDays < 0) return { label: "Past Due", color: "slate" };
  if (diffDays === 0) return { label: "Today", color: "rose" };
  if (diffDays === 1) return { label: "Tomorrow Morning", color: "amber" };
  if (diffDays === 2) return { label: "In 2 Days", color: "blue" };
  if (diffDays === 3) return { label: "In 3 Days", color: "blue" };
  if (diffDays <= 7) return { label: `${diffDays} days`, color: "blue" };

  return {
    label: due.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    color: "slate",
  };
}

const NOTEBOOK_TARGETS: Record<string, string> = {
  Mathematics: "📓 200-Page Ruled Exercise Notebook (Math Vol 1)",
  Science: "📓 Science Lab Record & Theory Notebook",
  English: "📓 English Literature & Composition Notebook",
  Social: "📓 Social Studies India Map Record & Notebook",
  Telugu: "📓 Telugu Pratipada Padya Notebook",
  Hindi: "📓 Hindi Vyakaran Register",
  Computer: "📓 Computer Programming Practical Record",
};

export default async function StudentHomeworkPage() {
  const profile = await getProfile();

  let studentClassId: string | undefined;
  let className = "10";
  let classSection = "A";
  let studentFullName = "Kiran Kumar Kotapuri";

  if (profile) {
    try {
      const admin = await createAdminClient();
      const { data: stu } = await admin
        .from("students")
        .select("id, full_name, class_id, classes(id, name, section)")
        .eq("school_id", profile.school_id)
        .eq("parent_phone", profile.phone)
        .eq("is_active", true)
        .maybeSingle();

      if (stu) {
        if (stu.full_name) studentFullName = stu.full_name;
        if (stu.class_id) {
          studentClassId = stu.class_id;
          if (stu.classes) {
            className = (stu.classes as any).name;
            classSection = (stu.classes as any).section;
          }
        }
      }
    } catch {}
  }

  const homeworkList = await getHomeworkList({
    schoolId: profile?.school_id,
    classId: studentClassId,
  });

  const verificationsMap = await getStudentHomeworkVerifications(studentFullName);

  const verifiedCount = Object.values(verificationsMap).filter((v) => v.status === "verified").length;
  const incompleteCount = Object.values(verificationsMap).filter((v) => v.status === "incomplete").length;
  const pendingCount = Math.max(0, homeworkList.length - verifiedCount - incompleteCount);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
              FINKFOLD EdOS &bull; Rule 2: Physical-to-Digital Homework Loop
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              📝 Daily Class Homework &amp; Notebook Verification
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Class {className}-{classSection} &bull; Student: <strong className="text-slate-800">{studentFullName}</strong>
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
              <div className="text-sm font-extrabold text-slate-800">{homeworkList.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Assigned</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
              <div className="text-sm font-extrabold text-emerald-700">{verifiedCount}</div>
              <div className="text-[10px] text-emerald-800 uppercase font-semibold">Verified in Class</div>
            </div>
            {incompleteCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
                <div className="text-sm font-extrabold text-amber-700">{incompleteCount}</div>
                <div className="text-[10px] text-amber-800 uppercase font-semibold">Incomplete</div>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-center">
              <div className="text-sm font-extrabold text-blue-700">{pendingCount}</div>
              <div className="text-[10px] text-blue-800 uppercase font-semibold">Due Tonight</div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Banner: Physical-to-Digital Homework Loop */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
            📖
          </div>
          <div>
            <div className="text-xs font-bold text-blue-950 flex items-center gap-2">
              <span>Physical Notebook Submission Policy (No Mobile / File Uploads)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                School Standard
              </span>
            </div>
            <p className="text-[11px] text-blue-800/80 mt-1 leading-relaxed max-w-3xl">
              Students do not upload homework or bring phones to school. Write all answers in your physical subject notebook at home tonight. Tomorrow morning, your subject teacher will inspect your physical notebook during classroom aisle rounds and tap <strong>&quot;Verified&quot;</strong> on their faculty tablet, immediately turning your chip below to slate/green and sending an automated confirmation to your parents on WhatsApp.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-[11px] font-bold text-blue-900 flex-shrink-0 shadow-xs">
          🎒 Pack Notebooks Tonight
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>
            Active Homework Tasks &bull; Class {className}-{classSection}
          </h2>
          <span className="badge badge-blue">Term 1 &bull; 2026-2027</span>
        </div>

        <div className="card-body space-y-4">
          {homeworkList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-sm font-bold text-slate-700">No Pending Homework!</div>
              <p className="text-xs text-slate-500 mt-1">
                You&apos;re all caught up on your assignments. Enjoy your evening!
              </p>
            </div>
          ) : (
            homeworkList.map((hw, i) => {
              const dueInfo = getDueInfo(hw.due_date);
              const verification = verificationsMap[hw.id];
              const notebook = NOTEBOOK_TARGETS[hw.subject] || "📓 Subject Exercise Notebook";

              return (
                <div
                  key={hw.id || i}
                  className={`p-4 rounded-xl border transition-all ${
                    verification?.status === "verified"
                      ? "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                      : verification?.status === "incomplete"
                      ? "bg-amber-50/40 border-amber-200"
                      : "bg-slate-50/70 border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Subject, Notebook, Task */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-xs font-bold text-blue-900 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                          {hw.subject}
                        </span>

                        {/* Due info badge */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${colorMap[dueInfo.color]}`}>
                          Due: {dueInfo.label}
                        </span>

                        {/* Physical notebook badge */}
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                          {notebook}
                        </span>
                      </div>

                      {/* Task text */}
                      <p className="text-sm text-slate-800 mt-2 font-medium leading-relaxed">
                        {hw.task}
                      </p>

                      {/* Teacher notes or verification feedback */}
                      {verification?.notes && (
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-100/80 border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">Teacher Feedback:</span>
                          <span className="italic">&ldquo;{verification.notes}&rdquo;</span>
                        </div>
                      )}
                    </div>

                    {/* Verification Status Chip */}
                    <div className="flex-shrink-0 sm:text-right">
                      {verification?.status === "verified" ? (
                        <div className="inline-flex flex-col items-start sm:items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-xs">
                            <span className="text-emerald-400">✓</span> Checked &amp; Completed
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Verified by {verification.verified_by}
                          </span>
                        </div>
                      ) : verification?.status === "incomplete" ? (
                        <div className="inline-flex flex-col items-start sm:items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                            <span>⚠️</span> Incomplete / Redo Needed
                          </span>
                          <span className="text-[10px] text-amber-800 font-medium">
                            Marked by {verification.verified_by}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-start sm:items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                            <span>⏳</span> Due in Physical Notebook
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Bring notebook to class tomorrow
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer explanation */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
        📌 <strong>Need help with your homework?</strong> Review tomorrow&apos;s lesson plan in your timetable or attend teacher office hours during lunch break.
      </div>
    </div>
  );
}

