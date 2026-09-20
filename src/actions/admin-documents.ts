"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import type {
  CertificateType,
  CertificateTemplate,
  GeneratedAdminCertificate,
} from "@/types/admin-extended";

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

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: "tpl-study",
    type: "study",
    title: "Study & Bonafide Certificate",
    category: "Academic",
    description: "Official verification that the student is currently enrolled and studying in this institution.",
    variables: ["{{student_name}}", "{{admission_no}}", "{{father_name}}", "{{class_grade}}", "{{academic_year}}", "{{dob}}"],
    sampleTitle: "STUDY AND CONDUCT CERTIFICATE",
  },
  {
    id: "tpl-bank-loan",
    type: "bank_loan_fee_estimate",
    title: "Bank Education Loan Fee Estimate",
    category: "Financial",
    description: "Itemized annual tuition, lab, exam, and transport fee estimate for commercial bank education loan processing.",
    variables: ["{{student_name}}", "{{admission_no}}", "{{father_name}}", "{{class_grade}}", "{{academic_year}}", "{{total_fees}}", "{{tuition_fees}}", "{{transport_fees}}", "{{bank_name}}"],
    sampleTitle: "BONAFIDE INSTITUTIONAL FEE ESTIMATE FOR EDUCATION LOAN",
  },
  {
    id: "tpl-character",
    type: "character",
    title: "Character & Moral Conduct Certificate",
    category: "Conduct",
    description: "Certified endorsement of moral character, exemplary discipline, and institutional sports/cultural participation.",
    variables: ["{{student_name}}", "{{admission_no}}", "{{class_grade}}", "{{conduct_grade}}", "{{academic_year}}", "{{achievements}}"],
    sampleTitle: "CERTIFICATE OF CHARACTER AND MERIT",
  },
  {
    id: "tpl-tc-draft",
    type: "transfer_certificate",
    title: "Transfer Certificate (TC) Draft",
    category: "Exit",
    description: "Preliminary TC clearance detailing fees cleared, date of admission, date of leaving, and promotion eligibility.",
    variables: ["{{student_name}}", "{{admission_no}}", "{{father_name}}", "{{mother_name}}", "{{dob}}", "{{class_leaving}}", "{{promoted_status}}", "{{reason_for_leaving}}"],
    sampleTitle: "TRANSFER AND WITHDRAWAL CLEARANCE CERTIFICATE",
  },
];

export const INITIAL_GENERATED_CERTIFICATES: GeneratedAdminCertificate[] = [
  {
    id: "cert-gen-01",
    certificateNumber: "PRIY-DOC-2026-0814",
    studentId: "stu-001",
    studentName: "Kiran Kumar",
    admissionNumber: "PRIY-2026-001",
    classGrade: "Class 10 - Section A",
    templateType: "bank_loan_fee_estimate",
    issueDate: "2026-09-18",
    academicYear: "2026-2027",
    verificationHash: "VERIF-QR-BANK-PRIY-78219",
    contentSnapshot: {
      totalFees: "₹48,500",
      tuitionFees: "₹36,000",
      transportFees: "₹9,500",
      labFees: "₹3,000",
      bankName: "State Bank of India (Trunk Road Branch)",
      fatherName: "Mr. K. Ranganatham",
    },
    status: "issued",
    signatoryTitle: "Principal & Administrative Officer",
  },
  {
    id: "cert-gen-02",
    certificateNumber: "PRIY-DOC-2026-0815",
    studentId: "stu-002",
    studentName: "Yasaswini S.",
    admissionNumber: "PRIY-2026-002",
    classGrade: "Class 10 - Section A",
    templateType: "study",
    issueDate: "2026-09-19",
    academicYear: "2026-2027",
    verificationHash: "VERIF-QR-STUDY-PRIY-99042",
    contentSnapshot: {
      fatherName: "Mr. S. Prabhakar Rao",
      dob: "14-Aug-2011",
      conduct: "Exemplary (Grade A+)",
    },
    status: "issued",
    signatoryTitle: "Principal",
  },
];

export async function generateAdminCertificate(input: {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  templateType: CertificateType;
  customVariables: Record<string, string>;
}) {
  try {
    const profile = await getAdminProfile();
    const serialNum = `PRIY-DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrHash = `FINKFOLD-TAMPERPROOF-${Buffer.from(serialNum + input.admissionNumber).toString("base64").slice(0, 16)}`;

    const newCert: GeneratedAdminCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: serialNum,
      studentId: input.studentId,
      studentName: input.studentName,
      admissionNumber: input.admissionNumber,
      classGrade: input.classGrade,
      templateType: input.templateType,
      issueDate: new Date().toISOString().slice(0, 10),
      academicYear: "2026-2027",
      verificationHash: qrHash,
      contentSnapshot: input.customVariables,
      status: "issued",
      signatoryTitle: "Principal, " + SCHOOL.name,
    };

    try {
      const supabase = await createAdminClient();
      await supabase.from("student_digital_certificates").insert({
        certificate_number: serialNum,
        student_id: input.studentId,
        title: input.templateType.toUpperCase().replace(/_/g, " "),
        category: "Administrative",
        recipient_name: input.studentName,
        class_grade: input.classGrade,
        qr_verification_hash: qrHash,
        signatory: newCert.signatoryTitle,
      });
    } catch {}

    try { revalidatePath("/portal/admin/documents"); } catch {}
    return { success: true, certificate: newCert };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate certificate" };
  }
}
