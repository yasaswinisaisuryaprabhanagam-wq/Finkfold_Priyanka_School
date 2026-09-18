import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyFieldTripDataAction } from "@/actions/faculty";
import FacultyFieldTripsClient from "@/components/FacultyFieldTripsClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Field Trip Manifests – Faculty Portal – ${SCHOOL.name}`,
  description: "Passenger manifests, digital fee verification, and bus boarding check-in for school excursions.",
};

export default async function FacultyFieldTripsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyFieldTripDataAction();

  return (
    <FacultyFieldTripsClient
      manifest={data.manifest}
      totalStudents={data.totalStudents}
      paidCount={data.paidCount}
      checkedInCount={data.checkedInCount}
    />
  );
}
