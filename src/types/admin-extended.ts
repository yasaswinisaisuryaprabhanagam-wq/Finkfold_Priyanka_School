/**
 * FINKFOLD EdOS: Admin Portal Extended Capabilities Types
 * Levels 1, 2, and 3 Enterprise Modules
 */

// ============================================================================
// LEVEL 1: BASIC / CORE FEATURES
// ============================================================================

// 1. Dynamic Certificate & Document Studio
export type CertificateType =
  | "study"
  | "bonafide"
  | "character"
  | "bank_loan_fee_estimate"
  | "transfer_certificate";

export interface CertificateTemplate {
  id: string;
  type: CertificateType;
  title: string;
  category: "Academic" | "Financial" | "Conduct" | "Exit";
  description: string;
  variables: string[];
  sampleTitle: string;
}

export interface GeneratedAdminCertificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  templateType: CertificateType;
  issueDate: string;
  academicYear: string;
  verificationHash: string;
  contentSnapshot: Record<string, any>;
  status: "draft" | "issued" | "revoked";
  signatoryTitle: string;
}

// 2. Library & Media Center Console
export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: "Science" | "Mathematics" | "Literature" | "History" | "Reference" | "Fiction";
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  replacementCost: number;
  barcode: string;
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: "active" | "returned" | "overdue";
  overdueDays: number;
  fineAmount: number;
  ledgerSynced: boolean;
}

export interface LibraryFine {
  id: string;
  loanId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  bookTitle: string;
  overdueDays: number;
  fineAmount: number;
  status: "pending" | "posted_to_fee_ledger" | "waived" | "paid";
  postedDate?: string;
}

// ============================================================================
// LEVEL 2: INTERMEDIATE FEATURES (Workflow & Revenue Automation)
// ============================================================================

// 3. Automated Defaulter & Late-Penalty Engine
export interface LatePenaltyRule {
  id: string;
  gracePeriodDays: number; // e.g. 10th of every month
  dailyPenaltyAmount: number; // e.g. ₹50/day
  maxCapAmount: number; // e.g. ₹1,500
  isActive: boolean;
  effectiveTerm: string;
}

export interface DefaulterRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classGrade: string;
  parentName: string;
  parentPhone: string;
  termName: string;
  baseDueAmount: number;
  dueDate: string;
  overdueDays: number;
  calculatedPenalty: number;
  totalPayable: number;
  lastReminderSentAt?: string;
  remindersCount: number;
  status: "pending" | "partially_paid" | "cleared" | "waived";
  paymentUpiLink: string;
}

export interface DefaulterRecoveryMetric {
  totalDefaultersCount: number;
  totalOutstandingAmount: number;
  totalPenaltiesAccrued: number;
  recoveredThisWeek: number;
  recoveredThisMonth: number;
  automatedRemindersDispatched: number;
  recoveryConversionRate: number; // Percentage
}

// 4. Digital Visitor Management System (VMS) & Gatepass
export interface CampusVisitor {
  id: string;
  badgeNumber: string; // e.g. VIS-2026-0841
  fullName: string;
  phone: string;
  organizationOrRelationship: string; // e.g. "Father of Kiran Kumar (10-A)", "CBSE Inspection Officer"
  purposeOfVisit: "PTM Consultation" | "Admission Inquiry" | "Vendor / Supplies" | "Official Inspection" | "Other";
  hostStaffId: string;
  hostStaffName: string;
  hostDepartment: string;
  checkInTime: string;
  checkOutTime?: string;
  status: "waiting_approval" | "approved_inside" | "checked_out" | "declined";
  idProofType: "Aadhaar" | "Driving License" | "Voter ID" | "PAN";
  idProofNumberLast4: string;
  photoUrl: string;
  temperatureCelsius?: number;
  issuedGate: string;
}

// 5. Government Compliance Exporter (UDISE+ & State Boards)
export interface UdiseDemographicRecord {
  id: string;
  studentId: string;
  admissionNumber: string;
  fullName: string;
  aadhaarStatus: "verified" | "pending" | "missing";
  socialCategory: "General" | "OBC" | "SC" | "ST";
  minorityGroup: "None" | "Muslim" | "Christian" | "Sikh" | "Buddhist" | "Jain";
  bplEwsStatus: boolean;
  cwsnDisability: "None" | "Locomotor" | "Visual" | "Hearing" | "Speech" | "Learning";
  motherTongueCode: string; // e.g. "042 - Telugu", "027 - Hindi"
  mediumOfInstruction: string;
  parentAnnualIncomeSlab: "Below 1L" | "1L - 2.5L" | "2.5L - 5L" | "Above 5L";
  previousYearResultPercentage: number;
  previousYearAttendanceDays: number;
  totalInstructionalDays: number;
  status: "compliant" | "warning_missing_fields";
  missingFields: string[];
}

export interface UdiseExportSummary {
  academicYear: string;
  schoolUdiseCode: string; // e.g. 28190400102
  totalStudentsAudited: number;
  compliantRecordsCount: number;
  flaggedErrorsCount: number;
  generatedDate: string;
  exportFormat: "JSON" | "CSV_DCF";
}

// ============================================================================
// LEVEL 3: ADVANCED FEATURES (Enterprise Intelligence & AI)
// ============================================================================

// 6. AI-Powered Timetable & Clash-Resolution Engine
export interface TimetableConstraint {
  id: string;
  type: "teacher_max_daily_periods" | "room_capacity" | "part_time_availability" | "subject_quota";
  description: string;
  targetId: string; // teacherId, roomId, or subjectCode
  targetName: string;
  ruleValue: any;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  periodNumber: 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  classId: string;
  className: string;
  section: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber: string;
  isLabPeriod?: boolean;
}

export interface MasterTimetableSummary {
  academicYear: string;
  totalClassesScheduled: number;
  totalTeachersAllocated: number;
  totalPeriodsPerWeek: number;
  conflictsDetected: number;
  isConflictFree: boolean;
  generatedAt: string;
}

// 7. Board Exam LOC (List of Candidates) Automator
export interface CandidateLocRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  candidateName: string;
  motherName: string;
  fatherName: string;
  guardianName?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "M" | "F";
  category: "GEN" | "OBC" | "SC" | "ST";
  identificationMark1: string;
  identificationMark2: string;
  subjectCodes: string[]; // e.g. ["184", "002", "041", "086", "087"]
  aadhaarNumber: string;
  annualParentIncome: number;
  cwsnCode: string;
  photoVerified: boolean;
  signatureVerified: boolean;
  boardVerificationStatus: "verified" | "error_missing_marks" | "error_parent_spelling" | "warning_photo";
  validationErrors: string[];
}

// 8. Automated Payroll & Statutory Deductions Engine
export interface StaffSalaryStructure {
  staffId: string;
  employeeCode: string;
  staffName: string;
  designation: string;
  department: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  basicSalary: number;
  hra: number;
  da: number;
  specialAllowance: number;
  grossSalary: number;
}

export interface MonthlyPayrollItem {
  id: string;
  staffId: string;
  employeeCode: string;
  staffName: string;
  designation: string;
  monthYear: string; // e.g. "Sep 2026"
  totalWorkingDays: number;
  biometricPresentDays: number;
  approvedPaidLeaveDays: number;
  unexcusedAbsenceDays: number;
  lossOfPayDays: number;
  lossOfPayDeduction: number;
  basicSalaryEarned: number;
  hraEarned: number;
  daEarned: number;
  grossEarned: number;
  epfDeduction: number; // 12% statutory
  professionalTax: number; // ₹200 standard slab
  tdsDeduction: number; // Income tax TDS
  totalDeductions: number;
  netPayableSalary: number;
  status: "draft" | "approved" | "disbursed";
  disbursementReference?: string;
}

// 9. Alumni Network & Endowment CRM
export interface AlumniProfile {
  id: string;
  studentId?: string;
  fullName: string;
  graduationBatch: string; // e.g. "Batch of 2024"
  admissionNumber: string;
  currentInstitutionOrEmployer: string; // e.g. "IIT Madras (B.Tech CS)", "Microsoft India"
  designationOrDegree: string;
  cityCountry: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  tier1Status: boolean; // Flagged for marketing
  totalEndowmentContributed: number;
  isMentorAvailable: boolean;
}

export interface EndowmentCampaign {
  id: string;
  campaignTitle: string;
  targetAmount: number;
  collectedAmount: number;
  category: "Campus Infrastructure" | "Robotics Lab" | "Underprivileged Scholarships" | "Sports Complex";
  deadline: string;
  backersCount: number;
  status: "active" | "completed";
  description: string;
}

export interface AlumniDonation {
  id: string;
  receiptNumber: string; // e.g. 80G-PRIY-2026-0142
  alumniId: string;
  donorName: string;
  panNumber: string;
  donationAmount: number;
  campaignId: string;
  campaignTitle: string;
  paymentMode: "UPI" | "NetBanking" | "Cheque";
  utrOrRefNumber: string;
  date: string;
  taxExemptionEligible: boolean; // 80G compliant
  verificationQrHash: string;
}
