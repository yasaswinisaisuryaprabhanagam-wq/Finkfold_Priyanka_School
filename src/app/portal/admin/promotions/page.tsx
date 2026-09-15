import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import PromoteClassButton from "./PromoteClassButton";
import { redirect } from "next/navigation";

export const metadata = { title: `Year-End Promotions · ${SCHOOL.name}` };

function getNextGrade(currentGrade: string): string | null {
  const g = currentGrade.trim().toLowerCase();
  if (g === "play" || g === "playschool") return "LKG";
  if (g === "lkg") return "UKG";
  if (g === "ukg") return "1";
  const num = parseInt(currentGrade);
  if (!isNaN(num)) {
    if (num >= 10) return "passed_out";
    return String(num + 1);
  }
  return null;
}

export default async function PromotionsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const adminClient = await createAdminClient();

  // Fetch all classes with student counts
  let classes: any[] = [];
  try {
    const { data } = await adminClient
      .from("classes")
      .select("id, name, section, academic_year")
      .eq("school_id", profile.school_id)
      .order("name")
      .order("section");
    classes = data || [];
  } catch {}

  // Count active students per class
  let studentCounts = new Map<string, number>();
  try {
    const { data } = await adminClient
      .from("students")
      .select("class_id")
      .eq("school_id", profile.school_id)
      .eq("is_active", true);
    (data || []).forEach((s: any) => {
      studentCounts.set(s.class_id, (studentCounts.get(s.class_id) || 0) + 1);
    });
  } catch {}

  // Fetch recent promotions
  let recentPromotions: any[] = [];
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data } = await adminClient
      .from("student_promotions")
      .select("id, from_class_id, to_class_id, academic_year_from, academic_year_to, promoted_at, notes")
      .eq("school_id", profile.school_id)
      .gte("promoted_at", since.toISOString())
      .order("promoted_at", { ascending: false })
      .limit(20);
    recentPromotions = data || [];
  } catch {}

  // Build "promote to" options for each class
  const classNameToId = new Map(classes.map((c) => [`${c.name.trim()}-${c.section.trim()}`, c.id]));

  const classRows = classes.map((cls) => {
    const nextGrade = getNextGrade(cls.name);
    const isTopClass = nextGrade === "passed_out";

    let nextId: string | null = null;
    let nextClassLabel = "";

    if (isTopClass) {
      nextId = "passed_out";
      nextClassLabel = "Passed Out / Graduated";
    } else if (nextGrade) {
      nextId = classNameToId.get(`${nextGrade}-${cls.section}`) || classNameToId.get(`${nextGrade}-A`) || null;
      if (nextId) {
        const target = classes.find((c) => c.id === nextId);
        nextClassLabel = target ? `Class ${target.name}-${target.section}` : `Class ${nextGrade}`;
      } else {
        nextClassLabel = `Class ${nextGrade}`;
      }
    } else {
      nextClassLabel = "No next class found";
    }

    return {
      ...cls,
      studentCount: studentCounts.get(cls.id) || 0,
      promoteTo: nextId,
      promoteToLabel: nextClassLabel,
    };
  });

  const nextAcYear = (() => {
    const [from] = SCHOOL.academicYear.split("-");
    const y = parseInt(from);
    return `${y + 1}-${y + 2}`;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl text-white p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #4c1d95 100%)" }}>
        <div className="relative z-10">
          <div className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Admin Control Panel &middot; {SCHOOL.name}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🎓 Year-End Promotions
          </h1>
          <p className="text-white/60 text-sm">
            Promote all students to next class &middot; {SCHOOL.academicYear} &rarr; {nextAcYear}
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">(!)</span>
        <div>
          <div className="text-sm font-bold text-amber-900">Run promotions only at year-end</div>
          <div className="text-xs text-amber-700 mt-0.5">
            Each promotion is logged permanently in the audit trail. It can be reversed manually
            by editing student class IDs in the database. Always take a backup before proceeding.
          </div>
        </div>
      </div>

      {/* Promotion table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Class Promotion Table
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {SCHOOL.academicYear} &rarr; {nextAcYear}
          </p>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Current Class</th>
                <th>Active Students</th>
                <th>Promote To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classRows.map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <span className="font-black text-slate-900">Class {cls.name} &middot; Section {cls.section}</span>
                    <div className="text-[11px] text-slate-400">{cls.academic_year}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black ${cls.studentCount === 0 ? "text-slate-300" : "text-slate-900"}`}>
                        {cls.studentCount}
                      </span>
                      <span className="text-xs text-slate-500">students</span>
                    </div>
                  </td>
                  <td>
                    {cls.promoteTo === "passed_out" ? (
                      <span className="badge badge-amber">🎓 Passed Out / Graduated</span>
                    ) : cls.promoteTo ? (
                      <span className="badge badge-blue">→ {cls.promoteToLabel}</span>
                    ) : (
                      <span className="text-xs text-rose-600">⚠️ {cls.promoteToLabel}</span>
                    )}
                  </td>
                  <td>
                    {cls.studentCount === 0 ? (
                      <span className="text-xs text-slate-400">No students</span>
                    ) : (
                      <PromoteClassButton
                        schoolId={profile.school_id}
                        fromClassId={cls.id}
                        fromClassName={`Class ${cls.name}-${cls.section}`}
                        toClassId={cls.promoteTo || "-"}
                        toClassName={cls.promoteToLabel}
                        studentCount={cls.studentCount}
                        academicYearFrom={SCHOOL.academicYear}
                        academicYearTo={nextAcYear}
                        promotedBy={profile.id}
                        disabled={!cls.promoteTo}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent promotions log */}
      {recentPromotions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-700">Recent Promotion History (Last 30 days)</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPromotions.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 text-xs">
                <span className="text-slate-400 font-mono">
                  {new Date(p.promoted_at).toLocaleDateString("en-IN")}
                </span>
                <span className="text-slate-700 font-semibold">
                  {p.academic_year_from} &rarr; {p.academic_year_to}
                </span>
                {p.notes && <span className="text-slate-500 italic">{p.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
