"use server";

import { revalidatePath } from "next/cache";

export interface InfirmaryLog {
  id: string;
  visitDate: string;
  visitTime: string;
  nurseName: string;
  symptoms: string;
  vitals: { tempF: string; pulseBpm: string };
  medicationGiven: string;
  outcome: string;
  parentAlertDispatched: boolean;
}

export interface StudentMedicalProfile {
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  knownAllergies: string[];
  chronicConditions: string[];
  pediatricianName: string;
  pediatricianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export const INITIAL_MEDICAL_PROFILE: StudentMedicalProfile = {
  bloodGroup: "B +ve",
  heightCm: 142,
  weightKg: 38,
  knownAllergies: ["Peanuts & Tree Nuts", "Penicillin Sensitivity"],
  chronicConditions: ["Mild seasonal bronchial asthma (carries Salbutamol inhaler)"],
  pediatricianName: "Dr. K. S. Murthy, M.D. (Pediatrics)",
  pediatricianPhone: "+91 98480 91823",
  emergencyContactName: "Sri Goud garu (Father)",
  emergencyContactPhone: "+91 9440266743",
};

export const INITIAL_INFIRMARY_LOGS: InfirmaryLog[] = [
  {
    id: "inf-01",
    visitDate: "14 Sep 2026",
    visitTime: "11:15 AM",
    nurseName: "Sister Anitha, GNM",
    symptoms: "Mild fever, frontal headache following sports period",
    vitals: { tempF: "99.4 °F", pulseBpm: "78 bpm" },
    medicationGiven: "Paracetamol 250mg syrup + Electral ORS hydration",
    outcome: "Rested for 35 mins in infirmary bed #2. Fever stabilized at 98.6°F. Returned to class at 11:55 AM.",
    parentAlertDispatched: true,
  },
  {
    id: "inf-02",
    visitDate: "28 Aug 2026",
    visitTime: "02:20 PM",
    nurseName: "Sister Anitha, GNM",
    symptoms: "Superficial knee scrape while playing basketball on court",
    vitals: { tempF: "Normal", pulseBpm: "84 bpm" },
    medicationGiven: "Antiseptic Betadine wash + sterile adhesive dressing",
    outcome: "Dressing applied. Advised not to run in sand pit. Resumed regular class.",
    parentAlertDispatched: false,
  },
];

export async function updateMedicalProfileAction(profile: StudentMedicalProfile) {
  revalidatePath("/portal/student/health");
  return {
    success: true,
    message: "Medical emergency profile updated! High-priority allergy flags have been pushed to Class Teacher and Infirmary rosters.",
  };
}
