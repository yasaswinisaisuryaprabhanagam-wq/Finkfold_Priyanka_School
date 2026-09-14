-- ==============================================================================
-- FINKFOLD SCHOOL PORTAL – PRIYANKA EM SCHOOL
-- COMPLETE MASTER DATABASE SCRIPT (SCHEMA + CONSTRAINTS + RLS + SEED DATA)
-- 
-- Instructions:
-- 1. Copy and paste this ENTIRE script into your Supabase SQL Editor.
-- 2. Click "Run" (it drops old tables cleanly and rebuilds everything with complete data).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CLEAN WIPE EXISTING TABLES & TYPES
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.parent_reply_log CASCADE;
DROP TABLE IF EXISTS public.whatsapp_notifications CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teacher_classes CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- ------------------------------------------------------------------------------
-- 2. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student');

-- ------------------------------------------------------------------------------
-- 3. TABLES DEFINITIONS
-- ------------------------------------------------------------------------------

-- Table: schools
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  primary_color text NOT NULL DEFAULT '#123B6D',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id)
);

-- Table: profiles (links to Supabase auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  school_id uuid NOT NULL,
  full_name text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'teacher'::public.app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

-- Table: classes
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  section text NOT NULL,
  academic_year text NOT NULL DEFAULT '2026-2027',
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT classes_school_name_section_unique UNIQUE (school_id, name, section)
);

-- Table: teacher_classes (faculty assignment junction)
CREATE TABLE public.teacher_classes (
  teacher_id uuid NOT NULL,
  class_id uuid NOT NULL,
  CONSTRAINT teacher_classes_pkey PRIMARY KEY (teacher_id, class_id),
  CONSTRAINT teacher_classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT teacher_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE
);

-- Table: students
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  admission_no text NOT NULL UNIQUE,
  full_name text NOT NULL,
  roll_no integer NOT NULL,
  parent_name text,
  parent_phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  consent_whatsapp boolean NOT NULL DEFAULT true,
  parent_phone_verified boolean NOT NULL DEFAULT true,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE
);

-- Table: attendance_sessions (daily roll-call session per class)
CREATE TABLE public.attendance_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  attendance_date date NOT NULL,
  marked_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_sessions_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT attendance_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT attendance_sessions_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT attendance_sessions_unique_class_date UNIQUE (class_id, attendance_date)
);

-- Table: attendance_records (individual student record per session)
CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_records_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT attendance_records_unique_session_student UNIQUE (session_id, student_id)
);

-- Table: whatsapp_notifications (dispatched by n8n & Meta Cloud API)
CREATE TABLE public.whatsapp_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('absent', 'correction_to_present')),
  parent_phone text NOT NULL,
  template_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'read', 'failed',
    'skipped_duplicate', 'skipped_no_consent', 'skipped_invalid_phone', 'skipped_no_prior_alert'
  )),
  meta_message_id text,
  error_detail text,
  attempt_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  attendance_date date NOT NULL,
  CONSTRAINT whatsapp_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT whatsapp_notifications_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT whatsapp_notifications_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  CONSTRAINT whatsapp_notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT whatsapp_notifications_student_date_event_unique UNIQUE (student_id, attendance_date, event_type)
);

-- Table: parent_reply_log (incoming parent WhatsApp replies)
CREATE TABLE public.parent_reply_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_phone text NOT NULL,
  message_text text,
  handled boolean NOT NULL DEFAULT false,
  handled_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parent_reply_log_pkey PRIMARY KEY (id),
  CONSTRAINT parent_reply_log_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reply_log ENABLE ROW LEVEL SECURITY;

-- Schools: anyone can view school details
CREATE POLICY "Allow public read on schools" ON public.schools FOR SELECT USING (true);

-- Profiles: users can see all profiles in their school
CREATE POLICY "Allow authenticated read on profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow self update on profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Classes: authenticated members can view classes
CREATE POLICY "Allow authenticated read on classes" ON public.classes FOR SELECT TO authenticated USING (true);

-- Teacher Classes: authenticated members can view assignments
CREATE POLICY "Allow authenticated read on teacher_classes" ON public.teacher_classes FOR SELECT TO authenticated USING (true);

-- Students: authenticated members can view students
CREATE POLICY "Allow authenticated read on students" ON public.students FOR SELECT TO authenticated USING (true);

-- Attendance Sessions: read & write for authenticated faculty
CREATE POLICY "Allow authenticated read on attendance_sessions" ON public.attendance_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on attendance_sessions" ON public.attendance_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on attendance_sessions" ON public.attendance_sessions FOR UPDATE TO authenticated USING (true);

-- Attendance Records: read & write for authenticated faculty
CREATE POLICY "Allow authenticated read on attendance_records" ON public.attendance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on attendance_records" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on attendance_records" ON public.attendance_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on attendance_records" ON public.attendance_records FOR DELETE TO authenticated USING (true);

-- WhatsApp Notifications: read & write
CREATE POLICY "Allow authenticated read on whatsapp_notifications" ON public.whatsapp_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on whatsapp_notifications" ON public.whatsapp_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on whatsapp_notifications" ON public.whatsapp_notifications FOR UPDATE TO authenticated USING (true);

-- Parent Replies: read & write
CREATE POLICY "Allow authenticated read on parent_reply_log" ON public.parent_reply_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update on parent_reply_log" ON public.parent_reply_log FOR UPDATE TO authenticated USING (true);

-- ------------------------------------------------------------------------------
-- 4.1 GRANT PERMISSIONS TO SUPABASE ROLES (Resolves 'permission denied for table')
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. AUTOMATIC PROFILE TRIGGER (Auto-links any new auth user to School & Class)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
  v_school_id uuid := 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid;
  v_class_id uuid;
  v_role public.app_role;
  v_name text;
BEGIN
  -- Determine role
  IF new.email LIKE '%admin%' THEN
    v_role := 'school_admin'::public.app_role;
  ELSE
    v_role := 'teacher'::public.app_role;
  END IF;

  -- Determine display name
  v_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    initcap(split_part(new.email, '@', 1))
  );

  -- Insert profile
  INSERT INTO public.profiles (id, school_id, full_name, role)
  VALUES (new.id, v_school_id, v_name, v_role)
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      school_id = EXCLUDED.school_id;

  -- Auto-link to default Class 10-A
  SELECT id INTO v_class_id FROM public.classes WHERE school_id = v_school_id AND name = '10' AND section = 'A' LIMIT 1;
  IF v_class_id IS NOT NULL THEN
    INSERT INTO public.teacher_classes (teacher_id, class_id)
    VALUES (new.id, v_class_id)
    ON CONFLICT (teacher_id, class_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 6. SEED DATA (FULL POPULATION FOR ALL TABLES)
-- ------------------------------------------------------------------------------

-- (A) Insert Priyanka EM School
INSERT INTO public.schools (id, name, slug, primary_color, logo_url)
VALUES (
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  'Priyanka EM School',
  'priyanka-em-school',
  '#123B6D',
  '/logo.png'
);

-- (B) Insert Class 10-A
INSERT INTO public.classes (id, school_id, name, section, academic_year)
VALUES (
  'c10a2026-1701-4cc0-9c59-8812324eb396'::uuid,
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  '10',
  'A',
  '2026-2027'
);

-- (C) Link existing users in auth.users (kiran@priyanka.em, teacher@priyanka.em, etc.)
DO $$
DECLARE
  v_school_id uuid := 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid;
  v_class_id uuid := 'c10a2026-1701-4cc0-9c59-8812324eb396'::uuid;
  u RECORD;
BEGIN
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    INSERT INTO public.profiles (id, school_id, full_name, role)
    VALUES (
      u.id,
      v_school_id,
      CASE 
        WHEN u.email = 'kiran@priyanka.em' THEN 'Kiran (Faculty)'
        WHEN u.email LIKE '%admin%' THEN 'School Administrator'
        ELSE 'Faculty Member'
      END,
      CASE 
        WHEN u.email LIKE '%admin%' THEN 'school_admin'::public.app_role
        ELSE 'teacher'::public.app_role
      END
    )
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        school_id = EXCLUDED.school_id;

    INSERT INTO public.teacher_classes (teacher_id, class_id)
    VALUES (u.id, v_class_id)
    ON CONFLICT (teacher_id, class_id) DO NOTHING;
  END LOOP;
END $$;

-- (D) Insert Students for Class 10-A
INSERT INTO public.students (
  id, school_id, class_id, admission_no, full_name, roll_no, parent_name, parent_phone, is_active, consent_whatsapp, parent_phone_verified
) VALUES
(
  'e1111111-1701-4cc0-9c59-8812324eb396'::uuid,
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  'c10a2026-1701-4cc0-9c59-8812324eb396'::uuid,
  'PRIY-2026-001',
  'Yasaswini',
  1,
  'Parent of Yasaswini',
  '+918247220252',
  true,
  true,
  true
),
(
  'e2222222-1701-4cc0-9c59-8812324eb396'::uuid,
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  'c10a2026-1701-4cc0-9c59-8812324eb396'::uuid,
  'PRIY-2026-002',
  'Kiran',
  2,
  'Parent of Kiran',
  '+917981067780',
  true,
  true,
  true
),
(
  'e3333333-1701-4cc0-9c59-8812324eb396'::uuid,
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  'c10a2026-1701-4cc0-9c59-8812324eb396'::uuid,
  'PRIY-2026-003',
  'Kethan',
  3,
  'Parent of Kethan',
  '+919440266743',
  true,
  true,
  true
);

-- (E) Insert 10 Historical Daily Attendance Sessions & Records
DO $$
DECLARE
  v_school_id uuid := 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid;
  v_class_id uuid := 'c10a2026-1701-4cc0-9c59-8812324eb396'::uuid;
  v_marked_by uuid;
  v_session_id uuid;
  v_s1 uuid := 'e1111111-1701-4cc0-9c59-8812324eb396'::uuid; -- Yasaswini
  v_s2 uuid := 'e2222222-1701-4cc0-9c59-8812324eb396'::uuid; -- Kiran
  v_s3 uuid := 'e3333333-1701-4cc0-9c59-8812324eb396'::uuid; -- Kethan
  v_dates date[] := ARRAY[
    '2026-09-01'::date,
    '2026-09-02'::date,
    '2026-09-03'::date,
    '2026-09-04'::date,
    '2026-09-05'::date,
    '2026-09-07'::date,
    '2026-09-08'::date,
    '2026-09-09'::date,
    '2026-09-10'::date,
    '2026-09-11'::date
  ];
  i integer;
BEGIN
  -- Select a faculty profile to mark the sessions
  SELECT id INTO v_marked_by FROM public.profiles WHERE school_id = v_school_id LIMIT 1;
  IF v_marked_by IS NULL THEN
    -- If no profile exists yet, create dummy profile id
    v_marked_by := gen_random_uuid();
  END IF;

  FOR i IN 1..10 LOOP
    -- Create Attendance Session
    INSERT INTO public.attendance_sessions (school_id, class_id, attendance_date, marked_by)
    VALUES (v_school_id, v_class_id, v_dates[i], v_marked_by)
    RETURNING id INTO v_session_id;

    -- Yasaswini: Absent on day 4, Present all other 9 days (90% attendance)
    INSERT INTO public.attendance_records (session_id, student_id, status, note)
    VALUES (
      v_session_id,
      v_s1,
      CASE WHEN i = 4 THEN 'absent' ELSE 'present' END,
      CASE WHEN i = 4 THEN 'Family wedding event' ELSE 'Regular attendance' END
    );

    -- Kiran: Absent on day 7, Present all other 9 days (90% attendance)
    INSERT INTO public.attendance_records (session_id, student_id, status, note)
    VALUES (
      v_session_id,
      v_s2,
      CASE WHEN i = 7 THEN 'absent' ELSE 'present' END,
      CASE WHEN i = 7 THEN 'Mild seasonal fever' ELSE 'Regular attendance' END
    );

    -- Kethan: Absent on day 3 and day 9, Present other 8 days (80% attendance)
    INSERT INTO public.attendance_records (session_id, student_id, status, note)
    VALUES (
      v_session_id,
      v_s3,
      CASE WHEN i IN (3, 9) THEN 'absent' ELSE 'present' END,
      CASE WHEN i IN (3, 9) THEN 'WhatsApp notification dispatched' ELSE 'Regular attendance' END
    );

    -- Absence Notification Log for Yasaswini on Day 4
    IF i = 4 THEN
      INSERT INTO public.whatsapp_notifications (
        school_id, session_id, student_id, attendance_date, event_type,
        parent_phone, template_name, status, meta_message_id
      ) VALUES (
        v_school_id, v_session_id, v_s1, v_dates[i], 'absent',
        '+918247220252', 'school_absence_alert_v1', 'delivered', 'wamid.HBgMOTE4MjQ3MjIwMjUyFQIAEhggRDQwRDgyN0U3ODU5NEFBQzhCNjAxRTJFM0VFMDE1MzkA'
      );
    END IF;

    -- Absence Notification Log for Kiran on Day 7
    IF i = 7 THEN
      INSERT INTO public.whatsapp_notifications (
        school_id, session_id, student_id, attendance_date, event_type,
        parent_phone, template_name, status, meta_message_id
      ) VALUES (
        v_school_id, v_session_id, v_s2, v_dates[i], 'absent',
        '+917981067780', 'school_absence_alert_v1', 'delivered', 'wamid.HBgMOTE3OTgxMDY3NzgAFQIAEhggRkJDMDgwOUQ2QzZGNEM2Mzk2ODFDQTc5RDBDNzg1RkMA'
      );
    END IF;

    -- Absence Notification Log for Kethan on Day 3 and Day 9
    IF i IN (3, 9) THEN
      INSERT INTO public.whatsapp_notifications (
        school_id, session_id, student_id, attendance_date, event_type,
        parent_phone, template_name, status, meta_message_id
      ) VALUES (
        v_school_id, v_session_id, v_s3, v_dates[i], 'absent',
        '+919440266743', 'school_absence_alert_v1', 'delivered', 'wamid.HBgMOTE5NDQwMjY2NzQzFQIAEhggRTE0MDcyNEM0QjYwNDY2M0E2N0U3ODQ5MEE5OTI0MTIA'
      );
    END IF;

  END LOOP;
END $$;

-- (F) Seed Inbound Parent WhatsApp Replies
INSERT INTO public.parent_reply_log (from_phone, message_text, handled)
VALUES
(
  '+917981067780',
  'Good morning teacher, Kiran had a mild fever yesterday. He is feeling better today and will resume classes tomorrow. Thank you.',
  true
),
(
  '+918247220252',
  'Yes maam, Yasaswini was attending her cousins wedding out of town. She will submit her pending homework assignments.',
  false
);

-- ==============================================================================
-- VERIFICATION QUERY
-- ==============================================================================
SELECT 'Schools' as table_name, count(*) as count FROM public.schools
UNION ALL
SELECT 'Classes', count(*) FROM public.classes
UNION ALL
SELECT 'Students', count(*) FROM public.students
UNION ALL
SELECT 'Attendance Sessions', count(*) FROM public.attendance_sessions
UNION ALL
SELECT 'Attendance Records', count(*) FROM public.attendance_records
UNION ALL
SELECT 'WhatsApp Alerts', count(*) FROM public.whatsapp_notifications
UNION ALL
SELECT 'Parent Replies', count(*) FROM public.parent_reply_log;
