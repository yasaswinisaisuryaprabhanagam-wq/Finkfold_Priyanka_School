"use server";

import { cookies } from "next/headers";
import { getProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Switch active campus branch
 * Sets the `finkfold_active_school` cookie so all portal queries,
 * RLS context, and headers immediately reflect the selected branch.
 */
export async function switchCampus(schoolId: string) {
  try {
    const profile = await getProfile();
    if (!profile) {
      return { success: false, error: "Unauthorized" };
    }

    // Only super_admin or admin roles are allowed to switch branches
    const isSuperAdmin =
      profile.role === "super_admin" ||
      profile.primary_role === "super_admin" ||
      (profile.roles && profile.roles.includes("super_admin"));

    if (!isSuperAdmin && profile.school_id !== schoolId) {
      return { success: false, error: "Access denied to branch" };
    }

    const cookieStore = await cookies();
    cookieStore.set("finkfold_active_school", schoolId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // accessible to client components for switcher UI
      sameSite: "lax",
    });

    revalidatePath("/portal", "layout");
    return { success: true, schoolId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to switch campus" };
  }
}
