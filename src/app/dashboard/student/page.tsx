import { redirect } from "next/navigation";

export default async function StudentPage(props: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const studentId = searchParams.studentId;
  if (studentId) {
    redirect(`/portal/student?studentId=${studentId}`);
  }
  redirect("/portal/student");
}
