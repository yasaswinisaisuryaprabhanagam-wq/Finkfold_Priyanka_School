# Finkfold School Portal – Priyanka EM School (Phase 1)

A production-ready school portal and website built for **Priyanka EM School**, Rasapūdipalem. Features public school pages, faculty authentication, classroom attendance marking, and automated parent WhatsApp notifications powered by **n8n** and **Meta WhatsApp Cloud API**.

---

## 🚀 Features

- **Public School Website**:
  - **Home**: Hero section, live WhatsApp parent connectivity preview, academic pillars, key statistics, admissions callout.
  - **About**: School history, mission, vision, core values, and community commitment.
  - **Academics**: Primary, Middle, and Secondary Wings, subject breakdown, and continuous evaluation model.
  - **Admissions**: 4-step admission journey, age eligibility matrix, documents checklist, and interactive inquiries.
  - **Contact**: Campus location, visiting hours, contact details, and online message form.
- **Faculty & Admin Authentication**:
  - Secure role-based access control (`teacher`, `school_admin`, `super_admin`) via Supabase Auth.
  - Fast demo credentials filler for rapid demonstration.
- **Teacher Dashboard**:
  - Displays assigned classes with section and academic year.
  - One-click navigation to daily roll call.
- **Attendance Module**:
  - Interactive roll call with instant statistics (Present, Absent, Attendance Rate %).
  - Quick bulk actions: "Mark All Present" & "Mark All Absent".
  - Student search and filter by roll number or name.
  - Visual indicator showing if parent has WhatsApp notification consent active.
- **Automated WhatsApp Absence Alerts**:
  - Saving attendance automatically logs session records in Supabase.
  - For absent students with WhatsApp consent, dispatches an event webhook to **n8n** with secret header `x-finkfold-secret`.
  - n8n triggers Meta WhatsApp Cloud API from approved number **7090476291**.
  - Two-way messaging: Parent replies in WhatsApp are routed to the inbound n8n webhook and logged in `parent_reply_log`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+ App Router](https://nextjs.org/) (React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Workflow Automation**: [n8n](https://n8n.io/)
- **Messaging API**: [Meta WhatsApp Cloud API](https://developers.facebook.com/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```
finkfold-school-portal/
├── .env.local                    # Environment variables
├── .env.example                  # Template of required environment variables
├── public/
│   └── logo.png                  # Priyanka EM School official emblem
├── src/
│   ├── actions/
│   │   └── submitAttendance.ts   # Server action: saves session & dispatches n8n webhook
│   ├── app/
│   │   ├── layout.tsx            # Root layout with Inter font
│   │   ├── globals.css           # Global Tailwind CSS styles
│   │   ├── page.tsx              # Public home page
│   │   ├── about/page.tsx        # About page
│   │   ├── academics/page.tsx    # Academics & curriculum page
│   │   ├── admissions/page.tsx   # Admissions & eligibility page
│   │   ├── contact/page.tsx      # Contact & campus visit page
│   │   ├── login/page.tsx        # Faculty login page
│   │   └── dashboard/
│   │       ├── layout.tsx        # Dashboard layout with role pill & sign out
│   │       ├── page.tsx          # Teacher / Admin class listing
│   │       └── attendance/
│   │           └── [classId]/
│   │               └── page.tsx  # Daily attendance roll call page
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation bar with mobile drawer
│   │   ├── Footer.tsx            # Footer with contact & accreditation info
│   │   ├── AttendanceForm.tsx    # Interactive roll call form
│   │   └── SignOutButton.tsx     # Sign out action component
│   └── lib/
│       ├── school-config.ts      # School branding tokens & metadata
│       ├── auth.ts               # requireAuth & getProfile helpers
│       └── supabase/
│           ├── client.ts         # Browser Supabase client (@supabase/ssr)
│           └── server.ts         # Server & Admin Supabase clients
└── supabase/
    ├── schema.sql                # Complete DDL tables, constraints & RLS policies
    └── seed.sql                  # School, Class 10-A, 3 students, and teacher mapping
```

---

## ⚙️ Setup & Installation

### 1. Database Setup in Supabase
1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and run the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. In **Authentication** -> **Users**, click **Add User** -> **Create User**:
   - **Email**: `teacher@priyanka.em`
   - **Password**: Choose a secure password (e.g. `Teacher@123`).
   - Auto-confirm user.
5. Copy and run the entire contents of [`supabase/seed.sql`](./supabase/seed.sql). This will:
   - Insert Priyanka EM School (`b30d9655-1701-4cc0-9c59-8812324eb396`).
   - Create Class 10-A.
   - Insert students (Yasaswini, Kiran, Kethan) with parent phone numbers and WhatsApp consent.
   - Link `teacher@priyanka.em` to the teacher profile and assign to Class 10-A.

### 2. Environment Variables
Ensure `.env.local` contains:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n Attendance Webhook URL
N8N_ATTENDANCE_WEBHOOK_URL=https://finkfold.app.n8n.cloud/webhook/finkfold/priyanka/attendance-event
N8N_ATTENDANCE_WEBHOOK_SECRET=finkfold_priyanka_2026

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Running Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 End-to-End Testing Workflow

1. **Verify Public Pages**:
   - Open `/` to view the homepage.
   - Test navigation to `/about`, `/academics`, `/admissions`, and `/contact`.
2. **Faculty Sign In**:
   - Navigate to `/login`.
   - Click **Quick Fill Demo Teacher** (or enter `teacher@priyanka.em` / `Teacher@123`).
   - Click **Sign In** -> Verify redirect to `/dashboard`.
3. **Open Class 10-A**:
   - On the dashboard, click **Mark Attendance** on the **Class 10 – Section A** card.
4. **Mark Absent & Submit**:
   - The roster displays Yasaswini (#1), Kiran (#2), and Kethan (#3).
   - Click **Absent** for Kiran.
   - Click **Save Attendance Session**.
5. **Verify Database & Webhook**:
   - In Supabase, verify rows in `attendance_sessions` and `attendance_records`.
   - Verify a row in `whatsapp_notifications` with status `sent`.
   - Confirm n8n received the POST payload at `https://finkfold.app.n8n.cloud/webhook/finkfold/priyanka/attendance-event` with header `x-finkfold-secret`.

---

## 🚢 Deployment to Vercel

1. Commit and push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Complete Priyanka EM School Phase-1 portal"
   git push origin main
   ```
2. In Vercel, click **Add New...** -> **Project** -> Import this repository.
3. Add the environment variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `N8N_ATTENDANCE_WEBHOOK_URL`
   - `N8N_ATTENDANCE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel URL after initial deploy)
4. Click **Deploy**.
