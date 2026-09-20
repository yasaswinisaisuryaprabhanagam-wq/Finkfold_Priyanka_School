"use client";

import { useState } from "react";
import {
  INITIAL_PAYROLL_RUN,
  INITIAL_SALARY_STRUCTURES,
  executeMonthlyPayroll,
  generateBankDisbursementCsv,
} from "@/actions/admin-payroll";
import type { MonthlyPayrollItem, StaffSalaryStructure } from "@/types/admin-extended";

export default function AdminPayrollPage() {
  const [payrollItems, setPayrollItems] = useState<MonthlyPayrollItem[]>(INITIAL_PAYROLL_RUN);
  const [structures, setStructures] = useState<StaffSalaryStructure[]>(INITIAL_SALARY_STRUCTURES);
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<MonthlyPayrollItem | null>(INITIAL_PAYROLL_RUN[0]);

  const totalGross = payrollItems.reduce((acc, p) => acc + p.grossEarned, 0);
  const totalDeductions = payrollItems.reduce((acc, p) => acc + p.totalDeductions, 0);
  const totalNet = payrollItems.reduce((acc, p) => acc + p.netPayableSalary, 0);
  const totalEpf = payrollItems.reduce((acc, p) => acc + p.epfDeduction, 0);

  async function handleLockPayroll() {
    setIsProcessing(true);
    const res = await executeMonthlyPayroll(selectedMonth);
    if (res.success) {
      setStatusMessage(`✓ ${res.message}`);
      setTimeout(() => setStatusMessage(null), 5000);
    }
    setIsProcessing(false);
  }

  async function handleDownloadBankCsv() {
    const res = await generateBankDisbursementCsv();
    if (res.success && res.csvContent) {
      const blob = new Blob([res.csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || "BANK_SALARY_DISBURSEMENT.csv";
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage("✓ Corporate Bank Transfer CSV generated for SBI/HDFC Corporate NetBanking.");
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 mb-2">
              <span>Level 3: Financial HR Operations</span>
              <span>·</span>
              <span>Biometrics & Statutory Compliance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Automated Payroll & Statutory Deductions Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Merge base salary scales with live biometric punch logs and approved digital leaves. Automatically compute Loss of Pay (LOP), deduct statutory EPF, Professional Tax, and TDS, and disburse via corporate bank CSV.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBankCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Bank Transfer CSV
            </button>
            <button
              onClick={handleLockPayroll}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              ⚡ Lock & Publish Payslips
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Payroll ({selectedMonth})</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">₹{totalGross.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 3 faculty profiles</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Disbursable Salary</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">₹{totalNet.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Ready for 1-click bank transfer</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statutory Deductions</div>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">₹{totalDeductions.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">EPF + PT + TDS withheld</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">EPF Trust Challan</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">₹{totalEpf.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">12% statutory basic match</div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs">
          {statusMessage}
        </div>
      )}

      {/* Grid: Payroll Table + Digital Payslip Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payroll Register Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Faculty Monthly Payroll Register
              </h2>
              <span className="text-xs font-mono text-slate-500">Biometric Sync: 100% Punctuality Match</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Employee & Dept</th>
                    <th className="p-3 text-center">Attendance (24d)</th>
                    <th className="p-3 text-right">Gross Pay</th>
                    <th className="p-3 text-right">LOP Ded.</th>
                    <th className="p-3 text-right">EPF (12%)</th>
                    <th className="p-3 text-right">Net Payable</th>
                    <th className="p-3 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payrollItems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{p.staffName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.employeeCode} · {p.designation}</div>
                      </td>
                      <td className="p-3 text-center font-mono">
                        <div className="text-slate-800 font-semibold">{p.biometricPresentDays} Present</div>
                        <div className="text-[10px] text-slate-400">
                          {p.approvedPaidLeaveDays} Leave · {p.lossOfPayDays} LOP
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-800">
                        ₹{p.grossEarned.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-600">
                        {p.lossOfPayDeduction > 0 ? `-₹${p.lossOfPayDeduction}` : "₹0"}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-700">
                        ₹{p.epfDeduction}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">
                        ₹{p.netPayableSalary.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                        >
                          View PDF 📄
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Digital Payslip Viewer Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Digital Payslip Preview
              </h3>
              <button onClick={() => window.print()} className="text-xs text-emerald-600 font-bold hover:underline">
                Print Payslip 🖨️
              </button>
            </div>

            {selectedPayslip ? (
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 font-mono text-xs">
                <div className="text-center pb-2 border-b border-slate-200">
                  <div className="font-bold text-slate-900 text-[11px] font-sans">PRIYANKA ENGLISH MEDIUM SCHOOL</div>
                  <div className="text-[10px] text-slate-500">SALARY SLIP — {selectedPayslip.monthYear.toUpperCase()}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <div>Name: <strong className="text-slate-900">{selectedPayslip.staffName}</strong></div>
                  <div>Emp ID: <strong className="text-slate-900">{selectedPayslip.employeeCode}</strong></div>
                  <div>Designation: <strong>{selectedPayslip.designation}</strong></div>
                  <div>Days Paid: <strong>{selectedPayslip.totalWorkingDays - selectedPayslip.lossOfPayDays} / {selectedPayslip.totalWorkingDays}</strong></div>
                </div>

                <div className="border-t border-b border-slate-200 py-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Pay Earned</span>
                    <span>₹{selectedPayslip.basicSalaryEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span>₹{selectedPayslip.hraEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dearness Allowance (DA)</span>
                    <span>₹{selectedPayslip.daEarned}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Gross Earnings</span>
                    <span>₹{selectedPayslip.grossEarned.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-rose-700">
                  <div className="flex justify-between">
                    <span>EPF (12% Statutory)</span>
                    <span>-₹{selectedPayslip.epfDeduction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax (PT)</span>
                    <span>-₹{selectedPayslip.professionalTax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax (TDS)</span>
                    <span>-₹{selectedPayslip.tdsDeduction}</span>
                  </div>
                  {selectedPayslip.lossOfPayDeduction > 0 && (
                    <div className="flex justify-between">
                      <span>Loss of Pay ({selectedPayslip.lossOfPayDays}d unexcused)</span>
                      <span>-₹{selectedPayslip.lossOfPayDeduction}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-100">
                    <span>Total Deductions</span>
                    <span>-₹{selectedPayslip.totalDeductions.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center text-xs font-bold">
                  <span>Net Salary Payable</span>
                  <span className="text-sm">₹{selectedPayslip.netPayableSalary.toLocaleString("en-IN")}</span>
                </div>

                <div className="text-[9px] text-slate-400 text-center font-sans">
                  Disbursement Ref: {selectedPayslip.disbursementReference} · Digitally Signed
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">Select an employee to view payslip.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
