"use server";

import { createAdminClient } from "@/lib/supabase/server";

export interface ResolveIdentifierResult {
  email: string;
  foundName?: string;
  admissionNo?: string;
}

/**
 * Resolves a student identifier (Admission Number, Roll No, or Email)
 * to their corresponding authentication email.
 */
export async function resolveStudentIdentifier(
  rawIdentifier: string
): Promise<ResolveIdentifierResult> {
  const identifier = rawIdentifier.trim();

  // 1. Direct email provided
  if (identifier.includes("@")) {
    return { email: identifier.toLowerCase() };
  }

  // 2. Demo student shorthand
  if (identifier.toLowerCase() === "student") {
    return { email: "student@priyanka.school", foundName: "Demo Student" };
  }

  // 3. Normalize admission format (e.g. PRIY-2026-001 or priy.2026.001 or 001)
  const normalized = identifier.toUpperCase();
  const supabase = await createAdminClient();

  // Try finding student by exact or ilike admission_no
  const { data: student } = await supabase
    .from("students")
    .select("admission_no, full_name, roll_no")
    .or(`admission_no.ilike.${normalized},admission_no.ilike.PRIY-2026-${identifier.padStart(3, "0")}`)
    .maybeSingle();

  if (student?.admission_no) {
    // Format: PRIY-2026-001 -> priy.2026.001@priyanka.school
    const emailFormatted = student.admission_no.toLowerCase().replace(/-/g, ".") + "@priyanka.school";
    return {
      email: emailFormatted,
      foundName: student.full_name,
      admissionNo: student.admission_no,
    };
  }

  // 4. If numeric only (e.g. "1" or "001")
  if (/^\d+$/.test(identifier)) {
    const padded = identifier.padStart(3, "0");
    return {
      email: `priy.2026.${padded}@priyanka.school`,
      admissionNo: `PRIY-2026-${padded}`,
    };
  }

  // Fallback: convert hyphens to dots and append domain
  const fallbackFormatted = identifier.toLowerCase().replace(/[\s\-_]/g, ".");
  return {
    email: fallbackFormatted.includes("@") ? fallbackFormatted : `${fallbackFormatted}@priyanka.school`,
  };
}
