import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import AdmissionFormClient from "./AdmissionFormClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ schoolSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { schoolSlug } = await params;
  return {
    title: `Online Admission Form – ${schoolSlug.replace(/-/g, " ")}`,
    description: "Submit your child's admission application online. Fast, easy, and paperless.",
  };
}

export default async function AdmissionsPage({ params }: Props) {
  const { schoolSlug } = await params;
  const adminClient = await createAdminClient();

  let { data: school } = await adminClient
    .from("schools")
    .select("id, name, slug")
    .eq("slug", schoolSlug)
    .maybeSingle();

  if (!school) {
    const { data: fallbackSchool } = await adminClient
      .from("schools")
      .select("id, name, slug")
      .or(`slug.eq.priyanka-em-school,slug.eq.priyanka-em-rasapudipalem,id.eq.${SCHOOL.id}`)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    school = fallbackSchool;
  }

  if (!school) notFound();

  return (
    <AdmissionFormClient
      schoolId={school.id}
      schoolName={school.name}
      academicYear="2026-2027"
    />
  );
}
