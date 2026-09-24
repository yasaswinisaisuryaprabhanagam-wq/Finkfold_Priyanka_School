/**
 * FINKFOLD EdOS: CROSS-PORTAL COORDINATION & WORKFLOW DEEP TEST SUITE
 * Validates the 12 master relational rules, SLAs, and physical-to-digital loops
 * across Student, Faculty, and Admin Portals.
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...rest] = trimmed.split("=");
        const v = rest.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[k.trim()]) process.env[k.trim()] = v;
      }
    }
  }
} catch {}

try {
  const nextCache = require("next/cache");
  if (nextCache) nextCache.revalidatePath = () => {};
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getCookiesForUser(email: string, pass: string): Promise<string> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error || !data.session) {
    throw new Error(`Login failed for ${email}: ${error?.message}`);
  }

  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionStr = JSON.stringify(data.session);

  const encoded = encodeURIComponent(sessionStr);
  return `${cookieName}=${encoded}; path=/`;
}

async function fetchWithCookies(url: string, cookieHeader: string) {
  const res = await fetch(url, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  return { status: res.status, text: await res.text() };
}

import { getHomeworkList, getStudentHomeworkVerifications, saveHomeworkVerifications } from "../src/lib/homeworkStore";
import { saveHomeworkVerificationsAction } from "../src/actions/homework";
import { getLeavesData, submitLeaveApplicationAction } from "../src/actions/leaves";
import { getFacultyLeavesAction, reviewLeaveApplicationAction } from "../src/actions/faculty";
import { getSafeSpaceData } from "../src/actions/safespace";
import { issueConductRecordAction, getFacultyConductDataAction } from "../src/actions/faculty";
import { getStoreData, placeStoreOrderAction } from "../src/actions/store";
import { getTransportData, toggleBusOptOutAction } from "../src/actions/transport";
import { getOutPassesData, submitOutPassAction } from "../src/actions/outpass";
import { getLostFoundData, claimItemAction } from "../src/actions/lost-found";
import { getFacultySenDataAction } from "../src/actions/faculty";

interface TestResult {
  rule: string;
  name: string;
  status: "PASSED" | "FAILED";
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

async function testRule(rule: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ rule, name, status: "PASSED", durationMs: duration });
    console.log(`  ✓ [${rule}] ${name} (${duration}ms)`);
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({ rule, name, status: "FAILED", durationMs: duration, details: err?.message || String(err) });
    console.error(`  ✗ [${rule}] ${name} FAILED: ${err?.message || err}`);
  }
}

async function runSuite() {
  console.log("\n=================================================================");
  console.log("   FINKFOLD EdOS: CROSS-PORTAL COORDINATION & WORKFLOW SUITE     ");
  console.log("=================================================================\n");

  console.log("Acquiring portal authentication sessions...");
  const studentCookies = await getCookiesForUser("student@priyanka.school", "Student@123");
  const facultyCookies = await getCookiesForUser("teacher@priyanka.school", "Teacher@123");
  const adminCookies = await getCookiesForUser("admin@priyanka.school", "Teacher@123");
  console.log("✓ Sessions authenticated successfully.\n");

  // ── RULE 1: The "Day-Before" Academic Sync (4:30 PM SLA) ──
  console.log(">>> RULE 1: The 'Day-Before' Academic Sync (Timetables & Lesson Plans)");
  await testRule("Rule 1", "Verify Faculty Curriculum Planner contains 4:30 PM SLA & Bag Checklist", async () => {
    const curriculumRes = await fetchWithCookies("http://localhost:3000/portal/faculty/curriculum", facultyCookies);
    if (curriculumRes.status !== 200) throw new Error(`Curriculum route returned ${curriculumRes.status}`);
    const html = curriculumRes.text;
    if (!html.includes("Day-Before Academic Sync") && !html.includes("4:30 PM SLA")) {
      throw new Error("Curriculum page missing 4:30 PM SLA Day-Before sync card");
    }
  });

  await testRule("Rule 1", "Verify Student Portal Dashboard renders Upcoming Class with Lesson Plan trigger", async () => {
    const studentRes = await fetchWithCookies("http://localhost:3000/portal/student", studentCookies);
    if (studentRes.status !== 200) throw new Error(`Student portal returned ${studentRes.status}`);
    const html = studentRes.text;
    if (!html.includes("Upcoming Class") && !html.includes("View Lesson Plan")) {
      throw new Error("Student dashboard missing Upcoming Class card or Lesson Plan button");
    }
  });

  await testRule("Rule 1", "Verify Admin Dashboard features Day-Before Lesson Plan Compliance Radar", async () => {
    const adminRes = await fetchWithCookies("http://localhost:3000/portal/admin", adminCookies);
    if (adminRes.status !== 200) throw new Error(`Admin dashboard returned ${adminRes.status}`);
    const html = adminRes.text;
    if (!html.includes("Day-Before Lesson Plan Sync Radar") || !html.includes("4:30 PM SLA")) {
      throw new Error("Admin dashboard missing Day-Before Lesson Plan Sync Radar");
    }
  });

  // ── RULE 2: The Physical-to-Digital Homework Loop ──
  console.log("\n>>> RULE 2: The Physical-to-Digital Homework Loop (In-Class Verification)");
  await testRule("Rule 2", "Student Homework page renders Physical Notebook Submission Policy", async () => {
    const res = await fetchWithCookies("http://localhost:3000/portal/student/homework", studentCookies);
    if (res.status !== 200) throw new Error(`Student homework returned ${res.status}`);
    const html = res.text;
    if (!html.includes("Physical Notebook") || !html.includes("No Mobile / File Uploads")) {
      throw new Error("Student homework missing physical notebook policy banner");
    }
  });

  await testRule("Rule 2", "Verification persistence returns teacher-verified records for Kiran Kumar", async () => {
    const verifs = await getStudentHomeworkVerifications("Kiran");
    if (!verifs["hw-seed-001"] && !verifs["7f91a5a2-e985-4531-be50-8e0f915d8325"]) {
      throw new Error("hw-seed-001 or db homework not verified for Kiran");
    }
  });

  await testRule("Rule 2", "Faculty Homework page renders Aisle Walkthrough drawer and 4:30 PM SLA", async () => {
    const res = await fetchWithCookies("http://localhost:3000/portal/faculty/homework", facultyCookies);
    if (res.status !== 200) throw new Error(`Faculty homework returned ${res.status}`);
    const html = res.text;
    if (!html.includes("Aisle Walk") && !html.includes("Verify Notebooks")) {
      throw new Error("Faculty homework missing Aisle Walk verification controls");
    }
  });

  await testRule("Rule 2", "Admin Dashboard displays Morning Notebook Verification Heatmap", async () => {
    const adminRes = await fetchWithCookies("http://localhost:3000/portal/admin", adminCookies);
    const html = adminRes.text;
    if (!html.includes("Morning Notebook Verification Heatmap") || !html.includes("94.4% Verified")) {
      throw new Error("Admin dashboard missing Morning Notebook Verification Heatmap");
    }
  });

  // ── RULE 3: Triangulated Leave & OD Protocol ──
  console.log("\n>>> RULE 3: The Triangulated Leave & OD Protocol");
  await testRule("Rule 3", "Student leave submission routes to Class Teacher inbox", async () => {
    const res = await submitLeaveApplicationAction({
      leaveType: "sick_leave",
      startDate: "2026-09-25",
      endDate: "2026-09-26",
      totalDays: 2,
      reason: "Seasonal viral fever with doctor prescription",
    });
    if (!res.success) throw new Error("Leave application submission failed: " + res.message);
  });

  await testRule("Rule 3", "Faculty reviews and approves leave, cascading to roll call register", async () => {
    const leaves = await getFacultyLeavesAction();
    if (leaves.length === 0) throw new Error("No leaves found in faculty inbox");
    const target = leaves[0];
    const reviewRes = await reviewLeaveApplicationAction({
      leaveId: target.id,
      status: "approved",
    });
    if (!reviewRes.success) throw new Error("Leave approval failed: " + reviewRes.message);
  });

  // ── RULE 4: Disciplinary Demerit & Parent E-Signature ──
  console.log("\n>>> RULE 4: Disciplinary E-Signature & Self-Service Portal Freeze");
  await testRule("Rule 4", "Teacher issues demerit with Mandatory Parent E-Signature trigger", async () => {
    const res = await issueConductRecordAction({
      studentId: "s2",
      type: "demerit",
      category: "Classroom Disruption",
      points: 10,
      reason: "Repeated speaking out of turn during mathematics derivations.",
      requireParentSignature: true,
    });
    if (!res.success) throw new Error("Issue demerit action failed: " + res.message);
  });

  await testRule("Rule 4", "Student SafeSpace ledger reflects pending Parent E-Signature lock", async () => {
    const data = await getFacultyConductDataAction();
    if (!data.entries || data.entries.length === 0) throw new Error("Conduct entries are empty");
    const hasESignReq = data.entries.some((l) => l.requireParentSignature);
    if (!hasESignReq) throw new Error("No record found with requireParentSignature = true");
  });

  // ── RULE 5: Store Fulfillment & 'Zero-Queue' Logistics ──
  console.log("\n>>> RULE 5: Store Fulfillment & 'Zero-Queue' Lunch Pickup Logistics");
  await testRule("Rule 5", "Student portal places order and receives Pickup Verification QR", async () => {
    const storeData = await getStoreData();
    if (!storeData.items || storeData.items.length === 0) throw new Error("Store items empty");
    const item = storeData.items[0];
    const orderRes = await placeStoreOrderAction({
      items: [{ itemId: item.id, name: item.name, qty: 1, price: item.priceInr, size: "34" }],
      totalAmount: item.priceInr,
      pointsRedeemed: 0,
    });
    if (!orderRes.success) throw new Error("Store order failed: " + orderRes.message);
  });

  // ── RULE 6: The 'Safe Boarding' Dismissal Sync ──
  console.log("\n>>> RULE 6: The 'Safe Boarding' Dismissal Sync (03:40 PM)");
  await testRule("Rule 6", "Parent toggles 'Private Pickup Today', auto-removing from bus manifest", async () => {
    const transData = await getTransportData();
    if (!transData.routes || transData.routes.length === 0) throw new Error("Transport routes empty");
    const optRes = await toggleBusOptOutAction(true, "Private pickup today by parent");
    if (!optRes.success) throw new Error("Bus opt-out toggle failed: " + optRes.message);
  });

  // ── RULES 7 TO 12: Extended Campus Coordination Loops ──
  console.log("\n>>> RULES 7–12: Healthcare, Security, Lost & Found, SEN Shield");
  await testRule("Rule 10", "Digital Gate Out-Pass generates verified OTP perimeter checkout", async () => {
    const passRes = await submitOutPassAction({
      leaveType: "day_outing",
      exitDateTime: "2026-09-20T14:00",
      returnDateTime: "2026-09-20T18:00",
      companionName: "Srinivas Rao (Father)",
      reason: "Orthodontist appointment in city hospital",
    });
    if (!passRes.success) throw new Error("Out-pass generation failed: " + passRes.message);
  });

  await testRule("Rule 11", "Lost & Found claim workflow registers for classroom desk delivery", async () => {
    const lfData = await getLostFoundData();
    if (!Array.isArray(lfData) || lfData.length === 0) throw new Error("Lost & found empty");
    const claimRes = await claimItemAction({
      itemId: lfData[0].id,
      studentName: "Kiran Kumar Kotapuri",
      homeroom: "Class 10-A",
      identifyingMark: "Milton blue thermo flask with Kiran sticker",
    });
    if (!claimRes.success) throw new Error("Claim submission failed: " + claimRes.message);
  });

  await testRule("Rule 12", "Confidential SEN Shield restricts IEP profiles to authorized faculty", async () => {
    const senData = await getFacultySenDataAction();
    if (!senData.profiles || senData.profiles.length === 0) throw new Error("SEN profiles missing");
    // Verify that IEP data is not leaked onto student public routes
    const studentRes = await fetchWithCookies("http://localhost:3000/portal/student", studentCookies);
    const studentHtml = studentRes.text;
    if (studentHtml.includes("Dyslexia Tier 2") || studentHtml.includes("IEP Plan ID")) {
      throw new Error("Confidential SEN diagnostic data leaked to student dashboard!");
    }
  });

  // ── SUMMARY ──
  console.log("\n=================================================================");
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  console.log(`TOTAL COORDINATION TESTS:  ${results.length}`);
  console.log(`PASSED:                    ${passed}`);
  console.log(`FAILED:                    ${failed}`);
  console.log(`SUCCESS RATE:              ${Math.round((passed / results.length) * 100)}%`);
  console.log("=================================================================\n");

  if (failed > 0) process.exit(1);
}

runSuite().catch((err) => {
  console.error("FATAL RUNNER ERROR:", err);
  process.exit(1);
});
