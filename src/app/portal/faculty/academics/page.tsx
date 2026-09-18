import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyAcademicsDataAction } from "@/actions/faculty";
import FacultyAcademicsClient from "@/components/FacultyAcademicsClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Academics & AI Radar – Faculty Portal – ${SCHOOL.name}`,
  description: "Manage class marks, bulk OMR imports, predictive remedial AI worksheets, and syllabus progress.",
};

export default async function FacultyAcademicsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyAcademicsDataAction();

  return (
    <FacultyAcademicsClient
      initialMarks={data.marks}
      initialSyllabus={data.syllabus}
      examName={data.examName}
      subject={data.subject}
      classAverage={data.classAverage}
    />
  );
}
