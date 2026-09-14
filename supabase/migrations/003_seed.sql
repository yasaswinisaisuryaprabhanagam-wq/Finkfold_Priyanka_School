-- =============================================================
-- Finkfold ERP - Seed Step 2: Classes + Students
-- Run AFTER 003a_add_parent_role.sql
-- WARNING: WIPES ALL EXISTING STUDENTS / CLASSES / ATTENDANCE
-- =============================================================

BEGIN;

-- -------------------------------------------------------
-- 0. Truncate in FK-safe order
-- -------------------------------------------------------
TRUNCATE TABLE public.whatsapp_notifications CASCADE;
TRUNCATE TABLE public.attendance_records     CASCADE;
TRUNCATE TABLE public.attendance_sessions    CASCADE;
TRUNCATE TABLE public.student_promotions     CASCADE;
TRUNCATE TABLE public.pending_admissions     CASCADE;
TRUNCATE TABLE public.parent_reply_log       CASCADE;
TRUNCATE TABLE public.teacher_classes        CASCADE;
TRUNCATE TABLE public.students               CASCADE;
TRUNCATE TABLE public.classes                CASCADE;

-- Remove teacher profiles (admin stays)
DELETE FROM public.profiles WHERE role = 'teacher'::public.app_role;

-- -------------------------------------------------------
-- 1. School
-- -------------------------------------------------------
INSERT INTO public.schools (id, name, slug)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Priyanka EM School',
  'priyanka-em-school'
) ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name;


-- -------------------------------------------------------
-- 2. Classes (35 total)
-- -------------------------------------------------------
INSERT INTO public.classes (id, school_id, name, section, academic_year) VALUES
-- Early Years (5)
('c0000000-0000-0000-0000-000000000001','a1b2c3d4-e5f6-7890-abcd-ef1234567890','Play','A','2026-2027'),
('c0000000-0000-0000-0000-000000000002','a1b2c3d4-e5f6-7890-abcd-ef1234567890','LKG', 'A','2026-2027'),
('c0000000-0000-0000-0000-000000000003','a1b2c3d4-e5f6-7890-abcd-ef1234567890','LKG', 'B','2026-2027'),
('c0000000-0000-0000-0000-000000000004','a1b2c3d4-e5f6-7890-abcd-ef1234567890','UKG', 'A','2026-2027'),
('c0000000-0000-0000-0000-000000000005','a1b2c3d4-e5f6-7890-abcd-ef1234567890','UKG', 'B','2026-2027'),
-- Class 1 A/B/C
('c0000000-0000-0000-0000-000000000006','a1b2c3d4-e5f6-7890-abcd-ef1234567890','1','A','2026-2027'),
('c0000000-0000-0000-0000-000000000007','a1b2c3d4-e5f6-7890-abcd-ef1234567890','1','B','2026-2027'),
('c0000000-0000-0000-0000-000000000008','a1b2c3d4-e5f6-7890-abcd-ef1234567890','1','C','2026-2027'),
-- Class 2 A/B/C
('c0000000-0000-0000-0000-000000000009','a1b2c3d4-e5f6-7890-abcd-ef1234567890','2','A','2026-2027'),
('c0000000-0000-0000-0000-000000000010','a1b2c3d4-e5f6-7890-abcd-ef1234567890','2','B','2026-2027'),
('c0000000-0000-0000-0000-000000000011','a1b2c3d4-e5f6-7890-abcd-ef1234567890','2','C','2026-2027'),
-- Class 3 A/B/C
('c0000000-0000-0000-0000-000000000012','a1b2c3d4-e5f6-7890-abcd-ef1234567890','3','A','2026-2027'),
('c0000000-0000-0000-0000-000000000013','a1b2c3d4-e5f6-7890-abcd-ef1234567890','3','B','2026-2027'),
('c0000000-0000-0000-0000-000000000014','a1b2c3d4-e5f6-7890-abcd-ef1234567890','3','C','2026-2027'),
-- Class 4 A/B/C
('c0000000-0000-0000-0000-000000000015','a1b2c3d4-e5f6-7890-abcd-ef1234567890','4','A','2026-2027'),
('c0000000-0000-0000-0000-000000000016','a1b2c3d4-e5f6-7890-abcd-ef1234567890','4','B','2026-2027'),
('c0000000-0000-0000-0000-000000000017','a1b2c3d4-e5f6-7890-abcd-ef1234567890','4','C','2026-2027'),
-- Class 5 A/B/C
('c0000000-0000-0000-0000-000000000018','a1b2c3d4-e5f6-7890-abcd-ef1234567890','5','A','2026-2027'),
('c0000000-0000-0000-0000-000000000019','a1b2c3d4-e5f6-7890-abcd-ef1234567890','5','B','2026-2027'),
('c0000000-0000-0000-0000-000000000020','a1b2c3d4-e5f6-7890-abcd-ef1234567890','5','C','2026-2027'),
-- Class 6 A/B/C
('c0000000-0000-0000-0000-000000000021','a1b2c3d4-e5f6-7890-abcd-ef1234567890','6','A','2026-2027'),
('c0000000-0000-0000-0000-000000000022','a1b2c3d4-e5f6-7890-abcd-ef1234567890','6','B','2026-2027'),
('c0000000-0000-0000-0000-000000000023','a1b2c3d4-e5f6-7890-abcd-ef1234567890','6','C','2026-2027'),
-- Class 7 A/B/C
('c0000000-0000-0000-0000-000000000024','a1b2c3d4-e5f6-7890-abcd-ef1234567890','7','A','2026-2027'),
('c0000000-0000-0000-0000-000000000025','a1b2c3d4-e5f6-7890-abcd-ef1234567890','7','B','2026-2027'),
('c0000000-0000-0000-0000-000000000026','a1b2c3d4-e5f6-7890-abcd-ef1234567890','7','C','2026-2027'),
-- Class 8 A/B/C
('c0000000-0000-0000-0000-000000000027','a1b2c3d4-e5f6-7890-abcd-ef1234567890','8','A','2026-2027'),
('c0000000-0000-0000-0000-000000000028','a1b2c3d4-e5f6-7890-abcd-ef1234567890','8','B','2026-2027'),
('c0000000-0000-0000-0000-000000000029','a1b2c3d4-e5f6-7890-abcd-ef1234567890','8','C','2026-2027'),
-- Class 9 A/B/C
('c0000000-0000-0000-0000-000000000030','a1b2c3d4-e5f6-7890-abcd-ef1234567890','9','A','2026-2027'),
('c0000000-0000-0000-0000-000000000031','a1b2c3d4-e5f6-7890-abcd-ef1234567890','9','B','2026-2027'),
('c0000000-0000-0000-0000-000000000032','a1b2c3d4-e5f6-7890-abcd-ef1234567890','9','C','2026-2027'),
-- Class 10 A/B/C
('c0000000-0000-0000-0000-000000000033','a1b2c3d4-e5f6-7890-abcd-ef1234567890','10','A','2026-2027'),
('c0000000-0000-0000-0000-000000000034','a1b2c3d4-e5f6-7890-abcd-ef1234567890','10','B','2026-2027'),
('c0000000-0000-0000-0000-000000000035','a1b2c3d4-e5f6-7890-abcd-ef1234567890','10','C','2026-2027')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 3. Students: 10 per class x 35 classes = 350 students
-- -------------------------------------------------------
DO $$
DECLARE
  school_id  uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  boy_first   text[] := ARRAY['Arjun','Ravi','Sai','Venkat','Surya','Rahul','Charan','Aditya','Pranav','Kiran'];
  girl_first  text[] := ARRAY['Priya','Divya','Anjali','Sowmya','Lakshmi','Sravani','Mounika','Kavya','Deepika','Padma'];
  surnames    text[] := ARRAY['Reddy','Kumar','Rao','Sharma','Naidu','Babu','Goud','Chowdary','Raju','Varma',
                              'Murthy','Prasad','Sekhar','Mohan','Kishore','Srinivas','Suresh','Ramesh','Ganesh','Satish'];

  class_ids   uuid[] := ARRAY[
    'c0000000-0000-0000-0000-000000000001'::uuid,
    'c0000000-0000-0000-0000-000000000002'::uuid,
    'c0000000-0000-0000-0000-000000000003'::uuid,
    'c0000000-0000-0000-0000-000000000004'::uuid,
    'c0000000-0000-0000-0000-000000000005'::uuid,
    'c0000000-0000-0000-0000-000000000006'::uuid,
    'c0000000-0000-0000-0000-000000000007'::uuid,
    'c0000000-0000-0000-0000-000000000008'::uuid,
    'c0000000-0000-0000-0000-000000000009'::uuid,
    'c0000000-0000-0000-0000-000000000010'::uuid,
    'c0000000-0000-0000-0000-000000000011'::uuid,
    'c0000000-0000-0000-0000-000000000012'::uuid,
    'c0000000-0000-0000-0000-000000000013'::uuid,
    'c0000000-0000-0000-0000-000000000014'::uuid,
    'c0000000-0000-0000-0000-000000000015'::uuid,
    'c0000000-0000-0000-0000-000000000016'::uuid,
    'c0000000-0000-0000-0000-000000000017'::uuid,
    'c0000000-0000-0000-0000-000000000018'::uuid,
    'c0000000-0000-0000-0000-000000000019'::uuid,
    'c0000000-0000-0000-0000-000000000020'::uuid,
    'c0000000-0000-0000-0000-000000000021'::uuid,
    'c0000000-0000-0000-0000-000000000022'::uuid,
    'c0000000-0000-0000-0000-000000000023'::uuid,
    'c0000000-0000-0000-0000-000000000024'::uuid,
    'c0000000-0000-0000-0000-000000000025'::uuid,
    'c0000000-0000-0000-0000-000000000026'::uuid,
    'c0000000-0000-0000-0000-000000000027'::uuid,
    'c0000000-0000-0000-0000-000000000028'::uuid,
    'c0000000-0000-0000-0000-000000000029'::uuid,
    'c0000000-0000-0000-0000-000000000030'::uuid,
    'c0000000-0000-0000-0000-000000000031'::uuid,
    'c0000000-0000-0000-0000-000000000032'::uuid,
    'c0000000-0000-0000-0000-000000000033'::uuid,
    'c0000000-0000-0000-0000-000000000034'::uuid,
    'c0000000-0000-0000-0000-000000000035'::uuid
  ];

  class_id    uuid;
  c_idx       int := 0;
  s_idx       int := 0;
  roll        int;
  first_name  text;
  surname     text;
  full_name   text;
  parent_sur  text;
  parent_name text;
  phone       text;
  adm_no      text;
BEGIN
  FOREACH class_id IN ARRAY class_ids LOOP
    c_idx := c_idx + 1;
    FOR roll IN 1..10 LOOP
      s_idx := s_idx + 1;
      surname    := surnames[((s_idx - 1) % 20) + 1];
      IF roll % 2 = 1 THEN
        first_name := boy_first[((roll - 1) / 2 % 10) + 1];
      ELSE
        first_name := girl_first[((roll - 2) / 2 % 10) + 1];
      END IF;
      full_name   := first_name || ' ' || surname;
      parent_sur  := surnames[((s_idx + 5) % 20) + 1];
      parent_name := 'Sri ' || parent_sur || ' garu';
      phone       := '+91' || lpad((7000000000 + s_idx)::text, 10, '0');
      adm_no      := 'PRIY-2026-' || lpad(s_idx::text, 3, '0');
      INSERT INTO public.students (
        id, school_id, class_id,
        admission_no, full_name, roll_no,
        parent_name, parent_phone,
        consent_whatsapp, is_active
      ) VALUES (
        gen_random_uuid(), school_id, class_id,
        adm_no, full_name, roll,
        parent_name, phone,
        true, true
      );
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Inserted % students across % classes.', s_idx, c_idx;
END $$;

-- -------------------------------------------------------
-- 4. Sample pending admission (for testing)
-- -------------------------------------------------------
INSERT INTO public.pending_admissions (
  id, school_id, full_name, applying_for_class, applying_for_section,
  parent_name, parent_phone, status, submitted_at
) VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Tanveer Ahmed',
  '6', 'A',
  'Sri Ahmed garu',
  '+917000000999',
  'pending',
  now()
);

COMMIT;

-- Verification
SELECT
  (SELECT count(*) FROM public.classes  WHERE school_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS total_classes,
  (SELECT count(*) FROM public.students WHERE school_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS total_students,
  (SELECT count(*) FROM public.pending_admissions WHERE school_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS pending_admissions;
