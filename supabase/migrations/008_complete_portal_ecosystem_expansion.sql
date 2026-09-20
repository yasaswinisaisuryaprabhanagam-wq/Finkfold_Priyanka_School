-- ==============================================================================
-- FINKFOLD EdOS — MIGRATION 008: COMPLETE PORTAL ECOSYSTEM EXPANSION
-- Path: supabase/migrations/008_complete_portal_ecosystem_expansion.sql
--
-- Description:
--   Comprehensive database expansion supporting all new capabilities across:
--     1. Student & Parent Portal (Demerits e-sign lock, UDISE demographics)
--     2. Faculty Command Center (Exams & marks, faculty leaves, curriculum unit plans,
--        voice grader, seating layouts, SEN vault, biometrics, maintenance, relief)
--     3. Admin Enterprise Operations (Admissions CRM, bank reconciliation, store
--        inventory & POs, live fleet radar & RFID turnstiles, recruitment ATS,
--        360 appraisals, NEP 2020 OBE, waterfall broadcast)
--     4. Admin Level 1, 2, 3 Capabilities (Print Room certificates, Library console,
--        Late-fee penalty & defaulters, VMS gatepass, AI timetable constraints & slots,
--        Board Exam LOC automator, Payroll & payslips, Alumni CRM & 80G donations)
-- ==============================================================================

-- ==============================================================================
-- PART 1: UPDATES & ENHANCEMENTS TO EXISTING TABLES
-- ==============================================================================

-- 1.1 Expand students table with Government Compliance & Board LOC Demographics
ALTER TABLE public.students 
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_status text DEFAULT 'pending' CHECK (aadhaar_status IN ('verified', 'pending', 'failed')),
  ADD COLUMN IF NOT EXISTS social_category text DEFAULT 'General' CHECK (social_category IN ('General', 'OBC', 'SC', 'ST')),
  ADD COLUMN IF NOT EXISTS minority_group text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS bpl_ews_status boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cwsn_disability text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS mother_tongue_code text DEFAULT '042 - Telugu',
  ADD COLUMN IF NOT EXISTS medium_of_instruction text DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS parent_annual_income_slab text DEFAULT '2.5L - 5L',
  ADD COLUMN IF NOT EXISTS previous_year_attendance_days integer DEFAULT 210,
  ADD COLUMN IF NOT EXISTS total_instructional_days integer DEFAULT 220,
  ADD COLUMN IF NOT EXISTS identification_mark_1 text,
  ADD COLUMN IF NOT EXISTS identification_mark_2 text;

-- 1.2 Expand student_conduct_ledger with Parent E-Signature Verification Lock
ALTER TABLE public.student_conduct_ledger
  ADD COLUMN IF NOT EXISTS parent_signed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS parent_signature_hash text;

-- 1.3 Expand fee_structures category constraint to allow library fines and late fees
ALTER TABLE public.fee_structures 
  DROP CONSTRAINT IF EXISTS fee_structures_category_check;

ALTER TABLE public.fee_structures 
  ADD CONSTRAINT fee_structures_category_check 
  CHECK (category IN ('tuition', 'admission', 'exam', 'transport', 'library', 'laboratory', 'sports', 'annual', 'other', 'books_uniform', 'digital_portal', 'miscellaneous', 'library_fine', 'late_fee'));

-- 1.4 Expand pending_admissions with Lead CRM & Pipeline Funnel tracking
ALTER TABLE public.pending_admissions
  ADD COLUMN IF NOT EXISTS lead_source text DEFAULT 'Website',
  ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'inquiry' CHECK (pipeline_stage IN ('inquiry', 'campus_tour', 'documents_submitted', 'principal_interview', 'admitted', 'dropped')),
  ADD COLUMN IF NOT EXISTS tour_date timestamptz,
  ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS counselor_notes text;


-- ==============================================================================
-- PART 2: FACULTY COMMAND CENTER & ACADEMIC ENGINE TABLES
-- ==============================================================================

-- 2.1 Examination Assessments Master
CREATE TABLE IF NOT EXISTS public.exam_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  name text NOT NULL,
  term text NOT NULL DEFAULT 'Term 1',
  start_date date,
  end_date date,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exam_assessments_school ON public.exam_assessments(school_id);

-- 2.2 Student Exam Marks & AI Remedial Flagging
CREATE TABLE IF NOT EXISTS public.student_exam_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.exam_assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks_obtained numeric NOT NULL CHECK (marks_obtained >= 0),
  max_marks numeric NOT NULL DEFAULT 100 CHECK (max_marks > 0),
  percentage numeric GENERATED ALWAYS AS ((marks_obtained / max_marks) * 100) STORED,
  grade text,
  is_flagged_remedial boolean NOT NULL DEFAULT false,
  remedial_topic text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_student_exam_subject UNIQUE (exam_id, student_id, subject_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_marks_student ON public.student_exam_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_marks_exam ON public.student_exam_marks(exam_id);

-- 2.3 Faculty & Staff Leave Requests
CREATE TABLE IF NOT EXISTS public.staff_leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type text NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'maternity', 'unpaid')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days numeric NOT NULL DEFAULT 1 CHECK (total_days > 0),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_leaves_staff ON public.staff_leaves(staff_id);

-- 2.4 Curriculum Unit Planner & Lesson Units
CREATE TABLE IF NOT EXISTS public.curriculum_unit_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_number integer NOT NULL,
  unit_title text NOT NULL,
  learning_objectives text NOT NULL,
  bloom_taxonomy_level text DEFAULT 'Applying' CHECK (bloom_taxonomy_level IN ('Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed')),
  co_teacher_synced boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_unit_plans_class_sub ON public.curriculum_unit_plans(class_id, subject_id);

-- 2.5 Subjective Essay Submissions & AI Voice Grader
CREATE TABLE IF NOT EXISTS public.student_essay_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  essay_topic text NOT NULL,
  essay_content text NOT NULL,
  ai_rubric_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  overall_score numeric,
  audio_voice_note_url text,
  teacher_comments text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'ai_evaluated', 'teacher_graded')),
  graded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_essay_submissions_student ON public.student_essay_submissions(student_id);

-- 2.6 Classroom Seating Layouts & Device Lock
CREATE TABLE IF NOT EXISTS public.classroom_seating_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE UNIQUE,
  grid_rows integer NOT NULL DEFAULT 6,
  grid_cols integer NOT NULL DEFAULT 7,
  desks_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  pairing_warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  device_lock_active boolean NOT NULL DEFAULT false,
  device_lock_message text DEFAULT 'Please look at the teacher. Screen locked by faculty.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.7 SEN & Inclusive Education Confidential Profiles
CREATE TABLE IF NOT EXISTS public.sen_student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  primary_diagnosis text NOT NULL,
  accommodations text[] DEFAULT ARRAY[]::text[],
  iep_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  behavior_triggers text,
  special_educator_assigned text,
  is_confidential boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.8 Staff Biometric Attendance Punches & Regularization
CREATE TABLE IF NOT EXISTS public.staff_biometric_punches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  punch_date date NOT NULL DEFAULT current_date,
  punch_in_time time,
  punch_out_time time,
  device_id text DEFAULT 'BIOMETRIC-GATE-01',
  status text NOT NULL DEFAULT 'on_time' CHECK (status IN ('on_time', 'late', 'half_day', 'absent')),
  is_regularized boolean NOT NULL DEFAULT false,
  regularization_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_staff_punch_date UNIQUE (staff_id, punch_date)
);
CREATE INDEX IF NOT EXISTS idx_biometric_punches_staff ON public.staff_biometric_punches(staff_id, punch_date);

-- 2.9 Store Indent Requisitions (Classroom & Lab Supplies)
CREATE TABLE IF NOT EXISTS public.store_indent_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  delivery_room text NOT NULL,
  urgency text NOT NULL DEFAULT 'standard' CHECK (urgency IN ('low', 'standard', 'urgent')),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'dispatched', 'fulfilled', 'rejected')),
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.10 Campus Maintenance Helpdesk Tickets
CREATE TABLE IF NOT EXISTS public.campus_maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  ticket_number text NOT NULL UNIQUE,
  reported_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_room text NOT NULL,
  issue_category text NOT NULL CHECK (issue_category IN ('electrical', 'plumbing', 'furniture', 'hvac', 'av_smartboard', 'structural', 'other')),
  description text NOT NULL,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'emergency')),
  sla_deadline_hours integer NOT NULL DEFAULT 48,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_technician text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_maintenance_school_status ON public.campus_maintenance_tickets(school_id, status);

-- 2.11 Student Group Projects & Peer Review Heatmap
CREATE TABLE IF NOT EXISTS public.student_group_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  project_title text NOT NULL,
  team_name text NOT NULL,
  student_ids text[] NOT NULL,
  peer_evaluations jsonb NOT NULL DEFAULT '[]'::jsonb,
  mentor_teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  grade numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.12 Faculty Relief / Substitution Allocation Desk
CREATE TABLE IF NOT EXISTS public.faculty_relief_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  relief_date date NOT NULL DEFAULT current_date,
  period_number integer NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  absent_teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_relief_teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.13 Field Trip Manifests & Parent Consent
CREATE TABLE IF NOT EXISTS public.field_trip_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  trip_name text NOT NULL,
  destination text NOT NULL,
  trip_date date NOT NULL,
  lead_teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  participating_classes text[] DEFAULT ARRAY[]::text[],
  student_roster jsonb NOT NULL DEFAULT '[]'::jsonb,
  first_aid_kit_packed boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('planning', 'scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ==============================================================================
-- PART 3: ADMIN ENTERPRISE OPERATIONS TABLES
-- ==============================================================================

-- 3.1 Admissions Leads CRM Pipeline
CREATE TABLE IF NOT EXISTS public.admissions_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  grade_applying_for text NOT NULL,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text,
  lead_source text DEFAULT 'Website',
  pipeline_stage text NOT NULL DEFAULT 'inquiry' CHECK (pipeline_stage IN ('inquiry', 'campus_tour', 'document_verification', 'fee_payment_pending', 'enrolled', 'dropped')),
  conversion_probability numeric DEFAULT 0.50,
  assigned_counselor uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_school_stage ON public.admissions_leads(school_id, pipeline_stage);

-- 3.2 Bank Statement CSV Reconciliation Records
CREATE TABLE IF NOT EXISTS public.bank_reconciliation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  statement_date date NOT NULL,
  utr_reference text NOT NULL UNIQUE,
  description text NOT NULL,
  credit_amount numeric DEFAULT 0.00,
  debit_amount numeric DEFAULT 0.00,
  reconciliation_status text NOT NULL DEFAULT 'unmatched' CHECK (reconciliation_status IN ('matched_auto', 'matched_manual', 'unmatched', 'flagged_discrepancy')),
  matched_fee_transaction_id uuid REFERENCES public.fee_transactions(id) ON DELETE SET NULL,
  reconciled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reconciled_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_bank_recon_utr ON public.bank_reconciliation_records(utr_reference);

-- 3.3 Campus Store Master Inventory
CREATE TABLE IF NOT EXISTS public.store_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  item_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('uniform', 'textbook', 'notebook', 'stationery', 'lab_kit')),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_threshold integer NOT NULL DEFAULT 15,
  unit_cost numeric NOT NULL CHECK (unit_cost >= 0),
  selling_price numeric NOT NULL CHECK (selling_price >= 0),
  supplier_name text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.4 Store Vendor Purchase Orders (Automated Restocking)
CREATE TABLE IF NOT EXISTS public.store_purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  po_number text NOT NULL UNIQUE,
  vendor_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted_to_vendor', 'partially_received', 'received_in_stock', 'cancelled')),
  ordered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  expected_delivery_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.5 Live Fleet Radar & GPS Telematics
CREATE TABLE IF NOT EXISTS public.fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  bus_number text NOT NULL UNIQUE,
  registration_number text NOT NULL UNIQUE,
  route_name text NOT NULL,
  capacity integer NOT NULL DEFAULT 40,
  driver_name text NOT NULL,
  driver_phone text NOT NULL,
  attendant_name text,
  current_latitude numeric,
  current_longitude numeric,
  current_speed_kmh numeric DEFAULT 0,
  is_engine_active boolean DEFAULT false,
  last_telematics_ping timestamptz
);
CREATE INDEX IF NOT EXISTS idx_fleet_school ON public.fleet_vehicles(school_id);

-- 3.6 RFID Turnstile Security Gate Logs
CREATE TABLE IF NOT EXISTS public.rfid_turnstile_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  rfid_card_id text NOT NULL,
  person_type text NOT NULL CHECK (person_type IN ('student', 'staff', 'visitor')),
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  gate_name text NOT NULL DEFAULT 'Main Security Gate',
  scan_type text NOT NULL CHECK (scan_type IN ('entry', 'exit')),
  scanned_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rfid_logs_scanned ON public.rfid_turnstile_logs(scanned_at);

-- 3.7 Careers ATS Job Openings
CREATE TABLE IF NOT EXISTS public.recruitment_job_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  department text NOT NULL,
  vacancies_count integer NOT NULL DEFAULT 1 CHECK (vacancies_count > 0),
  employment_type text DEFAULT 'Full-Time',
  min_qualification text NOT NULL,
  min_experience_years integer NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.8 Careers ATS Job Applicants
CREATE TABLE IF NOT EXISTS public.recruitment_applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  job_opening_id uuid NOT NULL REFERENCES public.recruitment_job_openings(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  years_of_experience numeric NOT NULL,
  resume_url text,
  pipeline_stage text NOT NULL DEFAULT 'applied' CHECK (pipeline_stage IN ('applied', 'screening', 'demo_lecture', 'interview', 'offer_extended', 'hired', 'rejected')),
  interview_rating numeric,
  notes text,
  applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_applicants_job_stage ON public.recruitment_applicants(job_opening_id, pipeline_stage);

-- 3.9 360° Faculty Appraisal Dossiers
CREATE TABLE IF NOT EXISTS public.faculty_appraisal_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2026-2027',
  biometric_punctuality_score numeric NOT NULL DEFAULT 0.00,
  academic_results_score numeric NOT NULL DEFAULT 0.00,
  ptm_parent_sentiment_score numeric NOT NULL DEFAULT 0.00,
  relief_substitution_score numeric NOT NULL DEFAULT 0.00,
  composite_score numeric GENERATED ALWAYS AS (
    (biometric_punctuality_score * 0.25) + 
    (academic_results_score * 0.35) + 
    (ptm_parent_sentiment_score * 0.20) + 
    (relief_substitution_score * 0.20)
  ) STORED,
  performance_tier text DEFAULT 'Meets Expectations',
  principal_recommendation text,
  increment_percentage numeric DEFAULT 8.0,
  is_finalized boolean NOT NULL DEFAULT false,
  finalized_at timestamptz,
  CONSTRAINT uq_staff_appraisal_year UNIQUE (staff_id, academic_year)
);

-- 3.10 NEP 2020 Outcome-Based Education (OBE) Learning Outcomes
CREATE TABLE IF NOT EXISTS public.obe_learning_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  outcome_code text NOT NULL UNIQUE,
  description text NOT NULL,
  bloom_taxonomy_level text NOT NULL CHECK (bloom_taxonomy_level IN ('Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating')),
  target_attainment_percentage numeric NOT NULL DEFAULT 75.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3.11 NEP 2020 Student Outcome Attainments
CREATE TABLE IF NOT EXISTS public.obe_student_attainments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  outcome_id uuid NOT NULL REFERENCES public.obe_learning_outcomes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  achieved_percentage numeric NOT NULL,
  is_attained boolean GENERATED ALWAYS AS (achieved_percentage >= 70.0) STORED,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_student_outcome_attainment UNIQUE (outcome_id, student_id)
);

-- 3.12 Omnichannel Waterfall Broadcast Studio
CREATE TABLE IF NOT EXISTS public.omnichannel_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  broadcast_title text NOT NULL,
  target_cohort text NOT NULL,
  message_body text NOT NULL,
  channels_sequence text[] DEFAULT ARRAY['push', 'whatsapp', 'sms']::text[],
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'crisis')),
  total_recipients integer NOT NULL DEFAULT 0,
  push_delivered_count integer DEFAULT 0,
  whatsapp_delivered_count integer DEFAULT 0,
  sms_fallback_count integer DEFAULT 0,
  dispatched_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  dispatched_at timestamptz NOT NULL DEFAULT now()
);


-- ==============================================================================
-- PART 4: ADMIN LEVEL 1, 2 & 3 ADVANCED CAPABILITIES TABLES
-- ==============================================================================

-- 4.1 Certificate Templates (Print Room Studio)
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id text PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  variables text[] NOT NULL,
  sample_title text NOT NULL,
  template_body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.2 Generated Institutional Certificates with QR Verification
CREATE TABLE IF NOT EXISTS public.generated_admin_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  template_type text NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  student_name text NOT NULL,
  admission_number text NOT NULL,
  class_grade text NOT NULL,
  populated_content text NOT NULL,
  custom_variables jsonb DEFAULT '{}'::jsonb,
  verification_hash text NOT NULL UNIQUE,
  generated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  issued_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cert_verif_hash ON public.generated_admin_certificates(verification_hash);

-- 4.3 Library Books Inventory
CREATE TABLE IF NOT EXISTS public.library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  isbn text NOT NULL,
  accession_number text NOT NULL UNIQUE,
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  shelf_rack_location text NOT NULL,
  total_copies integer NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
  available_copies integer NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  price numeric NOT NULL DEFAULT 0.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_library_books_isbn ON public.library_books(isbn);

-- 4.4 Library Loans & Overdue Fine Ledger Sync
CREATE TABLE IF NOT EXISTS public.library_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  issued_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL,
  returned_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
  overdue_fine_amount numeric NOT NULL DEFAULT 0.00,
  fine_synced_to_fee_ledger boolean NOT NULL DEFAULT false,
  fee_transaction_id uuid REFERENCES public.fee_transactions(id) ON DELETE SET NULL,
  issued_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_library_loans_student ON public.library_loans(student_id);

-- 4.5 Late-Penalty Rule Configuration
CREATE TABLE IF NOT EXISTS public.fee_late_penalty_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  daily_penalty_amount numeric NOT NULL DEFAULT 50.00 CHECK (daily_penalty_amount >= 0),
  grace_period_days integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.6 Automated Fee Defaulter Recovery Logs
CREATE TABLE IF NOT EXISTS public.fee_defaulter_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  base_overdue_amount numeric NOT NULL,
  overdue_days integer NOT NULL DEFAULT 0,
  calculated_penalty numeric NOT NULL DEFAULT 0.00,
  total_payable numeric NOT NULL,
  dynamic_upi_link text NOT NULL,
  last_reminder_dispatched_at timestamptz,
  reminders_sent_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reminded', 'partially_paid', 'settled')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_defaulters_student ON public.fee_defaulter_logs(student_id);

-- 4.7 Digital Visitor Management System (VMS) Passes
CREATE TABLE IF NOT EXISTS public.visitor_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  badge_number text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL,
  relationship_or_organization text NOT NULL,
  purpose_of_visit text NOT NULL,
  host_staff_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_staff_name text NOT NULL,
  host_department text NOT NULL,
  id_proof_type text NOT NULL CHECK (id_proof_type IN ('Aadhaar', 'Driving License', 'PAN', 'Voter ID', 'Passport', 'Other')),
  id_proof_last4 text NOT NULL,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  thermal_badge_qr text NOT NULL,
  is_on_campus boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visitor_badge ON public.visitor_passes(badge_number);
CREATE INDEX IF NOT EXISTS idx_visitor_campus_status ON public.visitor_passes(is_on_campus);

-- 4.8 AI Timetable Constraints
CREATE TABLE IF NOT EXISTS public.timetable_constraints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  constraint_type text NOT NULL CHECK (constraint_type IN ('teacher_max_daily_periods', 'room_capacity', 'part_time_availability', 'subject_quota')),
  description text NOT NULL,
  target_id text NOT NULL,
  target_name text NOT NULL,
  rule_value jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.9 Master Timetable Period Slots
CREATE TABLE IF NOT EXISTS public.class_timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  period_number integer NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  start_time text NOT NULL,
  end_time text NOT NULL,
  room_number text NOT NULL,
  is_lab_period boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_class_day_period UNIQUE (class_id, day_of_week, period_number)
);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON public.class_timetable_slots(class_id, day_of_week);

-- 4.10 Board Exam LOC (List of Candidates) Verification Roster
CREATE TABLE IF NOT EXISTS public.board_loc_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  roll_number text NOT NULL,
  candidate_name text NOT NULL,
  mother_name text NOT NULL,
  father_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('M', 'F', 'O')),
  category text NOT NULL CHECK (category IN ('GEN', 'OBC', 'SC', 'ST')),
  identification_mark_1 text NOT NULL,
  identification_mark_2 text,
  subject_codes text[] NOT NULL DEFAULT ARRAY['184', '002', '041', '086', '087']::text[],
  aadhaar_number text NOT NULL,
  annual_parent_income numeric NOT NULL,
  cwsn_code text DEFAULT 'NA',
  photo_verified boolean NOT NULL DEFAULT false,
  signature_verified boolean NOT NULL DEFAULT false,
  board_verification_status text NOT NULL DEFAULT 'pending' CHECK (board_verification_status IN ('verified', 'pending', 'error_missing_marks', 'discrepancy_flagged')),
  validation_errors text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_board_loc_school ON public.board_loc_candidates(school_id);

-- 4.11 Staff Salary Structure Master
CREATE TABLE IF NOT EXISTS public.staff_salary_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  basic_salary numeric NOT NULL CHECK (basic_salary >= 0),
  hra numeric NOT NULL DEFAULT 0.00 CHECK (hra >= 0),
  da numeric NOT NULL DEFAULT 0.00 CHECK (da >= 0),
  special_allowance numeric NOT NULL DEFAULT 0.00 CHECK (special_allowance >= 0),
  gross_salary numeric GENERATED ALWAYS AS (basic_salary + hra + da + special_allowance) STORED,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.12 Monthly Payroll Runs
CREATE TABLE IF NOT EXISTS public.monthly_payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  total_working_days integer NOT NULL DEFAULT 24,
  total_disbursed numeric NOT NULL DEFAULT 0.00,
  total_epf_collected numeric NOT NULL DEFAULT 0.00,
  total_pt_collected numeric NOT NULL DEFAULT 0.00,
  total_tds_deducted numeric NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved_locked', 'disbursed')),
  processed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_school_month_payroll UNIQUE (school_id, month_year)
);

-- 4.13 Itemized Staff Monthly Payslips
CREATE TABLE IF NOT EXISTS public.staff_monthly_payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  payroll_run_id uuid NOT NULL REFERENCES public.monthly_payroll_runs(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  total_working_days integer NOT NULL DEFAULT 24,
  biometric_present_days integer NOT NULL DEFAULT 24,
  approved_leave_days integer NOT NULL DEFAULT 0,
  unexcused_absence_days integer NOT NULL DEFAULT 0,
  loss_of_pay_days integer NOT NULL DEFAULT 0,
  loss_of_pay_deduction numeric NOT NULL DEFAULT 0.00,
  basic_earned numeric NOT NULL,
  hra_earned numeric NOT NULL,
  da_earned numeric NOT NULL,
  gross_earned numeric NOT NULL,
  epf_deduction numeric NOT NULL DEFAULT 0.00,
  professional_tax numeric NOT NULL DEFAULT 200.00,
  tds_deduction numeric NOT NULL DEFAULT 0.00,
  total_deductions numeric NOT NULL,
  net_payable_salary numeric NOT NULL,
  disbursement_reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'approved', 'disbursed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payslips_staff ON public.staff_monthly_payslips(staff_id);

-- 4.14 Alumni Network Profiles
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  graduation_batch text NOT NULL,
  admission_number text NOT NULL,
  current_institution_or_employer text NOT NULL,
  designation_or_degree text NOT NULL,
  city_country text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  linkedin_url text,
  is_tier_1 boolean NOT NULL DEFAULT false,
  total_endowment_contributed numeric NOT NULL DEFAULT 0.00,
  is_mentor_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alumni_batch ON public.alumni_profiles(graduation_batch);

-- 4.15 Endowment & Fundraising Campaigns
CREATE TABLE IF NOT EXISTS public.endowment_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  campaign_title text NOT NULL,
  category text NOT NULL CHECK (category IN ('Robotics Lab', 'Underprivileged Scholarships', 'Sports Complex', 'Library Fund', 'General Endowment')),
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  collected_amount numeric NOT NULL DEFAULT 0.00 CHECK (collected_amount >= 0),
  deadline date,
  backers_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.16 Alumni Contributions & Section 80G Tax Exemption Receipts
CREATE TABLE IF NOT EXISTS public.alumni_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  alumni_id uuid REFERENCES public.alumni_profiles(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.endowment_campaigns(id) ON DELETE SET NULL,
  receipt_number text NOT NULL UNIQUE,
  donor_name text NOT NULL,
  pan_number text NOT NULL,
  donation_amount numeric NOT NULL CHECK (donation_amount > 0),
  payment_mode text NOT NULL CHECK (payment_mode IN ('UPI', 'NetBanking', 'CreditCard', 'Cheque', 'Cash')),
  utr_or_ref_number text NOT NULL,
  donation_date date NOT NULL DEFAULT current_date,
  tax_exemption_eligible boolean NOT NULL DEFAULT true,
  verification_qr_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_donations_receipt ON public.alumni_donations(receipt_number);


-- ==============================================================================
-- PART 5: ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all newly created tables
ALTER TABLE public.exam_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_unit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_essay_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_seating_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sen_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_biometric_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_indent_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_group_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_relief_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_trip_manifests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admissions_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_turnstile_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_appraisal_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obe_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obe_student_attainments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omnichannel_broadcasts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_admin_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_late_penalty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_defaulter_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_loc_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_monthly_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endowment_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_donations ENABLE ROW LEVEL SECURITY;

-- Grant Service Role bypass and Authenticated Read permissions
DO $$
DECLARE
  tbl text;
  new_tables text[] := ARRAY[
    'exam_assessments', 'student_exam_marks', 'staff_leaves', 'curriculum_unit_plans',
    'student_essay_submissions', 'classroom_seating_layouts', 'sen_student_profiles',
    'staff_biometric_punches', 'store_indent_requisitions', 'campus_maintenance_tickets',
    'student_group_projects', 'faculty_relief_allocations', 'field_trip_manifests',
    'admissions_leads', 'bank_reconciliation_records', 'store_inventory', 'store_purchase_orders',
    'fleet_vehicles', 'rfid_turnstile_logs', 'recruitment_job_openings', 'recruitment_applicants',
    'faculty_appraisal_dossiers', 'obe_learning_outcomes', 'obe_student_attainments',
    'omnichannel_broadcasts', 'certificate_templates', 'generated_admin_certificates',
    'library_books', 'library_loans', 'fee_late_penalty_rules', 'fee_defaulter_logs',
    'visitor_passes', 'timetable_constraints', 'class_timetable_slots', 'board_loc_candidates',
    'staff_salary_structures', 'monthly_payroll_runs', 'staff_monthly_payslips',
    'alumni_profiles', 'endowment_campaigns', 'alumni_donations'
  ];
BEGIN
  FOREACH tbl IN ARRAY new_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'allow_all_service_role_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', 'allow_all_service_role_' || tbl, tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'allow_auth_read_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', 'allow_auth_read_' || tbl, tbl);
  END LOOP;
END $$;
