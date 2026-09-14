import { createAdminClient } from "@/lib/supabase/server";
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

  const { data: school } = await adminClient
    .from("schools")
    .select("id, name, slug")
    .eq("slug", schoolSlug)
    .single();

  if (!school) notFound();

  return (
    <AdmissionFormClient
      schoolId={school.id}
      schoolName={school.name}
      academicYear="2026-2027"
    />
  );
}
