import { getProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalIndexPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  const role = profile.primary_role || profile.role;

  if (role === "super_admin" || role === "school_admin" || role === "branch_admin") {
    redirect("/portal/admin");
  } else if (role === "student" || role === "parent") {
    redirect("/portal/student");
  } else {
    redirect("/portal/faculty");
  }
}
