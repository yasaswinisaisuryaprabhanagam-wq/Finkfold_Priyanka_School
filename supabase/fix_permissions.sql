-- ==============================================================================
-- 1-CLICK PERMISSION FIX FOR SUPABASE
-- Run this in your Supabase SQL Editor to grant table access to PostgREST
-- ==============================================================================

-- 1. Grant schema usage to standard Supabase roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Grant table, sequence, and routine privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Ensure future tables created automatically inherit full permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 4. Verify table access
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
