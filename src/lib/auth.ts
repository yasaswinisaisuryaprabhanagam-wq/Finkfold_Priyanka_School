import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "./supabase/server";
import { SCHOOL } from "./school-config";
import type { Profile, UserRole, CampusContext, School as SchoolEntity } from "@/types/erp";

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

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const cookieStore = await cookies();
  const activeBranchCookie = cookieStore.get("finkfold_active_school")?.value;

  const adminClient = await createAdminClient();

  // 1. Fetch existing profile from public.profiles using admin privileges (bypasses RLS issues)
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, school_id, organization_id, full_name, role, roles, primary_role, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    const isSuperAdmin =
      profile.role === "super_admin" ||
      profile.primary_role === "super_admin" ||
      (profile.roles && profile.roles.includes("super_admin"));

    // If super admin has selected an active branch from switcher, apply it dynamically
    const effectiveSchoolId = (isSuperAdmin && activeBranchCookie)
      ? activeBranchCookie
      : (profile.school_id || SCHOOL.id);

    const effectivePrimaryRole = (profile.primary_role || profile.role || "teacher") as UserRole;
    const effectiveRoles = (profile.roles && profile.roles.length > 0)
      ? profile.roles
      : [profile.role || "teacher"];

    const enrichedProfile: Profile = {
      id: profile.id,
      organization_id: profile.organization_id || null,
      school_id: effectiveSchoolId,
      full_name: profile.full_name,
      role: (profile.role || effectivePrimaryRole) as UserRole,
      roles: effectiveRoles as UserRole[],
      primary_role: effectivePrimaryRole,
      phone: profile.phone || null,
      avatar_url: profile.avatar_url || null,
    };

    // If the profile is a teacher, verify they have at least one class assigned
    if (enrichedProfile.role === "teacher" || enrichedProfile.primary_role === "teacher") {
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
          .eq("school_id", enrichedProfile.school_id)
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
    return enrichedProfile;
  }

  // 2. Auto-healing fallback: If user exists in auth.users but has no profile row yet,
  // provision a profile for them so they are not stuck in an endless login redirect loop.
  const email = user.email || "-";
  const role: UserRole = email.includes("admin") ? "school_admin" : "teacher";
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
        roles: [role],
        primary_role: role,
      })
      .select("id, school_id, organization_id, full_name, role, roles, primary_role, phone, avatar_url")
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
      return {
        ...newProfile,
        role: (newProfile.role || role) as UserRole,
        roles: (newProfile.roles || [role]) as UserRole[],
        primary_role: (newProfile.primary_role || role) as UserRole,
      };
    }
  } catch (err) {
    console.warn("Could not insert profile into database, using session fallback:", err);
  }

  // Resilient session fallback: Ensure authenticated user is NEVER blocked from their dashboard
  return {
    id: user.id,
    organization_id: null,
    school_id: SCHOOL.id,
    full_name: fullName,
    role: role,
    roles: [role],
    primary_role: role,
    phone: null,
    avatar_url: null,
  };
}

/**
 * Resolves current active campus context for multi-branch operation
 */
export async function getCampusContext(): Promise<CampusContext> {
  const profile = await getProfile();
  const cookieStore = await cookies();
  const activeBranchCookie = cookieStore.get("finkfold_active_school")?.value;

  const isSuperAdmin =
    profile?.role === "super_admin" ||
    profile?.primary_role === "super_admin" ||
    (profile?.roles && profile.roles.includes("super_admin"));

  const targetSchoolId = (isSuperAdmin && activeBranchCookie)
    ? activeBranchCookie
    : (profile?.school_id || SCHOOL.id);

  const adminClient = await createAdminClient();
  let schoolData: Partial<SchoolEntity> | null = null;
  try {
    const { data } = await adminClient
      .from("schools")
      .select("id, organization_id, name, slug, branch_code")
      .eq("id", targetSchoolId)
      .maybeSingle();
    schoolData = data;
  } catch {}

  return {
    schoolId: schoolData?.id || targetSchoolId,
    orgId: schoolData?.organization_id || profile?.organization_id || null,
    schoolName: schoolData?.name || SCHOOL.name,
    schoolSlug: schoolData?.slug || SCHOOL.slug,
    branchCode: schoolData?.branch_code || null,
    role: (profile?.primary_role || profile?.role || "teacher") as UserRole,
    isSuperAdmin: !!isSuperAdmin,
    activeAcademicYear: SCHOOL.academicYear,
  };
}

/**
 * Returns all active school campuses within the organization
 */
export async function getAllCampuses() {
  const adminClient = await createAdminClient();
  try {
    const { data: schools } = await adminClient
      .from("schools")
      .select("id, organization_id, name, slug, branch_code, address, city, state, is_active")
      .order("name");
    return schools && schools.length > 0
      ? schools
      : [
          {
            id: SCHOOL.id,
            organization_id: null,
            name: SCHOOL.name,
            slug: SCHOOL.slug,
            branch_code: "MAIN",
            address: SCHOOL.address,
            city: "Nellore",
            state: "Andhra Pradesh",
            is_active: true,
          },
        ];
  } catch {
    return [
      {
        id: SCHOOL.id,
        organization_id: null,
        name: SCHOOL.name,
        slug: SCHOOL.slug,
        branch_code: "MAIN",
        address: SCHOOL.address,
        city: "Nellore",
        state: "Andhra Pradesh",
        is_active: true,
      },
    ];
  }
}
