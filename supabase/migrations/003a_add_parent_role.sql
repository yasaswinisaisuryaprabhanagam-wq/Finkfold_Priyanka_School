-- =============================================================
-- Finkfold ERP - Seed Step 1: Add 'parent' to role enum
-- Run THIS QUERY FIRST (separately, before 003_seed_data.sql)
-- =============================================================

-- ALTER TYPE cannot run inside a transaction, so run it alone.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'parent'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'parent';
    RAISE NOTICE 'Added parent to app_role enum.';
  ELSE
    RAISE NOTICE 'parent already exists in app_role enum.';
  END IF;
END $$;
