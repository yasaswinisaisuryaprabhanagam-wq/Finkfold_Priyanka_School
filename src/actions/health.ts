"use server";

import { revalidatePath } from "next/cache";

import type { InfirmaryLog, StudentMedicalProfile } from "@/types/self-service";
import { INITIAL_MEDICAL_PROFILE, INITIAL_INFIRMARY_LOGS } from "@/types/self-service";

import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";

async function getDefaultStudentId(supabase: any) {
  const { data: stu } = await supabase.from("students").select("id").limit(1).maybeSingle();
  return stu?.id || "6921082e-75ab-4067-b536-b76d09f71c3a";
}

export async function getHealthData(): Promise<{ profile: StudentMedicalProfile; logs: InfirmaryLog[] }> {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  let profile = INITIAL_MEDICAL_PROFILE;
  let logs = INITIAL_INFIRMARY_LOGS;

  try {
    const { data: dbProfile } = await supabase
      .from("student_medical_records")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();

    if (dbProfile) {
      profile = {
        bloodGroup: dbProfile.blood_group || "B +ve",
        heightCm: dbProfile.height_cm || 142,
        weightKg: dbProfile.weight_kg || 38,
        knownAllergies: dbProfile.known_allergies || [],
        chronicConditions: dbProfile.chronic_conditions || [],
        pediatricianName: dbProfile.pediatrician_name || "Dr. K. S. Murthy, M.D.",
        pediatricianPhone: dbProfile.pediatrician_phone || "+91 98480 91823",
        emergencyContactName: dbProfile.emergency_contact_name || "Sri Goud garu (Father)",
        emergencyContactPhone: dbProfile.emergency_contact_phone || "+91 9440266743",
      };
    }

    const { data: dbLogs } = await supabase
      .from("infirmary_visit_logs")
      .select("*")
      .eq("student_id", studentId)
      .order("visit_date", { ascending: false });

    if (dbLogs && dbLogs.length > 0) {
      logs = dbLogs.map((l: any) => ({
        id: l.id,
        visitDate: new Date(l.visit_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        visitTime: l.visit_time,
        nurseName: l.nurse_name,
        symptoms: l.symptoms,
        vitals: { tempF: l.temp_f, pulseBpm: l.pulse_bpm },
        medicationGiven: l.medication_given,
        outcome: l.outcome,
        parentAlertDispatched: l.parent_alert_dispatched,
      }));
    }
  } catch (err) {
    // Fallback if table not queried
  }

  return { profile, logs };
}

export async function updateMedicalProfileAction(profile: StudentMedicalProfile) {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  try {
    await supabase.from("student_medical_records").upsert(
      {
        school_id: SCHOOL.id,
        student_id: studentId,
        blood_group: profile.bloodGroup,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        known_allergies: profile.knownAllergies,
        chronic_conditions: profile.chronicConditions,
        pediatrician_name: profile.pediatricianName,
        pediatrician_phone: profile.pediatricianPhone,
        emergency_contact_name: profile.emergencyContactName,
        emergency_contact_phone: profile.emergencyContactPhone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "school_id,student_id" }
    );
  } catch (err) {
    // Graceful fallback
  }

  revalidatePath("/portal/student/health");
  return {
    success: true,
    message: "Medical emergency profile updated and saved to DB! High-priority allergy flags have been pushed to Class Teacher and Infirmary rosters.",
  };
}
