import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyInfirmaryDataAction } from "@/actions/faculty";
import FacultyInfirmaryClient from "@/components/FacultyInfirmaryClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Infirmary & Trauma Logger – Faculty Portal – ${SCHOOL.name}`,
  description: "Report playground injuries, student ailments, and dispatch automated nurse & parent alerts.",
};

export default async function FacultyInfirmaryPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyInfirmaryDataAction();

  return (
    <FacultyInfirmaryClient
      initialReports={data.reports}
      students={data.students}
    />
  );
}
