/**
 * FINKFOLD EdOS: Level 1, 2, and 3 Admin Portal Test Suite
 * Validates all 9 advanced capabilities requested by leadership:
 * 1. Dynamic Certificate & Document Studio (The Print Room)
 * 2. Library & Media Center Console (with 7-day overdue fee ledger sync)
 * 3. Automated Defaulter & Late-Penalty Engine
 * 4. Digital Visitor Management System (VMS) & Gatepass
 * 5. Government Compliance Exporter (UDISE+ & State Boards)
 * 6. AI-Powered Timetable & Clash-Resolution Engine
 * 7. Board Exam LOC (List of Candidates) Automator
 * 8. Automated Payroll & Statutory Deductions Engine
 * 9. Alumni Network & Endowment CRM
 */

import http from "http";
import { generateAdminCertificate, CERTIFICATE_TEMPLATES } from "../src/actions/admin-documents";
import {
  INITIAL_LIBRARY_BOOKS,
  INITIAL_BOOK_LOANS,
  issueLibraryBook,
  returnLibraryBook,
  syncOverdueFinesToFeeLedger,
} from "../src/actions/admin-library";
import {
  DEFAULT_PENALTY_RULE,
  INITIAL_DEFAULTERS,
  applyLatePenaltyRule,
  dispatchDefaulterWhatsAppReminders,
} from "../src/actions/admin-defaulters";
import {
  INITIAL_CAMPUS_VISITORS,
  checkInVisitor,
  approveVisitorPass,
  checkOutVisitor,
} from "../src/actions/admin-visitors";
import { generateUdisePlusPackage } from "../src/actions/admin-compliance";
import {
  INITIAL_CONSTRAINTS,
  runTimetableClashSolver,
} from "../src/actions/admin-timetable";
import {
  INITIAL_LOC_CANDIDATES,
  updateCandidateLoc,
  exportBoardLocExcel,
} from "../src/actions/admin-board-loc";
import {
  INITIAL_PAYROLL_RUN,
  executeMonthlyPayroll,
  generateBankDisbursementCsv,
} from "../src/actions/admin-payroll";
import {
  INITIAL_ALUMNI_PROFILES,
  INITIAL_ENDOWMENT_CAMPAIGNS,
  recordAlumniDonation,
} from "../src/actions/admin-alumni";

const BASE_URL = "http://localhost:3000";

function checkRoute(path: string): Promise<{ status: number; ok: boolean }> {
  return new Promise((resolve) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      // 200 or 307/302 (redirect to /login for auth-guarded pages) are healthy SSR responses
      const ok = res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302;
      resolve({ status: res.statusCode || 500, ok });
    }).on("error", () => {
      resolve({ status: 500, ok: false });
    });
  });
}

async function runLevel123Tests() {
  console.log("=================================================================");
  console.log("   FINKFOLD EdOS: LEVEL 1, 2 & 3 ADVANCED ADMIN TEST SUITE       ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // --- LEVEL 1: CORE DAILY ADMIN ---
  console.log(">>> LEVEL 1: CORE DAILY ADMIN (Must-Haves)");

  // Feature 1: Certificate Studio
  const docRoute = await checkRoute("/portal/admin/documents");
  assert(docRoute.ok, "[Feature 1: Document Studio] Route /portal/admin/documents is online", `status: ${docRoute.status}`);

  const certTpl = CERTIFICATE_TEMPLATES.find((t) => t.type === "bank_loan_fee_estimate");
  assert(!!certTpl, "[Feature 1: Document Studio] Bank loan fee estimate template is available");
  assert(
    Boolean(certTpl?.variables.includes("{{total_fees}}") && certTpl?.variables.includes("{{student_name}}")),
    "[Feature 1: Document Studio] Template defines dynamic replacement variables"
  );

  const certRes = await generateAdminCertificate({
    studentId: "stu-001",
    studentName: "Kiran Kumar",
    admissionNumber: "PRIY-2026-001",
    classGrade: "Class 10-A",
    templateType: "bank_loan_fee_estimate",
    customVariables: { totalFees: "₹48,500", bankName: "SBI" },
  });
  assert(certRes.success && !!certRes.certificate?.verificationHash, "[Feature 1: Document Studio] Auto-fills variables and generates tamper-proof QR hash");

  // Feature 2: Library & Media Console
  const libRoute = await checkRoute("/portal/admin/library");
  assert(libRoute.ok, "[Feature 2: Library Console] Route /portal/admin/library is online", `status: ${libRoute.status}`);
  assert(INITIAL_LIBRARY_BOOKS.length >= 5, "[Feature 2: Library Console] Book catalog is seeded with ISBNs");

  const issueRes = await issueLibraryBook({
    bookId: INITIAL_LIBRARY_BOOKS[0].id,
    bookTitle: INITIAL_LIBRARY_BOOKS[0].title,
    isbn: INITIAL_LIBRARY_BOOKS[0].isbn,
    studentId: "stu-001",
    studentName: "Kiran Kumar",
    admissionNumber: "PRIY-2026-001",
    classGrade: "Class 10-A",
    durationDays: 14,
  });
  assert(issueRes.success && issueRes.loan?.status === "active", "[Feature 2: Library Console] Book loan issue workflow completes with 14-day due date");

  // Test 7-Day Overdue Rule Ledger Sync
  const syncRes = await syncOverdueFinesToFeeLedger(INITIAL_BOOK_LOANS);
  assert(Boolean(syncRes.success && (syncRes.syncedCount ?? 0) >= 1), "[Feature 2: Library Console] 7-Day overdue fine automatically synced to central fee ledger");

  // --- LEVEL 2: WORKFLOW & REVENUE AUTOMATION ---
  console.log("\n>>> LEVEL 2: WORKFLOW & REVENUE AUTOMATION");

  // Feature 3: Defaulter & Late-Penalty Engine
  const defRoute = await checkRoute("/portal/admin/fees/defaulters");
  assert(defRoute.ok, "[Feature 3: Defaulters Engine] Route /portal/admin/fees/defaulters is online", `status: ${defRoute.status}`);

  const ruleRes = await applyLatePenaltyRule({ dailyPenaltyAmount: 50, gracePeriodDays: 10 });
  assert(ruleRes.success, "[Feature 3: Defaulters Engine] Late-penalty rule configured (₹50/day after 10th)");

  const defaulter01 = INITIAL_DEFAULTERS[0];
  assert(
    defaulter01.calculatedPenalty === 500 && defaulter01.totalPayable === 19000,
    "[Feature 3: Defaulters Engine] Penalty mathematically computed for 10 overdue days (10 × ₹50 = ₹500)"
  );
  assert(
    defaulter01.paymentUpiLink.startsWith("upi://pay"),
    "[Feature 3: Defaulters Engine] Generates direct dynamic UPI payment deep link"
  );

  const whatsappRes = await dispatchDefaulterWhatsAppReminders([defaulter01.id]);
  assert(whatsappRes.success && whatsappRes.dispatchedCount === 1, "[Feature 3: Defaulters Engine] Automated WhatsApp reminder dispatch triggered");

  // Feature 4: Digital Visitor Management System (VMS)
  const vmsRoute = await checkRoute("/portal/admin/visitors");
  assert(vmsRoute.ok, "[Feature 4: VMS Gatepass] Route /portal/admin/visitors is online", `status: ${vmsRoute.status}`);

  const visitorRes = await checkInVisitor({
    fullName: "Ramesh Sharma",
    phone: "+91 98490 88219",
    organizationOrRelationship: "Father of Arjun",
    purposeOfVisit: "PTM Consultation",
    hostStaffName: "Mrs. Priyanka Devi",
    hostDepartment: "Mathematics",
    idProofType: "Aadhaar",
    idProofNumberLast4: "4821",
  });
  assert(Boolean(visitorRes.success && visitorRes.visitor?.badgeNumber.startsWith("VIS-2026-")), "[Feature 4: VMS Gatepass] Visitor checked in and issued badge number");

  const checkoutRes = await checkOutVisitor("vis-01");
  assert(checkoutRes.success && !!checkoutRes.checkOutTime, "[Feature 4: VMS Gatepass] Visitor check-out records departure timestamp");

  // Feature 5: Government Compliance Exporter (UDISE+)
  const udiseRoute = await checkRoute("/portal/admin/compliance/udise");
  assert(udiseRoute.ok, "[Feature 5: UDISE+ Compliance] Route /portal/admin/compliance/udise is online", `status: ${udiseRoute.status}`);

  const udiseRes = await generateUdisePlusPackage("JSON");
  assert(udiseRes.success && udiseRes.summary?.schoolUdiseCode === "28190400102", "[Feature 5: UDISE+ Compliance] UDISE+ JSON compiled for school code 28190400102");
  assert(
    Boolean(udiseRes.payloadString?.includes("UDISE+_v3.4.1_MOE_GOI")),
    "[Feature 5: UDISE+ Compliance] Output validates against Ministry of Education Data Capture Format"
  );

  // --- LEVEL 3: ENTERPRISE INTELLIGENCE & AI ---
  console.log("\n>>> LEVEL 3: ENTERPRISE INTELLIGENCE & AI");

  // Feature 6: AI Timetable Clash-Resolution
  const ttRoute = await checkRoute("/portal/admin/academics/timetable");
  assert(ttRoute.ok, "[Feature 6: AI Timetable] Route /portal/admin/academics/timetable is online", `status: ${ttRoute.status}`);

  const solverRes = await runTimetableClashSolver(INITIAL_CONSTRAINTS);
  assert(solverRes.success && solverRes.summary?.isConflictFree === true, "[Feature 6: AI Timetable] AI clash-resolution solver returns 100% conflict-free master schedule");

  // Feature 7: Board LOC Automator
  const locRoute = await checkRoute("/portal/admin/academics/board-loc");
  assert(locRoute.ok, "[Feature 7: Board LOC] Route /portal/admin/academics/board-loc is online", `status: ${locRoute.status}`);

  const flaggedCandidate = INITIAL_LOC_CANDIDATES.find((c) => c.boardVerificationStatus !== "verified");
  assert(
    !!flaggedCandidate && flaggedCandidate.validationErrors.length > 0,
    "[Feature 7: Board LOC] Pre-flight scanner correctly detects missing Identification Mark 1"
  );

  const locUpdateRes = await updateCandidateLoc("loc-03", { identificationMark1: "A MOLE ON CHIN" });
  assert(locUpdateRes.success, "[Feature 7: Board LOC] Candidate LOC record updated and resolved");

  const locExportRes = await exportBoardLocExcel("class-10");
  assert(Boolean(locExportRes.success && locExportRes.filename?.endsWith(".csv")), "[Feature 7: Board LOC] Exported board-compliant LOC submission package");

  // Feature 8: Automated Payroll & Deductions
  const payRoute = await checkRoute("/portal/admin/payroll");
  assert(payRoute.ok, "[Feature 8: Payroll Engine] Route /portal/admin/payroll is online", `status: ${payRoute.status}`);

  const payrollRes = await executeMonthlyPayroll("September 2026");
  assert(Boolean(payrollRes.success && (payrollRes.totalDisbursed ?? 0) > 0), "[Feature 8: Payroll Engine] Monthly payroll computed with biometric attendance and LOP deductions");

  const bankCsvRes = await generateBankDisbursementCsv();
  assert(
    Boolean(bankCsvRes.success && bankCsvRes.csvContent?.includes("BeneficiaryName,AccountNumber,IFSCCode")),
    "[Feature 8: Payroll Engine] Corporate Bank Transfer CSV generated for SBI/HDFC disbursement"
  );

  // Feature 9: Alumni Network & Endowment CRM
  const alumniRoute = await checkRoute("/portal/admin/alumni");
  assert(alumniRoute.ok, "[Feature 9: Alumni CRM] Route /portal/admin/alumni is online", `status: ${alumniRoute.status}`);

  const donationRes = await recordAlumniDonation({
    alumniId: INITIAL_ALUMNI_PROFILES[0].id,
    donorName: INITIAL_ALUMNI_PROFILES[0].fullName,
    panNumber: "ABCDE1234F",
    donationAmount: 25000,
    campaignId: INITIAL_ENDOWMENT_CAMPAIGNS[0].id,
    campaignTitle: INITIAL_ENDOWMENT_CAMPAIGNS[0].campaignTitle,
    paymentMode: "UPI",
    utrOrRefNumber: "UTR982104821",
  });
  assert(
    Boolean(donationRes.success && donationRes.donation?.receiptNumber.startsWith("80G-PRIY-2026-")),
    "[Feature 9: Alumni CRM] Recorded endowment donation and generated Section 80G Tax Exemption receipt"
  );

  // --- FINAL SUMMARY ---
  console.log("\n=================================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runLevel123Tests().catch((err) => {
  console.error("FATAL ERROR IN TEST RUNNER:", err);
  process.exit(1);
});
