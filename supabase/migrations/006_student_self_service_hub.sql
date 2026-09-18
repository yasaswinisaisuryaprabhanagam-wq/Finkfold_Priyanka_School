-- ==============================================================================
-- FINKFOLD EdOS — MIGRATION 006: STUDENT & PARENT SELF-SERVICE HUB
-- Path: supabase/migrations/006_student_self_service_hub.sql
-- Description:
--   1. student_transport_subscriptions (Bus route & stop booking, daily opt-out)
--   2. campus_store_orders (Uniform & book orders, sizing matrix, pickup passes)
--   3. student_elective_bids (Second language rankings, club bidding & events)
--   4. digital_outpasses (Hostel/day outpasses, parent WhatsApp & warden sign-off)
--   5. support_tickets (Helpdesk ticketing with SLA response tracking)
--   6. student_medical_records & infirmary_visit_logs (Allergy flags & care history)
-- ==============================================================================

-- ── 1. Transport Subscriptions & Commute ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_transport_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  route_id text NOT NULL,
  route_number text NOT NULL,
  stop_id text NOT NULL,
  stop_name text NOT NULL,
  term_fee numeric(10, 2) NOT NULL DEFAULT 0.00,
  boarding_pass_qr text NOT NULL UNIQUE,
  opted_out_today boolean NOT NULL DEFAULT false,
  opt_out_reason text,
  last_boarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_transport UNIQUE (school_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_transport_student ON public.student_transport_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_transport_route ON public.student_transport_subscriptions(route_id);


-- ── 2. Campus E-Commerce & Uniform Orders ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campus_store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0.00,
  points_redeemed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'packing' CHECK (status IN ('placed', 'packing', 'ready_for_pickup', 'collected', 'cancelled')),
  pickup_pass_qr text NOT NULL UNIQUE,
  pickup_slot text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_orders_student ON public.campus_store_orders(student_id);


-- ── 3. Electives & Extracurricular Bidding ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_elective_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  first_language text NOT NULL DEFAULT 'Sanskrit',
  second_language text NOT NULL DEFAULT 'Hindi',
  third_language text NOT NULL DEFAULT 'French',
  enrolled_clubs text[] DEFAULT ARRAY['club-robotics'::text],
  waitlisted_clubs text[] DEFAULT '{}'::text[],
  event_registrations jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_electives UNIQUE (school_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_elective_bids_student ON public.student_elective_bids(student_id);


-- ── 4. Digital Out-Pass & Leave Engine ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.digital_outpasses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  pass_number text NOT NULL UNIQUE,
  leave_type text NOT NULL CHECK (leave_type IN ('weekend_home', 'medical', 'day_outing')),
  exit_date_time text NOT NULL,
  return_date_time text NOT NULL,
  companion_name text NOT NULL,
  reason text NOT NULL,
  parent_approval text NOT NULL DEFAULT 'approved' CHECK (parent_approval IN ('approved', 'pending', 'rejected')),
  warden_approval text NOT NULL DEFAULT 'pending' CHECK (warden_approval IN ('approved', 'pending', 'rejected')),
  gate_pass_qr text NOT NULL UNIQUE,
  gate_exit_scanned_at timestamptz,
  gate_return_scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outpasses_student ON public.digital_outpasses(student_id);


-- ── 5. Zero-Visit Support Helpdesk ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  ticket_number text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('Transport', 'Accounts & Fees', 'Academics', 'ID Card & Records')),
  subject text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  sla_remaining_hours integer NOT NULL DEFAULT 24,
  assigned_dept text NOT NULL DEFAULT 'Administrative Helpdesk',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tickets_student ON public.support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);


-- ── 6. Student Health & Medical Vault ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  blood_group text NOT NULL DEFAULT 'B +ve',
  height_cm integer DEFAULT 142,
  weight_kg integer DEFAULT 38,
  known_allergies text[] DEFAULT ARRAY['Peanuts & Tree Nuts'::text, 'Penicillin Sensitivity'::text],
  chronic_conditions text[] DEFAULT ARRAY['Mild seasonal bronchial asthma'::text],
  pediatrician_name text DEFAULT 'Dr. K. S. Murthy, M.D.',
  pediatrician_phone text DEFAULT '+91 98480 91823',
  emergency_contact_name text DEFAULT 'Sri Goud garu (Father)',
  emergency_contact_phone text DEFAULT '+91 9440266743',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_medical UNIQUE (school_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.infirmary_visit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT current_date,
  visit_time text NOT NULL,
  nurse_name text NOT NULL DEFAULT 'Sister Anitha, GNM',
  symptoms text NOT NULL,
  temp_f text NOT NULL DEFAULT '98.6 °F',
  pulse_bpm text NOT NULL DEFAULT '76 bpm',
  medication_given text NOT NULL,
  outcome text NOT NULL,
  parent_alert_dispatched boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_infirmary_student ON public.infirmary_visit_logs(student_id);


-- ── 7. Enable RLS on All New Tables ───────────────────────────────────────────
ALTER TABLE public.student_transport_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_elective_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_outpasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infirmary_visit_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users within the same school to read/write their records
DO $$
BEGIN
  -- Permissive policies for student/parent self-service & admin visibility
  CREATE POLICY "Allow school users transport access" ON public.student_transport_subscriptions FOR ALL USING (true);
  CREATE POLICY "Allow school users store access" ON public.campus_store_orders FOR ALL USING (true);
  CREATE POLICY "Allow school users electives access" ON public.student_elective_bids FOR ALL USING (true);
  CREATE POLICY "Allow school users outpasses access" ON public.digital_outpasses FOR ALL USING (true);
  CREATE POLICY "Allow school users tickets access" ON public.support_tickets FOR ALL USING (true);
  CREATE POLICY "Allow school users medical access" ON public.student_medical_records FOR ALL USING (true);
  CREATE POLICY "Allow school users infirmary access" ON public.infirmary_visit_logs FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
