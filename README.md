# Finkfold Educational Operating System (EdOS) — Priyanka EM School

A modern, autonomous, multi-campus Educational Operating System (EdOS) and public web portal built for **Priyanka English Medium School & Trust Campuses**.

Built with **Next.js 16 (App Router, React 19)**, **Supabase PostgreSQL (with Row-Level Security)**, **Meta WhatsApp Cloud API v19.0**, and **n8n Automation Engine**.

---

## 🌟 Key Highlights & Current Capabilities

### 1. Dedicated Institutional Portals & SEO Isolation
- **🎓 Student & Parent Portal (`/student/login` -> `/portal/student`)**:
  - **Indexed by Google** for frictionless parent access via search.
  - **Admission Number Login**: Sign in directly using Student ID / Admission Number (e.g. `PRIY-2026-001` or `001`) or Email (`student@priyanka.school`).
  - **18 Subpages & Modules**: Academics & AI Skill Gaps, Homework Checklist, Timetable, Circulars, Fees with Dynamic UPI QR, Leaves & OD Passes, Health Vault, Documents Vault (1-click Bonafide & 80C Tax certificates), PTM Messaging, Anonymous SafeSpace Grievance tokens, Live GPS Bus Tracking, Campus Uniform/Book Store, Out-Pass & Mess Menus, Electives & Club Bidding.
- **👨‍🏫 Faculty Command Center (`/faculty/login` -> `/portal/faculty`)**:
  - **Private & Hidden from Search Engines** (`robots.txt` Disallow).
  - **23 Specialized Modules**: Morning Roll Call with Medical 🩺 & SEN ⭐ alerts, Leave/OD Approval Inbox, Academics & AI Radar (OMR bulk scanning, remedial drill dispatch), Conduct Demerit Ledger with parent e-sign lock, Curriculum Unit Planner with cross-section co-teacher sync, AI Essay Voice Grader, Seating Chart with "Eyes on Me" device lock, SEN Confidential IEP Vault, Staff HR Hub (payslips, leave quotas, biometric punch regularization), Store Indent Requisitions, and Campus Maintenance SLA Helpdesk.
- **🛡️ Executive Admin Console (`/admin/login` -> `/portal/admin`)**:
  - Multi-campus switcher, Central Treasury dashboard, Maker-Checker End-Of-Day (EOD) Cash Till auditing, bulk CSV student onboarding, staff allocation.

### 2. Modern Calm Visual Design System
- Redesigned to strictly adhere to clean, calm educational aesthetics inspired by premier university portals.
- **Color Palette**:
  - Canvas: Calm mist background (`#f4f6fb` / `#f8fafc`).
  - Surfaces: Pure white cards (`#ffffff`) with clean borders (`border-slate-200/80`) and subtle elevation (`shadow-[0_2px_8px_rgba(0,0,0,0.04)]`).
  - Soft Pastels: Soft Lilac (Math), Butter Yellow (Science), Sky Blue (English), Mint Green (Robotics & AI).
  - Zero eye-brightening, neon, or saturated dark surfaces in user-facing portals.
- **Widgets**: Circular SVG attendance and punctuality gauges, segmented schedule toggles (`[Today] [This Week] [This Month]`), teaching quality evaluation scorecards, and interactive status chips.

### 3. Meta WhatsApp Automation & n8n Engine
- Automated 2-way absence alerts triggered via n8n webhook (`https://finkfold.app.n8n.cloud/webhook/attendance`) with HMAC SHA-256 validation.
- Direct Meta Graph API fallback ensuring zero dropped notifications.
- Parent replies in WhatsApp route back into the teacher portal message center.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16 App Router](https://nextjs.org/) (React 19, Turbopack, TypeScript) |
| **Styling** | Custom Vanilla CSS Design System + HSL Design Tokens + Tailwind CSS |
| **Typography** | `Outfit` (Institutional Headings) & `Inter` (Tabular Data & Readability) |
| **Database & Auth** | [Supabase PostgreSQL](https://supabase.com/) with Row-Level Security (RLS) |
| **Automation** | [n8n Cloud Automation Engine](https://n8n.io/) |
| **Messaging** | [Meta WhatsApp Cloud API v19.0](https://developers.facebook.com/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🔑 Verified System Credentials

| Portal Persona | Dedicated URL Route | Login ID / Email | Password | Role Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Faculty / Teacher** | `/faculty/login` | `teacher@priyanka.school` | `Teacher@123` | Class 10-A Homeroom, Roll Call, Grading |
| **Student / Parent** | `/student/login` | `student@priyanka.school` *(or `PRIY-2026-001`)* | `Student@123` | Kiran Kumar (Roll #1, Class 10-A) |
| **School Admin** | `/admin/login` | `admin@priyanka.school` | `Teacher@123` | Branch Operations & Cash Till Checker |
| **Trust Super Admin** | `/admin/login` | `superadmin@priyanka.school` | `Admin@123` | Multi-Branch Treasury & Campus Switcher |

---

## 📁 Project Structure

```
finkfold-school-portal/
├── .env.local                                # Active environment configuration
├── public/                                   # Assets & branding logos
├── scripts/
│   ├── test_faculty_comprehensive_all_types.ts # 39/39 comprehensive faculty tests (Unit, Workflow, DB, HTTP)
│   ├── test_faculty_portal_all.ts            # 61/61 deep faculty action & route tests
│   └── test_student_portal_all.ts            # 40/40 comprehensive student portal tests
├── src/
│   ├── actions/                              # Server Actions (12+ functional domains)
│   │   ├── academics.ts                      # Exam marks, AI remedial worksheets, report cards
│   │   ├── bank-refunds.ts                   # Caution deposit refund management
│   │   ├── faculty.ts                        # 23 faculty workflows & server actions
│   │   ├── leaves.ts                         # Student leave & OD applications
│   │   ├── lost-found.ts                     # Campus lost & found catalog and claims
│   │   ├── ptm-messages.ts                   # PTM slot booking & teacher messages
│   │   ├── safespace.ts                      # Anonymous grievance tokens & conduct ledger
│   │   ├── store.ts                          # Campus e-commerce store & lunch pickup vouchers
│   │   ├── studentAuth.ts                    # Admission number / phone resolver
│   │   ├── submitAttendance.ts               # Morning roll call & n8n WhatsApp webhook
│   │   ├── transport.ts                      # Bus route subscriptions & GPS manifest
│   │   └── vault.ts                          # Bonafide/80C cert generation & ID photo compliance
│   ├── app/
│   │   ├── globals.css                       # Calm mist theme tokens & badge classes
│   │   ├── layout.tsx                        # Root layout with Outfit & Inter typography
│   │   ├── page.tsx                          # Public institutional homepage
│   │   ├── (public)/                         # /about, /academics, /admissions, /contact
│   │   ├── login/page.tsx                    # Universal auto-detecting login gateway
│   │   ├── student/login/page.tsx            # Dedicated student & parent login (Google indexed)
│   │   ├── faculty/login/page.tsx            # Dedicated faculty login (noindex)
│   │   ├── admin/login/page.tsx              # Executive admin login (disallow)
│   │   ├── portal/
│   │   │   ├── faculty/                      # 23 faculty portal pages & widgets
│   │   │   ├── student/                      # 18 student portal pages & widgets
│   │   │   └── admin/                        # Multi-campus treasury & till consoles
│   ├── components/                           # Pure-white card widgets & interactive clients
│   │   ├── AttendanceForm.tsx                # Roll call with medical/SEN alerts & safe boarding
│   │   ├── FacultyCurriculumClient.tsx       # NEP 2020 OBE unit planner & co-teacher sync
│   │   ├── FacultyVoiceGraderClient.tsx      # AI rubric grading & 1-tap voice notes
│   │   ├── FacultySeatingChartClient.tsx     # Drag-and-drop seating & device lock
│   │   ├── FacultySenClient.tsx              # Confidential IEP profiles & accommodations
│   │   ├── FacultyHrClient.tsx               # Staff payslips, leave quotas & biometrics
│   │   ├── FacultyStoreIndentClient.tsx      # Classroom supplies requisition & desk delivery
│   │   └── FacultyMaintenanceClient.tsx      # Campus maintenance tickets & SLA countdowns
│   ├── lib/
│   │   ├── school-config.ts                  # School branding, tokens, campus metadata
│   │   ├── auth.ts                           # Server session & role authorization helpers
│   │   └── supabase/                         # Supabase client instances (SSR, Admin)
│   └── types/
│       ├── faculty.ts                        # Full type definitions for faculty features
│       └── self-service.ts                   # Full type definitions for student features
└── supabase/
    ├── schema.sql                            # Production DDL with tables & RLS policies
    └── seed.sql                              # Seed data for schools, classes, and users
```

---

## ⚙️ Installation & Local Development

### 1. Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

### 2. Clone & Install
```bash
git clone https://github.com/yasaswinisaisuryaprabhanagam-wq/Finkfold_Priyanka_School.git
cd finkfold-school-portal
npm install
```

### 3. Configure Environment Variables
Create `.env.local` based on `.env.example`:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Automation
N8N_ATTENDANCE_WEBHOOK_URL=https://finkfold.app.n8n.cloud/webhook/attendance
N8N_ATTENDANCE_WEBHOOK_SECRET=your-hmac-secret

# Meta WhatsApp Cloud API
META_WHATSAPP_TOKEN=your-meta-access-token
META_PHONE_NUMBER_ID=1144602028740736

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Automated Testing Suite (140 / 140 Passing — 100%)

The codebase features comprehensive end-to-end automation covering Unit, Workflow, Database Resilience, and HTTP SSR Route integrity:

### 1. TypeScript Strict Compile Check
```bash
npx tsc --noEmit
# Exit Code: 0 (Zero errors across all pages, server actions, and tests)
```

### 2. Comprehensive Faculty Portal Tests (All Types)
```bash
npx tsx scripts/test_faculty_comprehensive_all_types.ts
# Result: 39/39 passed (100%)
# Covers: Type 1 Unit (6), Type 2 Workflows (9), Type 3 DB (2), Type 4 HTTP (22)
```

### 3. Faculty Deep Action Test Suite
```bash
npx tsx scripts/test_faculty_portal_all.ts
# Result: 61/61 passed (100%)
# Covers: All 23 faculty features and server actions
```

### 4. Student Portal Comprehensive Test Suite
```bash
npx tsx scripts/test_student_portal_all.ts
# Result: 40/40 passed (100%)
# Covers: All 18 student routes and self-service features
```

**Total Automated Coverage: 140 Tests Executed • 140 Passed • 0 Failed (100% Success Rate)**

---

## 📄 User Manuals & Documentation

For comprehensive guides tailored to specific personas, refer to:
- 📖 [Master Project Documentation](./PROJECT_DOCUMENTATION.md)
- 🏛️ [School & Branch Admin Portal User Manual](./admin_portal_user_manual.md)
- 🍎 [Faculty & Teacher User Manual](./teacher_faculty_user_manual.md)
- 🎓 [Student & Parent Portal User Manual](./student_portal_user_manual.md)

---

*Finkfold Educational Operating System (EdOS) — Built with pride for Priyanka English Medium School.*
