/**
 * Authenticated Coordination Test Script
 * Logs in as Student, Faculty, and Admin using Supabase Auth,
 * captures session cookies, and verifies that the rendered HTML of all 3 portals
 * contains the coordinated features.
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
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

  // Next.js @supabase/ssr cookie naming
  // The token is stored across chunked or single cookies named sb-<project-ref>-auth-token
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionStr = JSON.stringify(data.session);

  // Encode for cookie header
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

async function run() {
  console.log("\n=======================================================");
  console.log("   TESTING AUTHENTICATED PORTAL RENDERING & RULES      ");
  console.log("=======================================================\n");

  let allPassed = true;

  // 1. Test Student Portal
  console.log("1. Authenticating as Student (student@priyanka.school)...");
  try {
    const studentCookies = await getCookiesForUser("student@priyanka.school", "Student@123");
    console.log("   ✓ Student authenticated successfully");

    // Fetch /portal/student
    const dashRes = await fetchWithCookies("http://localhost:3000/portal/student", studentCookies);
    console.log(`   GET /portal/student -> Status: ${dashRes.status}`);
    const hasUpcoming = dashRes.text.includes("Upcoming Class");
    const hasLessonPlan = dashRes.text.includes("View Lesson Plan");
    const hasPackTonight = dashRes.text.includes("Pack Tonight");
    console.log(`   - Upcoming Class Card: ${hasUpcoming ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - View Lesson Plan Trigger: ${hasLessonPlan ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - Pack Tonight Material Pill: ${hasPackTonight ? "✓ FOUND" : "✗ MISSING"}`);

    if (!hasUpcoming || !hasLessonPlan) allPassed = false;

    // Fetch /portal/student/homework
    const hwRes = await fetchWithCookies("http://localhost:3000/portal/student/homework", studentCookies);
    console.log(`   GET /portal/student/homework -> Status: ${hwRes.status}`);
    const hasPolicy = hwRes.text.includes("Physical Notebook Submission Policy");
    const hasVerified = (hwRes.text.includes("Checked") && hwRes.text.includes("Completed")) || hwRes.text.includes("Checked &amp; Completed");
    const hasNotebookSpec = hwRes.text.includes("200-Page Ruled") || hwRes.text.includes("Science Lab");
    console.log(`   - Physical Notebook Submission Policy: ${hasPolicy ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - Teacher-Verified Status Badge: ${hasVerified ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - Target Physical Notebook Specs: ${hasNotebookSpec ? "✓ FOUND" : "✗ MISSING"}`);

    if (!hasPolicy || !hasVerified) allPassed = false;
  } catch (err: any) {
    console.error("   ✗ Student test failed:", err.message);
    allPassed = false;
  }

  // 2. Test Faculty Portal
  console.log("\n2. Authenticating as Faculty (teacher@priyanka.school)...");
  try {
    const facultyCookies = await getCookiesForUser("teacher@priyanka.school", "Teacher@123");
    console.log("   ✓ Faculty authenticated successfully");

    // Fetch /portal/faculty/homework
    const hwRes = await fetchWithCookies("http://localhost:3000/portal/faculty/homework", facultyCookies);
    console.log(`   GET /portal/faculty/homework -> Status: ${hwRes.status}`);
    const hasWalkthrough = hwRes.text.includes("Verify Notebooks (Aisle Walk)") || hwRes.text.includes("Aisle Walk");
    const hasSla = hwRes.text.includes("4:30 PM SLA");
    console.log(`   - In-Class Aisle Walkthrough Button: ${hasWalkthrough ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - 4:30 PM SLA Coordination Advisory: ${hasSla ? "✓ FOUND" : "✗ MISSING"}`);

    if (!hasWalkthrough || !hasSla) allPassed = false;

    // Fetch /portal/faculty/curriculum
    const curRes = await fetchWithCookies("http://localhost:3000/portal/faculty/curriculum", facultyCookies);
    console.log(`   GET /portal/faculty/curriculum -> Status: ${curRes.status}`);
    const hasDayBeforeSync = curRes.text.includes("Day-Before Academic Sync") && curRes.text.includes("4:30 PM SLA");
    const hasBagMaterials = curRes.text.includes("Required Student Bag Materials Tonight") || curRes.text.includes("Textbook: NCERT");
    console.log(`   - Day-Before Academic Sync (4:30 PM SLA): ${hasDayBeforeSync ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - Required Student Bag Materials Tonight: ${hasBagMaterials ? "✓ FOUND" : "✗ MISSING"}`);

    if (!hasDayBeforeSync || !hasBagMaterials) allPassed = false;
  } catch (err: any) {
    console.error("   ✗ Faculty test failed:", err.message);
    allPassed = false;
  }

  // 3. Test Admin Portal
  console.log("\n3. Authenticating as Admin (admin@priyanka.school)...");
  try {
    const adminCookies = await getCookiesForUser("admin@priyanka.school", "Teacher@123");
    console.log("   ✓ Admin authenticated successfully");

    // Fetch /portal/admin
    const adminRes = await fetchWithCookies("http://localhost:3000/portal/admin", adminCookies);
    console.log(`   GET /portal/admin -> Status: ${adminRes.status}`);
    const hasRule1Radar = adminRes.text.includes("Day-Before Lesson Plan Sync Radar");
    const hasRule2Heatmap = adminRes.text.includes("Morning Notebook Verification Heatmap");
    const hasWhatsappPushed = adminRes.text.includes("Instant Parent WhatsApp Verification Alerts") || adminRes.text.includes("68 Dispatched");
    console.log(`   - Rule 1 Lesson Plan Sync Radar (4:30 PM SLA): ${hasRule1Radar ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - Rule 2 Morning Notebook Verification Heatmap: ${hasRule2Heatmap ? "✓ FOUND" : "✗ MISSING"}`);
    console.log(`   - Automated WhatsApp Verification Dispatch Telemetry: ${hasWhatsappPushed ? "✓ FOUND" : "✗ MISSING"}`);

    if (!hasRule1Radar || !hasRule2Heatmap) allPassed = false;
  } catch (err: any) {
    console.error("   ✗ Admin test failed:", err.message);
    allPassed = false;
  }

  console.log("\n=======================================================");
  if (allPassed) {
    console.log("   🎉 ALL AUTHENTICATED PORTAL TESTS PASSED (100%)!    ");
  } else {
    console.log("   ⚠️ SOME TESTS FAILED — CHECK LOGS ABOVE            ");
  }
  console.log("=======================================================\n");

  if (!allPassed) process.exit(1);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
