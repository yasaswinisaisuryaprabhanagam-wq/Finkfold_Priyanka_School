# Finkfold School & Branch Admin Portal: The Ultimate Operational User Manual

---

## 🏛️ Welcome to the School Admin Command Center

### What is this Portal?
Welcome to the **Finkfold EdOS School Administrator Portal**—the executive operating console designed specifically for **Principals, Vice Principals, Headmasters, Administrative Officers, and Campus Bursars**.

In traditional schools, running day-to-day operations is bogged down by manual friction:
- **Cash Leakage & Tally Disputes**: Unchecked fee collection at front desks leading to cash discrepancies at the end of the day.
- **Disconnected Attendance Registers**: No real-time visibility into which class teacher has or has not marked attendance by 9:00 AM.
- **Parent Communication Breakdown**: Endless phone calls and printed paper notices that get lost inside student backpacks.
- **Admissions Bottlenecks**: Mountains of paper application forms, unverified phone numbers, and manual student roster creation.
- **Academic Pacing Gaps**: Lack of centralized oversight regarding whether teachers are assigning homework evenly or if certain classes are lagging behind.

**Finkfold EdOS consolidates your entire campus operations into one synchronized, real-time command deck.** Every fee rupee collected, every morning roll call marked, every admission approved, and every parent WhatsApp alert sent is tracked, audited, and managed from this single screen.

> [!NOTE]
> **Branch Admin vs. Trust Super Admin**:
> This manual is specifically tailored for the **Branch / School Administrator** (managing daily operations, staff, classes, admissions, fee cash till, and students of your assigned campus). Multi-branch treasury capital transfers and trust-wide organization provisioning are reserved for Trust Super Admins.

---

## 🔑 How to Log In (First Step)

1. Open any modern web browser (**Google Chrome, Safari, Microsoft Edge, or Mozilla Firefox**).
2. Navigate to your school admin login address:
   - **Production**: `https://your-school-url.vercel.app/admin/login`
   - **Local Testing**: `http://localhost:3000/admin/login`
3. Enter your **Administrator Credentials**:
   - **Username / Email**: `admin@priyanka.school` (or your assigned administrative email)
   - **Password**: `Teacher@123` (or your secure administrative password)
4. Click **"Sign In to Admin Workspace"**.
5. You will immediately land on your **Executive Overview Dashboard** (`/portal/admin`)!

> [!IMPORTANT]
> **Zero Search-Engine Exposure & Strict Security Clearance**:
> The Admin Portal is permanently blocked from search engines via `robots.txt` (`Disallow: /admin/*`). Furthermore, role-based access control (RBAC) automatically bars unauthorized students, parents, or teachers from accessing administrative controls.

---

# 🧭 Navigation Directory: Complete Module-by-Module Guide

The left-hand sidebar navigation provides access to 13 operational domains:

1. **📊 Executive Overview** (`/portal/admin`)
2. **💳 Fee Counter & Cash POS** (`/portal/admin/fees`)
3. **📋 Admissions Processing** (`/portal/admin/admissions`)
4. **👥 Student Registry** (`/portal/admin/students`)
5. **🏫 Classes & Sections** (`/portal/admin/classes`)
6. **📚 Academic Setup & Timetables** (`/portal/admin/academics`)
7. **👨‍🏫 Staff Management & Allocations** (`/portal/admin/staff`)
8. **📢 School Circulars & Notices** (`/portal/admin/circulars`)
9. **📝 Homework Hub Oversight** (`/portal/admin/homework`)
10. **🤖 AI Analytics & Insights** (`/portal/admin/analytics`)
11. **🎓 Year-End Batch Promotions** (`/portal/admin/promotions`)
12. **💬 WhatsApp Delivery Audit Log** (`/portal/admin/whatsapp`)
13. **⚙️ School Settings** (`/portal/admin/settings`)

---

# SECTION 1: EXECUTIVE OVERVIEW (`/portal/admin`)

---

### What is the purpose of this page?
The Executive Overview is your **morning flight deck**. Within 30 seconds of sitting at your desk at 8:30 AM, you get an instantaneous pulse check of your school without calling a single staff meeting.

### Key Tools & Visual Widgets on this Screen:

#### 1. The 4 Top Institutional KPI Stat Cards
- **👥 Total Students**: The exact live headcount of actively enrolled students currently on your campus rolls.
- **🏫 Classes**: Total number of registered class sections (e.g. Class 1 to Class 10). Displays how many classes have completed morning roll call today.
- **📋 Pending Roll Calls**: Real-time counter showing classes where the class teacher has **not yet finalized attendance**.
  - 🟢 **0 (Green)**: "All done! Every teacher has submitted morning roll call."
  - 🟠 **1+ (Amber Alert)**: Highlights classes requiring immediate administrative follow-up.
- **💬 WhatsApp Sent**: Live counter showing the exact number of automated WhatsApp absence and school notifications successfully transmitted today.

#### 2. Classes Attendance Status Roster
- Displays a class-by-class live register (e.g., *Class 10-A, Class 9-A, Class 8-A*).
- **Status Badges**:
  - `✓ Completed` (Green): Roll call has been submitted to the database and parent notifications are processed.
  - `Pending` (Amber): The teacher is currently in class or delayed in taking roll call.
- **Instant Action Buttons**:
  - Click **"Mark →"** or **"Edit / View →"** to directly inspect or take emergency roll call for that class if the homeroom teacher is absent.

#### 3. Live WhatsApp Activity & Delivery Ticker
- Displays the 6 most recent automated WhatsApp messages dispatched by the system.
- Shows student name, parent phone number, message event type (e.g. `absent` alert), delivery status (`delivered`, `sent`, `read`), and precise delivery timestamp.
- Allows immediate verification that Meta Cloud API servers and the n8n automation engine are dispatching parent alerts in real-time.

#### 4. Quick Access Action Hub
- Instant 1-click shortcut tiles for **School Circulars**, **Homework Hub**, **Admissions**, and **WhatsApp Audit Log**.

---

# SECTION 2: FEE COUNTER & CASH POS (`/portal/admin/fees`)

---

### What is the purpose of this page?
To eliminate cash leakage, streamline front-desk fee collections, provide instantaneous printed/PDF fee receipts, and enforce strict financial accountability through the **Maker-Checker End-Of-Day (EOD) Cash Till**.

### Key Tools on this Page:

#### Tool A: Counter Fee Collection & POS Billing
1. **Search Student**: Type the student's name, admission number (e.g. `PRIY-2026-001`), or roll number into the search bar.
2. **Review Fee Ledger**: The screen displays all term fee heads:
   - *Tuition Fee* (Term 1 / Term 2 / Term 3)
   - *Transport / Bus Fee*
   - *Annual Examination & Lab Fee*
   - *Curriculum Books & Uniform Kit*
   - Previous unpaid dues or late penalty balances.
3. **Select Payment Mode**:
   - 💵 **Cash**: Collected directly at the counter. Automatically updates today's Cash Drawer balance.
   - 📲 **Dynamic UPI QR**: Displays a dynamic QR code on screen. The parent scans using PhonePe, Google Pay, or Paytm. The exact rupee amount and school bank account are pre-filled.
   - 💳 **Card / POS**: Debit or credit card swipe terminal transaction reference.
   - 🏦 **Bank Transfer / NEFT / Cheque**: Records Cheque/UTR Number and clearance date.
4. **Click "Process Payment & Generate Receipt"**:
   - The transaction is recorded in the immutable `fee_transactions` ledger.
   - A tax-compliant, official receipt with school crest, serial number, and verification QR code is generated.
   - A WhatsApp fee receipt alert is automatically sent to the parent's phone.

#### Tool B: Maker-Checker End-Of-Day (EOD) Cash Till System
*Why does this matter?* Cash handling at school reception desks is the #1 source of bookkeeping discrepancies. Finkfold solves this with a **Maker-Checker protocol**:
- **Morning Open**: When the school office opens, the cashier/bursar enters the opening float balance (e.g. ₹2,000 for small change).
- **During the Day**: Every cash payment logged at the counter automatically adds to the active drawer (`cash_drawer_sessions`).
- **5:00 PM Maker Count**: The front-desk cashier physically counts the currency notes and coins, inputs the denominations into the system, and clicks **"Submit Drawer for Audit"**.
- **Checker Verification (Administrator)**:
  - The Principal or Branch Admin opens the till session.
  - The screen compares the **System Expected Cash** vs. the **Physically Counted Cash**.
  - If balanced: Click **"Approve & Lock Till"**.
  - If discrepancy (over/short): Input mandatory discrepancy explanation notes before sign-off.
  - Generates an immutable, timestamped EOD Till Reconciliation Certificate.

#### Tool C: Fee Structures & Concessions Management
- Create and edit standard fee schedules by grade (e.g., Grade 10 CBSE vs. Grade 1 Foundation).
- Apply approved administrative concessions:
  - *Sibling Concession* (e.g., 15% discount for 2nd child).
  - *Staff Ward Concession* (e.g., 50% tuition waiver).
  - *Merit Scholarship* or economic hardship waivers with board resolution notes.

---

# SECTION 3: ADMISSIONS PROCESSING (`/portal/admin/admissions`)

---

### What is the purpose of this page?
To manage the complete student intake lifecycle—from the moment an inquiry or application is submitted on your public website (`/admissions`) to classroom seat allocation and student onboarding.

### Step-by-Step Admissions Workflow:

#### Step 1: Reviewing Inbound Online Applications
- Applications submitted online appear in the **Pending Applications** inbox.
- Click any applicant card to inspect:
  - Child's full name, date of birth, and target entry grade (e.g., Class 1, Class 6, Class 10).
  - Father's & Mother's names, primary WhatsApp phone number, and residential address.
  - Previous school details and medium of instruction.

#### Step 2: Document Inspection & Verification Checklist
Verify required compliance documents:
- [x] Municipal Birth Certificate
- [x] Student & Parent Aadhar Cards
- [x] Original Transfer Certificate (TC) from previous school
- [x] Previous Academic Progress Report Card
- [x] Passport-size photograph and immunization records

#### Step 3: Actioning Applications (1-Click Onboarding)
- **Approve & Enroll**:
  1. Click **"Approve & Enroll"**.
  2. Select the assigned section (e.g. *Class 10 - Section A*).
  3. The system automatically assigns the next sequential **Admission Number** (e.g. `PRIY-2026-004`).
  4. Automatically provisions the student in the database, generates their student portal profile, and dispatches a **"Welcome to Priyanka EM School"** WhatsApp confirmation to the parents.
- **Waitlist**: Place on hold if class capacity (e.g. 40 seats) is currently filled.
- **Reject**: Decline with a standardized, polite administrative reason (e.g. *Age eligibility criteria not met for Grade 1*).

#### Step 4: Shareable Direct Admission Link
- Use the **Admission Share Box** to copy the school's official online admission link or QR code to post on WhatsApp school groups, pamphlets, or social media banners.

---

# SECTION 4: STUDENT REGISTRY (`/portal/admin/students`)

---

### What is the purpose of this page?
Your master student database. It replaces dusty filing cabinets and provides an instant 360-degree digital dossier on every child enrolled in your school.

### Key Tools on this Page:

#### 1. Search & Smart Filters
- Search instantly by student name, roll number, admission number, or parent mobile number.
- Filter by grade (Classes 1 to 10) or section (A, B, C).

#### 2. Student 360° Dossier
Clicking any student opens their complete institutional record:
- **Personal & Parent Contacts**: Emergency contact numbers, verified WhatsApp consent status.
- **Academic Progress Record**: Historic marks across FA-1, FA-2, SA-1, rank in class, and AI skill gap alerts.
- **Attendance History**: Complete calendar breakdown (Days Present, Absent, OD, Leave) and overall percentage compliance.
- **Conduct & Demerit History**: Merit commendation badges, demerit notices issued by teachers, and parent e-signature status.
- **Health & SEN Dossier**: Blood group, allergies, chronic conditions, and counselor-approved IEP accommodations.
- **Fee Ledger**: Total billed, amount paid, and live outstanding balance.

#### 3. Bulk Student Onboarding (CSV / Excel Import)
- At the start of an academic year, onboarding 200+ students one by one is exhausting.
- Click **"Import Students via CSV"**:
  1. Download the pre-formatted Finkfold Excel/CSV template.
  2. Fill in student names, date of birth, gender, parent mobile, and assigned class.
  3. Upload the file.
  4. The system validates all columns in seconds, detects duplicates, auto-generates sequential admission IDs, and creates student database profiles in bulk.

---

# SECTION 5: CLASSES & SECTIONS (`/portal/admin/classes`)

---

### What is the purpose of this page?
To organize your school's physical and administrative structure into manageable classes and sections.

### Key Capabilities:
- **Class Hierarchy**: View and manage all grade levels (Nursery through Class 10).
- **Section Allocation**: Define sections (A, B, C) with maximum seating capacities (e.g., 40 students per section).
- **Homeroom / Class Teacher Assignment**:
  - Assign the primary class teacher responsible for morning roll call, report cards, and parent messaging for each section.
  - Reassigning a class teacher updates the teacher portal immediately without altering student records.
- **Class Strength & Ratio Tracker**: Monitor male-to-female ratios and enrollment limits per section.

---

# SECTION 6: ACADEMIC SETUP & TIMETABLES (`/portal/admin/academics`)

---

### What is the purpose of this page?
To configure the academic backbone of your institution according to CBSE and State Board mandates.

### Key Tools on this Page:
- **Academic Calendar & Terms**:
  - Define start and end dates for **Academic Session 2026–2027**.
  - Configure evaluation terms (Term 1: June – October; Term 2: November – March).
- **Grading Schemes & Weightage**:
  - Set evaluation models: Formative Assessments (FA: 20%), Summative Assessments (SA: 80%).
  - Grade point cutoffs (A1, A2, B1, B2, C1, C2, D, E).
- **Master Timetable Oversight**:
  - Configure school period slots (Period 1: 08:45 AM – 09:30 AM ... Period 8: 03:00 PM – 03:45 PM).
  - Allocate subject periods across Mathematics, Science, Social Studies, English, Telugu/Hindi, and Robotics Lab.
  - Identify teacher period clashes or unassigned substitution slots.

---

# SECTION 7: STAFF MANAGEMENT (`/portal/admin/staff`)

---

### What is the purpose of this page?
To oversee all faculty and staff members, manage employee directories, assign teaching workloads, and ensure smooth staff HR operations.

### Key Tools on this Page:
- **Faculty Directory**:
  - Master list of all teachers, lab assistants, and administrative personnel.
  - Displays Employee ID, designation, educational qualifications, assigned homeroom, and official email.
- **Subject & Workload Allocation**:
  - Assign specific subjects to teachers (e.g. *Mrs. Priyanka Devi -> Class 10-A Mathematics & Class 9-A Mathematics*).
  - View total weekly teaching periods per teacher to prevent educator burnout.
- **Staff Attendance & Biometric Oversight**:
  - Review daily biometric punch records and punch regularization requests.
  - Approve or decline teacher casual/medical leave requests.
- **Onboarding & Relieving Staff**:
  - Add new teachers with assigned roles (`teacher`, `school_admin`).
  - Securely revoke access immediately when a faculty member is relieved.

---

# SECTION 8: SCHOOL CIRCULARS & NOTICES (`/portal/admin/circulars`)

---

### What is the purpose of this page?
To publish official school notifications, holiday announcements, exam schedules, and emergency notices with zero paper wastage.

### How to Publish a School Circular:
1. Click **"Create New Circular"**.
2. **Circular Title**: Enter a clear heading (e.g., *Pre-Board Examination Schedule & Timings — December 2026*).
3. **Category**: Select notice category:
   - 📅 *Academic / Exam Notice*
   - 🏖️ *Holiday / Vacation Announcement*
   - 💳 *Fee Due Reminder*
   - ⚠️ *Emergency Weather / Unscheduled Closure*
4. **Target Audience**:
   - *Whole School* (All parents and students)
   - *Specific Grade / Class* (e.g., Only Class 10 parents)
   - *Faculty & Staff Only*
5. **Notice Body & Attachments**: Write message details and upload PDF schedules or brochures.
6. **Publish & Broadcast**:
   - The notice appears instantly on the **Student Portal** and **Teacher Portal**.
   - For high-priority notices, select **"Broadcast via WhatsApp"** to send immediate push alerts to parent phones.

---

# SECTION 9: HOMEWORK HUB OVERSIGHT (`/portal/admin/homework`)

---

### What is the purpose of this page?
To give school leadership real-time visibility into academic workloads across all classes, ensuring consistent teaching standards without manually inspecting physical diaries.

### Key Capabilities:
- **Daily Homework Audit**: View all homework assignments posted today by subject teachers across every grade.
- **Load Balancing**: Detect if a single class has been assigned 4 heavy assignments on the same evening, preventing student exhaustion.
- **Syllabus Pacing Compliance**: Ensure teachers are maintaining continuous evaluation and posting regular reinforcement exercises.

---

# SECTION 10: AI ANALYTICS & INSIGHTS (`/portal/admin/analytics`)

---

### What is the purpose of this page?
To transform raw school data into actionable, executive intelligence through built-in analytics algorithms.

### Key Executive Dashboards:
- **🚨 Chronic Absenteeism Early Warning Radar**:
  - Identifies any student whose attendance drops near or below the **75% CBSE Board exam threshold**.
  - Groups students into risk tiers (Critical <65%, Warning 65%–74%, Safe >75%), allowing administrators to counsel parents months before board exams.
- **💰 Fee Collection Velocity & Aging Analysis**:
  - Real-time tracking of term tuition fee collections against target budget projections.
  - Aging breakdown of outstanding dues (0–30 days, 30–60 days, 90+ days overdue).
- **📈 Academic Learning Gap Clusters**:
  - Aggregates teacher OMR exam scores to highlight subjects or specific chapters where the entire grade scored poorly (e.g., *62% of Class 10 struggled with Quadratic Equation Discriminants*).
  - Empowers leadership to mandate focused remedial sessions before terminal exams.

---

# SECTION 11: YEAR-END PROMOTIONS (`/portal/admin/promotions`)

---

### What is the purpose of this page?
To execute smooth, automated grade transitions at the end of each academic year (e.g. promoting the entire Class 9-A batch to Class 10-A for the new session).

### The Batch Roll-Over Process:
1. **Select Source & Destination**:
   - Source: *Academic Year 2025-2026 — Class 9 Section A*
   - Target: *Academic Year 2026-2027 — Class 10 Section A*
2. **Review Student Eligibility**:
   - The system checks academic pass criteria and fee clearance.
   - Any student with detention or pending transfer can be unchecked.
3. **Execute Promotion**:
   - The system transitions enrolled students to their new grade in bulk.
   - Historical marks, attendance archives, and conduct ledgers are permanently preserved in the student's historical archive.
4. **Graduating Batch & TC Processing**:
   - Final Class 10 students are transitioned to **Alumni** status.
   - Generate official Transfer Certificates (TC) with conduct remarks and institutional seals.

---

# SECTION 12: WHATSAPP AUDIT & SETTINGS (`/portal/admin/whatsapp`)

---

### What is the purpose of this page?
To monitor the operational health of your Meta WhatsApp Cloud API connectivity and audit all automated communications.

### Key Capabilities:
- **Delivery Receipts Ledger**:
  - Chronological audit trail of all messages sent from the approved school number (**7090476291**).
  - Status indicators: `sent`, `delivered`, `read`, `failed`.
- **Inbound Parent Reply Logger (`parent_reply_log`)**:
  - When parents tap quick-reply buttons on their WhatsApp alerts (e.g. *"Child has viral fever, doctor note sent"*), their responses are captured here and routed to the homeroom teacher.
- **API Health Status**: Live diagnostic checking webhook uptime, HMAC secret validation, and Meta API rate limits.

---

# SECTION 13: SCHOOL SETTINGS (`/portal/admin/settings`)

---

### What is the purpose of this page?
To maintain core campus parameters, institutional accreditation metadata, and system preferences.

### Manageable Settings:
- **Institutional Profile**: Official registered school name, affiliation numbers (CBSE / State Board), motto, and crest logo.
- **Campus Contacts**: Official support phone number, administrative email, physical address, and visiting office hours.
- **Bell Schedule & Working Days**: Configured start/end times (08:30 AM to 03:45 PM) and official weekly working days (Monday through Saturday).

---

# 📅 Administrator Daily Operational Checklist

To achieve maximum institutional efficiency, administrators are recommended to follow this 3-step daily routine:

### 1. Morning Routine (08:30 AM – 09:00 AM)
1. Log in at `/admin/login` on your laptop or tablet.
2. Check the **Pending Roll Calls** KPI card on the Executive Overview.
3. If any class is pending by 08:50 AM, follow up with the class teacher or click **"Mark →"** to dispatch attendance.
4. Verify on the **WhatsApp Audit Ticker** that absence alerts are streaming out to parents.

### 2. Mid-Day Routine (12:30 PM – 02:00 PM)
1. Check **Admissions** (`/portal/admin/admissions`) to review any new student applications submitted from the website.
2. Review the **Homework Hub** (`/portal/admin/homework`) to verify that daily subject homework has been posted.
3. Publish any urgent circulars or notifications for parents before afternoon dismissal.

### 3. Evening EOD Till Routine (04:45 PM – 05:15 PM)
1. Navigate to **Fee Counter & Cash POS** (`/portal/admin/fees`).
2. Request the front-desk bursar/cashier to submit their **EOD Drawer Cash Count**.
3. Compare the system ledger with the physical cash envelope.
4. Record any discrepancy notes and click **"Approve & Lock Till"**.
5. Your campus financial records are now 100% reconciled and locked for the day!

---

# ❓ Administrator Frequently Asked Questions (FAQ)

#### Q1: What happens if a parent claims they did not receive the WhatsApp absence alert?
**Answer**: Open **WhatsApp Audit Log** (`/portal/admin/whatsapp`). Search for the parent's mobile number. You can see the exact delivery timestamp and status (`delivered` or `failed`). If marked `failed`, verify that the parent's phone number includes the country code (`+91`) and that they have not blocked the official school business number.

#### Q2: Can a teacher access fee collection records or cash till data?
**Answer**: **No.** Finkfold features strict Role-Based Access Control (RBAC). Teachers attempting to navigate to administrative fee pages are automatically redirected to their faculty workspace (`/portal/faculty`).

#### Q3: How do we handle parents who want to pay via UPI at the reception desk?
**Answer**: On `/portal/admin/fees`, search for the student, select the fee term, and click **Dynamic UPI QR**. The screen renders a QR code generated with your branch bank account and the exact rupee figure. The parent scans it with any UPI app (GPay, PhonePe, Paytm). Once payment completes, record the UTR number and click print receipt.

#### Q4: If a student transfers to another school mid-year, how do we process them?
**Answer**: Go to **Student Registry** (`/portal/admin/students`), find the student dossier, and click **"Process Transfer / Generate TC"**. The system checks that all library books, store supplies, and fee dues are cleared before generating the official signed Transfer Certificate.

---

*Finkfold Educational Operating System (EdOS) — Built for excellence in institutional leadership.*
