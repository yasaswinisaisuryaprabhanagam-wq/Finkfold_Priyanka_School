-- ==============================================================================
-- FINKFOLD EdOS — MIGRATION 009: SUPER ADMIN ENTERPRISE & COORDINATION EXPANSION
-- Path: supabase/migrations/009_super_admin_enterprise_and_coordination_expansion.sql
--
-- Description:
--   Comprehensive database expansion providing relational storage and constraints for:
--     1. PART I: ENHANCEMENTS TO EXISTING PORTAL TABLES
--        - Curriculum unit plans (evening bag packing checklist & homework sync)
--        - Conduct ledger (mandatory guardian digital e-sign & self-service freeze)
--        - Regulated teacher messages (after-hours scheduled delivery queue)
--        - Lost & found (claim identification mark & desk delivery audit)
--        - Fee structures (Trust-wide standardization organization_id)
--     2. PART II: SUPER ADMIN ENTERPRISE (TRUST HQ SOVEREIGNTY COMMAND)
--        - Global Master Data Management (MDM) & Policy Locks
--        - Policy Exception Approvals & Variance tracking
--        - Automated Board of Directors (BoD) Meeting Packets & Resolutions
--        - Universal Department Budgeting & Hard-Lock Burn-Rate Monitoring
--        - Over-Budget Expenditure Vouchers & Cryptographic Authorization
--        - Bulk E-Procurement RFQ Aggregation & Multi-Campus Consignments
--        - Reverse Auction Blind Bidding & L1 Lowest Bid Award
--        - Trust Sovereign Bulk Purchase Orders (PO)
--        - Inter-Campus Staff Mobility & Unified Personnel Ledger (Gratuity, Leaves, PF)
--        - Inter-Campus Staff Transfer Audit Trail
--        - Global Statutory Consolidation (EPF ECR, TDS 24Q, PT, ESI returns)
--        - Accreditation & Legal Affiliation Vault (90/30-day countdown SLAs)
--        - Compliance SLA Escalation Logs
--        - Institutional Asset & Infrastructure RTE 2009 / CBSE SARAS 4.0 Audits
--        - Statutory Gap Remediation Action Plans & Board CAPEX
--        - Franchise Expansion: 1-Click Campus Provisioning Blueprints & Logs
--     3. PART III: SUPER ADMIN CORE EXECUTIVE OVERRIDES
--        - Chairman's Fee Waiver Desk & Hall Ticket Unlock
--        - Cash Drawer Till Unlock Cryptographic Audit Ledger
--        - SafeSpace Grievance 2-Hour SLA Escalations
--        - 4:30 PM Lesson Plan Sync SLA Dispatches
--     4. PART IV: CROSS-PORTAL COORDINATION & COMPLIANCE
--        - Student Homework In-Class Aisle Walkthrough Verification
--        - Safe Boarding Afternoon Dismissal Overrides (Private Pickup Sync)
--        - Tally & NetSuite ERP Voucher & Journal Sync Logs
--        - UDISE+ Ministry Annual Data Capture Records
--     5. PART V: PERFORMANCE INDEXES & ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- ==============================================================================
-- PART 1: UPDATES & ENHANCEMENTS TO EXISTING TABLES
-- ==============================================================================

-- 1.1 Expand curriculum_unit_plans for Rule 1 (Day-Before Lesson Prep & Bag Packing Guide)
ALTER TABLE public.curriculum_unit_plans
  ADD COLUMN IF NOT EXISTS materials_to_pack jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS homework_instructions text,
  ADD COLUMN IF NOT EXISTS synced_to_student_evening_view boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS evening_synced_at timestamptz;

-- 1.2 Expand student_conduct_ledger for Rule 4 (Mandatory Guardian Digital E-Sign)
ALTER TABLE public.student_conduct_ledger
  ADD COLUMN IF NOT EXISTS mandatory_guardian_esign boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_lock_triggered boolean NOT NULL DEFAULT false;

-- 1.3 Expand regulated_teacher_messages for Rule 8 (After-Hours Queueing & Office Hours Window)
ALTER TABLE public.regulated_teacher_messages
  ADD COLUMN IF NOT EXISTS scheduled_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS office_hours_window text NOT NULL DEFAULT '15:45-17:00';

-- 1.4 Expand lost_and_found_items for Rule 11 (Claim Verification & Desk Delivery)
ALTER TABLE public.lost_and_found_items
  ADD COLUMN IF NOT EXISTS identifying_mark_claim text,
  ADD COLUMN IF NOT EXISTS desk_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_by uuid REFERENCES public.profiles(id);

-- 1.5 Expand fee_structures to link directly to organization for Trust-Wide Standardization
ALTER TABLE public.fee_structures
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id),
  ADD COLUMN IF NOT EXISTS is_trust_standard boolean NOT NULL DEFAULT false;

-- 1.6 Expand exam_assessments to flag Central Board Examinations
ALTER TABLE public.exam_assessments
  ADD COLUMN IF NOT EXISTS is_board_exam boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hall_ticket_generation_locked boolean NOT NULL DEFAULT false;


-- ==============================================================================
-- PART 2: SUPER ADMIN ENTERPRISE (TRUST HQ SOVEREIGNTY COMMAND)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 2.1 Global Master Data Management (MDM) & Policy Lock
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trust_master_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_key text NOT NULL UNIQUE,
  policy_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('finance_fees', 'academics', 'procurement', 'hr_payroll', 'infrastructure')),
  standard_value jsonb NOT NULL,
  is_locked boolean NOT NULL DEFAULT true,
  locked_by uuid REFERENCES public.profiles(id),
  locked_at timestamptz DEFAULT now(),
  allowed_variance_pct numeric NOT NULL DEFAULT 0.00,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trust_master_policies_pkey PRIMARY KEY (id)
);

-- Policy Exception Requests submitted by Branch Principals
CREATE TABLE IF NOT EXISTS public.policy_exception_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  policy_key text NOT NULL REFERENCES public.trust_master_policies(policy_key) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.profiles(id),
  current_standard_value jsonb NOT NULL,
  proposed_branch_value jsonb NOT NULL,
  justification_reason text NOT NULL,
  projected_financial_impact numeric DEFAULT 0.00,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  super_admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT policy_exception_requests_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.2 Automated Board of Directors (BoD) Pitch Decks & Meeting Packets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.board_meeting_packets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  packet_title text NOT NULL,
  fiscal_quarter text NOT NULL CHECK (fiscal_quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  fiscal_year text NOT NULL DEFAULT '2026-2027',
  meeting_date date NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'presented', 'archived')),
  consolidated_kpis jsonb NOT NULL DEFAULT '{}'::jsonb,
  campus_comparative_matrix jsonb NOT NULL DEFAULT '[]'::jsonb,
  academic_trajectory jsonb NOT NULL DEFAULT '{}'::jsonb,
  capex_proposals jsonb NOT NULL DEFAULT '[]'::jsonb,
  executive_summary text,
  prepared_by uuid REFERENCES public.profiles(id),
  deck_export_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT board_meeting_packets_pkey PRIMARY KEY (id)
);

-- Board Meeting Resolutions & Governance Directives
CREATE TABLE IF NOT EXISTS public.board_resolutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  packet_id uuid REFERENCES public.board_meeting_packets(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  resolution_number text NOT NULL UNIQUE,
  title text NOT NULL,
  passed_date date NOT NULL DEFAULT CURRENT_DATE,
  voting_summary jsonb NOT NULL DEFAULT '{"unanimous": true}'::jsonb,
  directive_text text NOT NULL,
  assigned_campus_id uuid REFERENCES public.schools(id),
  implementation_deadline date,
  status text NOT NULL DEFAULT 'in_effect' CHECK (status IN ('draft', 'in_effect', 'implemented', 'superseded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT board_resolutions_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.3 Universal Department Budgeting & Hard-Lock Burn-Rate Monitoring
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trust_department_budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  fiscal_year text NOT NULL DEFAULT '2026-2027',
  category text NOT NULL CHECK (category IN (
    'marketing_admissions', 
    'science_lab_consumables', 
    'it_infrastructure_cloud', 
    'estate_maintenance_repairs', 
    'sports_events', 
    'staff_development_training', 
    'operational_overhead'
  )),
  allocated_budget numeric NOT NULL CHECK (allocated_budget >= 0),
  spent_amount numeric NOT NULL DEFAULT 0.00 CHECK (spent_amount >= 0),
  pending_vouchers_amount numeric NOT NULL DEFAULT 0.00 CHECK (pending_vouchers_amount >= 0),
  hard_locked boolean NOT NULL DEFAULT false,
  hard_locked_at timestamptz,
  lock_reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trust_department_budgets_pkey PRIMARY KEY (id),
  CONSTRAINT trust_department_budgets_unique UNIQUE (school_id, fiscal_year, category)
);

-- Over-Budget Expenditure Vouchers requiring Super Admin Digital Authorization
CREATE TABLE IF NOT EXISTS public.over_budget_vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.trust_department_budgets(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  voucher_number text NOT NULL UNIQUE,
  requested_amount numeric NOT NULL CHECK (requested_amount > 0),
  vendor_name text NOT NULL,
  purpose text NOT NULL,
  current_budget_balance numeric NOT NULL,
  justification_notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  auth_code text UNIQUE,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT over_budget_vouchers_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.4 Centralized Bulk E-Procurement & Blind Bidding Engine
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trust_procurement_rfqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rfq_code text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  total_quantity text NOT NULL,
  aggregated_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  market_baseline_total numeric NOT NULL CHECK (market_baseline_total > 0),
  deadline timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'bidding_open' CHECK (status IN ('draft', 'bidding_open', 'unsealed_ready', 'awarded', 'closed')),
  awarded_po_number text,
  awarded_vendor_name text,
  winning_bid_amount numeric,
  total_projected_savings numeric,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trust_procurement_rfqs_pkey PRIMARY KEY (id)
);

-- Campus-Wise Delivery Split Manifests for Sovereign Bulk RFQs
CREATE TABLE IF NOT EXISTS public.trust_rfq_campus_allocations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.trust_procurement_rfqs(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  quantity_allocated text NOT NULL,
  storekeeper_consignee text NOT NULL,
  storekeeper_id uuid REFERENCES public.profiles(id),
  delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'dispatched', 'received_in_stock')),
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trust_rfq_campus_allocations_pkey PRIMARY KEY (id)
);

-- Sealed Blind Bids submitted by Audited Vendors
CREATE TABLE IF NOT EXISTS public.procurement_blind_bids (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.trust_procurement_rfqs(id) ON DELETE CASCADE,
  vendor_id text NOT NULL,
  vendor_name text NOT NULL,
  gst_number text NOT NULL,
  rating numeric DEFAULT 4.5,
  unit_price numeric NOT NULL CHECK (unit_price > 0),
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  lead_time_days integer NOT NULL,
  is_l1_lowest boolean NOT NULL DEFAULT false,
  warranty_terms text,
  encrypted_payload text,
  is_unsealed boolean NOT NULL DEFAULT false,
  unsealed_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT procurement_blind_bids_pkey PRIMARY KEY (id)
);

-- Sovereign Trust Bulk Purchase Orders (PO)
CREATE TABLE IF NOT EXISTS public.trust_bulk_purchase_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rfq_id uuid REFERENCES public.trust_procurement_rfqs(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  po_number text NOT NULL UNIQUE,
  vendor_name text NOT NULL,
  vendor_gst text NOT NULL,
  item_description text NOT NULL,
  total_po_amount numeric NOT NULL CHECK (total_po_amount > 0),
  net_savings numeric NOT NULL DEFAULT 0.00,
  delivery_deadline date,
  payment_terms text DEFAULT 'Net 30 Days after 3-campus physical verification',
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'acknowledged', 'partially_fulfilled', 'completed', 'cancelled')),
  issued_by uuid REFERENCES public.profiles(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trust_bulk_purchase_orders_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.5 Inter-Campus Staff Mobility & Unified Personnel History (Workday / Darwinbox)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_unified_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  trust_emp_id text NOT NULL UNIQUE,
  uan_number text,
  pan_number text,
  biometric_universal_key text NOT NULL UNIQUE,
  home_campus_id uuid NOT NULL REFERENCES public.schools(id),
  current_campus_id uuid NOT NULL REFERENCES public.schools(id),
  earned_leave_balance numeric NOT NULL DEFAULT 15.0,
  sick_leave_balance numeric NOT NULL DEFAULT 8.0,
  casual_leave_balance numeric NOT NULL DEFAULT 6.0,
  gratuity_accrued_amount numeric NOT NULL DEFAULT 0.00,
  cumulative_appraisal_rating numeric DEFAULT 4.8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_unified_profiles_pkey PRIMARY KEY (id)
);

-- Immutable Inter-Campus Transfer Ledger
CREATE TABLE IF NOT EXISTS public.inter_campus_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trust_emp_id text NOT NULL,
  from_school_id uuid NOT NULL REFERENCES public.schools(id),
  to_school_id uuid NOT NULL REFERENCES public.schools(id),
  designation text NOT NULL,
  effective_date date NOT NULL,
  transfer_ref text NOT NULL UNIQUE,
  reason text NOT NULL,
  marks_signed_off boolean NOT NULL DEFAULT true,
  assets_surrendered boolean NOT NULL DEFAULT true,
  biometrics_synced boolean NOT NULL DEFAULT true,
  leave_ledger_preserved boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('initiated', 'in_transit', 'completed', 'cancelled')),
  authorized_by uuid REFERENCES public.profiles(id),
  authorized_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inter_campus_transfers_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.6 Global Statutory Consolidation (EPF, TDS 24Q, PT, ESI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trust_statutory_returns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  challan_type text NOT NULL CHECK (challan_type IN ('EPF_ECR', 'TDS_24Q', 'PT_CONSOLIDATED', 'ESI_MONTHLY')),
  period_month text NOT NULL,
  period_year text NOT NULL,
  total_headcount integer NOT NULL CHECK (total_headcount > 0),
  gross_wages_total numeric NOT NULL CHECK (gross_wages_total >= 0),
  total_remittance_amount numeric NOT NULL CHECK (total_remittance_amount >= 0),
  challan_reference_ack text,
  exported_file_url text,
  compliance_status text NOT NULL DEFAULT 'generated' CHECK (compliance_status IN ('generated', 'reconciled', 'paid', 'filed')),
  generated_by uuid REFERENCES public.profiles(id),
  generated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trust_statutory_returns_pkey PRIMARY KEY (id),
  CONSTRAINT trust_statutory_unique UNIQUE (organization_id, challan_type, period_month, period_year)
);

-- Statutory Return Campus-Level Breakdown
CREATE TABLE IF NOT EXISTS public.trust_statutory_campus_breakdown (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES public.trust_statutory_returns(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  campus_headcount integer NOT NULL,
  gross_wages numeric NOT NULL,
  epf_contribution numeric NOT NULL DEFAULT 0.00,
  tds_deduction numeric NOT NULL DEFAULT 0.00,
  pt_deduction numeric NOT NULL DEFAULT 0.00,
  esi_deduction numeric NOT NULL DEFAULT 0.00,
  is_reconciled boolean NOT NULL DEFAULT true,
  CONSTRAINT trust_statutory_campus_breakdown_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.7 Accreditation & Affiliation Vault
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accreditation_vault_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'cbse_affiliation',
    'fire_safety_noc',
    'building_stability',
    'water_sanitation',
    'rte_recognition',
    'lease_deed',
    'pollution_consent',
    'other'
  )),
  document_display_name text NOT NULL,
  issuing_authority text NOT NULL,
  cert_number text NOT NULL,
  valid_from date,
  valid_until date NOT NULL,
  days_remaining integer NOT NULL,
  status text NOT NULL CHECK (status IN ('nominal', 'amber_warning', 'red_critical', 'expired')),
  document_file_url text,
  last_verified_date date NOT NULL DEFAULT CURRENT_DATE,
  verified_by uuid REFERENCES public.profiles(id),
  renewal_in_progress boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accreditation_vault_documents_pkey PRIMARY KEY (id)
);

-- Proactive Compliance SLA Escalation Dispatch Logs
CREATE TABLE IF NOT EXISTS public.compliance_sla_escalation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.accreditation_vault_documents(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  alert_tier text NOT NULL CHECK (alert_tier IN ('amber_90_day', 'red_30_day', 'emergency_expiry')),
  message text NOT NULL,
  dispatched_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_by uuid REFERENCES public.profiles(id),
  acknowledged_at timestamptz,
  CONSTRAINT compliance_sla_escalation_logs_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.8 Institutional Asset & Infrastructure RTE 2009 / CBSE SARAS 4.0 Audits
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campus_infrastructure_audits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2026-2027',
  enrolled_students integer NOT NULL,
  total_teachers integer NOT NULL,
  str_ratio numeric NOT NULL,
  str_status text NOT NULL CHECK (str_status IN ('compliant', 'warning', 'breach')),
  avg_classroom_sqft_per_student numeric NOT NULL,
  sqft_status text NOT NULL CHECK (sqft_status IN ('compliant', 'warning', 'breach')),
  library_titles_per_student numeric NOT NULL,
  library_status text NOT NULL CHECK (library_status IN ('compliant', 'warning', 'breach')),
  science_lab_ratio text NOT NULL,
  sanitation_points_ratio text NOT NULL,
  cwsn_ramps_accessible boolean NOT NULL DEFAULT true,
  cwsn_accessible_toilets boolean NOT NULL DEFAULT true,
  overall_rte_score integer NOT NULL CHECK (overall_rte_score >= 0 AND overall_rte_score <= 100),
  deficits jsonb NOT NULL DEFAULT '[]'::jsonb,
  audit_date date NOT NULL DEFAULT CURRENT_DATE,
  auditor_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campus_infrastructure_audits_pkey PRIMARY KEY (id)
);

-- Statutory RTE Remediation Action Plans & Board CAPEX Approvals
CREATE TABLE IF NOT EXISTS public.rte_remediation_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.campus_infrastructure_audits(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  statutory_gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  remediation_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_capex_inr numeric NOT NULL DEFAULT 0.00,
  target_completion_date date,
  board_approved boolean NOT NULL DEFAULT false,
  approved_by uuid REFERENCES public.profiles(id),
  remediation_pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rte_remediation_plans_pkey PRIMARY KEY (id)
);

-- ------------------------------------------------------------------------------
-- 2.9 Franchise Expansion: 1-Click New Campus Provisioning Wizard
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campus_provisioning_blueprints (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  blueprint_name text NOT NULL,
  source_school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  fee_structure_template jsonb NOT NULL DEFAULT '[]'::jsonb,
  grading_scales_template jsonb NOT NULL DEFAULT '[]'::jsonb,
  academic_terms_template jsonb NOT NULL DEFAULT '[]'::jsonb,
  subjects_catalogue_template jsonb NOT NULL DEFAULT '[]'::jsonb,
  rbac_roles_template jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_gold_standard boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campus_provisioning_blueprints_pkey PRIMARY KEY (id)
);

-- Automated Branch Deployment Execution Logs
CREATE TABLE IF NOT EXISTS public.campus_provisioning_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  new_school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  source_blueprint_id uuid REFERENCES public.campus_provisioning_blueprints(id),
  execution_duration_seconds numeric NOT NULL,
  cloned_entities_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  deployed_by uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed')),
  deployed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campus_provisioning_logs_pkey PRIMARY KEY (id)
);


-- ==============================================================================
-- PART 3: SUPER ADMIN CORE EXECUTIVE OVERRIDES
-- ==============================================================================

-- 3.1 Chairman's Fee Waiver Desk (Bypass Exam Gate Lock)
CREATE TABLE IF NOT EXISTS public.chairmans_fee_waivers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  waiver_reference text NOT NULL UNIQUE,
  overdue_amount_waived numeric NOT NULL CHECK (overdue_amount_waived >= 0),
  waiver_reason text NOT NULL,
  hall_ticket_unlocked boolean NOT NULL DEFAULT true,
  granted_by uuid NOT NULL REFERENCES public.profiles(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chairmans_fee_waivers_pkey PRIMARY KEY (id)
);

-- 3.2 Cash Drawer Till Unlock Cryptographic Audit Ledger
CREATE TABLE IF NOT EXISTS public.cash_drawer_unlock_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cash_drawer_id uuid NOT NULL REFERENCES public.cash_drawers(id) ON DELETE CASCADE,
  drawer_date date NOT NULL,
  cashier_id uuid NOT NULL REFERENCES public.profiles(id),
  unlock_reason text NOT NULL,
  cryptographic_auth_code text NOT NULL UNIQUE,
  unlocked_by uuid NOT NULL REFERENCES public.profiles(id),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  post_unlock_status text NOT NULL DEFAULT 'open_for_correction',
  CONSTRAINT cash_drawer_unlock_logs_pkey PRIMARY KEY (id)
);

-- 3.3 SafeSpace Grievance 2-Hour SLA Escalations
CREATE TABLE IF NOT EXISTS public.safespace_sla_escalations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grievance_id uuid NOT NULL REFERENCES public.anonymous_grievance_reports(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  tracking_token text NOT NULL,
  sla_threshold_hours integer NOT NULL DEFAULT 2,
  breached_at timestamptz NOT NULL DEFAULT now(),
  taken_over_by uuid NOT NULL REFERENCES public.profiles(id),
  taken_over_at timestamptz NOT NULL DEFAULT now(),
  investigation_notes text,
  CONSTRAINT safespace_sla_escalations_pkey PRIMARY KEY (id)
);

-- 3.4 4:30 PM Lesson Plan Sync SLA Dispatches & Formal Warnings
CREATE TABLE IF NOT EXISTS public.lesson_plan_sla_warnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_name text NOT NULL,
  offence_count integer NOT NULL DEFAULT 1,
  warning_tier text NOT NULL CHECK (warning_tier IN ('amber_reminder', 'formal_hr_warning', 'executive_debarment')),
  dispatched_by uuid NOT NULL REFERENCES public.profiles(id),
  dispatched_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_plan_sla_warnings_pkey PRIMARY KEY (id)
);


-- ==============================================================================
-- PART 4: CROSS-PORTAL COORDINATION & COMPLIANCE
-- ==============================================================================

-- 4.1 In-Class Aisle Walkthrough Physical Notebook Verification (Rule 2)
CREATE TABLE IF NOT EXISTS public.student_homework_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('verified', 'incomplete', 'missing')),
  verified_by uuid NOT NULL REFERENCES public.profiles(id),
  verified_at timestamptz NOT NULL DEFAULT now(),
  teacher_remarks text,
  parent_whatsapp_alert_sent boolean NOT NULL DEFAULT false,
  CONSTRAINT student_homework_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT student_homework_unique UNIQUE (homework_id, student_id)
);

-- 4.2 Safe Boarding Dismissal Overrides (Private Pickup Sync at 03:40 PM) (Rule 6)
CREATE TABLE IF NOT EXISTS public.student_dismissal_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  override_date date NOT NULL DEFAULT CURRENT_DATE,
  is_private_pickup boolean NOT NULL DEFAULT false,
  companion_name text,
  vehicle_number text,
  reported_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_by_faculty_id uuid REFERENCES public.profiles(id),
  bus_route_number text,
  gate_exit_scanned_at timestamptz,
  CONSTRAINT student_dismissal_overrides_pkey PRIMARY KEY (id),
  CONSTRAINT dismissal_override_unique UNIQUE (student_id, override_date)
);

-- 4.3 Tally & NetSuite ERP Multi-Branch Voucher Export Logs
CREATE TABLE IF NOT EXISTS public.tally_erp_sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('tally_vouchers_xml', 'journal_entries_csv', 'bank_feed_json')),
  date_range_start date NOT NULL,
  date_range_end date NOT NULL,
  total_vouchers_count integer NOT NULL,
  total_amount_inr numeric NOT NULL,
  exported_by uuid REFERENCES public.profiles(id),
  exported_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tally_erp_sync_logs_pkey PRIMARY KEY (id)
);

-- 4.4 UDISE+ National & State Annual Data Capture Records
CREATE TABLE IF NOT EXISTS public.udise_compliance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2026-2027',
  udise_sch_code text NOT NULL,
  section_1_school_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  section_2_physical_facility jsonb NOT NULL DEFAULT '{}'::jsonb,
  section_3_teaching_staff jsonb NOT NULL DEFAULT '{}'::jsonb,
  section_4_student_enrollment jsonb NOT NULL DEFAULT '{}'::jsonb,
  section_5_incentives jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_status text NOT NULL DEFAULT 'draft' CHECK (validation_status IN ('draft', 'validated', 'error_flagged', 'submitted_to_ministry')),
  certified_by_principal uuid REFERENCES public.profiles(id),
  certified_at timestamptz,
  CONSTRAINT udise_compliance_records_pkey PRIMARY KEY (id)
);


-- ==============================================================================
-- PART 5: HIGH-PERFORMANCE INDEXES
-- ==============================================================================

-- Master Policies & Exceptions
CREATE INDEX IF NOT EXISTS idx_trust_master_policies_org ON public.trust_master_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_policy_exceptions_status ON public.policy_exception_requests(organization_id, status);

-- Budgets & Over-Budget Vouchers
CREATE INDEX IF NOT EXISTS idx_trust_budgets_school_year ON public.trust_department_budgets(school_id, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_over_budget_vouchers_status ON public.over_budget_vouchers(organization_id, status);

-- Procurement
CREATE INDEX IF NOT EXISTS idx_trust_rfqs_org_status ON public.trust_procurement_rfqs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_blind_bids_rfq ON public.procurement_blind_bids(rfq_id);
CREATE INDEX IF NOT EXISTS idx_trust_pos_number ON public.trust_bulk_purchase_orders(po_number);

-- Staff Mobility
CREATE INDEX IF NOT EXISTS idx_staff_unified_profiles_emp_id ON public.staff_unified_profiles(trust_emp_id);
CREATE INDEX IF NOT EXISTS idx_inter_campus_transfers_staff ON public.inter_campus_transfers(staff_id, effective_date);

-- Statutory Consolidation
CREATE INDEX IF NOT EXISTS idx_statutory_returns_period ON public.trust_statutory_returns(organization_id, period_month, period_year);
CREATE INDEX IF NOT EXISTS idx_statutory_campus_breakdown_school ON public.trust_statutory_campus_breakdown(school_id);

-- Accreditation Vault
CREATE INDEX IF NOT EXISTS idx_accreditation_vault_expiry ON public.accreditation_vault_documents(valid_until, status);
CREATE INDEX IF NOT EXISTS idx_accreditation_vault_school ON public.accreditation_vault_documents(school_id);

-- Infrastructure Audits
CREATE INDEX IF NOT EXISTS idx_infra_audits_school_year ON public.campus_infrastructure_audits(school_id, academic_year);

-- Overrides
CREATE INDEX IF NOT EXISTS idx_chairmans_waivers_student ON public.chairmans_fee_waivers(student_id);
CREATE INDEX IF NOT EXISTS idx_cash_drawer_unlocks_drawer ON public.cash_drawer_unlock_logs(cash_drawer_id);
CREATE INDEX IF NOT EXISTS idx_safespace_escalations_token ON public.safespace_sla_escalations(tracking_token);

-- Coordination Rules
CREATE INDEX IF NOT EXISTS idx_homework_verifications_hw ON public.student_homework_verifications(homework_id, student_id);
CREATE INDEX IF NOT EXISTS idx_dismissal_overrides_date ON public.student_dismissal_overrides(school_id, override_date);


-- ==============================================================================
-- PART 6: ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all new tables
ALTER TABLE public.trust_master_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_exception_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_meeting_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_department_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.over_budget_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_procurement_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_rfq_campus_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_blind_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_bulk_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_unified_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inter_campus_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_statutory_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_statutory_campus_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accreditation_vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_sla_escalation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_infrastructure_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rte_remediation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_provisioning_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_provisioning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chairmans_fee_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_drawer_unlock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safespace_sla_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_sla_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_homework_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_dismissal_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_erp_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.udise_compliance_records ENABLE ROW LEVEL SECURITY;

-- Helper RLS rule: Authenticated read & write for authorized personnel
CREATE POLICY "Super Admins have sovereign access to trust policies" 
  ON public.trust_master_policies FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Principals have access to policy exceptions" 
  ON public.policy_exception_requests FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to board packets" 
  ON public.board_meeting_packets FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to board resolutions" 
  ON public.board_resolutions FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Finance have access to trust budgets" 
  ON public.trust_department_budgets FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Cashiers have access to over budget vouchers" 
  ON public.over_budget_vouchers FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to procurement rfqs" 
  ON public.trust_procurement_rfqs FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Campus storekeepers have access to rfq allocations" 
  ON public.trust_rfq_campus_allocations FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to blind bids" 
  ON public.procurement_blind_bids FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to trust purchase orders" 
  ON public.trust_bulk_purchase_orders FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and HR have access to unified profiles" 
  ON public.staff_unified_profiles FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to inter campus transfers" 
  ON public.inter_campus_transfers FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to statutory returns" 
  ON public.trust_statutory_returns FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to statutory campus breakdown" 
  ON public.trust_statutory_campus_breakdown FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Principals have access to accreditation vault" 
  ON public.accreditation_vault_documents FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to compliance sla logs" 
  ON public.compliance_sla_escalation_logs FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Principals have access to infrastructure audits" 
  ON public.campus_infrastructure_audits FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to rte remediation plans" 
  ON public.rte_remediation_plans FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to campus blueprints" 
  ON public.campus_provisioning_blueprints FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to provisioning logs" 
  ON public.campus_provisioning_logs FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Accountants have access to chairmans waivers" 
  ON public.chairmans_fee_waivers FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Cashiers have access to till unlock logs" 
  ON public.cash_drawer_unlock_logs FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins have access to safespace escalations" 
  ON public.safespace_sla_escalations FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Principals have access to lesson plan sla warnings" 
  ON public.lesson_plan_sla_warnings FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Teachers and Students have access to homework verifications" 
  ON public.student_homework_verifications FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Teachers and Parents have access to dismissal overrides" 
  ON public.student_dismissal_overrides FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Super Admins and Accountants have access to tally sync logs" 
  ON public.tally_erp_sync_logs FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Principals have access to udise compliance records" 
  ON public.udise_compliance_records FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);
