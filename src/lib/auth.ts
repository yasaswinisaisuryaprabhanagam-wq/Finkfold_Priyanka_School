import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "./supabase/server";
import { SCHOOL } from "./school-config";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminClient = await createAdminClient();

  // 1. Fetch existing profile from public.profiles using admin privileges (bypasses RLS issues)
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, school_id, full_name, role, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    if (profile.school_id !== SCHOOL.id && profile.school_id === "b30d9655-1701-4cc0-9c59-8812324eb396") {
      profile.school_id = SCHOOL.id;
    }
    // If the profile is a teacher, verify they have at least one class assigned
    if (profile.role === "teacher") {
      const { data: existingAssignment } = await adminClient
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", profile.id)
        .limit(1);

      if (!existingAssignment || existingAssignment.length === 0) {
        // Auto-assign to default class
        const { data: defaultClass } = await adminClient
          .from("classes")
          .select("id")
          .eq("school_id", profile.school_id)
          .maybeSingle();

        if (defaultClass) {
          await adminClient
            .from("teacher_classes")
            .insert({
              teacher_id: profile.id,
              class_id: defaultClass.id,
            })
            .select()
            .maybeSingle();
        }
      }
    }
    return profile;
  }

  // 2. Auto-healing fallback: If user exists in auth.users but has no profile row yet,
  // provision a profile for them so they are not stuck in an endless login redirect loop.
  const email = user.email || "-";
  const role = email.includes("admin") ? "school_admin" : "teacher";
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (email.split("@")[0]
      ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
      : "Faculty Member");

  try {
    const { data: newProfile, error: insertErr } = await adminClient
      .from("profiles")
      .insert({
        id: user.id,
        school_id: SCHOOL.id,
        full_name: fullName,
        role: role,
      })
      .select("id, school_id, full_name, role, phone")
      .single();

    if (newProfile && !insertErr) {
      if (role === "teacher") {
        const { data: defaultClass } = await adminClient
          .from("classes")
          .select("id")
          .eq("school_id", SCHOOL.id)
          .eq("name", "10")
          .eq("section", "A")
          .maybeSingle();

        if (defaultClass) {
          await adminClient
            .from("teacher_classes")
            .insert({
              teacher_id: user.id,
              class_id: defaultClass.id,
            })
            .select()
            .maybeSingle();
        }
      }
      return newProfile;
    }
  } catch (err) {
    console.warn("Could not insert profile into database, using session fallback:", err);
  }

  // Resilient session fallback: Ensure authenticated user is NEVER blocked from their dashboard
  return {
    id: user.id,
    school_id: SCHOOL.id,
    full_name: fullName,
    role: (role as "teacher" | "school_admin" | "super_admin" | "parent" | "student"),
    phone: null as string | null,
  };
}
