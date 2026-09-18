-- ==============================================================================
-- FINKFOLD EdOS ARCHITECTURE — STAGE 1: CORE FOUNDATION MIGRATION
-- Migration: 005_edos_core_foundation.sql
-- Description: Multi-branch hierarchy (Organizations -> Schools), Unified Profiles,
--              Academic Years, Subjects, Student Enrollments, Fee Structures,
--              Maker-Checker Cash Tills, Fee Transactions, and Strict Multi-Tier RLS.
-- ==============================================================================

-- ── 1. Organizations (Trust Level / Multi-Campus HQ) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#0c2d5a',
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default Trust for existing installation (Safe / Idempotent)
INSERT INTO public.organizations (id, name, code)
VALUES ('a0000000-0000-4000-a000-000000000001', 'Priyanka Educational Trust', 'PRIYANKA-TRUST')
ON CONFLICT (code) DO NOTHING;


-- ── 2. Extend Schools (Branch Level Hierarchy) ───────────────────────────────
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS branch_code text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Link existing schools to default Trust
UPDATE public.schools
SET organization_id = (SELECT id FROM public.organizations WHERE code = 'PRIYANKA-TRUST' LIMIT 1)
WHERE organization_id IS NULL;


-- ── 3. Extend Profiles (Unified Identity & Multi-Role Support) ───────────────
-- Allow Super Admins (Trust Chairman) to exist without a specific school_id
ALTER TABLE public.profiles
  ALTER COLUMN school_id DROP NOT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['teacher'::text],
  ADD COLUMN IF NOT EXISTS primary_role text DEFAULT 'teacher',
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Backfill organization_id for existing profiles
UPDATE public.profiles p
SET organization_id = s.organization_id
FROM public.schools s
WHERE p.school_id = s.id AND p.organization_id IS NULL;


-- ── 4. Academic Years ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g. '2026-2027'
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_school_academic_year UNIQUE (school_id, name)
);

-- Seed default academic year for existing schools
INSERT INTO public.academic_years (school_id, name, start_date, end_date, is_current)
SELECT id, '2026-2027', '2026-06-01', '2027-04-30', true
FROM public.schools
ON CONFLICT (school_id, name) DO NOTHING;


-- ── 5. Extend Classes with Academic Year Link ─────────────────────────────────
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS room_number text,
  ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 40;

-- Link existing classes to matching academic year
UPDATE public.classes c
SET academic_year_id = a.id
FROM public.academic_years a
WHERE c.school_id = a.school_id AND c.academic_year = a.name AND c.academic_year_id IS NULL;


-- ── 6. Subjects Master ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  type text NOT NULL DEFAULT 'theory' CHECK (type IN ('theory', 'practical', 'activity', 'language')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_school_subject_name UNIQUE (school_id, name)
);


-- ── 7. Student Enrollments (Multi-Year Lifecycle) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  academic_year text NOT NULL DEFAULT '2026-2027',
  roll_no integer,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'promoted', 'detained', 'transferred', 'withdrawn')),
  enrolled_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_year_enrollment UNIQUE (student_id, academic_year)
);

-- Backfill active students into student_enrollments
INSERT INTO public.student_enrollments (school_id, student_id, class_id, roll_no, academic_year, status)
SELECT school_id, id, class_id, roll_no, '2026-2027', 'active'
FROM public.students
ON CONFLICT (student_id, academic_year) DO NOTHING;


-- ── 8. Fee Structures Master ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE, -- NULL indicates school-wide fee head
  name text NOT NULL, -- e.g. 'Term 1 Tuition Fee', 'Smart Digital Diary Fee'
  category text NOT NULL DEFAULT 'tuition' CHECK (category IN ('tuition', 'admission', 'exam', 'transport', 'books_uniform', 'digital_portal', 'miscellaneous')),
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  due_date date,
  is_mandatory boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 9. Cash Drawers (Maker-Checker EOD Till Reconciliation) ───────────────────
CREATE TABLE IF NOT EXISTS public.cash_drawers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  drawer_date date NOT NULL DEFAULT current_date,
  cashier_id uuid NOT NULL REFERENCES public.profiles(id),
  opening_cash numeric(10, 2) NOT NULL DEFAULT 0.00,
  system_cash_collected numeric(10, 2) NOT NULL DEFAULT 0.00,
  declared_cash numeric(10, 2), -- Entered by cashier at 4:00 PM blind-close
  discrepancy numeric(10, 2) GENERATED ALWAYS AS (
    CASE WHEN declared_cash IS NULL THEN NULL ELSE (declared_cash - (opening_cash + system_cash_collected)) END
  ) STORED,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'submitted_for_verification', 'verified', 'discrepancy_flagged')),
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_school_cashier_date UNIQUE (school_id, cashier_id, drawer_date)
);


-- ── 10. Fee Transactions (Counter POS & Dynamic UPI Ledger) ───────────────────
CREATE TABLE IF NOT EXISTS public.fee_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  cash_drawer_id uuid REFERENCES public.cash_drawers(id) ON DELETE SET NULL,
  receipt_no text NOT NULL UNIQUE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'upi_dynamic', 'upi_manual', 'cheque', 'bank_transfer', 'gateway')),
  payment_status text NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'bounced')),
  transaction_ref text, -- Bank UTR, Cheque No, Dynamic UPI Ref ID
  collected_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 11. Performance Indices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schools_org ON public.schools(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON public.classes(school_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.student_enrollments(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_fee_struct_school ON public.fee_structures(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_cash_drawers_school_date ON public.cash_drawers(school_id, drawer_date);
CREATE INDEX IF NOT EXISTS idx_fee_tx_school_student ON public.fee_transactions(school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_fee_tx_receipt ON public.fee_transactions(receipt_no);


-- ── 12. Row Level Security (RLS) Helper Functions ────────────────────────────
-- Helper: Get Organization ID for currently authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Helper: Get School ID for currently authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Helper: Check if current user has super_admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'super_admin' OR 'super_admin' = ANY(roles))
  );
$$;

-- Helper: Check if current user has branch_admin or school_admin role
CREATE OR REPLACE FUNCTION public.is_branch_admin(target_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND (school_id = target_school_id OR public.is_super_admin())
      AND (role IN ('school_admin', 'super_admin') OR 'school_admin' = ANY(roles) OR 'super_admin' = ANY(roles))
  );
$$;


-- ── 13. Enable RLS on New Tables ─────────────────────────────────────────────
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_transactions ENABLE ROW LEVEL SECURITY;


-- ── 14. RLS Policies: Two-Tier Multi-Campus Hierarchy ─────────────────────────

-- Organizations: Super Admins can manage; Branch users can view their own Org
CREATE POLICY "Super Admins can manage organizations"
  ON public.organizations
  FOR ALL
  TO authenticated
  USING (public.is_super_admin() OR id = public.get_auth_org_id());

-- Academic Years: Scoped to School Branch
CREATE POLICY "Users can view academic years of their school"
  ON public.academic_years
  FOR SELECT
  TO authenticated
  USING (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "Branch Admins can manage academic years"
  ON public.academic_years
  FOR ALL
  TO authenticated
  USING (public.is_branch_admin(school_id));

-- Subjects: Scoped to School Branch
CREATE POLICY "Users can view subjects of their school"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "Branch Admins can manage subjects"
  ON public.subjects
  FOR ALL
  TO authenticated
  USING (public.is_branch_admin(school_id));

-- Student Enrollments: Branch Scoped
CREATE POLICY "Staff can view enrollments in their school"
  ON public.student_enrollments
  FOR SELECT
  TO authenticated
  USING (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "Branch Admins can manage enrollments"
  ON public.student_enrollments
  FOR ALL
  TO authenticated
  USING (public.is_branch_admin(school_id));

-- Fee Structures: Scoped to Branch
CREATE POLICY "Users can view fee structures in their school"
  ON public.fee_structures
  FOR SELECT
  TO authenticated
  USING (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "Branch Admins can manage fee structures"
  ON public.fee_structures
  FOR ALL
  TO authenticated
  USING (public.is_branch_admin(school_id));

-- Cash Drawers: Cashier owns their drawer; Branch Admins oversee
CREATE POLICY "Cashiers and Admins can view cash drawers"
  ON public.cash_drawers
  FOR SELECT
  TO authenticated
  USING (
    cashier_id = auth.uid() 
    OR public.is_branch_admin(school_id)
  );

CREATE POLICY "Cashiers can update their open cash drawer"
  ON public.cash_drawers
  FOR ALL
  TO authenticated
  USING (cashier_id = auth.uid() OR public.is_branch_admin(school_id));

-- Fee Transactions: Branch Admins & Cashiers view/insert; Super Admins audit
CREATE POLICY "Staff can view fee transactions of their school"
  ON public.fee_transactions
  FOR SELECT
  TO authenticated
  USING (
    school_id = public.get_auth_school_id() 
    OR public.is_super_admin()
  );

CREATE POLICY "Cashiers and Admins can record fee transactions"
  ON public.fee_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = public.get_auth_school_id() 
    OR public.is_super_admin()
  );
