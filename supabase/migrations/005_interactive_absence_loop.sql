-- ============================================================
-- Finkfold ERP – Migration 005: Interactive Absence Loop
-- "Zero-Admin" WhatsApp 2-way communication
-- Safe to re-run (all IF NOT EXISTS / DO blocks)
-- ============================================================

-- ── 1. Add absence reason tracking to attendance_records ─────
ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS reason text;

ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS parent_acknowledged boolean NOT NULL DEFAULT false;

ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz;

-- ── 2. Parent Reply Log table (audit trail of all inbound WhatsApp messages) ─
CREATE TABLE IF NOT EXISTS public.parent_reply_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.attendance_sessions(id) ON DELETE SET NULL,
  from_phone text NOT NULL,
  message_type text NOT NULL DEFAULT 'interactive'
    CHECK (message_type IN ('interactive', 'text', 'image', 'unknown')),
  button_payload text,          -- e.g. REASON_SICK, REASON_FAMILY, REASON_OTHER
  message_body text,            -- raw text if parent typed a reply
  readable_reason text,         -- e.g. "Sick Leave", "Family Event"
  handled boolean NOT NULL DEFAULT false,
  handled_by uuid REFERENCES public.profiles(id),
  handled_at timestamptz,
  meta_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parent_reply_log_pkey PRIMARY KEY (id)
);

-- Index for fast lookups by phone + date
CREATE INDEX IF NOT EXISTS idx_parent_reply_log_phone
  ON public.parent_reply_log(from_phone, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_parent_reply_log_unhandled
  ON public.parent_reply_log(handled, created_at DESC)
  WHERE handled = false;

-- RLS
ALTER TABLE public.parent_reply_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_reply_log' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.parent_reply_log
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END;
$$;

-- Authenticated users can read (teachers need to see unhandled replies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_reply_log' AND policyname = 'authenticated_read'
  ) THEN
    CREATE POLICY authenticated_read ON public.parent_reply_log
      FOR SELECT TO authenticated USING (true);
  END IF;
END;
$$;

-- Authenticated users can update (teachers acknowledge replies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_reply_log' AND policyname = 'authenticated_update'
  ) THEN
    CREATE POLICY authenticated_update ON public.parent_reply_log
      FOR UPDATE TO authenticated USING (true);
  END IF;
END;
$$;

-- ── 3. Verification ─────────────────────────────────────────
SELECT
  'Migration 005 ✅ Interactive Absence Loop'  AS status,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name = 'attendance_records' AND column_name = 'reason')           AS reason_col,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name = 'attendance_records' AND column_name = 'parent_acknowledged') AS ack_col,
  (SELECT count(*) FROM information_schema.tables
   WHERE table_name = 'parent_reply_log')                                        AS reply_log_exists;
