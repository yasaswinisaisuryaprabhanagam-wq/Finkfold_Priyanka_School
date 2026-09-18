-- ==============================================================================
-- FINKFOLD EdOS — MIGRATION 007: ENTERPRISE STUDENT & PARENT EXPANSION
-- Path: supabase/migrations/007_enterprise_student_portal_expansion.sql
-- Description:
--   1. lost_and_found_items (Lost property catalog, claim requests & locker bins)
--   2. anonymous_grievance_reports (Safe space drop-box, cryptographic tokens, counselor logs)
--   3. student_conduct_ledger (Merits, stars, ribbons & disciplinary warnings)
--   4. ptm_booking_slots & regulated_parent_messages (Teacher chat & PTM scheduling)
--   5. student_digital_certificates & external_achievements (E-Certs & School Dossier)
--   6. student_id_photo_submissions (Self-service photo upload with compliance verification)
--   7. student_leaves_and_od (Digital leave requests & official On-Duty tracking)
--   8. student_bank_refund_profiles (Caution deposit & scholarship refund details)
-- ==============================================================================

-- ── 1. Digital Lost & Found Board ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lost_and_found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('clothing', 'bottle', 'watch', 'books_stationery', 'accessories', 'other')),
  description text NOT NULL,
  found_location text NOT NULL,
  found_date date NOT NULL DEFAULT current_date,
  locker_bin text NOT NULL,
  photo_emoji text NOT NULL DEFAULT '📦',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed_pending', 'returned')),
  claimed_by_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  claimed_by_student_name text,
  claimed_homeroom text,
  claim_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lost_found_school ON public.lost_and_found_items(school_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON public.lost_and_found_items(status);


-- ── 2. Anonymous Safe Space & Grievance Cell ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.anonymous_grievance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  tracking_token text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('bullying', 'cyber_bullying', 'harassment', 'vandalism', 'counselor_private_chat', 'safety_hazard')),
  description text NOT NULL,
  location_details text,
  urgency text NOT NULL DEFAULT 'standard' CHECK (urgency IN ('standard', 'high', 'critical')),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_investigation', 'counselor_response_ready', 'resolved')),
  counselor_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grievance_token ON public.anonymous_grievance_reports(tracking_token);


-- ── 3. Live Conduct & Merit Ledger ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_conduct_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT current_date,
  entry_type text NOT NULL CHECK (entry_type IN ('merit', 'demerit')),
  title text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  issued_by text NOT NULL,
  description text NOT NULL,
  badge_icon text NOT NULL DEFAULT '⭐',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conduct_student ON public.student_conduct_ledger(student_id);


-- ── 4. Regulated Teacher Messaging & PTM Scheduler ───────────────────────────
CREATE TABLE IF NOT EXISTS public.regulated_teacher_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id text NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('parent', 'teacher')),
  message_text text NOT NULL,
  status text NOT NULL DEFAULT 'delivered' CHECK (status IN ('delivered', 'queued_for_office_hours')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ptm_booking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  teacher_id text NOT NULL,
  teacher_name text NOT NULL,
  subject text NOT NULL,
  slot_date text NOT NULL,
  time_slot text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked')),
  meeting_type text NOT NULL DEFAULT 'In-Person Classroom',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ptm_student ON public.ptm_booking_slots(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_student ON public.regulated_teacher_messages(student_id);


-- ── 5. Verifiable E-Certificates & External Achievements ──────────────────────
CREATE TABLE IF NOT EXISTS public.student_digital_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  certificate_number text NOT NULL UNIQUE,
  title text NOT NULL,
  event_name text NOT NULL,
  award_rank text NOT NULL,
  category text NOT NULL CHECK (category IN ('academic', 'sports', 'stem', 'cultural')),
  date_issued date NOT NULL DEFAULT current_date,
  recipient_name text NOT NULL,
  class_grade text NOT NULL,
  qr_verification_hash text NOT NULL UNIQUE,
  signatory text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.external_achievements_dropbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  organizing_body text NOT NULL,
  competition_level text NOT NULL CHECK (competition_level IN ('District', 'State', 'National', 'International')),
  event_date date NOT NULL,
  award_secured text NOT NULL,
  proof_document_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending_principal_approval' CHECK (status IN ('pending_principal_approval', 'verified_and_added_to_dossier', 'needs_clarification')),
  principal_remarks text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_id_photo_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  submitted_date date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'approved_batch_ready' CHECK (status IN ('approved_batch_ready', 'pending_review', 'resubmission_requested')),
  compliance_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cert_student ON public.student_digital_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_ext_ach_student ON public.external_achievements_dropbox(student_id);


-- ── 6. Digital Leave & On-Duty (OD/ML) Management ────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_leaves_and_od (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  leave_type text NOT NULL CHECK (leave_type IN ('sick_leave', 'casual_leave', 'medical_leave', 'on_duty')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL DEFAULT 1,
  reason text NOT NULL,
  medical_doc_required boolean NOT NULL DEFAULT false,
  medical_doc_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  on_duty_details jsonb,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaves_student ON public.student_leaves_and_od(student_id);


-- ── 7. Bank Details for Caution Deposit & Scholarship Refunds ─────────────────
CREATE TABLE IF NOT EXISTS public.student_bank_refund_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  bank_name text NOT NULL,
  account_number_masked text NOT NULL,
  ifsc_code text NOT NULL,
  branch_name text NOT NULL,
  verification_status text NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_verification')),
  caution_deposit_eligible_inr numeric(10, 2) NOT NULL DEFAULT 5000.00,
  scholarship_disbursed_inr numeric(10, 2) NOT NULL DEFAULT 0.00,
  pending_refund_inr numeric(10, 2) NOT NULL DEFAULT 0.00,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_bank UNIQUE (school_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_bank_student ON public.student_bank_refund_profiles(student_id);


-- ── 8. Enable RLS on All Tables & Add Permissive Policies ──────────────────────
ALTER TABLE public.lost_and_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_grievance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_conduct_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulated_teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptm_booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_achievements_dropbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_id_photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_leaves_and_od ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bank_refund_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Allow school users lost_found access" ON public.lost_and_found_items FOR ALL USING (true);
  CREATE POLICY "Allow school users grievance access" ON public.anonymous_grievance_reports FOR ALL USING (true);
  CREATE POLICY "Allow school users conduct access" ON public.student_conduct_ledger FOR ALL USING (true);
  CREATE POLICY "Allow school users messages access" ON public.regulated_teacher_messages FOR ALL USING (true);
  CREATE POLICY "Allow school users ptm access" ON public.ptm_booking_slots FOR ALL USING (true);
  CREATE POLICY "Allow school users certs access" ON public.student_digital_certificates FOR ALL USING (true);
  CREATE POLICY "Allow school users ext_ach access" ON public.external_achievements_dropbox FOR ALL USING (true);
  CREATE POLICY "Allow school users id_photo access" ON public.student_id_photo_submissions FOR ALL USING (true);
  CREATE POLICY "Allow school users leaves access" ON public.student_leaves_and_od FOR ALL USING (true);
  CREATE POLICY "Allow school users bank access" ON public.student_bank_refund_profiles FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
