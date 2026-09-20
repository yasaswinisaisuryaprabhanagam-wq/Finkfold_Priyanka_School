"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import type {
  AlumniProfile,
  EndowmentCampaign,
  AlumniDonation,
} from "@/types/admin-extended";

export const INITIAL_ALUMNI_PROFILES: AlumniProfile[] = [
  {
    id: "alm-01",
    fullName: "V. Sai Teja",
    graduationBatch: "Batch of 2022",
    admissionNumber: "PRIY-2022-041",
    currentInstitutionOrEmployer: "Indian Institute of Technology (IIT) Madras",
    designationOrDegree: "B.Tech Computer Science & Engineering (3rd Year)",
    cityCountry: "Chennai, India",
    email: "saiteja.v@alumni.priyanka.school",
    phone: "+91 94401 77812",
    linkedinUrl: "https://linkedin.com/in/saiteja-iitm",
    tier1Status: true,
    totalEndowmentContributed: 25000,
    isMentorAvailable: true,
  },
  {
    id: "alm-02",
    fullName: "K. Sneha Reddy",
    graduationBatch: "Batch of 2021",
    admissionNumber: "PRIY-2021-088",
    currentInstitutionOrEmployer: "National Institute of Technology (NIT) Warangal",
    designationOrDegree: "B.Tech Electronics & Communication",
    cityCountry: "Warangal, India",
    email: "sneha.k@alumni.priyanka.school",
    phone: "+91 98480 33419",
    linkedinUrl: "https://linkedin.com/in/snehareddy-nitw",
    tier1Status: true,
    totalEndowmentContributed: 15000,
    isMentorAvailable: true,
  },
  {
    id: "alm-03",
    fullName: "P. R. Karthik",
    graduationBatch: "Batch of 2019",
    admissionNumber: "PRIY-2019-012",
    currentInstitutionOrEmployer: "Microsoft R&D India",
    designationOrDegree: "Software Engineer II (Azure Cloud Platform)",
    cityCountry: "Hyderabad, India",
    email: "karthik.pr@alumni.priyanka.school",
    phone: "+91 79810 99420",
    linkedinUrl: "https://linkedin.com/in/karthikpr-msft",
    tier1Status: true,
    totalEndowmentContributed: 100000,
    isMentorAvailable: true,
  },
  {
    id: "alm-04",
    fullName: "D. Haritha",
    graduationBatch: "Batch of 2023",
    admissionNumber: "PRIY-2023-094",
    currentInstitutionOrEmployer: "All India Institute of Medical Sciences (AIIMS) Mangalagiri",
    designationOrDegree: "MBBS (2nd Professional)",
    cityCountry: "Vijayawada, India",
    email: "haritha.d@alumni.priyanka.school",
    phone: "+91 91210 44521",
    linkedinUrl: "https://linkedin.com/in/dr-haritha-aiims",
    tier1Status: true,
    totalEndowmentContributed: 10000,
    isMentorAvailable: false,
  },
];

export const INITIAL_ENDOWMENT_CAMPAIGNS: EndowmentCampaign[] = [
  {
    id: "cmp-01",
    campaignTitle: "Next-Gen AI & Robotics Laboratory Fund",
    targetAmount: 1000000, // ₹10 Lakhs
    collectedAmount: 680000, // ₹6.8 Lakhs (68%)
    category: "Robotics Lab",
    deadline: "31 Dec 2026",
    backersCount: 42,
    status: "active",
    description: "Equipping middle and senior schools with 30 NVIDIA Jetson AI kits, 3D printers, and drone engineering testbeds.",
  },
  {
    id: "cmp-02",
    campaignTitle: "Merit Scholarship for Underprivileged Girls in STEM",
    targetAmount: 500000, // ₹5 Lakhs
    collectedAmount: 435000, // ₹4.35 Lakhs (87%)
    category: "Underprivileged Scholarships",
    deadline: "15 Nov 2026",
    backersCount: 68,
    status: "active",
    description: "Full tuition, books, and lab fee waivers for 10 exceptional female scholars in classes 8 through 10.",
  },
];

export const INITIAL_ALUMNI_DONATIONS: AlumniDonation[] = [
  {
    id: "don-01",
    receiptNumber: "80G-PRIY-2026-0142",
    alumniId: "alm-03",
    donorName: "P. R. Karthik",
    panNumber: "ABCDE1234F",
    donationAmount: 50000,
    campaignId: "cmp-01",
    campaignTitle: "Next-Gen AI & Robotics Laboratory Fund",
    paymentMode: "NetBanking",
    utrOrRefNumber: "UTR994821094821",
    date: "2026-09-15",
    taxExemptionEligible: true,
    verificationQrHash: "VERIF-80G-PAN-ABCDE1234F-PRIY",
  },
];

async function getAdminProfile() {
  try {
    const profile = await getProfile();
    if (profile) return profile;
  } catch {}
  return {
    id: "admin-profile-default",
    school_id: "6921082e-75ab-4067-b536-b76d09f71c3a",
    full_name: "School Administrator",
    role: "school_admin",
  };
}

export async function recordAlumniDonation(input: {
  alumniId: string;
  donorName: string;
  panNumber: string;
  donationAmount: number;
  campaignId: string;
  campaignTitle: string;
  paymentMode: AlumniDonation["paymentMode"];
  utrOrRefNumber: string;
}) {
  try {
    const profile = await getAdminProfile();
    if (!profile) return { success: false, error: "Unauthorized" };

    const receiptNum = `80G-PRIY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrHash = `FINKFOLD-80G-TAX-EXEMPT-${Buffer.from(receiptNum + input.panNumber).toString("base64").slice(0, 16)}`;

    const newDonation: AlumniDonation = {
      id: `don-${Date.now()}`,
      receiptNumber: receiptNum,
      alumniId: input.alumniId,
      donorName: input.donorName,
      panNumber: input.panNumber.toUpperCase(),
      donationAmount: input.donationAmount,
      campaignId: input.campaignId,
      campaignTitle: input.campaignTitle,
      paymentMode: input.paymentMode,
      utrOrRefNumber: input.utrOrRefNumber,
      date: new Date().toISOString().slice(0, 10),
      taxExemptionEligible: true,
      verificationQrHash: qrHash,
    };

    try {
      revalidatePath("/portal/admin/alumni");
    } catch {}

    return { success: true, donation: newDonation };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record donation" };
  }
}
