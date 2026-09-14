-- ==============================================================================
-- Finkfold School Portal – Priyanka EM School (Phase 1)
-- Supabase Schema & Row Level Security (RLS)
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'parent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  primary_color text NOT NULL DEFAULT '#123B6D',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id)
);

-- 3. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  school_id uuid NOT NULL,
  full_name text NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

-- 4. Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  section text NOT NULL,
  academic_year text NOT NULL DEFAULT '2026-2027',
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

-- 5. Teacher–Class assignments
CREATE TABLE IF NOT EXISTS public.teacher_classes (
  teacher_id uuid NOT NULL,
  class_id uuid NOT NULL,
  CONSTRAINT teacher_classes_pkey PRIMARY KEY (teacher_id, class_id),
  CONSTRAINT teacher_classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT teacher_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE
);

-- 6. Students
CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  class_id uuid NOT NULL,
  admission_no text NOT NULL,
  full_name text NOT NULL,
  roll_no integer NOT NULL,
  parent_name text,
  parent_phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  consent_whatsapp boolean NOT NULL DEFAULT false,
  parent_phone_verified boolean NOT NULL DEFAULT false,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE
);

-- 7. Attendance sessions
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
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

-- 8. Attendance records
CREATE TABLE IF NOT EXISTS public.attendance_records (
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

-- 9. WhatsApp notifications log (used and updated by n8n)
CREATE TABLE IF NOT EXISTS public.whatsapp_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  attendance_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('absent', 'correction_to_present')),
  parent_phone text NOT NULL,
  template_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','sent','delivered','read','failed',
    'skipped_duplicate','skipped_no_consent','skipped_invalid_phone','skipped_no_prior_alert'
  )),
  meta_message_id text,
  error_detail text,
  attempt_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT whatsapp_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT whatsapp_notifications_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
  CONSTRAINT whatsapp_notifications_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  CONSTRAINT whatsapp_notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT whatsapp_notifications_student_date_event_unique UNIQUE (student_id, attendance_date, event_type)
);

-- 10. Parent reply log (logged by n8n inbound message flow)
CREATE TABLE IF NOT EXISTS public.parent_reply_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid,
  student_id uuid,
  from_phone text NOT NULL,
  message_text text,
  bot_reply_text text,
  handled boolean NOT NULL DEFAULT false,
  handled_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parent_reply_log_pkey PRIMARY KEY (id),
  CONSTRAINT parent_reply_log_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL,
  CONSTRAINT parent_reply_log_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL,
  CONSTRAINT parent_reply_log_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ==============================================================================
-- Enable Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reply_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------------------------

-- Schools: public read
DROP POLICY IF EXISTS "Allow public read of schools" ON public.schools;
CREATE POLICY "Allow public read of schools"
ON public.schools
FOR SELECT
USING (true);

-- Profiles: users can see own profile and others in same school
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
CREATE POLICY "Users can see own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can see others in same school" ON public.profiles;
CREATE POLICY "Users can see others in same school"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2
    WHERE p2.id = auth.uid()
      AND p2.school_id = profiles.school_id
  )
);

-- Classes: school members can see classes in their school
DROP POLICY IF EXISTS "School members can see classes" ON public.classes;
CREATE POLICY "School members can see classes"
ON public.classes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.school_id = classes.school_id
  )
);

-- Students: school members can see students in their school
DROP POLICY IF EXISTS "School members can see students" ON public.students;
CREATE POLICY "School members can see students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.school_id = students.school_id
  )
);

-- Attendance sessions: school members can see sessions in their school
DROP POLICY IF EXISTS "School members can see attendance sessions" ON public.attendance_sessions;
CREATE POLICY "School members can see attendance sessions"
ON public.attendance_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.school_id = attendance_sessions.school_id
  )
);

-- Attendance records: school members can see records in their school
DROP POLICY IF EXISTS "School members can see attendance records" ON public.attendance_records;
CREATE POLICY "School members can see attendance records"
ON public.attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.school_id = (
        SELECT s2.school_id
        FROM public.attendance_sessions s2
        WHERE s2.id = attendance_records.session_id
      )
  )
);

-- WhatsApp notifications: school members can see their school's notifications
DROP POLICY IF EXISTS "School members can see whatsapp notifications" ON public.whatsapp_notifications;
CREATE POLICY "School members can see whatsapp notifications"
ON public.whatsapp_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.school_id = whatsapp_notifications.school_id
  )
);

-- Parent reply log: school admins/teachers can see logs for their school
DROP POLICY IF EXISTS "School members can see parent reply log" ON public.parent_reply_log;
CREATE POLICY "School members can see parent reply log"
ON public.parent_reply_log
FOR SELECT
USING (
  school_id IS NULL
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.school_id = parent_reply_log.school_id
  )
);
