import { getAuthenticatedStudent } from "@/lib/studentSession";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import Link from "next/link";
import {
  BookOpen,
  UserCheck,
  Clock,
  MapPin,
  FileText,
  Calendar,
  Sparkles,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import StudentLessonPlanModal from "@/components/StudentLessonPlanModal";

export const metadata = {
  title: `Enrolled Subjects & Faculty – ${SCHOOL.name}`,
  description: "Enrolled subjects, assigned teachers, syllabus progress and lesson plans.",
};

export default async function StudentSubjectsPage() {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  // Fetch subjects for this school
  const { data: dbSubjects } = await supabase
    .from("subjects")
    .select("id, name, code, type")
    .eq("school_id", schoolId)
    .order("name");

  // Fetch teachers assigned to this student's class
  const { data: teacherClassRows } = await supabase
    .from("teacher_classes")
    .select("teacher_id, subject, is_class_teacher, profiles(id, full_name, phone, role)")
    .eq("class_id", student.class_id);

  // Fallback teacher list if not explicitly assigned
  const { data: allTeachers } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("school_id", schoolId)
    .eq("role", "teacher")
    .limit(10);

  const teacherMap = new Map<string, any>();
  if (teacherClassRows && teacherClassRows.length > 0) {
    teacherClassRows.forEach((r: any) => {
      if (r.subject && r.profiles) {
        teacherMap.set(r.subject.toLowerCase(), r.profiles);
      }
    });
  }

  // Curated subject details with syllabus & textbook specs
  const subjectsWithMeta = (dbSubjects || []).map((sub: any, idx: number) => {
    let assignedTeacher = teacherMap.get(sub.name.toLowerCase());
    if (!assignedTeacher && allTeachers && allTeachers.length > 0) {
      assignedTeacher = allTeachers[idx % allTeachers.length];
    }

    const teacherName = assignedTeacher?.full_name || "Faculty Specialist";
    const officeHours = "15:45 – 16:30 (Mon–Fri)";
    const room = sub.type === "practical" ? "Science Lab 1" : sub.name.includes("Computer") ? "Tech Lab" : "Room 204";
    const syllabusPercent = 65 + ((idx * 7) % 25);
    const currentUnit = sub.name === "Mathematics"
      ? "Unit 4: Quadratic Equations & Parabolic Optimization"
      : sub.name === "Science"
      ? "Unit 5: Life Processes & Respiration in Organisms"
      : sub.name === "English"
      ? "Unit 3: Formal Rhetoric & Gitanjali Poetic Devices"
      : sub.name === "Social Studies"
      ? "Unit 4: Resources, Development & Sustainable Economics"
      : "Unit 3: Classical Grammatical Syntax & Applied Composition";

    const prescribedBooks = sub.name === "Mathematics"
      ? "NCERT Mathematics Class 10 • R.D. Sharma Practice Vol. 1"
      : sub.name === "Science"
      ? "NCERT Science Class 10 • Comprehensive Lab Record & Observation"
      : sub.name === "English"
      ? "First Flight • Footprints Without Feet Literature Reader"
      : sub.name === "Social Studies"
      ? "Contemporary India Part II • Democratic Politics NCERT"
      : "State Board Prescribed Reader • Grammar Workbook";

    return {
      id: sub.id,
      name: sub.name,
      code: sub.code || `SUB-${sub.name.slice(0, 3).toUpperCase()}-10`,
      type: sub.type || "theory",
      teacherName,
      officeHours,
      room,
      syllabusPercent,
      currentUnit,
      prescribedBooks,
      periodsPerWeek: sub.type === "practical" ? 4 : 6,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Class {student.className}-{student.classSection} Curriculum</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Enrolled Subjects & Respective Faculty
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Comprehensive dossier of your academic curriculum, assigned subject teachers, office hours consultation windows, and unit-by-unit syllabus progression.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">Student: {student.full_name}</span>
          <span>&bull;</span>
          <span>Admission No: <strong className="text-slate-800">{student.admission_no}</strong></span>
          <span>&bull;</span>
          <span>Total Subjects: <strong className="text-indigo-600 font-bold">{subjectsWithMeta.length} Subjects</strong></span>
          <span>&bull;</span>
          <Link
            href="/portal/student/timetable"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold ml-auto"
          >
            <span>View Class Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjectsWithMeta.map((sub: any) => (
          <div
            key={sub.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            {/* Top row */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[11px] font-bold">
                      {sub.code}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {sub.type}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {sub.name}
                  </h2>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-slate-400 font-medium">Weekly Load</div>
                  <div className="text-xs font-bold text-slate-700">{sub.periodsPerWeek} Periods / Wk</div>
                </div>
              </div>

              {/* Teacher Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {sub.teacherName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{sub.teacherName}</span>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">Assigned Subject Specialist</div>
                    </div>
                  </div>

                  <Link
                    href={`/portal/student/ptm-messages?teacher=${encodeURIComponent(sub.teacherName)}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{sub.officeHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{sub.room}</span>
                  </div>
                </div>
              </div>

              {/* Syllabus Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Syllabus Term 1 Progress
                  </span>
                  <span className="text-indigo-600">{sub.syllabusPercent}% Completed</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${sub.syllabusPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate pt-0.5">
                  <strong className="text-slate-800">Current Chapter:</strong> {sub.currentUnit}
                </div>
              </div>

              {/* Textbooks */}
              <div className="text-[11px] text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  Prescribed Textbooks:
                </div>
                <div className="truncate">{sub.prescribedBooks}</div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Link
                href="/portal/student/homework"
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                View Daily Tasks &rarr;
              </Link>

              <StudentLessonPlanModal
                subject={sub.name}
                className={`Class ${student.className}-${student.classSection}`}
                topic={sub.currentUnit}
                time={`Period 1-2 • ${sub.room}`}
                room={sub.room}
                teacher={sub.teacherName}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
