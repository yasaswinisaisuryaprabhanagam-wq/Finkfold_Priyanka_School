-- ============================================================
-- FINKFOLD SCHOOL PORTAL – COMPLETE DATABASE SEED
-- Priyanka English Medium School, Rasapudipalem
-- Schema-aligned with supabase/schema.sql
-- Run in Supabase SQL Editor (service_role context)
-- ============================================================

-- ── STEP 1: Permissions ───────────────────────────────────────
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ── STEP 2: School ────────────────────────────────────────────
INSERT INTO public.schools (id, name, slug, primary_color, logo_url)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Priyanka English Medium School',
  'priyanka-em-rasapudipalem',
  '#123B6D',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  slug          = EXCLUDED.slug,
  primary_color = EXCLUDED.primary_color;

-- ── STEP 3: Classes ───────────────────────────────────────────
-- All UUID chars are valid hex (0-9, a-f only)
INSERT INTO public.classes (id, school_id, name, section, academic_year)
VALUES
  ('c1a00000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '10', 'A', '2026-2027'),
  ('c1b00000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '10', 'B', '2026-2027'),
  ('c9a00000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  '9', 'A', '2026-2027'),
  ('c9b00000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  '9', 'B', '2026-2027'),
  ('c8a00000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  '8', 'A', '2026-2027'),
  ('c8b00000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  '8', 'B', '2026-2027'),
  ('c7a00000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  '7', 'A', '2026-2027'),
  ('c6a00000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  '6', 'A', '2026-2027')
ON CONFLICT (id) DO NOTHING;

-- ── STEP 4: Students ──────────────────────────────────────────
-- 'd' prefix = valid hex. All 32 chars are 0-9 or a-f.
INSERT INTO public.students
  (id, school_id, class_id, admission_no, full_name, roll_no,
   parent_name, parent_phone, consent_whatsapp, is_active)
VALUES
  -- Class 10-A
  ('d1000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1a00000-0000-0000-0000-000000000001',
   'ADM-2026-001', 'Yasaswini',     1, 'Ramesh Babu',     '+918247220252', true, true),
  ('d2000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1a00000-0000-0000-0000-000000000001',
   'ADM-2026-002', 'Kiran',         2, 'Srinivas Rao',    '+917981067780', true, true),
  ('d3000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1a00000-0000-0000-0000-000000000001',
   'ADM-2026-003', 'Kethan',        3, 'Venkata Raman',   '+919440266743', true, true),
  ('d4000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1a00000-0000-0000-0000-000000000001',
   'ADM-2026-004', 'Navya Sri',     4, 'Suresh Kumar',    '+919876543210', true, true),
  ('d5000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1a00000-0000-0000-0000-000000000001',
   'ADM-2026-005', 'Manoj',         5, 'Ravi Prasad',     '+918765432109', true, true),
  -- Class 10-B
  ('d6000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1b00000-0000-0000-0000-000000000002',
   'ADM-2026-006', 'Divya',         1, 'Anand Rao',       '+917654321098', true, true),
  ('d7000000-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c1b00000-0000-0000-0000-000000000002',
   'ADM-2026-007', 'Arjun',         2, 'Narayana Murthy', '+916543210987', true, true),
  -- Class 9-A
  ('d8000000-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c9a00000-0000-0000-0000-000000000003',
   'ADM-2026-008', 'Priya Lakshmi', 1, 'Vijay Kumar',     '+915432109876', true, true),
  ('d9000000-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c9a00000-0000-0000-0000-000000000003',
   'ADM-2026-009', 'Rohith',        2, 'Bhaskar Rao',     '+914321098765', true, true),
  ('da000000-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'c9a00000-0000-0000-0000-000000000003',
   'ADM-2026-010', 'Sneha',         3, 'Prasad Varma',    '+913210987654', true, true)
ON CONFLICT (id) DO UPDATE SET
  full_name        = EXCLUDED.full_name,
  parent_name      = EXCLUDED.parent_name,
  parent_phone     = EXCLUDED.parent_phone,
  consent_whatsapp = EXCLUDED.consent_whatsapp;

-- ── STEP 5: Attendance Sessions + Records + WhatsApp Notifications ──
-- All created inside one DO block so session_id is available for WA notifs.
-- Requires at least one teacher in public.profiles for this school.
DO $$
DECLARE
  school_id_val  UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  class_id_val   UUID := 'c1a00000-0000-0000-0000-000000000001';
  teacher_id_val UUID;
  session_date   DATE;
  session_id     UUID;
  i              INT;
  absent_status  TEXT;
BEGIN
  -- Find a teacher profile for this school
  SELECT id INTO teacher_id_val
  FROM public.profiles
  WHERE school_id = school_id_val AND role = 'teacher'
  LIMIT 1;

  IF teacher_id_val IS NULL THEN
    RAISE NOTICE '⚠ No teacher profile found. Add a teacher via Supabase Auth → Authentication → Users, then run this SQL again.';
    RETURN;
  END IF;

  FOR i IN 0..9 LOOP
    session_date := CURRENT_DATE - (9 - i);

    -- Skip weekends (0=Sunday, 6=Saturday)
    CONTINUE WHEN EXTRACT(DOW FROM session_date) IN (0, 6);

    session_id := gen_random_uuid();

    INSERT INTO public.attendance_sessions
      (id, school_id, class_id, attendance_date, marked_by)
    VALUES
      (session_id, school_id_val, class_id_val, session_date, teacher_id_val)
    ON CONFLICT (class_id, attendance_date) DO NOTHING;

    -- Re-fetch session_id in case it already existed (conflict skipped insert)
    SELECT id INTO session_id
    FROM public.attendance_sessions
    WHERE class_id = class_id_val AND attendance_date = session_date;

    -- Attendance records for Class 10-A students
    -- Yasaswini absent day 3 | Kiran absent day 6 | Kethan absent days 2 & 8
    INSERT INTO public.attendance_records (id, session_id, student_id, status, note)
    VALUES
      (gen_random_uuid(), session_id, 'd1000000-0000-0000-0000-000000000001',
        CASE WHEN i = 3 THEN 'absent' ELSE 'present' END,
        CASE WHEN i = 3 THEN 'Family function' ELSE NULL END),
      (gen_random_uuid(), session_id, 'd2000000-0000-0000-0000-000000000002',
        CASE WHEN i = 6 THEN 'absent' ELSE 'present' END,
        CASE WHEN i = 6 THEN 'Mild fever – parent informed' ELSE NULL END),
      (gen_random_uuid(), session_id, 'd3000000-0000-0000-0000-000000000003',
        CASE WHEN i IN (2, 8) THEN 'absent' ELSE 'present' END,
        CASE WHEN i IN (2, 8) THEN 'WhatsApp alert sent to parent' ELSE NULL END),
      (gen_random_uuid(), session_id, 'd4000000-0000-0000-0000-000000000004',
        'present', NULL),
      (gen_random_uuid(), session_id, 'd5000000-0000-0000-0000-000000000005',
        CASE WHEN i = 5 THEN 'absent' ELSE 'present' END, NULL)
    ON CONFLICT (session_id, student_id) DO NOTHING;

    -- WhatsApp notifications for absent students on this day
    -- (session_id is now available, satisfying the NOT NULL FK constraint)
    IF i = 3 THEN
      INSERT INTO public.whatsapp_notifications
        (id, school_id, session_id, student_id, attendance_date, event_type,
         parent_phone, template_name, status, meta_message_id)
      VALUES
        (gen_random_uuid(), school_id_val, session_id,
         'd1000000-0000-0000-0000-000000000001', session_date, 'absent',
         '+918247220252', 'school_absence_alert_v1', 'delivered',
         'wamid.HBgMOTE4MjQ3MjIwMjUy')
      ON CONFLICT (student_id, attendance_date, event_type) DO NOTHING;
    END IF;

    IF i = 6 THEN
      INSERT INTO public.whatsapp_notifications
        (id, school_id, session_id, student_id, attendance_date, event_type,
         parent_phone, template_name, status, meta_message_id)
      VALUES
        (gen_random_uuid(), school_id_val, session_id,
         'd2000000-0000-0000-0000-000000000002', session_date, 'absent',
         '+917981067780', 'school_absence_alert_v1', 'delivered',
         'wamid.HBgMOTE3OTgxMDY3Nzgw')
      ON CONFLICT (student_id, attendance_date, event_type) DO NOTHING;
    END IF;

    IF i IN (2, 8) THEN
      INSERT INTO public.whatsapp_notifications
        (id, school_id, session_id, student_id, attendance_date, event_type,
         parent_phone, template_name, status, meta_message_id)
      VALUES
        (gen_random_uuid(), school_id_val, session_id,
         'd3000000-0000-0000-0000-000000000003', session_date, 'absent',
         '+919440266743', 'school_absence_alert_v1', 'delivered',
         'wamid.HBgMOTE5NDQwMjY2NzQz')
      ON CONFLICT (student_id, attendance_date, event_type) DO NOTHING;
    END IF;

  END LOOP;

  RAISE NOTICE '✅ Sessions, records and WhatsApp notifications seeded successfully.';
END;
$$;

-- ── STEP 6: Parent Replies ────────────────────────────────────
-- To check which columns your live table has, run this first:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'parent_reply_log';
-- Inserting only the columns guaranteed to exist (from schema.sql primary definition)
INSERT INTO public.parent_reply_log
  (id, from_phone, message_text, handled)
VALUES
  (gen_random_uuid(),
   '+917981067780',
   'Good morning teacher, Kiran had a mild fever yesterday. He is feeling better today. Thank you.',
   true),
  (gen_random_uuid(),
   '+918247220252',
   'Yes ma''am, Yasaswini was attending a family wedding. She will submit her homework tomorrow.',
   false)
ON CONFLICT DO NOTHING;

-- ── STEP 7: Service-role RLS bypass on all tables ─────────────
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'schools','classes','students','profiles',
    'attendance_sessions','attendance_records',
    'whatsapp_notifications','parent_reply_log','teacher_classes'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "service_role_all" ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "service_role_all" ON public.%I FOR ALL USING (auth.role() = ''service_role'')',
      tbl
    );
  END LOOP;
  RAISE NOTICE '✅ Service-role bypass policies applied to all tables.';
END;
$$;

-- ── VERIFICATION ──────────────────────────────────────────────
SELECT
  'Seed complete! ✅'                                   AS status,
  (SELECT count(*) FROM public.schools)                 AS schools,
  (SELECT count(*) FROM public.classes)                 AS classes,
  (SELECT count(*) FROM public.students)                AS students,
  (SELECT count(*) FROM public.attendance_sessions)     AS sessions,
  (SELECT count(*) FROM public.attendance_records)      AS records,
  (SELECT count(*) FROM public.whatsapp_notifications)  AS whatsapp_notifs,
  (SELECT count(*) FROM public.parent_reply_log)        AS parent_replies;
