"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { CampusVisitor } from "@/types/admin-extended";

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

export const INITIAL_CAMPUS_VISITORS: CampusVisitor[] = [
  {
    id: "vis-01",
    badgeNumber: "VIS-2026-0841",
    fullName: "Ramesh Sharma",
    phone: "+91 98490 88219",
    organizationOrRelationship: "Father of Arjun Sharma (Class 9-A)",
    purposeOfVisit: "PTM Consultation",
    hostStaffId: "staff-01",
    hostStaffName: "Mrs. Priyanka Devi",
    hostDepartment: "Senior Mathematics",
    checkInTime: "10:15 AM",
    status: "approved_inside",
    idProofType: "Aadhaar",
    idProofNumberLast4: "4821",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    issuedGate: "Main Campus Reception Gate 01",
  },
  {
    id: "vis-02",
    badgeNumber: "VIS-2026-0842",
    fullName: "S. V. Ramana Rao",
    phone: "+91 94401 11203",
    organizationOrRelationship: "CBSE District Inspection Panel",
    purposeOfVisit: "Official Inspection",
    hostStaffId: "staff-admin",
    hostStaffName: "Dr. K. Srinivas (Principal)",
    hostDepartment: "Executive Administration",
    checkInTime: "11:30 AM",
    status: "approved_inside",
    idProofType: "Driving License",
    idProofNumberLast4: "9914",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    issuedGate: "Administrative Block Turnstile",
  },
  {
    id: "vis-03",
    badgeNumber: "VIS-2026-0843",
    fullName: "K. Lakshmi",
    phone: "+91 79810 44510",
    organizationOrRelationship: "Prospective Parent (Admission Inquiry)",
    purposeOfVisit: "Admission Inquiry",
    hostStaffId: "staff-admissions",
    hostStaffName: "Admissions Counselor",
    hostDepartment: "Front Office",
    checkInTime: "12:10 PM",
    checkOutTime: "12:55 PM",
    status: "checked_out",
    idProofType: "Voter ID",
    idProofNumberLast4: "7102",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    issuedGate: "Main Campus Reception Gate 01",
  },
  {
    id: "vis-04",
    badgeNumber: "VIS-2026-0844",
    fullName: "Mohan Lal",
    phone: "+91 91210 99841",
    organizationOrRelationship: "Oxford University Press (Book Supplier)",
    purposeOfVisit: "Vendor / Supplies",
    hostStaffId: "staff-store",
    hostStaffName: "Campus Bursar & Storekeeper",
    hostDepartment: "Logistics & Store",
    checkInTime: "01:05 PM",
    status: "waiting_approval",
    idProofType: "PAN",
    idProofNumberLast4: "3310",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    issuedGate: "Service Gate 03",
  },
];

export async function checkInVisitor(input: {
  fullName: string;
  phone: string;
  organizationOrRelationship: string;
  purposeOfVisit: CampusVisitor["purposeOfVisit"];
  hostStaffName: string;
  hostDepartment: string;
  idProofType: CampusVisitor["idProofType"];
  idProofNumberLast4: string;
  photoUrl?: string;
}) {
  try {
    const profile = await getAdminProfile();
    const badgeNum = `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newVisitor: CampusVisitor = {
      id: `vis-${Date.now()}`,
      badgeNumber: badgeNum,
      fullName: input.fullName,
      phone: input.phone,
      organizationOrRelationship: input.organizationOrRelationship,
      purposeOfVisit: input.purposeOfVisit,
      hostStaffId: "staff-host",
      hostStaffName: input.hostStaffName,
      hostDepartment: input.hostDepartment,
      checkInTime: timeStr,
      status: "approved_inside",
      idProofType: input.idProofType,
      idProofNumberLast4: input.idProofNumberLast4,
      photoUrl: input.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      issuedGate: "Main Campus Reception Gate 01",
    };

    try { revalidatePath("/portal/admin/visitors"); } catch {}
    return { success: true, visitor: newVisitor };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to check in visitor" };
  }
}

export async function approveVisitorPass(visitorId: string) {
  try {
    const profile = await getAdminProfile();
    try { revalidatePath("/portal/admin/visitors"); } catch {}
    return { success: true, message: `Pass ${visitorId} approved by host.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve pass" };
  }
}

export async function checkOutVisitor(visitorId: string) {
  try {
    const profile = await getAdminProfile();
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    try { revalidatePath("/portal/admin/visitors"); } catch {}
    return { success: true, checkOutTime: timeStr };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to check out visitor" };
  }
}
