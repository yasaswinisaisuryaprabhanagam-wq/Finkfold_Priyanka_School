-- ============================================================
-- Finkfold ERP – Migration 004: WhatsApp Phase A Constraints
-- Safe to re-run (all additive / IF NOT EXISTS)
-- ============================================================

-- ── 1. Unique constraint on whatsapp_notifications ──────────
-- Required for the status-callback upsert to work correctly.
-- n8n calls POST /api/webhook/whatsapp-status after each send;
-- we upsert on (session_id, student_id) to update status/meta_message_id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'whatsapp_notifications_session_student_unique'
  ) THEN
    ALTER TABLE public.whatsapp_notifications
      ADD CONSTRAINT whatsapp_notifications_session_student_unique
      UNIQUE (session_id, student_id);
    RAISE NOTICE '✅ Unique constraint added: whatsapp_notifications(session_id, student_id)';
  ELSE
    RAISE NOTICE 'ℹ️ Constraint already exists — skipped.';
  END IF;
END;
$$;

-- ── 2. Ensure meta_message_id column exists ─────────────────
ALTER TABLE public.whatsapp_notifications
  ADD COLUMN IF NOT EXISTS meta_message_id text;

-- ── 3. RLS: Allow status callback to update from service role ─
-- (service_role_all policy from migration 002 already covers this)

-- ── 4. Add is_test flag to whatsapp_notifications (optional) ─
-- Used to tag test messages sent from the Setup page.
ALTER TABLE public.whatsapp_notifications
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- ── 5. Verification ─────────────────────────────────────────
SELECT
  'Migration 004 ✅'                                                            AS status,
  (SELECT count(*) FROM public.whatsapp_notifications)                          AS total_wa_records,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name = 'whatsapp_notifications' AND column_name = 'meta_message_id') AS meta_msg_id_col,
  (SELECT column_name FROM information_schema.columns
   WHERE table_name = 'whatsapp_notifications' AND column_name = 'is_test')         AS is_test_col;
