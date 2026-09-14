-- ============================================================
-- Finkfold ERP – Migration 002: Real-World Operations
-- Run in Supabase SQL Editor (safe to re-run – all additive)
-- ============================================================

-- ── 1. Extend students table ──────────────────────────────────
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS second_parent_phone text,
  ADD COLUMN IF NOT EXISTS parent_whatsapp_name text,
  ADD COLUMN IF NOT EXISTS student_tag text,
  ADD COLUMN IF NOT EXISTS left_on date,
  ADD COLUMN IF NOT EXISTS left_reason text CHECK (left_reason IN
    ('tc_issued','transferred','family_relocation','dropout','passed_out','other')),
  ADD COLUMN IF NOT EXISTS promoted_from_class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;

-- ── 2. Extend profiles (teachers) ────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS relieved_on date,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS employee_code text;

-- ── 3. Upgrade teacher_classes junction table ─────────────────
ALTER TABLE public.teacher_classes
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS is_class_teacher boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS academic_year text NOT NULL DEFAULT '2026-2027',
  ADD COLUMN IF NOT EXISTS assigned_on date NOT NULL DEFAULT current_date,
  ADD COLUMN IF NOT EXISTS relieved_on date;

-- ── 4. Student promotion audit log ───────────────────────────
CREATE TABLE IF NOT EXISTS public.student_promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  from_class_id uuid NOT NULL REFERENCES public.classes(id),
  to_class_id uuid NOT NULL REFERENCES public.classes(id),
  promoted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  promoted_at timestamptz NOT NULL DEFAULT now(),
  academic_year_from text NOT NULL,
  academic_year_to text NOT NULL,
  notes text
);

-- ── 5. Pending admissions (digital form) ─────────────────────
CREATE TABLE IF NOT EXISTS public.pending_admissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male','female','other')),
  applying_for_class text NOT NULL,
  applying_for_section text,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  second_parent_phone text,
  address text,
  previous_school text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- ── 6. RLS: Enable on new tables ─────────────────────────────
ALTER TABLE public.student_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_admissions ENABLE ROW LEVEL SECURITY;

-- ── 7. Service-role bypass on ALL tables ─────────────────────
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'schools','classes','students','profiles',
    'attendance_sessions','attendance_records',
    'whatsapp_notifications','parent_reply_log','teacher_classes',
    'student_promotions','pending_admissions'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "service_role_all" ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "service_role_all" ON public.%I FOR ALL USING (auth.role() = ''service_role'')',
      tbl
    );
  END LOOP;
  RAISE NOTICE '✅ Migration 002 complete – service-role bypass applied to all tables.';
END;
$$;

-- ── 8. RLS read policies for new tables ──────────────────────
DROP POLICY IF EXISTS "School members can see promotions" ON public.student_promotions;
CREATE POLICY "School members can see promotions"
ON public.student_promotions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() AND p.school_id = student_promotions.school_id
));

DROP POLICY IF EXISTS "School admins can see pending admissions" ON public.pending_admissions;
CREATE POLICY "School admins can see pending admissions"
ON public.pending_admissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.school_id = pending_admissions.school_id
    AND p.role IN ('school_admin', 'super_admin')
));

DROP POLICY IF EXISTS "Anyone can submit admission" ON public.pending_admissions;
CREATE POLICY "Anyone can submit admission"
ON public.pending_admissions FOR INSERT
WITH CHECK (true);

-- ── 9. Verification ──────────────────────────────────────────
SELECT
  'Migration 002 ✅'                                          AS status,
  (SELECT count(*) FROM public.student_promotions)            AS promotions_table,
  (SELECT count(*) FROM public.pending_admissions)            AS admissions_table,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name='students' AND column_name='left_on')     AS students_left_on_col,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name='profiles' AND column_name='is_active')   AS profiles_is_active_col;
