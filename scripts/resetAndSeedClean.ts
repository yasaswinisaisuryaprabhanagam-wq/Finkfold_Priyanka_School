import * as fs from "fs";
import * as path from "path";

// 1. Load .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...rest] = trimmed.split("=");
        const v = rest.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v;
        }
      }
    }
  }
} catch (e) {
  console.warn("Could not load .env.local:", e);
}

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Fixed Canonical IDs
const ORG_ID = "a0000000-0000-4000-a000-000000000001";
const MAIN_CAMPUS_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"; // Matches SCHOOL.id in school-config.ts
const LEGACY_CAMPUS_ID = "b30d9655-1701-4cc0-9c59-8812324eb396"; // Anchor for auth trigger
const NORTH_CAMPUS_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const EAST_CAMPUS_ID = "c3d4e5f6-a7b8-9012-cdef-123456789012";
const TECH_CAMPUS_ID = "d4e5f6a7-b8c9-0123-defa-234567890123";
const ACADEMIC_YEAR_ID = "e5f6a7b8-c9d0-1234-ef01-234567890123";

// Standard Passwords
const SUPERADMIN_PASS = "SuperAdmin@123";
const ADMIN_PASS = "Admin@123";
const TEACHER_PASS = "Teacher@123";
const STUDENT_PASS = "Student@123";

// Cache existing users to avoid redundant queries
let existingAuthUsers: any[] = [];

async function refreshAuthUsers() {
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  existingAuthUsers = data?.users || [];
}

async function createAuthUser(email: string, pass: string, name: string, role: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = existingAuthUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: pass,
      user_metadata: { full_name: name, role },
    });
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: pass,
    email_confirm: true,
    user_metadata: { full_name: name, role },
  });

  if (error) {
    console.error(`Failed to create auth user ${normalizedEmail}:`, error.message);
    return null;
  }
  return data.user.id;
}

async function main() {
  console.log("=================================================");
  console.log("FINKFOLD ERP - MASTER CLEAN RESET & MULTI-BRANCH RE-SEED");
  console.log("=================================================");

  // ─────────────────────────────────────────────────────────────
  // STEP 1: TRUNCATE ALL TRANSACTIONAL & OPERATIONAL TABLES
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 1] Wiping all existing table data cleanly...");

  const tablesToWipe = [
    // Enterprise & Trust tables
    "cash_drawer_unlock_logs", "chairmans_fee_waivers", "campus_provisioning_logs",
    "rte_remediation_plans", "campus_infrastructure_audits", "accreditation_vault_documents",
    "trust_statutory_campus_breakdown", "trust_statutory_returns", "inter_campus_transfers",
    "staff_unified_profiles", "trust_bulk_purchase_orders", "procurement_blind_bids",
    "trust_procurement_rfqs", "over_budget_vouchers", "trust_department_budgets",
    "board_meeting_packets", "policy_exception_requests", "trust_master_policies",

    // Admin & Operational tables
    "alumni_donations", "endowment_campaigns", "alumni_profiles", "staff_monthly_payslips",
    "monthly_payroll_runs", "staff_salary_structures", "board_loc_candidates",
    "class_timetable_slots", "timetable_constraints", "visitor_passes", "fee_defaulter_logs",
    "fee_late_penalty_rules", "library_loans", "library_books", "generated_admin_certificates",
    "certificate_templates", "omnichannel_broadcasts", "obe_student_attainments",
    "obe_learning_outcomes", "faculty_appraisal_dossiers", "recruitment_applicants",
    "recruitment_job_openings", "rfid_turnstile_logs", "fleet_vehicles", "store_purchase_orders",
    "store_inventory", "bank_reconciliation_records", "admissions_leads", "field_trip_manifests",
    "faculty_relief_allocations", "student_group_projects", "campus_maintenance_tickets",
    "store_indent_requisitions", "staff_biometric_punches", "sen_student_profiles",
    "classroom_seating_layouts", "student_essay_submissions", "curriculum_unit_plans",
    "staff_leaves", "student_exam_marks", "student_bank_refund_profiles", "student_leaves_and_od",
    "student_id_photo_submissions", "external_achievements_dropbox", "student_digital_certificates",
    "ptm_booking_slots", "regulated_teacher_messages", "student_conduct_ledger",
    "anonymous_grievance_reports", "lost_and_found_items", "infirmary_visit_logs",
    "student_medical_records", "support_tickets", "digital_outpasses", "student_elective_bids",
    "campus_store_orders", "student_transport_subscriptions", "fee_transactions", "cash_drawers",
    "fee_structures", "student_enrollments", "parent_reply_log", "whatsapp_notifications",
    "attendance_records", "attendance_sessions", "student_promotions", "pending_admissions",
    "student_homework_verifications", "homework", "circulars",

    // Core Foundation
    "teacher_classes", "students", "classes", "subjects", "academic_years",
    "profiles", "schools", "organizations"
  ];

  for (const t of tablesToWipe) {
    try {
      await supabase.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}
  }
  console.log("✓ Operational tables cleared.");

  // ─────────────────────────────────────────────────────────────
  // STEP 2: SEED 1 ORGANIZATION & 4 DISTINCT CAMPUSES (+ ANCHOR)
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 2] Seeding Trust Organization & 4 Distinct Campuses...");

  await supabase.from("organizations").upsert({
    id: ORG_ID,
    name: "Finkfold Educational Trust",
    code: "FINKFOLD-TRUST",
    currency: "INR",
  });

  const campuses = [
    {
      id: MAIN_CAMPUS_ID,
      organization_id: ORG_ID,
      name: "Priyanka English Medium School (Main Campus)",
      slug: "priyanka-em-school",
      branch_code: "CAMPUS-MAIN",
      address: "Fathekhan Pet Main Road, Santhi Nagar",
      city: "Nellore",
      state: "Andhra Pradesh",
      pincode: "524003",
      phone: "+91 9440266743",
      email: "main.campus@priyanka.school",
      primary_color: "#123B6D",
      is_active: true,
    },
    {
      id: LEGACY_CAMPUS_ID,
      organization_id: ORG_ID,
      name: "Priyanka English Medium School (Anchor)",
      slug: "priyanka-em-school-anchor",
      branch_code: "CAMPUS-ANCHOR",
      address: "Fathekhan Pet, Nellore",
      city: "Nellore",
      state: "Andhra Pradesh",
      pincode: "524003",
      phone: "+91 9440266743",
      email: "anchor@priyanka.school",
      primary_color: "#123B6D",
      is_active: true,
    },
    {
      id: NORTH_CAMPUS_ID,
      organization_id: ORG_ID,
      name: "Priyanka Global Academy (North Campus)",
      slug: "priyanka-global-north",
      branch_code: "CAMPUS-NORTH",
      address: "Podalakur Road, Ramamurthy Nagar",
      city: "Nellore",
      state: "Andhra Pradesh",
      pincode: "524004",
      phone: "+91 9440266744",
      email: "north.campus@priyanka.school",
      primary_color: "#0D9488",
      is_active: true,
    },
    {
      id: EAST_CAMPUS_ID,
      organization_id: ORG_ID,
      name: "Priyanka World School (East Campus)",
      slug: "priyanka-world-east",
      branch_code: "CAMPUS-EAST",
      address: "Muthukur Road, Allipuram",
      city: "Nellore",
      state: "Andhra Pradesh",
      pincode: "524002",
      phone: "+91 9440266745",
      email: "east.campus@priyanka.school",
      primary_color: "#7C3AED",
      is_active: true,
    },
    {
      id: TECH_CAMPUS_ID,
      organization_id: ORG_ID,
      name: "Priyanka STEM International (Tech Campus)",
      slug: "priyanka-stem-south",
      branch_code: "CAMPUS-TECH",
      address: "Magunta Layout, South Bypass",
      city: "Nellore",
      state: "Andhra Pradesh",
      pincode: "524005",
      phone: "+91 9440266746",
      email: "tech.campus@priyanka.school",
      primary_color: "#C026D3",
      is_active: true,
    },
  ];

  await supabase.from("schools").upsert(campuses);
  console.log("✓ 4 Campuses created (Main, North, East, Tech) + Anchor.");

  // ─────────────────────────────────────────────────────────────
  // STEP 3: SEED ACADEMIC YEAR & SUBJECTS
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 3] Seeding Academic Year & Core Subjects...");
  await supabase.from("academic_years").upsert({
    id: ACADEMIC_YEAR_ID,
    school_id: MAIN_CAMPUS_ID,
    name: "2026-2027",
    start_date: "2026-06-01",
    end_date: "2027-04-30",
    is_current: true,
  });

  // Also seed anchor Class 10-A to ensure auth trigger never encounters null
  await supabase.from("classes").upsert({
    school_id: LEGACY_CAMPUS_ID,
    name: "10",
    section: "A",
    academic_year: "2026-2027",
  });

  const subjects = [
    { school_id: MAIN_CAMPUS_ID, name: "Mathematics", code: "MATH", type: "theory" },
    { school_id: MAIN_CAMPUS_ID, name: "Science", code: "SCI", type: "theory" },
    { school_id: MAIN_CAMPUS_ID, name: "English", code: "ENG", type: "language" },
    { school_id: MAIN_CAMPUS_ID, name: "Social Studies", code: "SOC", type: "theory" },
    { school_id: MAIN_CAMPUS_ID, name: "Telugu", code: "TEL", type: "language" },
    { school_id: MAIN_CAMPUS_ID, name: "Hindi", code: "HIN", type: "language" },
    { school_id: MAIN_CAMPUS_ID, name: "Computer Science", code: "CS", type: "practical" },
  ];
  const { data: createdSubjects } = await supabase.from("subjects").upsert(subjects, { onConflict: "school_id,name" }).select();
  const mathSubjectId = createdSubjects?.find((s) => s.name === "Mathematics")?.id;
  const scienceSubjectId = createdSubjects?.find((s) => s.name === "Science")?.id;

  // ─────────────────────────────────────────────────────────────
  // STEP 4: SEED 13 CLASSES (Play-A to 10-A) FOR MAIN CAMPUS
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 4] Seeding 13 Classes for Main Campus...");
  const classNames = ["Play", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const classRows = classNames.map((name) => ({
    school_id: MAIN_CAMPUS_ID,
    name: name,
    section: "A",
    academic_year: "2026-2027",
  }));

  const { data: createdClasses, error: classErr } = await supabase
    .from("classes")
    .upsert(classRows, { onConflict: "school_id,name,section" })
    .select();

  if (classErr) console.error("Error creating classes:", classErr);
  console.log(`✓ ${createdClasses?.length || 0} Classes successfully created.`);

  // Load active auth users once to optimize API calls
  await refreshAuthUsers();

  // ─────────────────────────────────────────────────────────────
  // STEP 5: SEED SEPARATED SUPER ADMIN & SCHOOL ADMINS
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 5] Creating Separated Super Admin & School Admin Accounts...");

  // 5A: SUPER ADMIN (HQ Level)
  const superAdminUid = await createAuthUser(
    "superadmin@finkfold.school",
    SUPERADMIN_PASS,
    "Dr. K. V. Rao (Trust Chairman & CEO)",
    "super_admin"
  );
  if (superAdminUid) {
    await supabase.from("profiles").upsert({
      id: superAdminUid,
      organization_id: ORG_ID,
      school_id: MAIN_CAMPUS_ID,
      full_name: "Dr. K. V. Rao (Trust Chairman & CEO)",
      role: "super_admin",
      roles: ["super_admin"],
      primary_role: "super_admin",
      phone: "+91 9848011220",
    });
    console.log("  ★ SUPER ADMIN: superadmin@finkfold.school / SuperAdmin@123");
  }

  // 5B: SCHOOL ADMINS (One for each Campus)
  const schoolAdmins = [
    {
      email: "admin@priyanka.school",
      name: "S. Ramanathan (Principal - Main Campus)",
      schoolId: MAIN_CAMPUS_ID,
      phone: "+91 9440266743",
    },
    {
      email: "principal.north@priyanka.school",
      name: "M. Anuradha (Principal - North Campus)",
      schoolId: NORTH_CAMPUS_ID,
      phone: "+91 9440266744",
    },
    {
      email: "principal.east@priyanka.school",
      name: "Dr. K. Srinivas (Principal - East Campus)",
      schoolId: EAST_CAMPUS_ID,
      phone: "+91 9440266745",
    },
    {
      email: "principal.tech@priyanka.school",
      name: "T. Vikram (Principal - Tech Campus)",
      schoolId: TECH_CAMPUS_ID,
      phone: "+91 9440266746",
    },
  ];

  for (const sa of schoolAdmins) {
    const uid = await createAuthUser(sa.email, ADMIN_PASS, sa.name, "school_admin");
    if (uid) {
      await supabase.from("profiles").upsert({
        id: uid,
        organization_id: ORG_ID,
        school_id: sa.schoolId,
        full_name: sa.name,
        role: "school_admin",
        roles: ["school_admin"],
        primary_role: "school_admin",
        phone: sa.phone,
      });
      console.log(`  ✓ SCHOOL ADMIN: ${sa.email} / ${ADMIN_PASS} (${sa.name})`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 6: SEED 13 TEACHERS (1 for each class)
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 6] Creating 13 Class Teachers (1 per class)...");

  const teacherDefs = [
    { classKey: "Play", name: "Sunitha Devi", email: "teacher.play@priyanka.school", subject: "Early Years" },
    { classKey: "LKG",  name: "Anitha Kumari", email: "teacher.lkg@priyanka.school",  subject: "Phonics & Arts" },
    { classKey: "UKG",  name: "Vasantha Laxmi", email: "teacher.ukg@priyanka.school",  subject: "General Awareness" },
    { classKey: "1",    name: "Sreenivas Rao", email: "teacher.1a@priyanka.school",   subject: "Mathematics" },
    { classKey: "2",    name: "K. Meenakshi",  email: "teacher.2a@priyanka.school",   subject: "English" },
    { classKey: "3",    name: "R. Venkatesh",  email: "teacher.3a@priyanka.school",   subject: "Science" },
    { classKey: "4",    name: "M. Radhika",    email: "teacher.4a@priyanka.school",   subject: "Social Studies" },
    { classKey: "5",    name: "P. Suresh",     email: "teacher.5a@priyanka.school",   subject: "Hindi" },
    { classKey: "6",    name: "T. Aparna",     email: "teacher.6a@priyanka.school",   subject: "Telugu" },
    { classKey: "7",    name: "N. Rajesh",     email: "teacher.7a@priyanka.school",   subject: "Computer Science" },
    { classKey: "8",    name: "D. Sandhya",    email: "teacher.8a@priyanka.school",   subject: "Physical Science" },
    { classKey: "9",    name: "C. Harish",     email: "teacher.9a@priyanka.school",   subject: "Chemistry & Maths" },
    { classKey: "10",   name: "G. Madhavi",    email: "teacher.10a@priyanka.school",  subject: "Biology & Science" },
  ];

  const teacherProfiles: any[] = [];
  for (const t of teacherDefs) {
    const uid = await createAuthUser(t.email, TEACHER_PASS, t.name, "teacher");
    if (uid) {
      await supabase.from("profiles").upsert({
        id: uid,
        organization_id: ORG_ID,
        school_id: MAIN_CAMPUS_ID,
        full_name: t.name,
        role: "teacher",
        roles: ["teacher"],
        primary_role: "teacher",
        phone: "+91 91000000" + String(teacherProfiles.length + 1).padStart(2, "0"),
      });

      const targetClass = createdClasses?.find((c) => c.name === t.classKey);
      if (targetClass) {
        await supabase.from("teacher_classes").upsert(
          {
            teacher_id: uid,
            class_id: targetClass.id,
          },
          { onConflict: "teacher_id,class_id" }
        );
      }
      teacherProfiles.push({ id: uid, ...t, classId: targetClass?.id });
      console.log(`  ✓ TEACHER: ${t.email} / ${TEACHER_PASS} -> Class ${t.classKey}-A`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 7: SEED EXACTLY 10 STUDENTS PER CLASS (13 x 10 = 130)
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 7] Seeding Exactly 10 Students per Class (130 Students Total)...");

  const firstNames = ["Aarav", "Ananya", "Kiran", "Yasaswini", "Sai", "Pooja", "Vikram", "Sneha", "Rahul", "Divya"];
  const lastNames = ["Rao", "Sharma", "Reddy", "Verma", "Patel", "Naidu", "Chowdary", "Gupta", "Nair", "Iyer"];

  let studentCount = 0;
  const createdStudentRows: any[] = [];

  for (let cIdx = 0; cIdx < classNames.length; cIdx++) {
    const cName = classNames[cIdx];
    const targetClass = createdClasses?.find((c) => c.name === cName);
    if (!targetClass) continue;

    for (let sIdx = 1; sIdx <= 10; sIdx++) {
      studentCount++;
      const admissionNo = `PRIY-2026-${String(studentCount).padStart(3, "0")}`;
      const fullName = `${firstNames[sIdx - 1]} ${lastNames[(cIdx + sIdx) % 10]}`;
      const parentName = `Mr. & Mrs. ${lastNames[(cIdx + sIdx) % 10]}`;
      const parentPhone = `+91 98480${String(studentCount).padStart(5, "0")}`;
      const studentEmail = `${admissionNo.toLowerCase().replace(/-/g, ".")}@priyanka.school`;

      // 1. Create auth user for student
      const uid = await createAuthUser(studentEmail, STUDENT_PASS, fullName, "student");

      // 2. Insert into students table
      const { data: sRow } = await supabase
        .from("students")
        .upsert(
          {
            school_id: MAIN_CAMPUS_ID,
            class_id: targetClass.id,
            admission_no: admissionNo,
            full_name: fullName,
            roll_no: sIdx,
            parent_name: parentName,
            parent_phone: parentPhone,
            is_active: true,
            consent_whatsapp: true,
            parent_phone_verified: true,
          },
          { onConflict: "admission_no" }
        )
        .select()
        .single();

      if (sRow) {
        createdStudentRows.push(sRow);

        // 3. Update profile row to link correctly
        if (uid) {
          await supabase.from("profiles").upsert({
            id: uid,
            school_id: MAIN_CAMPUS_ID,
            organization_id: ORG_ID,
            full_name: fullName,
            role: "student",
            roles: ["student", "parent"],
            primary_role: "student",
            phone: parentPhone,
          });
        }

        // Student Enrollment
        await supabase.from("student_enrollments").upsert(
          {
            school_id: MAIN_CAMPUS_ID,
            student_id: sRow.id,
            class_id: targetClass.id,
            academic_year_id: ACADEMIC_YEAR_ID,
            roll_number: sIdx,
            status: "active",
          }
        );
      }
    }
  }

  // Also create demo shorthand student account: student@priyanka.school / Student@123
  const demoUid = await createAuthUser("student@priyanka.school", STUDENT_PASS, "Demo Student", "student");
  if (demoUid && createdStudentRows[0]) {
    await supabase.from("profiles").upsert({
      id: demoUid,
      school_id: MAIN_CAMPUS_ID,
      organization_id: ORG_ID,
      full_name: "Yasaswini Prabha (Demo Student)",
      role: "student",
      roles: ["student", "parent"],
      primary_role: "student",
      phone: "+91 9848000001",
    });
  }
  console.log(`✓ ${createdStudentRows.length} Students seeded across 13 classes (10 per class).`);

  // ─────────────────────────────────────────────────────────────
  // STEP 8: SEED REAL DATA FOR ALL MODULES & FUNCTIONALITIES
  // ─────────────────────────────────────────────────────────────
  console.log("\n[Step 8] Seeding High-Fidelity Data for ALL Feature Modules...");

  // 8A. TRUST MASTER POLICIES
  console.log("  -> Trust Master Policies & Global Locks");
  const policies = [
    {
      organization_id: ORG_ID,
      policy_code: "POL-FEE-2026-01",
      policy_name: "Class 10 Standard Annual Tuition Fee",
      category: "fee_structure",
      global_lock: true,
      policy_value: { annual_tuition: 45000, term_split: [18000, 15000, 12000] },
      notes: "Strictly locked by Trust HQ Board Resolution 2026/A1.",
    },
    {
      organization_id: ORG_ID,
      policy_code: "POL-ACAD-2026-02",
      policy_name: "CBSE Standard Grading Scale & Assessment Blueprint",
      category: "grading_scale",
      global_lock: true,
      policy_value: { scale: "10-point", pass_percentage: 35, internal_weightage: 20 },
      notes: "Standardized across all trust branches.",
    },
    {
      organization_id: ORG_ID,
      policy_code: "POL-UNIF-2026-03",
      policy_name: "Universal Student Uniform & Kit Pricing",
      category: "uniform_pricing",
      global_lock: true,
      policy_value: { primary_set: 1800, secondary_set: 2400, sports_kit: 950 },
      notes: "Direct procurement price ceiling.",
    },
    {
      organization_id: ORG_ID,
      policy_code: "POL-HR-2026-04",
      policy_name: "Faculty 7th Pay Commission Base Band Matrix",
      category: "staff_payroll",
      global_lock: true,
      policy_value: { PRT_base: 28000, TGT_base: 36000, PGT_base: 45000 },
      notes: "Mandatory statutory wage protection.",
    },
  ];
  await supabase.from("trust_master_policies").upsert(policies, { onConflict: "policy_code" });

  // 8B. PENDING POLICY EXCEPTION REQUEST
  console.log("  -> Branch Policy Exception Requests");
  await supabase.from("policy_exception_requests").upsert({
    request_number: "EXC-2026-001",
    organization_id: ORG_ID,
    branch_id: NORTH_CAMPUS_ID,
    policy_id: null,
    target_entity: "Tuition Fee - Grade 1",
    requested_value: { discount_percentage: 10, proposed_fee: 31500 },
    reason: "New residential township expansion drive - offering 10% localized early bird discount.",
    status: "pending",
  });

  // 8C. BOARD MEETING PACKET
  console.log("  -> Board Meeting Packets");
  await supabase.from("board_meeting_packets").upsert({
    organization_id: ORG_ID,
    meeting_title: "BoD Annual Strategy & Fiscal Review - Q3 FY2026",
    fiscal_quarter: "Q3",
    fiscal_year: "2026-2027",
    metrics_snapshot: {
      total_campuses: 4,
      total_enrolled_students: 520,
      fee_collection_efficiency: "94.2%",
      ebitda_margin: "28.5%",
      cbse_academic_health_index: "9.1/10",
      compliance_readiness_score: "100%",
    },
    status: "finalized",
  });

  // 8D. TRUST DEPARTMENT BUDGETS & OVER-BUDGET VOUCHERS
  console.log("  -> Department Budgets & Vouchers");
  await supabase.from("trust_department_budgets").upsert([
    {
      organization_id: ORG_ID,
      campus_id: MAIN_CAMPUS_ID,
      department: "Science Laboratories",
      fiscal_year: "2026-2027",
      allocated_amount: 350000,
      spent_amount: 310000,
      committed_amount: 25000,
      is_locked: false,
    },
    {
      organization_id: ORG_ID,
      campus_id: MAIN_CAMPUS_ID,
      department: "Sports & Athletics Infrastructure",
      fiscal_year: "2026-2027",
      allocated_amount: 200000,
      spent_amount: 215000, // OVER BUDGET!
      committed_amount: 10000,
      is_locked: true,
    },
    {
      organization_id: ORG_ID,
      campus_id: NORTH_CAMPUS_ID,
      department: "IT & Robotics Lab",
      fiscal_year: "2026-2027",
      allocated_amount: 500000,
      spent_amount: 240000,
      committed_amount: 40000,
      is_locked: false,
    },
  ]);

  await supabase.from("over_budget_vouchers").upsert({
    voucher_number: "OBV-2026-004",
    organization_id: ORG_ID,
    campus_id: MAIN_CAMPUS_ID,
    department: "Sports & Athletics Infrastructure",
    requested_amount: 25000,
    justification: "Emergency replacement of athletic hurdles & high-jump foam mats before District Meet.",
    approval_status: "pending",
  });

  // 8E. BULK PROCUREMENT RFQS & BLIND VENDOR BIDS
  console.log("  -> Bulk Procurement RFQ & Sealed Bids");
  const { data: rfqRow } = await supabase
    .from("trust_procurement_rfqs")
    .upsert({
      rfq_number: "RFQ-TRUST-2026-001",
      organization_id: ORG_ID,
      item_title: "Universal School Uniforms & Blazers (All 4 Campuses)",
      category: "uniforms",
      specification: "Navy blue poly-viscose blend, embroidered trust crest, pre-shrunk, sizes 24 to 40.",
      total_quantity: 4000,
      bidding_deadline: "2026-10-15T18:00:00Z",
      status: "bidding_open",
    })
    .select()
    .single();

  if (rfqRow) {
    await supabase.from("procurement_blind_bids").upsert([
      {
        rfq_id: rfqRow.id,
        vendor_name: "Apex TexFab India Ltd",
        quoted_unit_price: 620,
        total_bid_amount: 2480000,
        is_sealed: true,
        bid_hash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      },
      {
        rfq_id: rfqRow.id,
        vendor_name: "Nellore Weaver's Consortium",
        quoted_unit_price: 590,
        total_bid_amount: 2360000,
        is_sealed: true,
        bid_hash: "SHA256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      },
    ]);
  }

  // 8F. STAFF MOBILITY & DEPUTATION
  console.log("  -> Staff Unified Mobility");
  const sreenivasId = teacherProfiles.find((t) => t.name === "Sreenivas Rao")?.id;
  if (sreenivasId) {
    await supabase.from("staff_unified_profiles").upsert({
      staff_id: sreenivasId,
      organization_id: ORG_ID,
      primary_campus_id: MAIN_CAMPUS_ID,
      employee_code: "FAC-MAIN-001",
      full_name: "Sreenivas Rao",
      designation: "Senior Mathematics Specialist",
      specialization: "Olympiad & Vedic Maths",
      is_inter_campus_deputed: true,
    });

    await supabase.from("inter_campus_transfers").upsert({
      staff_id: sreenivasId,
      organization_id: ORG_ID,
      source_campus_id: MAIN_CAMPUS_ID,
      destination_campus_id: NORTH_CAMPUS_ID,
      transfer_type: "dual_cross_deputation",
      effective_date: "2026-06-01",
      status: "active",
      gratuity_balance_carried: 145000,
      annual_leave_balance_carried: 14,
    });
  }

  // 8G. ACCREDITATION VAULT & INFRASTRUCTURE AUDITS
  console.log("  -> Accreditation Vault & Infrastructure");
  await supabase.from("accreditation_vault_documents").upsert([
    {
      campus_id: MAIN_CAMPUS_ID,
      affiliation_board: "CBSE",
      affiliation_number: "CBSE-AFF-281925",
      document_category: "affiliation_letter",
      title: "CBSE Senior Secondary Provisional Affiliation Order 2026-2029",
      valid_from: "2026-04-01",
      valid_until: "2029-03-31",
      compliance_status: "valid",
    },
    {
      campus_id: MAIN_CAMPUS_ID,
      affiliation_board: "State Board AP",
      affiliation_number: "AP-NOC-2024-89",
      document_category: "fire_safety_noc",
      title: "State Fire & Emergency Services No-Objection Certificate",
      valid_from: "2025-01-01",
      valid_until: "2027-12-31",
      compliance_status: "valid",
    },
  ]);

  await supabase.from("campus_infrastructure_audits").upsert({
    campus_id: MAIN_CAMPUS_ID,
    audit_date: "2026-08-15",
    pupil_teacher_ratio: 18.5,
    cctv_coverage_percentage: 96.0,
    has_separate_girls_cwsn_toilet: true,
    has_ramps_and_handrails: true,
    fire_extinguisher_status: "certified_refilled",
    overall_rte_rating: "A_GRADE",
    audited_by: "District Educational Quality Inspectorate",
  });

  // 8H. STATUTORY CONSOLIDATION
  console.log("  -> Statutory & Tax Consolidation");
  await supabase.from("trust_statutory_returns").upsert({
    organization_id: ORG_ID,
    financial_year: "2025-2026",
    statutory_type: "EPF",
    filing_period: "August 2026",
    total_tax_liability: 384500,
    total_deposited: 384500,
    filing_status: "filed",
    challan_reference: "EPF-CHAL-HYD-20260819",
  });

  // 8I. CASH DRAWER & DAILY TREASURY
  console.log("  -> Cash Drawer Till & Fee Transactions");
  const adminProfile = await supabase.from("profiles").select("id").eq("role", "school_admin").limit(1).single();
  const cashierId = adminProfile.data?.id;

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (cashierId) {
    await supabase.from("cash_drawers").upsert({
      school_id: MAIN_CAMPUS_ID,
      cashier_id: cashierId,
      session_date: todayStr,
      opening_float: 2000.0,
      total_cash_collected: 4500.0,
      is_closed: false,
    });
  }

  // A couple of initial fee receipts
  const student1 = createdStudentRows[0];
  const student2 = createdStudentRows[1];
  if (student1 && student2 && cashierId) {
    await supabase.from("fee_transactions").upsert([
      {
        school_id: MAIN_CAMPUS_ID,
        student_id: student1.id,
        receipt_no: "REC-2026-0001",
        amount_paid: 2500,
        payment_mode: "cash",
        cashier_id: cashierId,
        remarks: "Term 1 Tuition Advance",
      },
      {
        school_id: MAIN_CAMPUS_ID,
        student_id: student2.id,
        receipt_no: "REC-2026-0002",
        amount_paid: 2000,
        payment_mode: "upi",
        cashier_id: cashierId,
        remarks: "Term 1 Transport Fee",
      },
    ]);
  }

  // 8J. CURRICULUM & NEXT-DAY LESSON PLANS
  console.log("  -> Next-Day Curriculum Lesson Plans");
  const class1 = createdClasses?.find((c) => c.name === "1");
  const class10 = createdClasses?.find((c) => c.name === "10");
  const teacher1 = teacherProfiles.find((t) => t.classKey === "1");
  const teacher10 = teacherProfiles.find((t) => t.classKey === "10");

  if (class1 && teacher1) {
    await supabase.from("curriculum_unit_plans").upsert({
      school_id: MAIN_CAMPUS_ID,
      class_id: class1.id,
      subject_id: mathSubjectId,
      teacher_id: teacher1.id,
      plan_date: tomorrowStr,
      topic_title: "Addition of 2-Digit Numbers with Carrying",
      materials_required: "Maths Square Notebook (100 pgs), Abacus Tool, Sharp Pencil & Eraser",
      submission_status: "approved",
    });
  }

  if (class10 && teacher10) {
    await supabase.from("curriculum_unit_plans").upsert({
      school_id: MAIN_CAMPUS_ID,
      class_id: class10.id,
      subject_id: scienceSubjectId,
      teacher_id: teacher10.id,
      plan_date: tomorrowStr,
      topic_title: "Life Processes: Respiration & Photosynthesis in Plants",
      materials_required: "NCERT Class 10 Biology Part 1, Practical Observation Record, Colored Pencils",
      submission_status: "submitted",
    });
  }

  // 8K. ATTENDANCE SESSION FOR TODAY
  console.log("  -> Today's Attendance Sessions");
  if (class1 && teacher1) {
    const { data: attSession } = await supabase
      .from("attendance_sessions")
      .upsert({
        school_id: MAIN_CAMPUS_ID,
        class_id: class1.id,
        attendance_date: todayStr,
        marked_by: teacher1.id,
      })
      .select()
      .single();

    if (attSession) {
      const class1Students = createdStudentRows.filter((s) => s.class_id === class1.id);
      for (let i = 0; i < class1Students.length; i++) {
        const status = i === 1 ? "absent" : i === 2 ? "absent" : "present";
        await supabase.from("attendance_records").upsert({
          session_id: attSession.id,
          student_id: class1Students[i].id,
          status,
          remarks: status === "absent" ? "Uninformed Morning Absence" : "Present in Class",
        });

        if (status === "absent") {
          await supabase.from("whatsapp_notifications").upsert({
            school_id: MAIN_CAMPUS_ID,
            student_id: class1Students[i].id,
            recipient_phone: class1Students[i].parent_phone,
            message_type: "attendance_absent",
            message_body: `Dear Parent, your child ${class1Students[i].full_name} was marked ABSENT today (${todayStr}) in Class 1-A roll call. Kindly reply if sick.`,
            status: "sent",
          });
        }
      }
    }
  }

  // 8L. STUDENT CONDUCT LEDGER & DEMERIT E-SIGN
  console.log("  -> Student Conduct Ledger & Demerits");
  if (student1) {
    await supabase.from("student_conduct_ledger").upsert({
      school_id: MAIN_CAMPUS_ID,
      student_id: student1.id,
      violation_title: "Missing Required Science Practical Record",
      demerit_points: 2,
      incident_date: todayStr,
      requires_parent_signature: true,
      parent_signed: false, // Ready for Parent Portal E-Sign Testing!
      remarks: "Student forgot practical record book for the second time this week.",
    });
  }

  // 8M. SAFESPACE ANONYMOUS GRIEVANCE
  console.log("  -> SafeSpace Anonymous Grievance Desk");
  await supabase.from("anonymous_grievance_reports").upsert({
    school_id: MAIN_CAMPUS_ID,
    tracking_hash: "SAFE-2026-7821",
    category: "Restroom Cleanliness & Hygiene",
    description: "Third floor primary block water dispenser was leaking and restroom latch is broken.",
    severity: "medium",
    status: "submitted",
    action_notes: null,
    acknowledged_within_sla: false,
  });

  // 8N. ADMISSIONS CRM LEADS
  console.log("  -> Admissions CRM Leads");
  await supabase.from("admissions_leads").upsert([
    {
      school_id: MAIN_CAMPUS_ID,
      parent_name: "Venkat Rao",
      phone: "+91 9988776655",
      child_name: "Sai Teja",
      grade_interested: "Class 1",
      lead_status: "new",
      notes: "Enquired via school website banner.",
    },
    {
      school_id: MAIN_CAMPUS_ID,
      parent_name: "Geetha Kumari",
      phone: "+91 9988776656",
      child_name: "Sneha Reddy",
      grade_interested: "Class 6",
      lead_status: "entrance_scheduled",
      notes: "Written diagnostic assessment booked for Saturday 10:00 AM.",
    },
  ]);

  // 8O. CAMPUS STORE PRE-ORDER & PICKUP QR
  console.log("  -> Campus Store Order");
  if (student1) {
    await supabase.from("campus_store_orders").upsert({
      school_id: MAIN_CAMPUS_ID,
      student_id: student1.id,
      order_number: "ORD-2026-901",
      items: [{ item_name: "Standard School Tie & Belt Set", quantity: 1, unit_price: 350 }],
      total_amount: 350,
      payment_status: "paid_at_counter",
      fulfillment_status: "ready_for_pickup",
      pickup_qr_code: "QR:ORD-2026-901-PICKUP",
    });
  }

  // 8P. STUDENT LEAVE / OUTPASS
  console.log("  -> Student Leave & Digital Outpass");
  if (student2) {
    await supabase.from("student_leaves_and_od").upsert({
      school_id: MAIN_CAMPUS_ID,
      student_id: student2.id,
      leave_type: "medical",
      start_date: todayStr,
      end_date: tomorrowStr,
      reason: "Viral fever and doctor consultation",
      status: "pending",
    });
  }

  console.log("\n=================================================");
  console.log("🎉 MASTER RESET & MULTI-BRANCH RE-SEED COMPLETE!");
  console.log("=================================================");
  console.log("\nLOGIN CREDENTIALS DIRECTORY:");
  console.log("-------------------------------------------------");
  console.log("★ SUPER ADMIN (Trust HQ):");
  console.log("   Email:    superadmin@finkfold.school");
  console.log("   Password: SuperAdmin@123");
  console.log("   Role:     super_admin");
  console.log("   Scope:    All 4 Campuses + Sovereign Trust Tools");
  console.log("");
  console.log("★ SCHOOL ADMINS (Principals):");
  console.log("   Main Campus:   admin@priyanka.school / Admin@123");
  console.log("   North Campus:  principal.north@priyanka.school / Admin@123");
  console.log("   East Campus:   principal.east@priyanka.school / Admin@123");
  console.log("   Tech Campus:   principal.tech@priyanka.school / Admin@123");
  console.log("");
  console.log("★ CLASS TEACHERS (13 Total - 1 per Class):");
  console.log("   Class 1-A:  teacher.1a@priyanka.school / Teacher@123 (Sreenivas Rao)");
  console.log("   Class 10-A: teacher.10a@priyanka.school / Teacher@123 (G. Madhavi)");
  console.log("   All others: teacher.{class}@priyanka.school / Teacher@123");
  console.log("");
  console.log("★ STUDENTS & PARENTS (130 Total - 10 per Class):");
  console.log("   Class Play-A: PRIY-2026-001 to PRIY-2026-010");
  console.log("   Class 1-A:    PRIY-2026-031 to PRIY-2026-040");
  console.log("   Class 10-A:   PRIY-2026-121 to PRIY-2026-130");
  console.log("   Password:     Student@123");
  console.log("   Demo Short:   student / Student@123");
  console.log("=================================================");
}

main().catch(console.error);
