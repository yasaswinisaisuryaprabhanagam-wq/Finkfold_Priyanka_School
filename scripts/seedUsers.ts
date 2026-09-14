/**
 * Finkfold ERP - Auth User Seeder
 * Creates Supabase Auth accounts for:
 *   - 1 Admin (Principal)
 *   - 30 Teachers (with class assignments)
 *   - 350 Parents (linked by phone to students)
 *
 * Run AFTER 003a_add_parent_role.sql and 003_seed.sql in Supabase SQL editor.
 * Usage:  npx tsx scripts/seedUsers.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// -- Load .env.local -------------------------------------------------
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local not found");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SCHOOL_ID    = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TEACHER_PASS = "Teacher@123";
const PARENT_PASS  = "Parent@123";
const ADMIN_PASS   = "Admin@123";

// -- Class ID map ----------------------------------------------------
const C: Record<string, string> = {
  "Play-A": "c0000000-0000-0000-0000-000000000001",
  "LKG-A":  "c0000000-0000-0000-0000-000000000002",
  "LKG-B":  "c0000000-0000-0000-0000-000000000003",
  "UKG-A":  "c0000000-0000-0000-0000-000000000004",
  "UKG-B":  "c0000000-0000-0000-0000-000000000005",
  "1-A":    "c0000000-0000-0000-0000-000000000006",
  "1-B":    "c0000000-0000-0000-0000-000000000007",
  "1-C":    "c0000000-0000-0000-0000-000000000008",
  "2-A":    "c0000000-0000-0000-0000-000000000009",
  "2-B":    "c0000000-0000-0000-0000-000000000010",
  "2-C":    "c0000000-0000-0000-0000-000000000011",
  "3-A":    "c0000000-0000-0000-0000-000000000012",
  "3-B":    "c0000000-0000-0000-0000-000000000013",
  "3-C":    "c0000000-0000-0000-0000-000000000014",
  "4-A":    "c0000000-0000-0000-0000-000000000015",
  "4-B":    "c0000000-0000-0000-0000-000000000016",
  "4-C":    "c0000000-0000-0000-0000-000000000017",
  "5-A":    "c0000000-0000-0000-0000-000000000018",
  "5-B":    "c0000000-0000-0000-0000-000000000019",
  "5-C":    "c0000000-0000-0000-0000-000000000020",
  "6-A":    "c0000000-0000-0000-0000-000000000021",
  "6-B":    "c0000000-0000-0000-0000-000000000022",
  "6-C":    "c0000000-0000-0000-0000-000000000023",
  "7-A":    "c0000000-0000-0000-0000-000000000024",
  "7-B":    "c0000000-0000-0000-0000-000000000025",
  "7-C":    "c0000000-0000-0000-0000-000000000026",
  "8-A":    "c0000000-0000-0000-0000-000000000027",
  "8-B":    "c0000000-0000-0000-0000-000000000028",
  "8-C":    "c0000000-0000-0000-0000-000000000029",
  "9-A":    "c0000000-0000-0000-0000-000000000030",
  "9-B":    "c0000000-0000-0000-0000-000000000031",
  "9-C":    "c0000000-0000-0000-0000-000000000032",
  "10-A":   "c0000000-0000-0000-0000-000000000033",
  "10-B":   "c0000000-0000-0000-0000-000000000034",
  "10-C":   "c0000000-0000-0000-0000-000000000035",
};

// -- Teacher definitions ---------------------------------------------
// Each teacher maps to ONE row per class in teacher_classes.
// The DB PK is (teacher_id, class_id), so we must NOT have duplicates.
// subject = the main subject they teach in that class
// isClassTeacher = true if they are also the class teacher
type ClassAssignment = { classKey: string; subject: string; isClassTeacher: boolean };
type TeacherDef = {
  name: string;
  email: string;
  phone: string;
  empCode: string;
  assignments: ClassAssignment[];
};

const TEACHERS: TeacherDef[] = [
  // -- EARLY YEARS (5 teachers, 5 classes) --
  {
    name: "Sunitha Devi", email: "sunitha.devi@priyanka.school",
    phone: "+919100000001", empCode: "EY-001",
    assignments: [
      { classKey: "Play-A", subject: "General", isClassTeacher: true },
    ],
  },
  {
    name: "Anitha Kumari", email: "anitha.kumari@priyanka.school",
    phone: "+919100000002", empCode: "EY-002",
    assignments: [
      { classKey: "LKG-A", subject: "General", isClassTeacher: true },
    ],
  },
  {
    name: "Rajitha Rani", email: "rajitha.rani@priyanka.school",
    phone: "+919100000003", empCode: "EY-003",
    assignments: [
      { classKey: "LKG-B", subject: "General", isClassTeacher: true },
    ],
  },
  {
    name: "Vasantha Laxmi", email: "vasantha.laxmi@priyanka.school",
    phone: "+919100000004", empCode: "EY-004",
    assignments: [
      { classKey: "UKG-A", subject: "General", isClassTeacher: true },
    ],
  },
  {
    name: "Padmaja Reddy", email: "padmaja.reddy@priyanka.school",
    phone: "+919100000005", empCode: "EY-005",
    assignments: [
      { classKey: "UKG-B", subject: "General", isClassTeacher: true },
    ],
  },

  // -- PRIMARY SECTION A: Classes 1-5 (5 teachers) --
  {
    name: "Sreenivas Rao", email: "sreenivas.rao@priyanka.school",
    phone: "+919100000006", empCode: "PA-001",
    assignments: [
      { classKey: "1-A", subject: "Mathematics", isClassTeacher: true },
      { classKey: "2-A", subject: "Mathematics", isClassTeacher: false },
      { classKey: "3-A", subject: "Mathematics", isClassTeacher: false },
      { classKey: "4-A", subject: "Mathematics", isClassTeacher: false },
      { classKey: "5-A", subject: "Mathematics", isClassTeacher: false },
    ],
  },
  {
    name: "Vijaya Laxmi", email: "vijaya.laxmi@priyanka.school",
    phone: "+919100000007", empCode: "PA-002",
    assignments: [
      { classKey: "2-A", subject: "English", isClassTeacher: true },
      { classKey: "1-A", subject: "English", isClassTeacher: false },
      { classKey: "3-A", subject: "English", isClassTeacher: false },
      { classKey: "4-A", subject: "English", isClassTeacher: false },
      { classKey: "5-A", subject: "English", isClassTeacher: false },
    ],
  },
  {
    name: "Nagaraju Sharma", email: "nagaraju.sharma@priyanka.school",
    phone: "+919100000008", empCode: "PA-003",
    assignments: [
      { classKey: "3-A", subject: "Telugu", isClassTeacher: true },
      { classKey: "1-A", subject: "Telugu", isClassTeacher: false },
      { classKey: "2-A", subject: "Telugu", isClassTeacher: false },
      { classKey: "4-A", subject: "Telugu", isClassTeacher: false },
      { classKey: "5-A", subject: "Telugu", isClassTeacher: false },
    ],
  },
  {
    name: "Sarada Devi", email: "sarada.devi@priyanka.school",
    phone: "+919100000009", empCode: "PA-004",
    assignments: [
      { classKey: "4-A", subject: "Science", isClassTeacher: true },
      { classKey: "1-A", subject: "EVS",     isClassTeacher: false },
      { classKey: "2-A", subject: "EVS",     isClassTeacher: false },
      { classKey: "3-A", subject: "Science", isClassTeacher: false },
      { classKey: "5-A", subject: "Science", isClassTeacher: false },
    ],
  },
  {
    name: "Ravi Kumar", email: "ravi.kumar@priyanka.school",
    phone: "+919100000010", empCode: "PA-005",
    assignments: [
      { classKey: "5-A", subject: "Social Studies", isClassTeacher: true },
      { classKey: "1-A", subject: "Social Studies", isClassTeacher: false },
      { classKey: "2-A", subject: "Social Studies", isClassTeacher: false },
      { classKey: "3-A", subject: "Social Studies", isClassTeacher: false },
      { classKey: "4-A", subject: "Social Studies", isClassTeacher: false },
    ],
  },

  // -- PRIMARY SECTION B: Classes 1-5 (5 teachers) --
  {
    name: "Saroja Bai", email: "saroja.bai@priyanka.school",
    phone: "+919100000011", empCode: "PB-001",
    assignments: [
      { classKey: "1-B", subject: "Mathematics", isClassTeacher: true },
      { classKey: "2-B", subject: "Mathematics", isClassTeacher: false },
      { classKey: "3-B", subject: "Mathematics", isClassTeacher: false },
      { classKey: "4-B", subject: "Mathematics", isClassTeacher: false },
      { classKey: "5-B", subject: "Mathematics", isClassTeacher: false },
    ],
  },
  {
    name: "Manohar Rao", email: "manohar.rao@priyanka.school",
    phone: "+919100000012", empCode: "PB-002",
    assignments: [
      { classKey: "2-B", subject: "English", isClassTeacher: true },
      { classKey: "1-B", subject: "English", isClassTeacher: false },
      { classKey: "3-B", subject: "English", isClassTeacher: false },
      { classKey: "4-B", subject: "English", isClassTeacher: false },
      { classKey: "5-B", subject: "English", isClassTeacher: false },
    ],
  },
  {
    name: "Pushpa Rani", email: "pushpa.rani@priyanka.school",
    phone: "+919100000013", empCode: "PB-003",
    assignments: [
      { classKey: "3-B", subject: "Telugu", isClassTeacher: true },
      { classKey: "1-B", subject: "Telugu", isClassTeacher: false },
      { classKey: "2-B", subject: "Telugu", isClassTeacher: false },
      { classKey: "4-B", subject: "Telugu", isClassTeacher: false },
      { classKey: "5-B", subject: "Telugu", isClassTeacher: false },
    ],
  },
  {
    name: "Suresh Babu", email: "suresh.babu@priyanka.school",
    phone: "+919100000014", empCode: "PB-004",
    assignments: [
      { classKey: "4-B", subject: "Science", isClassTeacher: true },
      { classKey: "1-B", subject: "EVS",     isClassTeacher: false },
      { classKey: "2-B", subject: "EVS",     isClassTeacher: false },
      { classKey: "3-B", subject: "Science", isClassTeacher: false },
      { classKey: "5-B", subject: "Science", isClassTeacher: false },
    ],
  },
  {
    name: "Kamala Devi", email: "kamala.devi@priyanka.school",
    phone: "+919100000015", empCode: "PB-005",
    assignments: [
      { classKey: "5-B", subject: "Social Studies", isClassTeacher: true },
      { classKey: "1-B", subject: "Social Studies", isClassTeacher: false },
      { classKey: "2-B", subject: "Social Studies", isClassTeacher: false },
      { classKey: "3-B", subject: "Social Studies", isClassTeacher: false },
      { classKey: "4-B", subject: "Social Studies", isClassTeacher: false },
    ],
  },

  // -- PRIMARY SECTION C: Classes 1-5 (3 teachers, multi-subject) --
  {
    name: "Bhavani Shankar", email: "bhavani.shankar@priyanka.school",
    phone: "+919100000016", empCode: "PC-001",
    assignments: [
      { classKey: "1-C", subject: "Mathematics", isClassTeacher: true },
      { classKey: "2-C", subject: "Mathematics", isClassTeacher: false },
      { classKey: "3-C", subject: "Mathematics", isClassTeacher: false },
      { classKey: "4-C", subject: "Mathematics", isClassTeacher: false },
      { classKey: "5-C", subject: "Mathematics", isClassTeacher: false },
    ],
  },
  {
    name: "Leela Kumari", email: "leela.kumari@priyanka.school",
    phone: "+919100000017", empCode: "PC-002",
    assignments: [
      { classKey: "2-C", subject: "English", isClassTeacher: true },
      { classKey: "3-C", subject: "English", isClassTeacher: true },
      { classKey: "1-C", subject: "English", isClassTeacher: false },
      { classKey: "4-C", subject: "English", isClassTeacher: false },
      { classKey: "5-C", subject: "English", isClassTeacher: false },
    ],
  },
  {
    name: "Venkateswara Rao", email: "venkat.rao@priyanka.school",
    phone: "+919100000018", empCode: "PC-003",
    assignments: [
      { classKey: "4-C", subject: "Telugu", isClassTeacher: true },
      { classKey: "5-C", subject: "Telugu", isClassTeacher: true },
      { classKey: "1-C", subject: "Telugu", isClassTeacher: false },
      { classKey: "2-C", subject: "Telugu", isClassTeacher: false },
      { classKey: "3-C", subject: "Telugu", isClassTeacher: false },
    ],
  },

  // -- SECONDARY SECTION A: Classes 6-10 (5 teachers) --
  {
    name: "Krishnamurthy", email: "krishna.murthy@priyanka.school",
    phone: "+919100000019", empCode: "SA-001",
    assignments: [
      { classKey: "9-A",  subject: "Mathematics", isClassTeacher: true },
      { classKey: "6-A",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "7-A",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "8-A",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "10-A", subject: "Mathematics", isClassTeacher: false },
    ],
  },
  {
    name: "Prasad Rao", email: "prasad.rao@priyanka.school",
    phone: "+919100000020", empCode: "SA-002",
    assignments: [
      { classKey: "6-A",  subject: "Science", isClassTeacher: true },
      { classKey: "7-A",  subject: "Science", isClassTeacher: false },
      { classKey: "8-A",  subject: "Science", isClassTeacher: false },
      { classKey: "9-A",  subject: "Science", isClassTeacher: false },
      { classKey: "10-A", subject: "Science", isClassTeacher: false },
    ],
  },
  {
    name: "Anand Kumar", email: "anand.kumar@priyanka.school",
    phone: "+919100000021", empCode: "SA-003",
    assignments: [
      { classKey: "7-A",  subject: "English", isClassTeacher: true },
      { classKey: "6-A",  subject: "English", isClassTeacher: false },
      { classKey: "8-A",  subject: "English", isClassTeacher: false },
      { classKey: "9-A",  subject: "English", isClassTeacher: false },
      { classKey: "10-A", subject: "English", isClassTeacher: false },
    ],
  },
  {
    name: "Mythili Devi", email: "mythili.devi@priyanka.school",
    phone: "+919100000022", empCode: "SA-004",
    assignments: [
      { classKey: "8-A",  subject: "Social Studies", isClassTeacher: true },
      { classKey: "6-A",  subject: "Social Studies", isClassTeacher: false },
      { classKey: "7-A",  subject: "Social Studies", isClassTeacher: false },
      { classKey: "9-A",  subject: "Social Studies", isClassTeacher: false },
      { classKey: "10-A", subject: "Social Studies", isClassTeacher: false },
    ],
  },
  {
    name: "Raghu Nath", email: "raghu.nath@priyanka.school",
    phone: "+919100000023", empCode: "SA-005",
    assignments: [
      { classKey: "10-A", subject: "Telugu", isClassTeacher: true },
      { classKey: "6-A",  subject: "Telugu", isClassTeacher: false },
      { classKey: "7-A",  subject: "Telugu", isClassTeacher: false },
      { classKey: "8-A",  subject: "Telugu", isClassTeacher: false },
      { classKey: "9-A",  subject: "Telugu", isClassTeacher: false },
    ],
  },

  // -- SECONDARY SECTION B: Classes 6-10 (4 teachers) --
  {
    name: "Subba Rao", email: "subba.rao@priyanka.school",
    phone: "+919100000024", empCode: "SB-001",
    assignments: [
      { classKey: "9-B",  subject: "Mathematics", isClassTeacher: true },
      { classKey: "6-B",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "7-B",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "8-B",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "10-B", subject: "Mathematics", isClassTeacher: false },
    ],
  },
  {
    name: "Uma Devi", email: "uma.devi@priyanka.school",
    phone: "+919100000025", empCode: "SB-002",
    assignments: [
      { classKey: "6-B",  subject: "Science", isClassTeacher: true },
      { classKey: "7-B",  subject: "Science", isClassTeacher: false },
      { classKey: "8-B",  subject: "Science", isClassTeacher: false },
      { classKey: "9-B",  subject: "Science", isClassTeacher: false },
      { classKey: "10-B", subject: "Science", isClassTeacher: false },
    ],
  },
  {
    name: "Malleswara Rao", email: "mallesh.rao@priyanka.school",
    phone: "+919100000026", empCode: "SB-003",
    assignments: [
      { classKey: "7-B",  subject: "English", isClassTeacher: true },
      { classKey: "6-B",  subject: "English", isClassTeacher: false },
      { classKey: "8-B",  subject: "English", isClassTeacher: false },
      { classKey: "9-B",  subject: "English", isClassTeacher: false },
      { classKey: "10-B", subject: "English", isClassTeacher: false },
    ],
  },
  {
    name: "Sujata Reddy", email: "sujata.reddy@priyanka.school",
    phone: "+919100000027", empCode: "SB-004",
    assignments: [
      { classKey: "8-B",  subject: "Telugu", isClassTeacher: true },
      { classKey: "10-B", subject: "Telugu", isClassTeacher: true },
      { classKey: "6-B",  subject: "Telugu", isClassTeacher: false },
      { classKey: "7-B",  subject: "Telugu", isClassTeacher: false },
      { classKey: "9-B",  subject: "Telugu", isClassTeacher: false },
    ],
  },

  // -- SECONDARY SECTION C: Classes 6-10 (3 teachers) --
  {
    name: "Bala Krishna", email: "bala.krishna@priyanka.school",
    phone: "+919100000028", empCode: "SC-001",
    assignments: [
      { classKey: "9-C",  subject: "Mathematics", isClassTeacher: true },
      { classKey: "6-C",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "7-C",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "8-C",  subject: "Mathematics", isClassTeacher: false },
      { classKey: "10-C", subject: "Mathematics", isClassTeacher: false },
    ],
  },
  {
    name: "Vimala Rani", email: "vimala.rani@priyanka.school",
    phone: "+919100000029", empCode: "SC-002",
    assignments: [
      { classKey: "6-C",  subject: "Science", isClassTeacher: true },
      { classKey: "7-C",  subject: "Science", isClassTeacher: false },
      { classKey: "8-C",  subject: "Science", isClassTeacher: false },
      { classKey: "9-C",  subject: "Science", isClassTeacher: false },
      { classKey: "10-C", subject: "Science", isClassTeacher: false },
    ],
  },
  {
    name: "Satyanarayana", email: "satya.narayana@priyanka.school",
    phone: "+919100000030", empCode: "SC-003",
    assignments: [
      { classKey: "7-C",  subject: "Telugu", isClassTeacher: true },
      { classKey: "8-C",  subject: "Telugu", isClassTeacher: true },
      { classKey: "10-C", subject: "Telugu", isClassTeacher: true },
      { classKey: "6-C",  subject: "Telugu", isClassTeacher: false },
      { classKey: "9-C",  subject: "Telugu", isClassTeacher: false },
    ],
  },
];

// -- Helpers ---------------------------------------------------------

async function createAuthUser(email: string, password: string, fullName: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    if (error.message.includes("already been registered") || error.code === "email_exists") {
      // Find existing user
      const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = list?.users?.find((u) => u.email === email);
      if (existing) return existing.id;
    }
    console.error(`  Error creating auth for ${email}: ${error.message}`);
    return null;
  }

  return data.user?.id ?? null;
}

async function createProfile(
  userId: string,
  role: "school_admin" | "teacher" | "parent",
  fullName: string,
  phone: string,
  empCode?: string,
) {
  // Columns: id, school_id, full_name, role, phone, employee_code, is_active
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    school_id: SCHOOL_ID,
    full_name: fullName,
    role,
    phone,
    employee_code: empCode ?? null,
    is_active: true,
  }, { onConflict: "id" });

  if (error) console.error(`  Profile error for ${fullName}: ${error.message}`);
}

async function assignClasses(teacherId: string, assignments: ClassAssignment[]) {
  // teacher_classes PK = (teacher_id, class_id)
  // Columns: teacher_id, class_id, subject, is_class_teacher, academic_year, assigned_on, relieved_on
  // NO school_id column!
  // Each (teacher_id, class_id) can only appear ONCE.

  for (const a of assignments) {
    const classId = C[a.classKey];
    if (!classId) { console.warn(`  Unknown class key: ${a.classKey}`); continue; }

    const { error } = await supabase.from("teacher_classes").upsert({
      teacher_id:       teacherId,
      class_id:         classId,
      subject:          a.subject,
      is_class_teacher: a.isClassTeacher,
      academic_year:    "2026-2027",
      assigned_on:      new Date().toISOString().slice(0, 10),
    }, { onConflict: "teacher_id,class_id" });

    if (error) console.error(`    Class assign error (${a.classKey}/${a.subject}): ${error.message}`);
  }
}

// -- Main ------------------------------------------------------------

async function main() {
  console.log("\nFinkfold ERP - User Seeder");
  console.log("=".repeat(50));

  // 1. Admin
  console.log("\nCreating Admin...");
  const adminId = await createAuthUser("admin@priyanka.school", ADMIN_PASS, "Principal Admin");
  if (adminId) {
    await createProfile(adminId, "school_admin", "Principal Admin", "+919000000000", "ADMIN-001");
    console.log(`  OK: admin@priyanka.school (password: ${ADMIN_PASS})`);
  }

  // 2. Teachers (30)
  console.log(`\nCreating ${TEACHERS.length} Teachers...`);
  let tOk = 0;
  for (const t of TEACHERS) {
    const uid = await createAuthUser(t.email, TEACHER_PASS, t.name);
    if (uid) {
      await createProfile(uid, "teacher", t.name, t.phone, t.empCode);
      await assignClasses(uid, t.assignments);
      console.log(`  OK: ${t.email} [${t.empCode}] (${t.assignments.length} classes)`);
      tOk++;
    }
  }
  console.log(`  Total: ${tOk}/${TEACHERS.length} teachers created`);

  // 3. Parents (350)
  console.log("\nCreating 350 Parent accounts...");
  let pOk = 0;

  for (let i = 1; i <= 350; i++) {
    const idx   = String(i).padStart(3, "0");
    const email = `parent${idx}@priyanka.school`;
    const phone = `+91${(7000000000 + i).toString()}`;
    const name  = `Parent ${idx}`;

    const uid = await createAuthUser(email, PARENT_PASS, name);
    if (uid) {
      await createProfile(uid, "parent", name, phone);
      pOk++;
    }

    if (i % 50 === 0) console.log(`  ... ${i}/350 done`);
  }
  console.log(`  Total: ${pOk}/350 parents created`);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("Seed complete!\n");
  console.log("Login credentials:");
  console.log(`  Admin    -> admin@priyanka.school / ${ADMIN_PASS}`);
  console.log(`  Teachers -> {name}@priyanka.school / ${TEACHER_PASS}`);
  console.log(`  Parents  -> parent001..parent350@priyanka.school / ${PARENT_PASS}`);
  console.log("\nExample teacher logins:");
  TEACHERS.slice(0, 5).forEach((t) =>
    console.log(`  ${t.name.padEnd(20)} -> ${t.email}`)
  );
  console.log("\nExample parent login:");
  console.log("  parent001@priyanka.school (student: Roll #1, Play-A)");
}

main().catch((e) => { console.error(e); process.exit(1); });
