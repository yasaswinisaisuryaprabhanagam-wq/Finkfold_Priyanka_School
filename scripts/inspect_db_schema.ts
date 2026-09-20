import * as fs from "fs";
import * as path from "path";

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

import { createAdminClient } from "../src/lib/supabase/server";

async function main() {
  const supabase = await createAdminClient();

  const tablesToCheck = [
    // 37 tables currently listed in user's prompt
    "schools", "profiles", "classes", "teacher_classes", "students", "attendance_sessions",
    "attendance_records", "whatsapp_notifications", "parent_reply_log", "student_promotions",
    "pending_admissions", "homework", "circulars", "organizations", "academic_years", "subjects",
    "student_enrollments", "fee_structures", "cash_drawers", "fee_transactions",
    "student_transport_subscriptions", "campus_store_orders", "student_elective_bids",
    "digital_outpasses", "support_tickets", "student_medical_records", "infirmary_visit_logs",
    "lost_and_found_items", "anonymous_grievance_reports", "student_conduct_ledger",
    "regulated_teacher_messages", "ptm_booking_slots", "student_digital_certificates",
    "external_achievements_dropbox", "student_id_photo_submissions", "student_leaves_and_od",
    "student_bank_refund_profiles",

    // Faculty & Student Extended Modules
    "exams", "student_exam_marks", "staff_leaves", "curriculum_unit_plans",
    "student_essay_submissions", "classroom_seating_layouts", "sen_student_profiles",
    "staff_biometric_punches", "store_indent_requisitions", "campus_maintenance_tickets",
    "student_group_projects", "faculty_relief_allocations", "field_trip_manifests",

    // Admin Enterprise Modules
    "admissions_leads", "bank_reconciliation_records", "store_inventory", "store_purchase_orders",
    "fleet_vehicles", "rfid_turnstile_logs", "recruitment_job_openings", "recruitment_applicants",
    "faculty_appraisal_dossiers", "obe_learning_outcomes", "obe_student_attainments",
    "omnichannel_broadcasts",

    // Admin Level 1, 2, 3 Modules
    "certificate_templates", "generated_admin_certificates",
    "library_books", "library_loans",
    "fee_late_penalty_rules", "fee_defaulter_logs",
    "visitor_passes",
    "timetable_constraints", "class_timetable_slots",
    "board_loc_candidates",
    "staff_salary_structures", "monthly_payroll_runs", "staff_monthly_payslips",
    "alumni_profiles", "endowment_campaigns", "alumni_donations"
  ];

  const existing: string[] = [];
  const missing: string[] = [];

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select("*").limit(0);
      if (!error) {
        existing.push(table);
      } else if (error.code === "42P01") { // undefined_table
        missing.push(table);
      } else {
        existing.push(`${table} (${error.message})`);
      }
    } catch {
      missing.push(table);
    }
  }

  console.log(`\n=================================================`);
  console.log(`LIVE DATABASE SCHEMA AUDIT RESULTS`);
  console.log(`=================================================`);
  console.log(`Existing Tables in DB (${existing.length}):`);
  existing.forEach((t) => console.log(`  ✓ ${t}`));
  console.log(`\nMissing Tables in DB (${missing.length}):`);
  missing.forEach((t) => console.log(`  ✗ ${t}`));
}

main();
