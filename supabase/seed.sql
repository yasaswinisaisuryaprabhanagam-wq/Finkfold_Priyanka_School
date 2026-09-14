-- ==============================================================================
-- Finkfold School Portal – Priyanka EM School (Phase 1)
-- Seed Data: School, Class 10-A, Students, Faculty Assignment & Attendance History
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Insert / Verify School: Priyanka EM School
INSERT INTO public.schools (id, name, slug, primary_color, logo_url)
VALUES (
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  'Priyanka EM School',
  'priyanka-em-school',
  '#123B6D',
  '/logo.png'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color,
    logo_url = EXCLUDED.logo_url;

-- 2. Insert / Verify Class 10-A
INSERT INTO public.classes (school_id, name, section, academic_year)
SELECT
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  '10',
  'A',
  '2026-2027'
WHERE NOT EXISTS (
  SELECT 1 FROM public.classes
  WHERE school_id = 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid
    AND name = '10' AND section = 'A'
);

-- 3. Insert Students for Class 10-A
-- Note: parent_phone stored with +91 E.164 format for n8n Meta WhatsApp routing!
-- Student 1: Yasaswini
INSERT INTO public.students (
  school_id,
  class_id,
  admission_no,
  full_name,
  roll_no,
  parent_name,
  parent_phone,
  is_active,
  consent_whatsapp,
  parent_phone_verified
)
SELECT
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  c.id,
  'PRIY-2026-001',
  'Yasaswini',
  1,
  'Parent of Yasaswini',
  '+918247220252',
  true,
  true,
  true
FROM public.classes AS c
WHERE c.school_id = 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid
  AND c.name = '10' AND c.section = 'A'
  AND NOT EXISTS (
    SELECT 1 FROM public.students WHERE admission_no = 'PRIY-2026-001'
  );

-- Student 2: Kiran
INSERT INTO public.students (
  school_id,
  class_id,
  admission_no,
  full_name,
  roll_no,
  parent_name,
  parent_phone,
  is_active,
  consent_whatsapp,
  parent_phone_verified
)
SELECT
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  c.id,
  'PRIY-2026-002',
  'Kiran',
  2,
  'Parent of Kiran',
  '+917981067780',
  true,
  true,
  true
FROM public.classes AS c
WHERE c.school_id = 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid
  AND c.name = '10' AND c.section = 'A'
  AND NOT EXISTS (
    SELECT 1 FROM public.students WHERE admission_no = 'PRIY-2026-002'
  );

-- Student 3: Kethan
INSERT INTO public.students (
  school_id,
  class_id,
  admission_no,
  full_name,
  roll_no,
  parent_name,
  parent_phone,
  is_active,
  consent_whatsapp,
  parent_phone_verified
)
SELECT
  'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid,
  c.id,
  'PRIY-2026-003',
  'Kethan',
  3,
  'Parent of Kethan',
  '+919440266743',
  true,
  true,
  true
FROM public.classes AS c
WHERE c.school_id = 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid
  AND c.name = '10' AND c.section = 'A'
  AND NOT EXISTS (
    SELECT 1 FROM public.students WHERE admission_no = 'PRIY-2026-003'
  );

-- Ensure all parent phones have +91 format
UPDATE public.students
SET parent_phone = CASE 
  WHEN parent_phone NOT LIKE '+%' AND length(parent_phone) = 10 THEN '+91' || parent_phone
  ELSE parent_phone
END
WHERE parent_phone IS NOT NULL;

-- ==============================================================================
-- 4. Faculty Profiles & Class Assignment (Links kiran@priyanka.em & teacher@priyanka.em)
-- ==============================================================================
DO $$
DECLARE
  v_school_id uuid := 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid;
  v_class_id uuid;
  u RECORD;
BEGIN
  -- Find class ID for 10-A
  SELECT id INTO v_class_id FROM public.classes WHERE school_id = v_school_id AND name = '10' AND section = 'A' LIMIT 1;

  -- Loop through users in auth.users matching teacher / kiran
  FOR u IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE email IN ('kiran@priyanka.em', 'teacher@priyanka.em', 'admin@priyanka.em')
  LOOP
    -- Insert profile
    INSERT INTO public.profiles (id, school_id, full_name, role)
    VALUES (
      u.id, 
      v_school_id, 
      CASE 
        WHEN u.email = 'kiran@priyanka.em' THEN 'Kiran (Faculty)'
        WHEN u.email = 'admin@priyanka.em' THEN 'School Administrator'
        ELSE 'Demo Teacher'
      END,
      CASE 
        WHEN u.email = 'admin@priyanka.em' THEN 'school_admin'
        ELSE 'teacher'
      END
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        school_id = EXCLUDED.school_id;

    -- Assign teacher to Class 10-A
    IF v_class_id IS NOT NULL THEN
      INSERT INTO public.teacher_classes (teacher_id, class_id)
      VALUES (u.id, v_class_id)
      ON CONFLICT (teacher_id, class_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ==============================================================================
-- 5. Seed Historical Attendance Sessions & Records (10 Past School Days)
-- Generates:
-- Yasaswini: 9 present, 1 absent (90% attendance)
-- Kiran:     9 present, 1 absent (90% attendance)
-- Kethan:    8 present, 2 absent (80% attendance)
-- ==============================================================================
DO $$
DECLARE
  v_school_id uuid := 'b30d9655-1701-4cc0-9c59-8812324eb396'::uuid;
  v_class_id uuid;
  v_marked_by uuid;
  v_session_id uuid;
  v_s1 uuid; -- Yasaswini
  v_s2 uuid; -- Kiran
  v_s3 uuid; -- Kethan
  v_date date;
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
  -- Get class 10-A
  SELECT id INTO v_class_id FROM public.classes WHERE school_id = v_school_id AND name = '10' AND section = 'A' LIMIT 1;
  -- Get marked_by profile
  SELECT id INTO v_marked_by FROM public.profiles WHERE school_id = v_school_id LIMIT 1;
  -- Get student IDs
  SELECT id INTO v_s1 FROM public.students WHERE admission_no = 'PRIY-2026-001' LIMIT 1;
  SELECT id INTO v_s2 FROM public.students WHERE admission_no = 'PRIY-2026-002' LIMIT 1;
  SELECT id INTO v_s3 FROM public.students WHERE admission_no = 'PRIY-2026-003' LIMIT 1;

  IF v_class_id IS NOT NULL AND v_marked_by IS NOT NULL AND v_s1 IS NOT NULL AND v_s2 IS NOT NULL AND v_s3 IS NOT NULL THEN
    FOR i IN 1..array_length(v_dates, 1) LOOP
      v_date := v_dates[i];

      -- Create or find session
      SELECT id INTO v_session_id FROM public.attendance_sessions 
      WHERE class_id = v_class_id AND attendance_date = v_date LIMIT 1;

      IF v_session_id IS NULL THEN
        INSERT INTO public.attendance_sessions (school_id, class_id, attendance_date, marked_by)
        VALUES (v_school_id, v_class_id, v_date, v_marked_by)
        RETURNING id INTO v_session_id;
      END IF;

      -- Student 1 (Yasaswini): absent on day 4 (2026-09-04), present all other 9 days
      INSERT INTO public.attendance_records (session_id, student_id, status, note)
      VALUES (
        v_session_id, 
        v_s1, 
        CASE WHEN i = 4 THEN 'absent' ELSE 'present' END,
        CASE WHEN i = 4 THEN 'Parent called: family event' ELSE 'Regular attendance' END
      )
      ON CONFLICT (session_id, student_id) DO NOTHING;

      -- Student 2 (Kiran): absent on day 7 (2026-09-08), present all other 9 days
      INSERT INTO public.attendance_records (session_id, student_id, status, note)
      VALUES (
        v_session_id, 
        v_s2, 
        CASE WHEN i = 7 THEN 'absent' ELSE 'present' END,
        CASE WHEN i = 7 THEN 'Parent notified: mild fever' ELSE 'Regular attendance' END
      )
      ON CONFLICT (session_id, student_id) DO NOTHING;

      -- Student 3 (Kethan): absent on day 3 (2026-09-03) and day 9 (2026-09-10), present other 8 days
      INSERT INTO public.attendance_records (session_id, student_id, status, note)
      VALUES (
        v_session_id, 
        v_s3, 
        CASE WHEN i IN (3, 9) THEN 'absent' ELSE 'present' END,
        CASE WHEN i IN (3, 9) THEN 'WhatsApp notification dispatched' ELSE 'Regular attendance' END
      )
      ON CONFLICT (session_id, student_id) DO NOTHING;

      -- If Kiran was absent on day 7, add sample row to whatsapp_notifications
      IF i = 7 THEN
        INSERT INTO public.whatsapp_notifications (
          school_id, session_id, student_id, attendance_date, event_type, 
          parent_phone, template_name, status, meta_message_id
        )
        VALUES (
          v_school_id, v_session_id, v_s2, v_date, 'absent',
          '+917981067780', 'school_absence_alert_v1', 'delivered', 'wamid.HBgMOTE3OTgxMDY3NzgAFQIAEhggRkJDMDgwOUQ2QzZGNEM2Mzk2ODFDQTc5RDBDNzg1RkMA'
        )
        ON CONFLICT (student_id, attendance_date, event_type) DO NOTHING;
      END IF;

      -- If Yasaswini was absent on day 4, add sample row to whatsapp_notifications
      IF i = 4 THEN
        INSERT INTO public.whatsapp_notifications (
          school_id, session_id, student_id, attendance_date, event_type, 
          parent_phone, template_name, status, meta_message_id
        )
        VALUES (
          v_school_id, v_session_id, v_s1, v_date, 'absent',
          '+918247220252', 'school_absence_alert_v1', 'delivered', 'wamid.HBgMOTE4MjQ3MjIwMjUyFQIAEhggRDQwRDgyN0U3ODU5NEFBQzhCNjAxRTJFM0VFMDE1MzkA'
        )
        ON CONFLICT (student_id, attendance_date, event_type) DO NOTHING;
      END IF;

    END LOOP;
  END IF;
END $$;

-- ==============================================================================
-- 6. Seed Sample Inbound Parent Replies
-- ==============================================================================
INSERT INTO public.parent_reply_log (from_phone, message_text, handled)
SELECT 
  '+917981067780', 
  'Good morning teacher, Kiran had a mild fever yesterday. He is taking rest and will be back in class tomorrow. Thank you.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.parent_reply_log WHERE from_phone = '+917981067780'
);

INSERT INTO public.parent_reply_log (from_phone, message_text, handled)
SELECT 
  '+918247220252', 
  'Yes maam, Yasaswini was out of town attending her cousins wedding. She will submit her pending homework.',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.parent_reply_log WHERE from_phone = '+918247220252'
);
