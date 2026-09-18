import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyConductDataAction } from "@/actions/faculty";
import FacultyConductClient from "@/components/FacultyConductClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Conduct Ledger & Merits – Faculty Portal – ${SCHOOL.name}`,
  description: "Award merit points, log behavioral demerits, and enforce parent e-signature locks.",
};

export default async function FacultyConductPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyConductDataAction();

  return (
    <FacultyConductClient
      initialEntries={data.entries}
      students={data.students}
    />
  );
}
