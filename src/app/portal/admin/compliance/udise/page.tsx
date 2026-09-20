"use client";

import { useState } from "react";
import {
  INITIAL_UDISE_RECORDS,
  generateUdisePlusPackage,
} from "@/actions/admin-compliance";
import type { UdiseDemographicRecord, UdiseExportSummary } from "@/types/admin-extended";

export default function AdminUdiseCompliancePage() {
  const [records, setRecords] = useState<UdiseDemographicRecord[]>(INITIAL_UDISE_RECORDS);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSummary, setExportSummary] = useState<UdiseExportSummary | null>(null);
  const [exportedPayload, setExportedPayload] = useState<string | null>(null);

  async function handleExport(format: "JSON" | "CSV_DCF") {
    setIsExporting(true);
    const res = await generateUdisePlusPackage(format);
    if (res.success && res.summary) {
      setExportSummary(res.summary);
      setExportedPayload(res.payloadString || null);

      // Trigger browser download
      const blob = new Blob([res.payloadString || ""], { type: format === "JSON" ? "application/json" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || `UDISE_PLUS_EXPORT.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsExporting(false);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Level 2: Regulatory Compliance</span>
              <span>·</span>
              <span>Ministry of Education (GoI)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Government Compliance Exporter (UDISE+)
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Eliminate a month of clerical re-typing into government portals. Finkfold automatically compiles student demographics, caste, Aadhaar verification, and CWSN into ready-to-upload UDISE+ JSON and Data Capture Format (DCF) files.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("JSON")}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download UDISE+ JSON
            </button>
            <button
              onClick={() => handleExport("CSV_DCF")}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              Export Excel DCF
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Audited</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">842 Students</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">UDISE Code: 28190400102</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aadhaar Verified</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">99.5%</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">838 of 842 verified with UIDAI</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">BPL / EWS Quota</div>
          <div className="text-xl font-bold text-sky-700 mt-1 font-mono">148 Students</div>
          <div className="text-[10px] text-slate-500 mt-1">17.6% Section 12(1)(c) compliance</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CWSN / Inclusion</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">6 Students</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">IEP accommodations mapped</div>
        </div>
      </div>

      {/* Export Success Message */}
      {exportSummary && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm">
              ✓ UDISE+ Package Successfully Compiled for Academic Year {exportSummary.academicYear}
            </div>
            <span className="text-xs font-mono text-emerald-700">Format: {exportSummary.exportFormat}</span>
          </div>
          <p className="text-xs text-emerald-800">
            Export contains <strong>{exportSummary.compliantRecordsCount} fully compliant records</strong>. File is formatted to exact Ministry of Education UDISE+ specifications and is ready for immediate upload to the official portal.
          </p>
        </div>
      )}

      {/* Demographics Audit Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Student Demographic Data Capture Audit
          </h2>
          <span className="text-xs text-slate-500">Ministry DCF Schema v3.4.1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Admission & Name</th>
                <th className="p-3">Aadhaar Status</th>
                <th className="p-3">Social Category</th>
                <th className="p-3">Minority Group</th>
                <th className="p-3">Mother Tongue</th>
                <th className="p-3">Income Slab</th>
                <th className="p-3 text-center">Instructional Days</th>
                <th className="p-3 text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{r.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{r.admissionNumber}</div>
                  </td>
                  <td className="p-3 font-mono">
                    {r.aadhaarStatus === "verified" ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span>✓</span> Verified
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <span>●</span> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                      {r.socialCategory}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">{r.minorityGroup}</td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">{r.motherTongueCode}</td>
                  <td className="p-3 text-slate-700 font-mono">{r.parentAnnualIncomeSlab}</td>
                  <td className="p-3 text-center font-mono text-slate-700">
                    {r.previousYearAttendanceDays} / {r.totalInstructionalDays}
                  </td>
                  <td className="p-3 text-center">
                    {r.status === "compliant" ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Compliant
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold" title={r.missingFields.join(", ")}>
                        ⚠️ Missing Fields
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
