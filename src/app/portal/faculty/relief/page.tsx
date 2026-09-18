import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyReliefDataAction } from "@/actions/faculty";
import FacultyReliefClient from "@/components/FacultyReliefClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Relief & Substitution Desk – Faculty Portal – ${SCHOOL.name}`,
  description: "View morning substitution alerts and accept class coverage for absent colleagues.",
};

export default async function FacultyReliefPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyReliefDataAction();

  return <FacultyReliefClient initialRequests={data.requests} />;
}
