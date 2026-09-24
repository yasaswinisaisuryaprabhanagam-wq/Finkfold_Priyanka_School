"use client";

import { SCHOOL } from "@/lib/school-config";
import type { MultiTierExamRecord, EarlierYearMarksArchive, AiWorksheet } from "@/types/self-service";

/**
 * Triggers a native browser download for a generated document
 */
function triggerDownload(content: string, filename: string, mimeType: string = "text/html") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-ready window and triggers print dialog (enabling Save to PDF)
 */
function openPrintableDocument(title: string, bodyHtml: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to view and download your PDF document.");
    return;
  }

  const doc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      margin: 0;
      padding: 30px;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 70px;
      font-weight: 900;
      color: rgba(99, 102, 241, 0.04);
      pointer-events: none;
      white-space: nowrap;
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
    }
    .header {
      border-bottom: 2px solid #1e293b;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .school-name {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .school-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .doc-badge {
      display: inline-block;
      padding: 6px 14px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 10px;
      color: #3730a3;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 12px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .info-val {
      font-weight: 700;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .grade-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
      background: #dcfce7;
      color: #166534;
    }
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .sig-block {
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    .sig-line {
      font-family: serif;
      font-style: italic;
      font-size: 16px;
      color: #1e1b4b;
      margin-bottom: 4px;
    }
    .print-bar {
      margin-bottom: 20px;
      text-align: right;
    }
    .btn-print {
      background: #0f172a;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      body { padding: 0; }
      .sheet { border: none; box-shadow: none; padding: 20px; max-width: 100%; }
      .print-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="sheet">
    <div class="watermark">OFFICIAL EVALUATION</div>
    ${bodyHtml}
  </div>
  <script>
    setTimeout(() => {
      window.print();
    }, 500);
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(doc);
  printWindow.document.close();
}

/**
 * 1. Download official Report Card PDF
 */
export function downloadReportCardPDF(
  exam: MultiTierExamRecord,
  studentName: string = "Aarav Sharma",
  admissionNo: string = "PRIY-2026-001",
  classGrade: string = "Class 10 - Section A"
) {
  const totalMax = exam.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const totalObtained = exam.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const percentage = ((totalObtained / totalMax) * 100).toFixed(1);

  const rowsHtml = exam.subjects
    .map(
      (sub) => `
    <tr>
      <td><strong>${sub.subject}</strong> <span style="color:#64748b; font-size:10px;">(${sub.code})</span></td>
      <td style="text-align:center; font-weight:700;">${sub.marksObtained}</td>
      <td style="text-align:center; color:#64748b;">${sub.maxMarks}</td>
      <td style="text-align:center; color:#64748b;">${sub.classAverage}</td>
      <td style="text-align:center;"><span class="grade-badge">${sub.grade}</span></td>
      <td style="text-align:right; font-weight:600; color:#475569;">${sub.percentile}th %ile</td>
    </tr>
  `
    )
    .join("");

  const bodyHtml = `
    <div class="header">
      <div>
        <div class="school-name">${SCHOOL.name}</div>
        <div class="school-sub">Affiliation: ${SCHOOL.affiliation} • Branch: Main Campus</div>
        <div class="school-sub">${SCHOOL.address}</div>
      </div>
      <div style="text-align:right;">
        <span class="doc-badge">Official Report Card</span>
        <div style="font-size:10px; color:#64748b; margin-top:4px;">Academic Session 2026-27</div>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-label">Student Name</div>
        <div class="info-val">${studentName}</div>
      </div>
      <div>
        <div class="info-label">Admission Number</div>
        <div class="info-val">${admissionNo}</div>
      </div>
      <div>
        <div class="info-label">Class & Section</div>
        <div class="info-val">${classGrade}</div>
      </div>
      <div>
        <div class="info-label">Class Rank</div>
        <div class="info-val">#${exam.rankInClass} of ${exam.totalStudents}</div>
      </div>
      <div>
        <div class="info-label">Assessment</div>
        <div class="info-val">${exam.examName}</div>
      </div>
      <div>
        <div class="info-label">Term / Cycle</div>
        <div class="info-val">${exam.term}</div>
      </div>
      <div>
        <div class="info-label">Evaluation Date</div>
        <div class="info-val">${exam.date}</div>
      </div>
      <div>
        <div class="info-label">Cumulative Result</div>
        <div class="info-val" style="color:#3730a3;">${percentage}% (${percentage >= "85" ? "Distinction" : "First Class"})</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Subject & Curriculum Code</th>
          <th style="text-align:center;">Marks Scored</th>
          <th style="text-align:center;">Max Marks</th>
          <th style="text-align:center;">Class Average</th>
          <th style="text-align:center;">Grade</th>
          <th style="text-align:right;">Class Standing</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="background:#f8fafc; font-weight:800; border-top:2px solid #cbd5e1;">
          <td>GRAND TOTAL & OVERALL PERCENTAGE</td>
          <td style="text-align:center; color:#0f172a; font-size:13px;">${totalObtained}</td>
          <td style="text-align:center; color:#64748b;">${totalMax}</td>
          <td style="text-align:center; color:#64748b;">—</td>
          <td style="text-align:center;"><span class="grade-badge" style="background:#c7d2fe; color:#312e81;">A1</span></td>
          <td style="text-align:right; color:#3730a3; font-size:13px;">${percentage}%</td>
        </tr>
      </tbody>
    </table>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; font-size:11px; color:#475569; margin-bottom:20px;">
      <strong>Faculty Remarks:</strong> Demonstrates remarkable mastery across mathematical problem solving and science experimental reasoning. Recommended for State Level Olympiad Training.
    </div>

    <div class="footer-signatures">
      <div class="sig-block">
        <div class="sig-line">Mrs. G. Madhavi, M.Sc., B.Ed.</div>
        <div>Class Teacher</div>
      </div>
      <div class="sig-block" style="text-align:center;">
        <div style="font-family:monospace; font-size:10px; color:#6366f1; border:1px dashed #a5b4fc; padding:4px 8px; border-radius:4px;">
          QR VERIFIED: FINK-${exam.id.toUpperCase()}-VERIFIED
        </div>
        <div style="margin-top:2px;">Digital Seal of Examination</div>
      </div>
      <div class="sig-block">
        <div class="sig-line">Dr. K. Radhika Devi, M.A., Ph.D.</div>
        <div>Principal & Head of Institution</div>
      </div>
    </div>
  `;

  openPrintableDocument(`${exam.examName} - ${studentName}`, bodyHtml);
  triggerDownload(bodyHtml, `Report_Card_${exam.id}_${admissionNo}.html`);
}

/**
 * 2. Download Remedial Practice Worksheet PDF
 */
export function downloadWorksheetPDF(
  worksheet: AiWorksheet,
  studentName: string = "Aarav Sharma",
  classGrade: string = "Class 10-A"
) {
  const bodyHtml = `
    <div class="header">
      <div>
        <div class="school-name">${SCHOOL.name} • AI Learning Hub</div>
        <div class="school-sub">Weekend Remedial Practice & Concept Mastery Drill</div>
      </div>
      <div style="text-align:right;">
        <span class="doc-badge" style="background:#fef3c7; border-color:#fde68a; color:#92400e;">Targeted Practice</span>
        <div style="font-size:10px; color:#64748b; margin-top:4px;">Estimated Time: ${worksheet.estimatedMinutes} Mins</div>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-label">Student Name</div>
        <div class="info-val">${studentName}</div>
      </div>
      <div>
        <div class="info-label">Class</div>
        <div class="info-val">${classGrade}</div>
      </div>
      <div>
        <div class="info-label">Subject</div>
        <div class="info-val">${worksheet.subject}</div>
      </div>
      <div>
        <div class="info-label">Target Topic</div>
        <div class="info-val">${worksheet.topic}</div>
      </div>
    </div>

    <div style="margin-bottom:24px; font-size:12px;">
      <h3 style="font-size:14px; color:#0f172a; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
        Section A: Conceptual Foundation Drills (5 Questions • 2 Marks Each)
      </h3>
      <ol style="padding-left:20px; line-height:1.8; color:#334155;">
        <li>Define the standard algebraic form of a quadratic equation and write the discriminant condition for real and distinct roots.</li>
        <li>For the polynomial P(x) = 2x² - 8x + 6, find the sum and product of the zeroes without calculating the roots directly.</li>
        <li>State the graphical significance of the discriminant when Δ < 0 on a Cartesian coordinate plane.</li>
        <li>Determine whether x = -3 is a solution to the equation 3x² + 7x - 6 = 0.</li>
        <li>Express the relationship between the coefficients and roots of ax² + bx + c = 0 in terms of α + β and αβ.</li>
      </ol>

      <h3 style="font-size:14px; color:#0f172a; margin-top:20px; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
        Section B: Applied Problem Solving (5 Questions • 3 Marks Each)
      </h3>
      <ol start="6" style="padding-left:20px; line-height:1.8; color:#334155;">
        <li>Solve using the method of completing the square: 2x² - 5x + 3 = 0. Show all intermediate factoring steps.</li>
        <li>The diagonal of a rectangular field is 60 meters more than the shorter side. If the longer side is 30 meters more than the shorter side, find the sides of the field.</li>
        <li>Find the values of k for which the quadratic equation (k + 1)x² - 2(k - 1)x + 1 = 0 has real and equal roots.</li>
        <li>An express train takes 1 hour less than a passenger train to travel 132 km between two stations. If the average speed of the express train is 11 km/h more than that of the passenger train, find their average speeds.</li>
        <li>Prove that the roots of the equation (a - b)x² + (b - c)x + (c - a) = 0 are always rational if a, b, and c are rational numbers.</li>
      </ol>

      <h3 style="font-size:14px; color:#0f172a; margin-top:20px; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
        Section C: Board Exam Higher-Order Thinking Skills (5 Questions • 5 Marks Each)
      </h3>
      <ol start="11" style="padding-left:20px; line-height:1.8; color:#334155;">
        <li>A motor boat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than to return downstream to the same spot. Find the speed of the stream.</li>
        <li>Two water taps together can fill a tank in 9⅜ hours. The tap of larger diameter takes 10 hours less than the smaller one to fill the tank separately. Find the time in which each tap can separately fill the tank.</li>
        <li>If -5 is a root of the quadratic equation 2x² + px - 15 = 0 and the quadratic equation p(x² + x) + k = 0 has equal roots, find the value of k.</li>
        <li>Construct a quadratic equation whose roots are reciprocal to the roots of ax² + bx + c = 0.</li>
        <li>Synthesize the complete step-by-step parabolic vertex formula derivation and explain its application in projectile trajectory optimization.</li>
      </ol>
    </div>

    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px; font-size:11px; color:#166534; margin-top:20px;">
      <strong>✓ AI Teacher Diagnostic Key:</strong> Worksheets submitted via student portal or physical homeroom drop-box are auto-assessed. Completing this worksheet earns <strong>+15 Merit Points</strong> on your conduct ledger.
    </div>
  `;

  openPrintableDocument(`${worksheet.title} - ${studentName}`, bodyHtml);
  triggerDownload(bodyHtml, `Remedial_Worksheet_${worksheet.id}.html`);
}

/**
 * 3. Download Archived Earlier Year Marksheet PDF
 */
export function downloadArchivedMarksheetPDF(
  archive: EarlierYearMarksArchive,
  studentName: string = "Aarav Sharma",
  admissionNo: string = "PRIY-2026-001"
) {
  const bodyHtml = `
    <div class="header">
      <div>
        <div class="school-name">${SCHOOL.name}</div>
        <div class="school-sub">Archived Cumulative Dossier & Permanent Record</div>
      </div>
      <div style="text-align:right;">
        <span class="doc-badge" style="background:#f1f5f9; border-color:#cbd5e1; color:#334155;">Historical Archive</span>
        <div style="font-size:10px; color:#64748b; margin-top:4px;">Academic Year: ${archive.academicYear}</div>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-label">Student Name</div>
        <div class="info-val">${studentName}</div>
      </div>
      <div>
        <div class="info-label">Admission Number</div>
        <div class="info-val">${admissionNo}</div>
      </div>
      <div>
        <div class="info-label">Recorded Class</div>
        <div class="info-val">${archive.classGrade}</div>
      </div>
      <div>
        <div class="info-label">Cumulative GPA</div>
        <div class="info-val" style="color:#166534;">${archive.annualGpa}</div>
      </div>
      <div>
        <div class="info-label">Aggregate Percentage</div>
        <div class="info-val">${archive.percentage}%</div>
      </div>
      <div>
        <div class="info-label">Annual Attendance</div>
        <div class="info-val">${archive.attendancePercent}% (Compliant)</div>
      </div>
      <div>
        <div class="info-label">Conduct Assessment</div>
        <div class="info-val">${archive.conductGrade} (Exemplary)</div>
      </div>
      <div>
        <div class="info-label">Record Status</div>
        <div class="info-val">Verified & Archived</div>
      </div>
    </div>

    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px; padding:16px; margin-bottom:24px;">
      <h4 style="font-size:12px; font-weight:800; color:#581c87; margin:0 0 6px 0; text-transform:uppercase;">
        🏆 Recorded Institutional Honors & Co-Curricular Accolades
      </h4>
      <p style="font-size:12px; color:#6b21a8; line-height:1.6; margin:0;">
        ${archive.keyHonors}
      </p>
    </div>

    <div class="footer-signatures">
      <div class="sig-block">
        <div class="sig-line">Registrar of Institutional Archives</div>
        <div>Record Office</div>
      </div>
      <div class="sig-block" style="text-align:center;">
        <div style="font-family:monospace; font-size:10px; color:#64748b; border:1px solid #cbd5e1; padding:4px 8px; border-radius:4px;">
          CRYPT-ARCHIVE-${archive.academicYear.replace(/[^a-zA-Z0-9]/g, "")}-OK
        </div>
        <div style="margin-top:2px;">Sealed Archive Dossier</div>
      </div>
      <div class="sig-block">
        <div class="sig-line">Dr. K. Radhika Devi</div>
        <div>Principal</div>
      </div>
    </div>
  `;

  openPrintableDocument(`Archived Marksheet ${archive.academicYear} - ${studentName}`, bodyHtml);
  triggerDownload(bodyHtml, `Archived_Marksheet_${archive.academicYear.replace(/[^a-zA-Z0-9]/g, "_")}.html`);
}
