# Finkfold Educational Operating System (EdOS) — Super Admin Portal
## The Ultimate Operational User Manual & Trust HQ Blueprint

> **System Version**: 3.2 (September 2026) &nbsp;|&nbsp; **Portal Status**: ✅ Production Ready & Fully Verified &nbsp;|&nbsp; **Classification**: Confidential — Trust Board & Super Admin Tier Only

---

## 🏛️ Executive Welcome & System Philosophy

Welcome to the **Finkfold EdOS Super Admin Portal** — the Trust-level executive command center engineered specifically for **Chairpersons, Managing Trustees, Chief Academic Officers, and Group Finance Controllers** governing multiple campuses.

The Super Admin role is the apex governance tier within Finkfold EdOS. It is not an isolated, separate software application; rather, it is an **elevated privilege state** within the standard `/portal/admin` workspace. Super Admins possess all standard school administration tools while unlocking cross-campus telemetry, centralized financial treasury sovereignty, and executive override authorities that branch-level Principals and staff do not possess.

> **Scope of this Manual**:
> This manual details the elevated features, operational workflows, and executive override prerogatives available to **Super Admins**. For daily campus operations (such as marking classroom attendance, generating individual fee receipts, or managing bus routes), refer to the companion **School & Branch Admin Portal Manual**.

---

## 🔑 Login & Elevated Authentication

1. Open a modern desktop web browser (Google Chrome, Microsoft Edge, Safari, or Mozilla Firefox).
2. Navigate to the Admin Portal URL:
   - **Production**: `https://your-school-domain.edu.in/portal/admin`
   - **Local Staging**: `http://localhost:3000/portal/admin`
3. Enter your assigned Super Admin credentials (Email and Password) and click **Sign In to Admin Workspace**.
4. The system validates your session and role credentials:
   - `role === "super_admin"` OR
   - `primary_role === "super_admin"` OR
   - `roles.includes("super_admin")`
5. The workspace automatically transitions into **Trust HQ Mode**, indicated by the purple `HQ` badge and the **Global Branch Switcher** in the top navigation bar.

---

## 🔐 Core Architectural Foundation (The Trust HQ Layer)

### 1. Data Scoping & Row-Level Security (RLS)
- **School Admins / Principals**: Strictly locked to their single assigned `school_id`. Attempting to access data from another branch returns a 403 Forbidden or empty query result.
- **Super Admins**: Linked directly to the parent `organization_id` (The Educational Trust). PostgreSQL RLS policies enforce:
  ```sql
  user.organization_id == table.organization_id
  ```
  This grants the Super Admin sovereign read and write capabilities across all campuses within the Trust.

### 2. The Context Cookie (`finkfold_active_school`)
To prevent data overload and operational confusion, the Super Admin does not view all students from all branches in a single unmanageable list. Standard branch modules (Students, Classes, Attendance, Fees) adapt dynamically to the **active branch context**:

| Cookie Attribute | Specification |
| :--- | :--- |
| **Cookie Name** | `finkfold_active_school` |
| **Payload** | UUID of the currently active campus (`school_id`) |
| **Lifespan** | 30 days (persists across browser restarts) |
| **Security** | HTTP-Only, Secure, SameSite=Lax |
| **Default Fallback** | Super Admin's home branch or the first campus registered under the Trust |

> **Crucial Exception**: The **Centralized Treasury** module (`/portal/admin/treasury`) and **Cross-Campus Intelligence Panels** deliberately ignore this cookie to aggregate financial, academic, and welfare data across all campuses simultaneously.

---

## 🎨 Visual Identity — Super Admin vs. Standard Admin

| UI Element | Standard School Admin | Super Admin (Trust HQ) |
| :--- | :--- | :--- |
| **Sidebar Role Badge** | `Admin` (slate gray) | `HQ` (vibrant purple) |
| **Sidebar Title** | `School Principal` | `Super Admin (HQ)` |
| **Topbar Branch Indicator** | Static campus badge | Interactive dropdown of all Trust branches |
| **Executive Overview** | Single campus attendance & KPIs | **Multi-Campus Intelligence Center** with 4:30 PM SLA Heatmap |
| **Treasury & Audit** | Single campus cash drawer | **Centralized Treasury**: 3-branch roll-up + **Unlock Till Authority** |
| **Fee Defaulters** | View unpaid dues & send WhatsApps | **Chairman's Waiver Desk**: Bypass exam gate locks |
| **SafeSpace Triage** | Branch counselor queue | **2-Hour SLA Escalation Command**: Direct HQ takeover |
| **Faculty Appraisals** | Branch teacher scores | **Trust Top 10 Faculty Leaderboard** (cross-campus rankings) |
| **Admissions CRM** | Branch conversion kanban | **Cross-Campus Marketing ROI Benchmark** & CPA tracking |
| **OBE Curriculum** | Single campus lesson balance | **Trust Cognitive Quality Index & Multi-Campus Bloom's Heatmap** |

---

## 🏫 Global Branch Switcher (Top Navigation Bar)

The Global Branch Switcher is prominently located in the top navigation bar on every portal page. It enables seamless instant transitions between physical campuses.

```
+-----------------------------------------------------------------------------------------+
| [🔍 Search students, staff, classes...]                   [Sep 23, 2026]                |
|                                                           [🏫 Main Campus (HYD-01) ▼]   |
|                                                           [🟢 Operational] [🔔] [HQ 👤] |
+-----------------------------------------------------------------------------------------+
```

### Operational Workflow:
1. Click the **Branch Switcher** dropdown in the topbar.
2. Select any campus within the Trust (e.g. *Main Campus HYD-01*, *North Campus HYD-02*, or *East City HYD-03*).
3. The client executes the `switchCampus(schoolId)` Server Action:
   - Sets the `finkfold_active_school` cookie.
   - Triggers `revalidatePath('/portal/admin', 'layout')`.
   - The browser automatically refreshes into the selected campus context.
4. All student rosters, staff directories, fee counters, and daily timetables instantly reflect the chosen branch.

---

## 📡 Module 1: Executive Overview HQ Intelligence Center (`/portal/admin`)

When a Super Admin logs into the portal, the main dashboard features the elevated **Multi-Campus Executive Intelligence Center** directly beneath the welcome banner.

### 1. Cross-Campus Real-Time Telemetry Cards
- **Trust Campuses**: Total active physical branches (e.g., 3 Live: Main, North, East City).
- **Trust Students**: Real-time aggregated enrollment (e.g., 1,842 total: 840 Main, 520 North, 482 East).
- **4:30 PM SLA Compliance**: Percentage of faculty across all branches who submitted tomorrow's lesson plans before the daily 4:30 PM deadline (e.g., 93.8% — 4 Overdue).
- **Critical Grievances**: Active SafeSpace crisis tokens that have exceeded the 2-hour response threshold and require Super Admin intervention.

### 2. Daily Lesson Plan 4:30 PM SLA Compliance Heatmap
Finkfold EdOS enforces a strict institutional rule: *teachers must submit tomorrow's digital lesson plan by 4:30 PM so students and parents can review required materials and pack bags by 6:00 PM*.

The Super Admin heatmap lists all teachers across the Trust with submission timestamps and status tags:
- `✓ On-Time` (Green): Submitted before 4:30 PM.
- `⏳ Pending` (Yellow): Awaiting submission before the deadline.
- `⚠️ SLA Breach` (Rose): Failed to submit before 4:30 PM. Displays the total number of breaches recorded this month.

#### How to Issue an HR Warning to a Habitual Offender:
1. Locate the faculty member in the heatmap marked with `⚠️ SLA Breach` or `⏳ Pending`.
2. Review their **Monthly Breaches** count.
3. Click the **"Issue HR Warning ⚡"** button in the *Super Admin Action* column.
4. The system triggers `dispatchLessonPlanSlaWarning(teacherName, branchName, offenceCount)`.
5. An official warning notice is logged into the staff member's permanent HR dossier and dispatched to their portal inbox.
6. A success confirmation toast appears: `📢 HR Warning dispatched to [Teacher Name] ([Branch]). Warning logged to Staff HR file.`

---

## 🏛️ Module 2: Centralized Treasury & Cash Till Unlock Authority (`/portal/admin/treasury`)

The Centralized Treasury module is the financial nucleus of the Trust. It completely bypasses the branch cookie to aggregate revenue across all campuses.

### Tab 1: Campus Treasury Breakdown
Displays side-by-side financial cards for each physical campus:
- Physical cash collected today at the counter.
- Dynamic UPI collections deposited directly into Trust bank accounts.
- Total daily collections in INR.
- Live EOD drawer status (`OPEN`, `VERIFIED`, or `DISCREPANCY FLAGGED`).
- Instant **"Switch Branch"** shortcut to jump directly to that campus's Fee Counter.

### Tab 2: Maker-Checker Daily Till Audits & Till Unlock Authority
Finkfold EdOS employs a strict financial perimeter:
- **Maker**: Front-desk cashier collects cash and records transactions at the POS.
- **Checker**: Branch Principal physically counts cash notes and marks the drawer as `VERIFIED` (locked).

Once locked, branch personnel **cannot** modify receipts or tamper with the register. Only the Super Admin has the cryptographic authority to unlock a closed till.

#### Step-by-Step Procedure: Unlocking a Verified Till
1. Navigate to **Treasury & Tally-Sync** → click the **Audit & Discrepancies** tab.
2. Locate the row for the target branch and drawer date.
3. If the drawer is `VERIFIED` or locked, click the **"🔓 Unlock Till"** button in the *Super Admin Authority* column.
4. The **Unlock Cash Drawer Till Modal** opens with drawer details:
   - Branch Name & Branch Code
   - Drawer Date & Assigned Cashier
   - Declared Cash Amount
5. In the **Reason for Unlocking Cash Drawer** field, enter a mandatory justification (minimum 10 characters), such as:
   > *"Audit reconciliation authorized by CFO due to late evening bus fee cash collection."*
6. Click **"Confirm & Unlock Cash Till 🔓"**.
7. The system invokes `unlockCashTill(drawerId, drawerDate, branchName, unlockReason)`.
8. The drawer's status reverts to `OPEN`, enabling the cashier to make authorized adjustments.
9. An immutable audit record is created with an official cryptographic reference (e.g. `UNLOCK-M3P9K1-SA`), and a notification is dispatched to the campus principal.

### Tab 3: Cross-Branch Transactions Ledger
A live combined stream of the last 30 fee transactions across the entire Trust, showing receipt numbers, branch codes, student names, payment modes (`CASH`, `UPI_DYNAMIC`), timestamps, and amounts.

### Tab 4: 5:30 PM WhatsApp Executive Digest
Previews the automated executive summary dispatched at 5:30 PM daily to the Managing Trustee's smartphone via the Meta WhatsApp Cloud API. Includes branch-wise totals, cash in hand, digital receipts, and audit flags.

### Tab 5: 1-Click Tally-Sync (XML Voucher Export)
Eliminates manual bookkeeping. Generates an XML file matching Tally ERP 9 / TallyPrime schema (`<ENVELOPE><TALLYMESSAGE><VOUCHER>`), mapping Finkfold fee categories (Tuition, Transport, Store, Admission) directly to Trust Tally Ledgers. Click **"Export Tally XML"** → **"Download File"**.

### Tab 6: Automated Bank Statement Reconciliation
Upload the Trust's master bank CSV statement. The AI engine cross-references bank UTR numbers against `fee_transactions` in the portal, segregating transactions into **Matched** (99.4%), **Pending Settlement**, and **Unmatched Credit** exception queues.

---

## ⚡ Module 3: Defaulter Engine & Chairman's Waiver Desk (`/portal/admin/fees/defaulters`)

Finkfold EdOS automatically computes daily late penalties after the monthly grace period and locks exam hall tickets for students with severe overdue fees (>15 days). 

Super Admins hold the **Chairman's Master Override Key**, allowing them to unlock exam hall tickets for compassionate, humanitarian, or board-approved exceptions without deleting the financial balance.

### Step-by-Step Procedure: Granting a Chairman's Waiver
1. Navigate to **Section 1: Revenue** → **Defaulters & Late Penalty** (`/portal/admin/fees/defaulters`).
2. At the top of the page, view the **Exam Hall-Ticket Gate Locks & Humanitarian Waivers** panel.
3. Review students flagged with `🔒 Hall-Ticket Locked` (>15 days overdue).
4. Click **"⚡ Issue Chairman's Waiver"** on the target student's card or click **"Unlock 🔓"** in the main defaulters table.
5. The **Grant Chairman's Waiver Modal** appears displaying:
   - Student Name, Admission Number, and Class Grade
   - Total Pending Balance and Overdue Days
6. In the **Formal Justification / Board Note** box, enter a comprehensive justification (minimum 10 characters):
   > *"Parental medical emergency approved by Managing Trustee. Hall-ticket released for Pre-Board exam; balance settlement pledged before final report cards."*
7. Click **"Confirm & Unlock Hall-Ticket ⚡"**.
8. The system invokes `grantChairmansWaiver(studentId, studentName, waiverReason)`:
   - Releases the exam gate lock immediately on the Student Portal.
   - Logs the waiver permanently in the Trust audit records with the Super Admin's name and timestamp.
   - Retains the financial ledger liability so the family can settle dues later.
9. The student's status updates immediately to `✓ Waiver Active`.

---

## 🛡️ Module 4: SafeSpace 2-Hour SLA Crisis Escalation Command (`/portal/admin/safespace`)

SafeSpace is an end-to-end encrypted anonymous grievance drop-box where students can report severe bullying, mental distress, or safety issues.

### The 2-Hour SLA Emergency Escalation Rule:
When a critical report is filed, a mandatory **2-Hour SLA Countdown Clock** starts. If the campus principal or counselor fails to log an active intervention within 120 minutes, the grievance **automatically breaches SLA and escalates to the Super Admin Escalation Inbox**.

### Operational Workflow: Taking HQ Ownership of an Escalated Grievance
1. Navigate to **Section 4: Academic Governance** → **SafeSpace Grievance Triage** (`/portal/admin/safespace`).
2. Super Admins see the elevated **"SUPER ADMIN ESCALATION INBOX • 2-HOUR TRUST SLA BREACHES"** command desk.
3. Review breached grievances showing red flags (e.g., `⚠️ SLA Breached by 120m` or `⏳ 48m Remaining`).
4. Click **"⚡ Take HQ Ownership"**.
5. The system executes `markSlaEscalationOwnership(tokenId, tokenCode)`:
   - Immediately stops the SLA breach countdown clock.
   - Assigns ownership to `Trust Super Admin (Executive Intervention)`.
   - Sends an urgent compliance alert to the campus principal.
6. The case dossier opens on the right side:
   - Read the confidential student disclosure statement.
   - Enter an executive directive in the **Trust Super Admin Executive Intervention Note** box (e.g. *Anti-bullying patrol assigned; external counseling session scheduled*).
   - Click **"Log Intervention & Stop SLA Timer"**.
7. In the **Secure Two-Way Anonymous Dialogue** panel, type a confidential reassurance message to the student. Your message appears with the official badge: `Trust Super Admin (Executive)`.

---

## ⭐ Module 5: 360° Appraisals & Trust Top 10 Faculty Leaderboard (`/portal/admin/staff/appraisals`)

The 360° Faculty Appraisal Matrix replaces subjective evaluations with an empirical, mathematical performance formula:

$$\text{Composite Score} = (0.25 \times \text{Punctuality}) + (0.35 \times \text{Academic Gain}) + (0.20 \times \text{PTM Sentiment}) + (0.20 \times \text{Relief Coverage})$$

### Tab: 🏆 Trust Top 10 Faculty Leaderboard (All 3 Campuses)
Exclusive to Super Admins, this view aggregates faculty performance across all Trust branches to identify top educators for promotions, awards, and increments.

#### How to Review and Export Trust Honours:
1. Navigate to **Section 3: HR & Payroll** → **360° Faculty Appraisals** (`/portal/admin/staff/appraisals`).
2. Select the **"🏆 Trust Top 10 Faculty Leaderboard (All 3 Campuses)"** tab.
3. View the ranked leaderboard (🥇 Rank 1, 🥈 Rank 2, 🥉 Rank 3...):
   - Faculty Name & Subject
   - Campus Branch (Main, North, East City)
   - Component scores (Punctuality %, Academic %, PTM %, Relief %)
   - Composite Score & Performance Band
4. Click on any teacher row to view their **Audit Dossier** on the right:
   - Biometric late punches count.
   - Academic class average trajectory gains (e.g. `+12.8% vs last year`).
   - Average parent feedback rating (e.g. `★ 4.8 / 5.0`).
   - Substitution periods covered.
   - **Trust Recommendation**: View recommended salary increments and honours (e.g., *+18% Band A+ & Chairman's Star Award*, *Research Grant*, or *Band B Increment*).
5. Click **"Export Appraisal Ledger (PDF)"** to download the signed Trust executive honours roll.

---

## 🎯 Module 6: Admissions CRM & Cross-Campus Marketing ROI (`/portal/admin/admissions/crm`)

Standard school admins manage lead pipeline kanbans for their individual branch. Super Admins unlock the **"🌐 Cross-Campus ROI"** benchmarking engine to optimize advertising expenditure across all campuses.

### Key Metrics Monitored:
- **Marketing Spend per Campus**: Total ad spend on digital campaigns, billboards, and print pamphlets.
- **Inquiries & Campus Tours**: Volume of prospective parent visits.
- **Confirmed Enrollments**: Final enrolled students.
- **Conversion Rate %**: Percentage of initial inquiries that convert into fee-paying admissions.
- **Gross Tuition Yield**: Total expected first-year tuition revenue generated.
- **Customer Acquisition Cost (CPA)**: Exact marketing cost per enrolled child:
  $$\text{CPA} = \frac{\text{Total Marketing Spend}}{\text{Total Enrolled Students}}$$

### Strategic Allocation Insights:
The dashboard provides an automated AI strategic insight comparing branch efficiency:
> *Example: "North Campus is delivering the lowest acquisition cost (₹1,323/child) via highway billboards, whereas Main Campus dominates organic word-of-mouth. We recommend diverting ₹15,000 from East City print pamphlets into North Campus digital geotargeted ads."*

---

## 🧠 Module 7: NEP 2020 OBE Auditor & Trust Cognitive Quality Index (`/portal/admin/academics/obe`)

National Education Policy (NEP 2020) and CBSE guidelines mandate a departure from rote learning toward **Higher Order Thinking Skills (HOTS)**.

### The Trust Cognitive Quality Index:
Super Admins view the **Multi-Campus Bloom's Taxonomy Heatmap**, auditing the cognitive distribution of question banks and lesson plans across all three campuses:

| Cognitive Level | Category | Target % |
| :--- | :--- | :--- |
| **Remembering** | Rote Memorization | `< 30%` (Cap) |
| **Understanding** | Conceptual Grasp | `20% – 25%` |
| **Applying** | Practical Problem Solving | `25% – 30%` |
| **Analyzing** | Deconstruction & Logic | `10% – 15%` (HOTS) |
| **Evaluating** | Critical Review & Critique | `5% – 10%` (HOTS) |
| **Creating** | Original Design & Projects | `5% – 10%` (HOTS) |

### How to Dispatch an Academic Directive to a Branch:
1. Navigate to **Section 4: Academic Governance** → **NEP 2020 OBE Auditor** (`/portal/admin/academics/obe`).
2. Review the **Trust Cognitive Quality Index** cards:
   - Check the stacked color bars for each branch.
   - Inspect branches with status marked `Action Required` or `Critical Review` (e.g. where Remembering exceeds 35%).
3. On any non-compliant campus card, click **"Issue Trust Directive ⚡"**.
4. The system logs an executive pedagogical coaching directive sent directly to the campus Principal and Department Heads, scheduling a mandatory lesson plan audit.

---

# PART II: GLOBAL TRUST SOVEREIGNTY & EXPANSION COMMAND
## (Enterprise Architecture Inspired by SAP, Oracle NetSuite, Coupa, Workday, Darwinbox & PowerSchool)

This section details the 9 sovereign enterprise capabilities engineered for group-level Trust executives. These modules allow HQ to standardize policies, automate board presentations, control universal budgets, unlock group procurement savings, retain unified staff histories, aggregate government statutory returns, safeguard legal accreditations, benchmark statutory infrastructure compliance, and provision new branches in seconds.

---

## 🏛️ Module 8: Global Master Data Management (MDM) & Policy Lock (`/portal/admin/trust/master-data`)

### The Real-World Problem:
A branch Principal arbitrarily lowers the tuition fee for Class 10 to boost localized admissions, or alters the academic grading scale or uniform pricing. This breaks the Trust's standardized financial projections and centralized report card formats.

### The Finkfold Solution:
The Super Admin defines the Master Data Foundation. HQ configures the absolute baseline for Fee Structures, Academic Calendars, Grading Scales, and Uniform Pricing.

```
+-----------------------------------------------------------------------------------------+
| [🔒 Standard Class 10 Tuition Fee]     | ₹45,000 / Term | Status: LOCKED (Read-Only)    |
| [🔒 Standard Grading Scale]            | CBSE A1 to E   | Status: LOCKED (Read-Only)    |
| [🔒 Trust Uniform Kit Pricing]         | ₹3,200 / Set   | Status: LOCKED (Read-Only)    |
+-----------------------------------------------------------------------------------------+
```

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Global Policy Lock (MDM)** (`/portal/admin/trust/master-data`).
2. Toggle the **"Global Lock 🔒"** switch on any standardized policy (e.g. Class 10 Tuition Fee or CBSE Assessment Scale).
3. On all branch-level Principal and Accountant portals, this field becomes read-only and marked with an audit lock icon.
4. **Policy Exception Workflow**:
   - If a branch Principal wants to run a localized discount campaign (e.g. North Campus 10% Early Bird Scholarship), they submit a **"Policy Exception Request"** through their portal.
   - The request appears in the Super Admin's Exception Inbox on this page with justification and projected impact.
   - The Super Admin provides a **1-click digital approval or rejection** with executive notes via `approvePolicyExceptionRequest()`.

---

## 📊 Module 9: Automated Board of Directors (BoD) Pitch Deck Generator (`/portal/admin/hq-reporting`)

### The Real-World Problem:
Preparing for quarterly Board of Directors meetings requires finance and academic teams to spend 2 weeks manually exporting spreadsheets from 3 campuses, stitching them together into PowerPoint, and risking calculation errors or outdated slides.

### The Finkfold Solution:
A 1-click automated Pitch Deck & Executive Packet generator. It aggregates real-time data across all branches into an executive presentation mode with PowerPoint, PDF, and live slideshow views.

### Slide Deck Composition:
- **Slide 1: Executive Macro Overview & Group Financial Health**: Consolidated Revenue (₹2.41 Cr), Group Surplus (₹78.2 Lakhs), EBITDA margin (32.4%), and Total Active Student Enrollment (3,220).
- **Slide 2: Campus-by-Campus Comparative Performance**: Revenue, Collections %, Student-Teacher Ratio, and Academic Pass % benchmarked side-by-side.
- **Slide 3: Academic Excellence & Board Exam Trajectory**: Pre-board 90%+ scorers, Bloom's cognitive distribution, and STEM Olympiad medals.
- **Slide 4: Capital Expenditure & Infrastructure Expansion**: Science lab commissioning, bus fleet additions, and new branch expansion roadmaps.

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **BoD Pitch Deck Generator** (`/portal/admin/hq-reporting`).
2. Select the fiscal quarter (e.g. Q2 FY 2026-27).
3. Click **"Launch Live Executive Presentation Mode"** for a full-screen, distraction-free board presentation.
4. Click **"Export Board Deck (PPTX / PDF)"** to generate a pre-formatted, C-suite ready presentation deck.

---

## 💰 Module 10: Universal Budgeting & Burn-Rate Monitor (`/portal/admin/trust/budgets`)

### The Real-World Problem:
A branch Principal or Estate Manager overspends their departmental budget (e.g. spending ₹5,25,000 against a ₹5,00,000 marketing cap) by colluding with local vendors on spot expense vouchers. HQ only discovers the hemorrhage weeks later during quarterly audits.

### The Finkfold Solution:
Coupa-inspired real-time budget burn monitoring with **Automated Hard-Locks**. When a branch exhausts 100% of an allocated category, the branch portal automatically hard-locks further voucher submissions. Any over-budget expenditure requires Super Admin digital override.

```
+-----------------------------------------------------------------------------------------+
| [North Campus - Marketing]  | Allocated: ₹5.00L | Spent: ₹5.25L (105%) | 🔒 HARD LOCKED |
| [East City - Science Lab]   | Allocated: ₹3.50L | Spent: ₹3.25L (93%)  | ⚠️ AMBER ALERT |
| [Main Campus - IT Cloud]    | Allocated: ₹4.50L | Spent: ₹2.90L (64%)  | 🟢 NOMINAL     |
+-----------------------------------------------------------------------------------------+
```

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Universal Budget & Burn-Rate** (`/portal/admin/trust/budgets`).
2. Review the burn-rate indicators across all campuses. Categories over 90% show amber alerts; categories at or above 100% are highlighted in red hard-lock.
3. Review the **Over-Budget Voucher Approval Queue**:
   - Inspect voucher details: Branch, Vendor, Requested Amount, and negative budget impact.
   - Enter an executive justification note.
   - Click **"Authorize Over-Budget Override"**.
4. The system executes `approveOverBudgetVoucher()`, generates a cryptographic authorization code (`BUDGET-OVR-XXXX-SA`), and unlocks the payment for the branch cashier.

---

## 🛒 Module 11: Bulk E-Procurement & Blind Bidding Engine (`/portal/admin/trust/procurement`)

### The Real-World Problem:
Each branch purchases stationery, science lab consumables, answer booklets, and sports uniforms separately at retail spot prices. Vendors overcharge individual branches, and kickbacks or favoritism go unnoticed.

### The Finkfold Solution:
Coupa and SAP Ariba-inspired sovereign RFQ aggregator. Finkfold consolidates purchase requisitions across all 3 campuses into sovereign bulk tenders. Approved vendors submit blind, sealed quotes. Super Admin evaluates the lowest L1 bids and generates multi-branch Purchase Orders with 1 click.

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Bulk E-Procurement** (`/portal/admin/trust/procurement`).
2. Review aggregated RFQs (e.g. *RFQ-TRUST-2026-041: 4,500 Units Science Lab Consumables* across Main, North, and East City).
3. While the bidding window is open, quotes remain cryptographically sealed to prevent price leaks.
4. When unsealed, the **Reverse Auction Matrix** displays vendor bids, quality ratings, lead times, and exact Trust economies of scale savings (e.g. ₹5,67,500 saved, 30.7% below spot branch rates).
5. Click **"Award Tender & Generate PO"** on the L1 lowest bidder:
   - Invokes `awardProcurementBid()`.
   - Generates a sovereign Purchase Order (`PO-TRUST-XXXXX`).
   - Automatically dispatches delivery consignment splits to each campus storekeeper.

---

## 🔄 Module 12: Inter-Campus Staff Mobility & Unified History (`/portal/admin/trust/staff-mobility`)

### The Real-World Problem:
When teacher Dr. Priyanka Sharma transfers from Main Campus to North Campus, traditional portals make administrators create a duplicate profile. This wipes her historical PF/UAN, biometric identity, leave ledgers (Gratuity, Earned Leave), and historical 360° student appraisals.

### The Finkfold Solution:
Workday and Darwinbox-inspired cross-campus mobility engine. Staff retain a persistent **Trust-Wide Employee ID** (`EMP-TRUST-XXXX`). When transferring branches, all entitlements, bio-credentials, and evaluation records travel seamlessly with the employee.

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Staff Mobility & Unified History** (`/portal/admin/trust/staff-mobility`).
2. Browse the Trust Unified Faculty Roster.
3. Click **"Initiate Inter-Campus Transfer"** on any faculty member:
   - Select destination campus (e.g. North Campus HYD-02).
   - Select effective transfer date and assigned designation.
   - Enter executive transfer justification.
   - Complete the Handover Checklist (marks signed off, campus assets surrendered, biometric turnstile auto-sync, leave ledger preservation).
4. Click **"Authorize & Execute Transfer"**:
   - Executes `executeInterCampusTransfer()`.
   - Generates immutable transfer reference (`TXFER-XXXXX`).
   - Relocates staff profile with zero administrative downtime and updates the Trust Transfer Audit Trail.

---

## 📑 Module 13: Global Statutory Consolidation (EPF, TDS, PT) (`/portal/admin/trust/statutory`)

### The Real-World Problem:
Branch accountants generate isolated EPF/ESI files, TDS deduction sheets, and state Professional Tax returns. This leads to calculation discrepancies, delayed government remittances, mismatched UANs, and hefty interest penalties from EPFO and the Income Tax Department.

### The Finkfold Solution:
Zoho Books and GreytHR Enterprise-inspired statutory consolidation engine. Aggregates monthly payroll across all 3 campuses into a single Trust-level tax pool and generates 1-click government-compliant upload files.

```
+-----------------------------------------------------------------------------------------+
| Consolidated Gross Wages : ₹78.40 Lakhs (214 Faculty & Staff)                           |
| Consolidated EPF Remittance: ₹12.45 Lakhs (Employee + Employer + EPS + Admin)            |
| Consolidated TDS Form 24Q: ₹8.95 Lakhs (Mapped to Trust TAN: HYDF01928B)                |
| Consolidated Professional Tax: ₹1.45 Lakhs (Telangana Statutory Slabs)                  |
| Compliance Health Score   : 100% NOMINAL (0 Late Notices / 0 Penalties)                 |
+-----------------------------------------------------------------------------------------+
```

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Global Statutory Consolidation** (`/portal/admin/trust/statutory`).
2. Select the filing Month and Year.
3. Review campus-by-campus wage and deduction reconciliations.
4. Click **"Generate Trust EPF ECR File"**:
   - Executes `generateTrustStatutoryChallans("EPF_ECR")`.
   - Validates UANs, pension caps, and admin charges.
   - Automatically downloads the formatted ECR text/CSV file ready for direct upload to the EPFO Unified Portal.
5. Click **"Generate Consolidated TDS 24Q"** to generate the Traces FVU-compatible return.

---

## 🛡️ Module 14: Accreditation & Affiliation Vault (`/portal/admin/trust/accreditation`)

### The Real-World Problem:
When operating multiple branches, critical legal compliance certificates (CBSE SARAS 4.0 Affiliation, State Fire Safety NOC, Structural Soundness & Stability, Drinking Water Hygiene, RTE Form II) expire unnoticed. A lapse results in sudden closure notices from the Education Department, de-affiliation threats, or emergency inspection scrambles.

### The Finkfold Solution:
Centralized legal vault with proactive **90-Day & 30-Day Countdown Timers**:
- **Critical Red Alert (< 30 Days)**: Automated escalations dispatched to Super Admin and campus Principal.
- **Proactive Amber Warning (30-90 Days)**: Renewal inspection workflow initialized.
- **Nominal Standing (> 90 Days)**: Fully certified legal operations.

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Accreditation Vault** (`/portal/admin/trust/accreditation`).
2. Review the status cards of all institutional instruments across campuses.
3. For any instrument nearing expiration or requiring renewal, click **"Upload Renewed Certificate"**.
4. Enter Certificate Number, Issuing Authority, and Renewed Expiry Date, and attach the official PDF decree.
5. Click **"Verify & Commit to Vault"**:
   - Executes `uploadAccreditationCertificate()`.
   - Resets the countdown timer, updates the verification audit stamp, and renews institutional SLA standing.

---

## 🏫 Module 15: Institutional Asset & Infrastructure Audit (RTE) (`/portal/admin/trust/infrastructure`)

### The Real-World Problem:
Schools fail surprise CBSE or State Education Department RTE audits because individual branch managers pack too many students into cramped classrooms (violating the 10-12 sq.ft. per student norm), allow the Student-Teacher Ratio (STR) to inflate above 30:1, or maintain insufficient library titles or lab workstations.

### The Finkfold Solution:
PowerSchool and CBSE Affiliation Bye-Laws audit engine monitoring real-time statutory metrics against legal thresholds:
- **Student-Teacher Ratio (STR)**: Benchmark max 30:1 (Primary) / 35:1 (Secondary).
- **Classroom Square Footage per Child**: Benchmark min 10-12 sq.ft. per enrolled child.
- **Library Titles per Student**: Benchmark min 5 unique titles per child + 15 periodicals.
- **Science & Composite Lab Workstations**: 1 terminal/microscope per 2 students.
- **Barrier-Free Accessibility**: 100% CWSN ramps and accessible sanitation.

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **Infrastructure Audit (RTE)** (`/portal/admin/trust/infrastructure`).
2. Review the campus comparison matrix. Campuses with statutory breaches are highlighted with red alerts.
3. Click on any non-compliant campus (e.g. North Campus with STR 31.8:1 and classroom floor space deficit).
4. Click **"Generate RTE Remediation Plan"**:
   - Outlines exact rectification steps (e.g. hire 3 TGTs, bifurcate Section 9B into 9C, acquire 944 library titles).
   - Generates recommended CAPEX investment summary for the Board of Directors.
   - Exports the official Remediation PDF.

---

## 🚀 Module 16: Franchise Expansion: 1-Click New Campus Provisioning Wizard (`/portal/admin/trust/provision-campus`)

### The Real-World Problem:
Opening a new school branch (e.g. "Finkfold Gachibowli" or "Finkfold Bengaluru") typically takes months of manual database entries, re-creating 14-tier fee structures, grade definitions, terms, subject mappings, departments, and permission policies. This manual process is prone to transcription errors, missing policies, and inconsistent tuition structures.

### The Finkfold Solution:
AWS CloudFormation and NetSuite Multi-Entity deployment wizard. Replicates complete school configurations from a golden template branch in **under 5 seconds**.

### Operational Workflow:
1. Navigate to **Section 0: Trust HQ Sovereignty** → **1-Click Campus Provisioning** (`/portal/admin/trust/provision-campus`).
2. **Step 1: Institutional Profile & Statutory Details**:
   - Enter Full Campus Name (e.g. *Finkfold International School - Gachibowli*).
   - Set Branch Code (e.g. `HYD-04`), City, Official Email, Address, and Bank Account/IFSC for localized payment processing.
3. **Step 2: Master Blueprint Inheritance & Policy Cloning**:
   - Select Source Blueprint Template (e.g. *Main Campus HYD-01 - Gold Standard CBSE*).
   - Verify auto-cloned configurations: 14-Tier Fee Structure, CBSE Grading Scales (A1 to E), Academic Terms, and RBAC Security Profiles.
4. **Step 3: Deploy Live**:
   - Click **"Deploy Live New Branch"**.
   - The system executes `provisionNewCampus()` in 3.4 seconds.
   - Deploys database schema, initializes campus metadata, and immediately binds the new campus into the **Global Branch Switcher** in the top navigation bar.

---

## 🛠️ Super Admin Server Actions Technical Reference

All Super Admin operations are executed through secure, role-verified server actions:

### Core Governance Actions ([`src/actions/superAdmin.ts`](file:///d:/KIRAN/KIRAN_PROJECTS/finkfold-school-portal/src/actions/superAdmin.ts))

| Action Function | Parameters | Operational Purpose |
| :--- | :--- | :--- |
| `grantChairmansWaiver` | `studentId, studentName, waiverReason` | Unlocks exam hall tickets on student portal; creates audit waiver record. |
| `unlockCashTill` | `drawerId, drawerDate, branchName, unlockReason` | Unlocks closed/verified cash drawer for correction; creates cryptographic audit code (`UNLOCK-XXXX-SA`). |
| `markSlaEscalationOwnership` | `tokenId, tokenCode` | Takes Super Admin ownership of breached SafeSpace grievance; stops emergency SLA timer. |
| `dispatchLessonPlanSlaWarning` | `teacherName, branchName, offenceCount` | Logs formal HR warning for 4:30 PM lesson plan sync non-compliance. |

### Enterprise Trust HQ Actions ([`src/actions/superAdminEnterprise.ts`](file:///d:/KIRAN/KIRAN_PROJECTS/finkfold-school-portal/src/actions/superAdminEnterprise.ts))

| Action Function | Parameters | Operational Purpose |
| :--- | :--- | :--- |
| `toggleGlobalPolicyLock` | `policyKey, isLocked` | Locks/unlocks fee structures, grading scales, or academic calendars across all branches. |
| `approvePolicyExceptionRequest`| `requestId, decision, notes` | Grants or rejects a branch Principal's localized policy discount exception. |
| `approveOverBudgetVoucher` | `voucherId, branchName, category, amount, notes` | Authorizes an expenditure voucher that exceeds a branch's allocated budget ceiling (`BUDGET-OVR-XXXX-SA`). |
| `awardProcurementBid` | `rfqId, vendorId, vendorName, itemDescription, winningBidAmount, totalSavings` | Awards bulk tender to L1 lowest bidder, generates digital PO (`PO-TRUST-XXXX`), and splits campus manifests. |
| `executeInterCampusTransfer` | `staffId, staffName, fromCampus, toCampus, effectiveDate, designation, transferReason` | Executes inter-campus staff relocation while preserving unified Trust ID, biometrics, leave balances, and appraisals. |
| `generateTrustStatutoryChallans`| `month, year, challanType` | Consolidates multi-campus payroll and generates EPFO ECR, TDS 24Q, or PT government return files. |
| `uploadAccreditationCertificate`| `campusName, documentType, validUntil, certNumber` | Commits renewed Fire Safety NOC, CBSE Affiliation, or Building Safety certificate to the legal vault. |
| `provisionNewCampus` | `formData (name, branchCode, city, address, phone, email, bankAccount, bankIfsc, cloneFromCampusId)` | Auto-provisions and replicates complete school configuration from blueprint in 3.4 seconds. |

---

## 📋 Best Practices & Enterprise Governance Checklist

1. **Daily 9:00 AM Routine**:
   - Check the **SafeSpace Escalation Inbox** on `/portal/admin/safespace` for any critical tokens that breached overnight.
   - Review the **Executive Overview** on `/portal/admin` for campus operational statuses.

2. **Daily 5:00 PM Routine**:
   - Inspect the **4:30 PM Lesson Plan SLA Heatmap** on the main dashboard; dispatch warnings to repeated violators.
   - Open **Centralized Treasury** (`/portal/admin/treasury`); verify that all 3 campus cash drawers are balancing with zero discrepancy.
   - Check the **Universal Budget & Burn-Rate Monitor** (`/portal/admin/trust/budgets`) for any hard-locked vouchers requiring emergency executive sign-off.

3. **Weekly Procurement & Compliance Audit**:
   - Review active tender submissions in **Bulk E-Procurement** (`/portal/admin/trust/procurement`); award ready L1 tenders.
   - Check the **Accreditation Vault** (`/portal/admin/trust/accreditation`) countdown timers for any licenses entering the 30-day red alert window.

4. **Monthly Statutory & Academic Readiness**:
   - On the 5th of each month, open **Global Statutory Consolidation** (`/portal/admin/trust/statutory`) and download the consolidated EPF ECR and PT returns before the 15th statutory deadline.
   - Review the **Infrastructure & RTE Audit Matrix** (`/portal/admin/trust/infrastructure`) to ensure classroom densities and student-teacher ratios remain within legal thresholds.
   - Before Board of Directors sessions, launch the **BoD Pitch Deck Generator** (`/portal/admin/hq-reporting`) to present real-time, consolidated multi-campus performance.

---

*Finkfold Educational Operating System (EdOS) — Engineered for Trust Sovereign Governance.*