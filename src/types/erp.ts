/**
 * ==============================================================================
 * FINKFOLD EdOS (Educational Operating System) — ERP TYPES & DATA CONTRACTS
 * Path: src/types/erp.ts
 *
 * Defines end-to-end type safety matching:
 * - Supabase schema: 005_edos_core_foundation.sql
 * - Multi-Branch Hierarchy (Organizations -> Schools / Campuses)
 * - Academic Management, Student Lifecycles, and Subject Masters
 * - Maker-Checker Cash Drawer Tills & Counter POS Fee Ledger
 * ==============================================================================
 */

// ── 1. User Roles & Identity ─────────────────────────────────────────────────
export type UserRole =
  | "super_admin"   // Trust Chairman / HQ Auditor (Multi-branch visibility)
  | "school_admin"  // Branch Principal / Vice Principal
  | "branch_admin"  // Branch Administrator / Campus Lead
  | "accountant"    // Fee Counter Cashier / Accounts Desk
  | "teacher"       // Faculty / Class Incharge
  | "parent"        // Guardian / Parent
  | "student";      // Enrolled Student

export type SubjectType = "theory" | "practical" | "activity" | "language";

export type EnrollmentStatus =
  | "active"
  | "promoted"
  | "detained"
  | "transferred"
  | "withdrawn";

export type FeeCategory =
  | "tuition"
  | "admission"
  | "exam"
  | "transport"
  | "books_uniform"
  | "digital_portal"
  | "miscellaneous";

export type DrawerStatus =
  | "open"
  | "submitted_for_verification"
  | "verified"
  | "discrepancy_flagged";

export type PaymentMethod =
  | "cash"
  | "upi_dynamic"
  | "upi_manual"
  | "cheque"
  | "bank_transfer"
  | "gateway";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "bounced";

// ── 2. Core Entities ──────────────────────────────────────────────────────────

/** Multi-campus Trust / Enterprise HQ entity */
export interface Organization {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  primary_color: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

/** Individual School Branch / Campus */
export interface School {
  id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  branch_code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  tagline?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  logo_url?: string | null;
  code?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** User Profile with Unified Multi-Role capabilities */
export interface Profile {
  id: string;
  organization_id: string | null;
  school_id: string;
  full_name: string;
  role: UserRole;
  roles: UserRole[] | string[];
  primary_role: UserRole | string;
  phone: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Academic Year Session (e.g., 2026-2027) */
export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

/** Class / Section definition */
export interface ClassItem {
  id: string;
  school_id: string;
  academic_year_id: string | null;
  name: string;
  section: string;
  academic_year: string;
  room_number: string | null;
  capacity: number;
  created_at?: string;
}

/** Subject Master */
export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  type: SubjectType;
  created_at: string;
}

/** Student Profile */
export interface Student {
  id: string;
  school_id: string;
  class_id: string;
  full_name: string;
  roll_no: number;
  admission_no: string;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email?: string | null;
  consent_whatsapp: boolean;
  is_active: boolean;
  left_on?: string | null;
  left_reason?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  created_at?: string;
}

/** Multi-Year Student Enrollment History */
export interface StudentEnrollment {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string | null;
  academic_year: string;
  roll_no: number | null;
  status: EnrollmentStatus;
  enrolled_on: string;
  created_at: string;
}

/** Fee Head / Fee Structure */
export interface FeeStructure {
  id: string;
  school_id: string;
  academic_year_id: string | null;
  class_id: string | null; // null represents school-wide fee head
  name: string;
  category: FeeCategory;
  amount: number;
  due_date: string | null;
  is_mandatory: boolean;
  created_at: string;
}

/** Maker-Checker Cash Till Drawer */
export interface CashDrawer {
  id: string;
  school_id: string;
  drawer_date: string;
  cashier_id: string;
  opening_cash: number;
  system_cash_collected: number;
  declared_cash: number | null;
  discrepancy: number | null;
  status: DrawerStatus;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

/** Fee Payment Transaction */
export interface FeeTransaction {
  id: string;
  organization_id: string | null;
  school_id: string;
  student_id: string;
  fee_structure_id: string | null;
  cash_drawer_id: string | null;
  receipt_no: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_ref: string | null;
  collected_by: string | null;
  paid_at: string;
  remarks: string | null;
  created_at: string;
}

// ── 3. Operational DTOs & Compound Views ──────────────────────────────────────

/** Context for current campus request / session */
export interface CampusContext {
  schoolId: string;
  orgId: string | null;
  schoolName: string;
  schoolSlug: string;
  branchCode: string | null;
  role: UserRole;
  isSuperAdmin: boolean;
  activeAcademicYear?: string;
}

/** Student with active class and fee balance summary */
export interface StudentWithFees extends Student {
  class_name?: string;
  class_section?: string;
  total_fees?: number;
  total_paid?: number;
  pending_due?: number;
}

/** Counter POS fee payment submission payload */
export interface FeePaymentInput {
  student_id: string;
  fee_structure_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_ref?: string;
  remarks?: string;
}

/** Cash Drawer EOD Close & Reconciliation input */
export interface CashDrawerReconciliationInput {
  drawer_id: string;
  declared_cash: number;
  notes?: string;
}

/** Daily Treasury Rollup for Super Admin / HQ */
export interface DailyBranchTreasury {
  school_id: string;
  school_name: string;
  branch_code: string | null;
  cash_collected: number;
  upi_collected: number;
  cheque_bank_collected: number;
  total_collected: number;
  drawers_closed: number;
  drawers_flagged: number;
}
