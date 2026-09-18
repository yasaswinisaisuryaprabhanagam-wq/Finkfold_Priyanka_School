import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { getFacultyLostFoundDataAction } from "@/actions/faculty";
import FacultyLostFoundClient from "@/components/FacultyLostFoundClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Lost & Found Snap & Upload – Faculty Portal – ${SCHOOL.name}`,
  description: "Upload campus lost items, uniforms, and books for immediate parent claim verification.",
};

export default async function FacultyLostFoundPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?from=faculty");

  const data = await getFacultyLostFoundDataAction();

  return <FacultyLostFoundClient initialItems={data.items} />;
}
