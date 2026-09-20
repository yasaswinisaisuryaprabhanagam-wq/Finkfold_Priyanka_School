"use client";

import { useState } from "react";
import { SCHOOL } from "@/lib/school-config";
import {
  CERTIFICATE_TEMPLATES,
  INITIAL_GENERATED_CERTIFICATES,
  generateAdminCertificate,
} from "@/actions/admin-documents";
import type { CertificateType, GeneratedAdminCertificate } from "@/types/admin-extended";

const SAMPLE_STUDENTS = [
  { id: "stu-001", name: "Kiran Kumar", admissionNo: "PRIY-2026-001", classGrade: "Class 10 - Section A", fatherName: "Mr. K. Ranganatham", totalFees: "₹48,500" },
  { id: "stu-002", name: "Yasaswini S.", admissionNo: "PRIY-2026-002", classGrade: "Class 10 - Section A", fatherName: "Mr. S. Prabhakar Rao", totalFees: "₹48,500" },
  { id: "stu-003", name: "Kethan Reddy", admissionNo: "PRIY-2026-003", classGrade: "Class 10 - Section A", fatherName: "Mr. K. Pratap Reddy", totalFees: "₹48,500" },
  { id: "stu-004", name: "M. Sai Charan", admissionNo: "PRIY-2026-088", classGrade: "Class 10 - Section B", fatherName: "Mr. M. Venkateswara Rao", totalFees: "₹48,500" },
];

export default function AdminDocumentStudioPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateType>("bank_loan_fee_estimate");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("stu-001");
  const [customBankName, setCustomBankName] = useState("State Bank of India (Trunk Road Branch)");
  const [customTuitionFees, setCustomTuitionFees] = useState("₹36,000");
  const [customTransportFees, setCustomTransportFees] = useState("₹9,500");
  const [customLabFees, setCustomLabFees] = useState("₹3,000");
  const [customConduct, setCustomConduct] = useState("Exemplary (Grade A+)");
  const [issuedCerts, setIssuedCerts] = useState<GeneratedAdminCertificate[]>(INITIAL_GENERATED_CERTIFICATES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCert, setPreviewCert] = useState<GeneratedAdminCertificate | null>(INITIAL_GENERATED_CERTIFICATES[0]);

  const activeStudent = SAMPLE_STUDENTS.find((s) => s.id === selectedStudentId) || SAMPLE_STUDENTS[0];
  const activeTpl = CERTIFICATE_TEMPLATES.find((t) => t.type === selectedTemplate) || CERTIFICATE_TEMPLATES[0];

  async function handleGenerate() {
    setIsGenerating(true);
    const customVars: Record<string, string> = {
      bankName: customBankName,
      tuitionFees: customTuitionFees,
      transportFees: customTransportFees,
      labFees: customLabFees,
      totalFees: "₹48,500",
      fatherName: activeStudent.fatherName,
      conductGrade: customConduct,
    };

    const res = await generateAdminCertificate({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      admissionNumber: activeStudent.admissionNo,
      classGrade: activeStudent.classGrade,
      templateType: selectedTemplate,
      customVariables: customVars,
    });

    if (res.success && res.certificate) {
      setIssuedCerts([res.certificate, ...issuedCerts]);
      setPreviewCert(res.certificate);
    }
    setIsGenerating(false);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Level 1: Daily Admin Core</span>
              <span>·</span>
              <span>The Print Room</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Dynamic Certificate & Document Studio
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Eliminate Microsoft Word typing errors. Select a student and an official institutional template to generate tamper-proof, digitally signed certificates with verification QR codes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Certificate (A4)
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Generator Controls + Live Tamper-Proof Document View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Template Selector Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              1. Choose Document Template
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              {CERTIFICATE_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.type;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.type)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-300 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{tpl.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{tpl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Selector Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              <span className="h-2 w-2 rounded-full bg-sky-600" />
              2. Select Target Student
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enrolled Candidate</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {SAMPLE_STUDENTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo}) — {s.classGrade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Variables depending on template */}
              {selectedTemplate === "bank_loan_fee_estimate" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Education Loan Parameters</div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Target Bank / Branch</label>
                    <input
                      type="text"
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Tuition</label>
                      <input
                        type="text"
                        value={customTuitionFees}
                        onChange={(e) => setCustomTuitionFees(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Transport</label>
                      <input
                        type="text"
                        value={customTransportFees}
                        onChange={(e) => setCustomTransportFees(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Lab/Exam</label>
                      <input
                        type="text"
                        value={customLabFees}
                        onChange={(e) => setCustomLabFees(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === "character" && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Conduct Endorsement Grade</label>
                  <input
                    type="text"
                    value={customConduct}
                    onChange={(e) => setCustomConduct(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 mt-2"
              >
                {isGenerating ? "Compiling Certificate..." : "⚡ Generate Digitally Signed Certificate"}
              </button>
            </div>
          </div>
        </div>

        {/* Live Document Preview Column */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl bg-white border-2 border-slate-300 shadow-md relative overflow-hidden" id="certificate-print-area">
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <span className="text-9xl font-black">{SCHOOL.name.charAt(0)}</span>
            </div>

            {/* Document Header */}
            <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
              <div className="text-xs font-bold text-purple-700 tracking-widest uppercase">PRIYANKA EDUCATIONAL TRUST • REGD. NO. 412/1998</div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                {SCHOOL.name.toUpperCase()}
              </h2>
              <div className="text-[11px] text-slate-500 font-medium">
                Affiliated to CBSE / State Board of Education • Fathekhan Pet, Nellore - 524002 (A.P.)
              </div>
              <div className="pt-3">
                <span className="inline-block px-4 py-1 rounded-md bg-slate-900 text-white font-bold text-xs tracking-wider uppercase">
                  {activeTpl.sampleTitle}
                </span>
              </div>
            </div>

            {/* Serial & Date Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 py-4 font-mono">
              <div>Ref: <strong className="text-slate-900">{previewCert?.certificateNumber || "PRIY-DOC-2026-0814"}</strong></div>
              <div>Date: <strong className="text-slate-900">{previewCert?.issueDate || new Date().toISOString().slice(0, 10)}</strong></div>
            </div>

            {/* Certificate Body Text */}
            <div className="py-6 text-sm text-slate-800 leading-relaxed space-y-4">
              {selectedTemplate === "bank_loan_fee_estimate" ? (
                <>
                  <p>
                    This is to formally certify that <strong>{activeStudent.name}</strong>, Son/Daughter of{" "}
                    <strong>{activeStudent.fatherName}</strong>, bearing Admission Number{" "}
                    <strong className="font-mono">{activeStudent.admissionNo}</strong>, is a bonafide student of this institution currently pursuing{" "}
                    <strong>{activeStudent.classGrade}</strong> for the Academic Session <strong>2026-2027</strong>.
                  </p>
                  <p>
                    This institutional fee estimate is issued on official request for submission to{" "}
                    <strong>{customBankName}</strong> for the sanction of an Education Loan:
                  </p>
                  <div className="my-3 border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2 text-left">Fee Head / Component</th>
                          <th className="p-2 text-right">Approved Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        <tr>
                          <td className="p-2 text-slate-800">Annual Academic Tuition Fee</td>
                          <td className="p-2 text-right font-semibold">{customTuitionFees}</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-800">Transport & Safe Bus Routing Fee</td>
                          <td className="p-2 text-right font-semibold">{customTransportFees}</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-slate-800">Science Lab, Smartboard & Examination Fee</td>
                          <td className="p-2 text-right font-semibold">{customLabFees}</td>
                        </tr>
                        <tr className="bg-purple-50/50 font-bold text-purple-900">
                          <td className="p-2">Total Estimated Annual Fee Obligation</td>
                          <td className="p-2 text-right text-sm">₹48,500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p>
                  This is to certify that <strong>{activeStudent.name}</strong>, Son/Daughter of{" "}
                  <strong>{activeStudent.fatherName}</strong>, Admission No:{" "}
                  <strong className="font-mono">{activeStudent.admissionNo}</strong>, is a bonafide student of{" "}
                  <strong>{activeStudent.classGrade}</strong> in our institution for the academic year <strong>2026-2027</strong>.
                  To the best of our knowledge, their moral character and conduct have been{" "}
                  <strong>{customConduct}</strong>.
                </p>
              )}
            </div>

            {/* Document Footer with Signatures & QR */}
            <div className="pt-8 border-t border-slate-200 flex items-end justify-between mt-4">
              {/* Dynamic QR Verification Box */}
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 bg-slate-100 border-2 border-slate-800 rounded-lg flex items-center justify-center p-1 shadow-xs">
                  {/* High contrast QR simulation */}
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1">
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-200" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-200" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-900 uppercase">Tamper-Proof Verification</div>
                  <div className="text-[9px] font-mono text-slate-500 max-w-[140px] truncate">
                    {previewCert?.verificationHash || "VERIF-QR-BANK-PRIY-78219"}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">● Cryptographically Signed</div>
                </div>
              </div>

              {/* Principal's Signature & Seal */}
              <div className="text-center space-y-1">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-base text-slate-800">K. Srinivas, Ph.D.</span>
                </div>
                <div className="text-xs font-bold text-slate-900 border-t border-slate-800 pt-1 px-4">
                  Principal & Administrative Officer
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Priyanka English Medium School</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
