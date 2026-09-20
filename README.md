# Finkfold Educational Operating System (EdOS) — Priyanka EM School

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Meta WhatsApp API](https://img.shields.io/badge/Meta%20WhatsApp-Cloud%20API%20v19.0-25D366?style=flat&logo=whatsapp)](https://developers.facebook.com/)
[![n8n Automation](https://img.shields.io/badge/n8n-Automation%20Engine-FF6584?style=flat&logo=n8n)](https://n8n.io/)
[![Tests](https://img.shields.io/badge/Automated%20Tests-154%2F154%20Passing-brightgreen?style=flat)](./scripts)

A modern, autonomous, multi-campus Educational Operating System (EdOS) and institutional web portal built for **Priyanka English Medium School & Trust Campuses** (Fathekhan Pet Main, Gandhi Nagar, Haranathpuram).

Built with **Next.js 16 (App Router, React 19)**, **Supabase PostgreSQL (78 Tables with Row-Level Security)**, **Meta WhatsApp Cloud API v19.0**, and **n8n Automation Engine**.

---

## 🌟 Key Highlights & Architectural Capabilities

### 1. Dedicated Institutional Portals & SEO Isolation
- **🎓 Student & Parent Portal (`/student/login` ➔ `/portal/student`)**:
  - **Indexed by Google Search** for frictionless parent access via mobile search.
  - **Admission Number Login**: Sign in directly using Student ID / Admission Number (e.g. `PRIY-2026-001` or `001`), Student Email (`student@priyanka.school`), or Registered Parent Mobile Number.
  - **18 Subpages & Self-Service Modules**:
    - Dashboard Cockpit with course progress & live period telemetry
    - Academics & AI Skill Gap breakdown with remedial worksheets
    - Homework Checklist with digital submission uploads
    - Timetable with classroom location tags
    - Institutional Circulars & Noticeboard
    - Fees Desk with Dynamic UPI QR & 1-click 80C Tax Exemption Certificates
    - Digital Conduct Ledger with Parent E-Signature Verification Lock
    - Student Leaves & On-Duty (OD) Pass Applications
    - Health & Infirmary Vault (Allergies, blood group, clinic visit logs)
    - Documents Vault (Digital ID Card generator, Bonafide & Study certificates)
    - Regulated PTM Messaging & Slot Booking
    - "SafeSpace" Anonymous Grievance Tokens & Resolution Tracking
    - Live GPS Bus Radar & Stop ETA Tracker
    - Campus Uniform/Book Store e-commerce orders & lunch vouchers
    - Digital Outpass & Gatepass Requests
    - Electives & Club Bidding
    - Bank Caution Deposit Refund Account Vault
- **👨‍🏫 Faculty Command Center (`/faculty/login` ➔ `/portal/faculty`)**:
  - **Private & Hidden from Search Engines** (`robots.txt` Disallow & `noindex`).
  - **23 Specialized Modules**:
    - Morning Roll Call with Medical 🩺 & SEN ⭐ alerts, safe bus boarding, and automated WhatsApp absence alerts
    - Examination Assessments & Student Marks Entry with automated AI Remedial flagger
    - Interactive Seating Chart Designer with "Eyes on Me" Device Lock
    - SEN & Inclusive Education Confidential IEP Profiles & Accommodations Vault
    - AI Essay Voice Grader with custom rubrics and 1-tap audio voice memos
    - NEP 2020 Outcome-Based Curriculum Unit Planner with co-teacher sync
    - Student Group Projects & Peer Review Heatmap
    - Faculty Relief / Substitution Allocation Desk with clash detection
    - Staff HR Hub (biometric punch regularization, payslips, leave balances)
    - Store Indent Requisitions (whiteboard markers, lab supplies, desk delivery)
    - Campus Maintenance SLA Helpdesk with asset repair countdowns
    - Field Trip Manifests & Emergency Medical Rosters
- **🛡️ Executive Admin Console (`/admin/login` ➔ `/portal/admin`)**:
  - **Section 1: Executive Intelligence & AI**: AI Enrollment Forecasting & Lead CRM (funnel stages, marketing campaign ROI, capacity warning), Centralized Treasury & 1-Click Tally-Sync (standard XML voucher generation) + Automated Bank Statement CSV UTR Reconciliation.
  - **Section 2: Smart Campus Logistics & Fleet**: E-Commerce Store Fulfillment ("Pick & Pack" warehouse manifest, 1-scan barcode dispatch, automated vendor PO generation), Live Fleet Radar (real-time GPS telematics map, bus roster with overspeed alerts, turnstile RFID gate swipe stream).
  - **Section 3: HR, Recruitment & Staff Appraisals**: Applicant Tracking System (ATS) Careers sync & recruitment Kanban, 360° Faculty Appraisal Matrix with objective weighted dossier (25% Biometric, 35% Academic, 20% PTM sentiment, 20% Relief).
  - **Section 4: Academic Governance & NEP 2020 Compliance**: NEP 2020 Outcome-Based Education (OBE) Auditor with Bloom's Taxonomy cognitive heatmap, "SafeSpace" Grievance Triage Board with 2-Hour SLA countdown timer & anonymous token replies.
  - **Section 5: Campus Maintenance & Operations**: Estate & Facility Command (work order dispatch, asset depreciation tracker flagging >4 repairs for budget replacement), Omnichannel Waterfall Broadcast Studio (Push ➔ WhatsApp ➔ SMS fallback funnel).
  - **Section 6: Foundational Campus Administration**: Student Registry & Bulk CSV Import, Class Management & Roll Call Oversight, Staff Directory & Period Allocation Grid, Academics Master, Fee Counter POS Cash Till, Year-End Academic Promotions, and WhatsApp Audit Trail.
  - **Section 7: Level 1 Core Daily Admin**: Dynamic Certificate & Document Studio ("Print Room" with drag-and-drop templates, tamper-proof QR verification for Bonafide, Study, Character, and Bank Loan Fee Estimates), Library & Media Center Console (ISBN/barcode scanning, active loans, 7-day overdue auto-fine sync to central fee ledger).
  - **Section 8: Level 2 Workflow & Revenue Automation**: Automated Defaulter & Late-Penalty Engine (₹50/day after 10th rule, automated WhatsApp reminders with dynamic UPI links, recovery heatmap), Digital Visitor Management System (VMS) & Gatepass (reception tablet check-in, host approval, thermal-printed badge with QR, live campus headcount), Government Compliance Exporter (UDISE+ & State Boards with demographic compilation, pre-flight auditor, JSON & Excel DCF exports).
  - **Section 9: Level 3 Enterprise Intelligence & AI**: AI-Powered Timetable & Clash-Resolution Engine (teacher constraints, room capacities, 100% conflict-free master timetable generation in <2s), Board Exam LOC (List of Candidates) Automator (60-point pre-flight validation for missing marks/typos, inline editor, board-compliant export), Automated Payroll & Statutory Deductions Engine (biometric attendance & approved leaves reconciliation, LOP calculation, EPF 12%, PT ₹200, TDS, batch payslips, bank transfer CSV), Alumni Network & Endowment CRM (directory of alumni at IITs/NITs/AIIMS, campaigns, 80G Tax Exemption receipts with verification QR).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16.3.5 App Router](https://nextjs.org/) (React 19.2.8, Turbopack, TypeScript 5) |
| **Styling & Aesthetics** | Custom Vanilla CSS Design System + HSL Calm Mist Tokens + Tailwind CSS v4 |
| **Typography** | `Outfit` (Institutional Headings & Branding) & `Inter` (Tabular Data & Readability) |
| **Database & Auth** | [Supabase PostgreSQL](https://supabase.com/) with Row-Level Security (RLS) & 78 Tables |
| **Automation Engine** | [n8n Cloud Automation Engine](https://n8n.io/) with HMAC SHA-256 Webhook Auth |
| **Messaging Gateway** | [Meta WhatsApp Cloud API v19.0](https://developers.facebook.com/) (Direct failover) |
| **Deployment** | [Vercel](https://vercel.com/) Edge Runtime |

---

## 🔑 Verified System Credentials

| Portal Persona | Dedicated URL Route | Login ID / Email | Password | Role Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty / Teacher** | `/faculty/login` | `teacher@priyanka.school` | `Teacher@123` | Class 10-A Homeroom, Roll Call, Grading |
| **Student / Parent** | `/student/login` | `student@priyanka.school`<br/>*(or `PRIY-2026-001`)* | `Student@123` | Kiran Kumar (Roll #1, Class 10-A) |
| **School Admin** | `/admin/login` | `admin@priyanka.school` | `Teacher@123` | Branch Operations & Cash Till Checker |
| **Trust Super Admin** | `/admin/login` | `superadmin@priyanka.school` | `Admin@123` | Multi-Branch Treasury & Campus Switcher |

---

## 🗄️ Database Architecture (78 Production Tables)

The system database runs on Supabase PostgreSQL with strict Row Level Security (RLS). The database consists of **37 foundational tables** plus **41 portal ecosystem expansion tables** deployed in `supabase/migrations/008_complete_portal_ecosystem_expansion.sql`:

### 1. Foundational Core Schema (37 Base Tables)
`schools`, `profiles`, `classes`, `teacher_classes`, `students`, `attendance_sessions`, `attendance_records`, `whatsapp_notifications`, `parent_reply_log`, `student_promotions`, `pending_admissions`, `homework`, `circulars`, `organizations`, `academic_years`, `subjects`, `student_enrollments`, `fee_structures`, `cash_drawers`, `fee_transactions`, `student_transport_subscriptions`, `campus_store_orders`, `student_elective_bids`, `digital_outpasses`, `support_tickets`, `student_medical_records`, `infirmary_visit_logs`, `lost_and_found_items`, `anonymous_grievance_reports`, `student_conduct_ledger`, `regulated_teacher_messages`, `ptm_booking_slots`, `student_digital_certificates`, `external_achievements_dropbox`, `student_id_photo_submissions`, `student_leaves_and_od`, `student_bank_refund_profiles`.

### 2. Portal Ecosystem Expansion (41 Migration 008 Tables)
- **Faculty Academic Engine**: `exam_assessments`, `student_exam_marks`, `staff_leaves`, `curriculum_unit_plans`, `student_essay_submissions`, `classroom_seating_layouts`, `sen_student_profiles`, `staff_biometric_punches`, `store_indent_requisitions`, `campus_maintenance_tickets`, `student_group_projects`, `faculty_relief_allocations`, `field_trip_manifests`.
- **Admin Enterprise Modules**: `admissions_leads`, `bank_reconciliation_records`, `store_inventory`, `store_purchase_orders`, `fleet_vehicles`, `rfid_turnstile_logs`, `recruitment_job_openings`, `recruitment_applicants`, `faculty_appraisal_dossiers`, `obe_learning_outcomes`, `obe_student_attainments`, `omnichannel_broadcasts`.
- **Admin Level 1, 2, 3 Modules**: `certificate_templates`, `generated_admin_certificates`, `library_books`, `library_loans`, `fee_late_penalty_rules`, `fee_defaulter_logs`, `visitor_passes`, `timetable_constraints`, `class_timetable_slots`, `board_loc_candidates`, `staff_salary_structures`, `monthly_payroll_runs`, `staff_monthly_payslips`, `alumni_profiles`, `endowment_campaigns`, `alumni_donations`.

---

## ⚙️ Installation & Local Development

### 1. Prerequisites
- Node.js 20+ (Node.js 24 supported)
- npm or pnpm
- Supabase project credentials

### 2. Clone & Install
```bash
git clone https://github.com/yasaswinisaisuryaprabhanagam-wq/Finkfold_Priyanka_School.git
cd finkfold-school-portal
npm install
```

### 3. Configure Environment Variables
Create `.env.local` in the project root:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Automation Engine
N8N_ATTENDANCE_WEBHOOK_URL=https://finkfold.app.n8n.cloud/webhook/attendance
N8N_ATTENDANCE_WEBHOOK_SECRET=your-hmac-secret

# Meta WhatsApp Cloud API
META_WHATSAPP_TOKEN=your-meta-access-token
META_PHONE_NUMBER_ID=1144602028740736

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Setup & Migration
To deploy all 41 ecosystem expansion tables and table enhancements:
1. Open [supabase/migrations/008_complete_portal_ecosystem_expansion.sql](./supabase/migrations/008_complete_portal_ecosystem_expansion.sql).
2. Copy the SQL script and paste it into your **Supabase Dashboard SQL Editor**.
3. Click **Run**. All tables, indexes, constraints, and RLS policies will be created.

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Automated Testing Suite (154 / 154 Passing — 100%)

The codebase features comprehensive end-to-end automation covering Unit, Workflow, Database Resilience, and HTTP SSR Route integrity:

```bash
# 1. TypeScript Strict Compile Check
npx tsc --noEmit
# Exit Code: 0 (Zero errors across all pages, server actions, and tests)

# 2. Comprehensive Faculty Portal Tests (All Types)
npx tsx scripts/test_faculty_comprehensive_all_types.ts
# Result: 39/39 passed (100%)

# 3. Faculty Deep Action Test Suite
npx tsx scripts/test_faculty_portal_all.ts
# Result: 61/61 passed (100%)

# 4. Student Portal Comprehensive Test Suite
npx tsx scripts/test_student_portal_all.ts
# Result: 40/40 passed (100%)

# 5. Enterprise Admin Portal Deep Test Suite
npx tsx scripts/test_admin_enterprise_suite.ts
# Result: 14/14 passed (100%)
```

**Total Automated Coverage: 154 Tests Executed • 154 Passed • 0 Failed (100% Success Rate)**

---

## 📄 Dedicated User Manuals & Documentation

For comprehensive guides tailored to specific institutional personas, refer to:
- 📖 [Master Project Documentation](./PROJECT_DOCUMENTATION.md) — Architectural specifications, full schema reference, server action catalog, and security models.
- 🏛️ [School & Branch Admin Portal User Manual](./admin_portal_user_manual.md) — Comprehensive guide for Principals, Admins, and Bursars covering all 9 operational sections.
- 🍎 [Faculty & Teacher User Manual](./teacher_faculty_user_manual.md) — Guide for teachers covering Roll Call, AI Grading, Seating, SEN Vault, and HR.
- 🎓 [Student & Parent Portal User Manual](./student_portal_user_manual.md) — Parent and student guide for Fee Payments, Academics, Bus Tracking, and Leaves.

---

*Finkfold Educational Operating System (EdOS) — Built with pride for Priyanka English Medium School.*
