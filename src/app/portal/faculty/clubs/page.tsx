import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyClubsDataAction } from "@/actions/faculty";
import FacultyClubsClient from "@/components/FacultyClubsClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Clubs & Verified Credentials – Faculty Portal – ${SCHOOL.name}`,
  description: "Manage sponsored student clubs, attendance, and review external achievement certificates.",
};

export default async function FacultyClubsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyClubsDataAction();

  return (
    <FacultyClubsClient
      clubName={data.clubName}
      sponsorName={data.sponsorName}
      schedule={data.schedule}
      initialRoster={data.roster}
      initialCerts={data.certVerifications}
    />
  );
}
