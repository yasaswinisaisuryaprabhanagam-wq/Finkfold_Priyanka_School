/**
 * ==============================================================================
 * FINKFOLD EdOS (Educational Operating System) — ENTERPRISE & TRUST HQ TYPES
 * Path: src/types/enterprise.ts
 *
 * Defines end-to-end TypeScript interfaces matching:
 * - Supabase schema: 009_super_admin_enterprise_and_coordination_expansion.sql
 * - Super Admin Enterprise Modules (MDM, Budgets, Procurement, Mobility, Statutory,
 *   Accreditation Vault, Asset RTE Audits, 1-Click Campus Provisioning)
 * - Super Admin Core Executive Overrides (Chairman Waivers, Till Unlocks, SLAs)
 * - Cross-Portal Coordination Rules (Notebook HW verification, Safe dismissal)
 * ==============================================================================
 */

// ── 1. Global Master Data Management & Policy Locks ──────────────────────────
export interface TrustMasterPolicy {
  id: string;
  organization_id: string;
  policy_key: string;
  policy_name: string;
  category: "finance_fees" | "academics" | "procurement" | "hr_payroll" | "infrastructure";
  standard_value: Record<string, unknown>;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
  allowed_variance_pct: number;
  description?: string;
  updated_at: string;
}

export interface PolicyExceptionRequest {
  id: string;
  organization_id: string;
  school_id: string;
  policy_key: string;
  requested_by: string;
  current_standard_value: Record<string, unknown>;
  proposed_branch_value: Record<string, unknown>;
  justification_reason: string;
  projected_financial_impact: number;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
  super_admin_notes?: string;
  created_at: string;
}

// ── 2. Automated Board of Directors (BoD) Packets ────────────────────────────
export interface BoardMeetingPacket {
  id: string;
  organization_id: string;
  packet_title: string;
  fiscal_quarter: "Q1" | "Q2" | "Q3" | "Q4";
  fiscal_year: string;
  meeting_date: string;
  status: "draft" | "published" | "presented" | "archived";
  consolidated_kpis: Record<string, unknown>;
  campus_comparative_matrix: Array<Record<string, unknown>>;
  academic_trajectory: Record<string, unknown>;
  capex_proposals: Array<Record<string, unknown>>;
  executive_summary?: string;
  prepared_by?: string;
  deck_export_url?: string;
  created_at: string;
}

export interface BoardResolution {
  id: string;
  packet_id?: string;
  organization_id: string;
  resolution_number: string;
  title: string;
  passed_date: string;
  voting_summary: Record<string, unknown>;
  directive_text: string;
  assigned_campus_id?: string;
  implementation_deadline?: string;
  status: "draft" | "in_effect" | "implemented" | "superseded";
  created_at: string;
}

// ── 3. Universal Department Budgeting & Burn-Rate ─────────────────────────────
export interface TrustDepartmentBudget {
  id: string;
  organization_id: string;
  school_id: string;
  fiscal_year: string;
  category:
    | "marketing_admissions"
    | "science_lab_consumables"
    | "it_infrastructure_cloud"
    | "estate_maintenance_repairs"
    | "sports_events"
    | "staff_development_training"
    | "operational_overhead";
  allocated_budget: number;
  spent_amount: number;
  pending_vouchers_amount: number;
  hard_locked: boolean;
  hard_locked_at?: string;
  lock_reason?: string;
  updated_at: string;
}

export interface OverBudgetVoucher {
  id: string;
  budget_id: string;
  organization_id: string;
  school_id: string;
  voucher_number: string;
  requested_amount: number;
  vendor_name: string;
  purpose: string;
  current_budget_balance: number;
  justification_notes?: string;
  status: "pending" | "approved" | "rejected";
  auth_code?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

// ── 4. Bulk E-Procurement & Blind Bidding ────────────────────────────────────
export interface TrustProcurementRFQ {
  id: string;
  organization_id: string;
  rfq_code: string;
  title: string;
  category: string;
  total_quantity: string;
  aggregated_items: Array<Record<string, unknown>>;
  market_baseline_total: number;
  deadline: string;
  status: "draft" | "bidding_open" | "unsealed_ready" | "awarded" | "closed";
  awarded_po_number?: string;
  awarded_vendor_name?: string;
  winning_bid_amount?: number;
  total_projected_savings?: number;
  created_by?: string;
  created_at: string;
}

export interface ProcurementBlindBid {
  id: string;
  rfq_id: string;
  vendor_id: string;
  vendor_name: string;
  gst_number: string;
  rating: number;
  unit_price: number;
  total_amount: number;
  lead_time_days: number;
  is_l1_lowest: boolean;
  warranty_terms?: string;
  is_unsealed: boolean;
  unsealed_at?: string;
  submitted_at: string;
}

export interface TrustBulkPurchaseOrder {
  id: string;
  rfq_id?: string;
  organization_id: string;
  po_number: string;
  vendor_name: string;
  vendor_gst: string;
  item_description: string;
  total_po_amount: number;
  net_savings: number;
  delivery_deadline?: string;
  payment_terms?: string;
  status: "issued" | "acknowledged" | "partially_fulfilled" | "completed" | "cancelled";
  issued_by?: string;
  issued_at: string;
}

// ── 5. Staff Mobility & Unified Personnel Ledger ─────────────────────────────
export interface StaffUnifiedProfile {
  id: string;
  organization_id: string;
  staff_id: string;
  trust_emp_id: string;
  uan_number?: string;
  pan_number?: string;
  biometric_universal_key: string;
  home_campus_id: string;
  current_campus_id: string;
  earned_leave_balance: number;
  sick_leave_balance: number;
  casual_leave_balance: number;
  gratuity_accrued_amount: number;
  cumulative_appraisal_rating: number;
  created_at: string;
  updated_at: string;
}

export interface InterCampusTransfer {
  id: string;
  organization_id: string;
  staff_id: string;
  trust_emp_id: string;
  from_school_id: string;
  to_school_id: string;
  designation: string;
  effective_date: string;
  transfer_ref: string;
  reason: string;
  marks_signed_off: boolean;
  assets_surrendered: boolean;
  biometrics_synced: boolean;
  leave_ledger_preserved: boolean;
  status: "initiated" | "in_transit" | "completed" | "cancelled";
  authorized_by?: string;
  authorized_at: string;
}

// ── 6. Global Statutory Consolidation ────────────────────────────────────────
export interface TrustStatutoryReturn {
  id: string;
  organization_id: string;
  challan_type: "EPF_ECR" | "TDS_24Q" | "PT_CONSOLIDATED" | "ESI_MONTHLY";
  period_month: string;
  period_year: string;
  total_headcount: number;
  gross_wages_total: number;
  total_remittance_amount: number;
  challan_reference_ack?: string;
  exported_file_url?: string;
  compliance_status: "generated" | "reconciled" | "paid" | "filed";
  generated_by?: string;
  generated_at: string;
}

// ── 7. Accreditation & Legal Vault ───────────────────────────────────────────
export interface AccreditationVaultDocument {
  id: string;
  organization_id: string;
  school_id: string;
  document_type:
    | "cbse_affiliation"
    | "fire_safety_noc"
    | "building_stability"
    | "water_sanitation"
    | "rte_recognition"
    | "lease_deed"
    | "pollution_consent"
    | "other";
  document_display_name: string;
  issuing_authority: string;
  cert_number: string;
  valid_from?: string;
  valid_until: string;
  days_remaining: number;
  status: "nominal" | "amber_warning" | "red_critical" | "expired";
  document_file_url?: string;
  last_verified_date: string;
  verified_by?: string;
  renewal_in_progress: boolean;
  created_at: string;
}

// ── 8. Institutional Asset & Infrastructure RTE Audits ───────────────────────
export interface CampusInfrastructureAudit {
  id: string;
  organization_id: string;
  school_id: string;
  academic_year: string;
  enrolled_students: number;
  total_teachers: number;
  str_ratio: number;
  str_status: "compliant" | "warning" | "breach";
  avg_classroom_sqft_per_student: number;
  sqft_status: "compliant" | "warning" | "breach";
  library_titles_per_student: number;
  library_status: "compliant" | "warning" | "breach";
  science_lab_ratio: string;
  sanitation_points_ratio: string;
  cwsn_ramps_accessible: boolean;
  cwsn_accessible_toilets: boolean;
  overall_rte_score: number;
  deficits: string[];
  audit_date: string;
  auditor_id?: string;
  created_at: string;
}

export interface RTERemediationPlan {
  id: string;
  audit_id: string;
  organization_id: string;
  school_id: string;
  statutory_gaps: string[];
  remediation_steps: string[];
  recommended_capex_inr: number;
  target_completion_date?: string;
  board_approved: boolean;
  approved_by?: string;
  remediation_pdf_url?: string;
  created_at: string;
}

// ── 9. Campus Provisioning & Blueprint Replication ───────────────────────────
export interface CampusProvisioningBlueprint {
  id: string;
  organization_id: string;
  blueprint_name: string;
  source_school_id?: string;
  fee_structure_template: Array<Record<string, unknown>>;
  grading_scales_template: Array<Record<string, unknown>>;
  academic_terms_template: Array<Record<string, unknown>>;
  subjects_catalogue_template: Array<Record<string, unknown>>;
  rbac_roles_template: Array<Record<string, unknown>>;
  is_gold_standard: boolean;
  created_at: string;
}

// ── 10. Super Admin Overrides ────────────────────────────────────────────────
export interface ChairmansFeeWaiver {
  id: string;
  organization_id: string;
  school_id: string;
  student_id: string;
  waiver_reference: string;
  overdue_amount_waived: number;
  waiver_reason: string;
  hall_ticket_unlocked: boolean;
  granted_by: string;
  granted_at: string;
}

export interface CashDrawerUnlockLog {
  id: string;
  organization_id: string;
  school_id: string;
  cash_drawer_id: string;
  drawer_date: string;
  cashier_id: string;
  unlock_reason: string;
  cryptographic_auth_code: string;
  unlocked_by: string;
  unlocked_at: string;
  post_unlock_status: string;
}

// ── 11. Cross-Portal Coordination Data Contracts ─────────────────────────────
export interface StudentHomeworkVerification {
  id: string;
  homework_id: string;
  student_id: string;
  status: "verified" | "incomplete" | "missing";
  verified_by: string;
  verified_at: string;
  teacher_remarks?: string;
  parent_whatsapp_alert_sent: boolean;
}

export interface StudentDismissalOverride {
  id: string;
  school_id: string;
  student_id: string;
  override_date: string;
  is_private_pickup: boolean;
  companion_name?: string;
  vehicle_number?: string;
  reported_at: string;
  acknowledged_by_faculty_id?: string;
  bus_route_number?: string;
  gate_exit_scanned_at?: string;
}
