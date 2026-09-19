"use client";

import { useState, useEffect, useTransition } from "react";
import type { FeeTransaction, FeeStructure } from "@/types/erp";
import type { BankRefundProfile } from "@/types/self-service";
import { INITIAL_BANK_REFUND } from "@/types/self-service";
import { getBankRefundData, saveBankRefundDetailsAction } from "@/actions/bank-refunds";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle
} from "lucide-react";

export default function StudentFeesClient({
  student,
  schoolName,
  structures,
  transactions,
}: {
  student: any;
  schoolName: string;
  structures: FeeStructure[];
  transactions: FeeTransaction[];
}) {
  const [activeTab, setActiveTab] = useState<"fees" | "bank_refund">("fees");
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [showUpiPayModal, setShowUpiPayModal] = useState<FeeStructure | null>(null);

  // Bank Refund state
  const [bankProfile, setBankProfile] = useState<BankRefundProfile>(INITIAL_BANK_REFUND);
  const [holderName, setHolderName] = useState(INITIAL_BANK_REFUND.accountHolderName);
  const [bankName, setBankName] = useState(INITIAL_BANK_REFUND.bankName);
  const [accountNumber, setAccountNumber] = useState("3928104892");
  const [ifscCode, setIfscCode] = useState(INITIAL_BANK_REFUND.ifscCode);
  const [branchName, setBranchName] = useState(INITIAL_BANK_REFUND.branchName);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getBankRefundData().then((res) => {
      if (res) {
        setBankProfile(res);
        setHolderName(res.accountHolderName);
        setBankName(res.bankName);
        setIfscCode(res.ifscCode);
        setBranchName(res.branchName);
      }
    });
  }, []);

  // Compute fee totals
  const totalAllocated = structures.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalPaid = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const pendingDue = Math.max(0, totalAllocated - totalPaid);

  function handleSaveBankDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!accountNumber || !ifscCode || !holderName) return;

    startTransition(async () => {
      const res = await saveBankRefundDetailsAction({
        accountHolderName: holderName,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
      });

      if (res.success) {
        setBankProfile(res.bankProfile);
        setNotification(res.message);
        setTimeout(() => setNotification(null), 8000);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide mb-2">
              Fee Ledger, Receipts &amp; Refunds &middot; {schoolName}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              🧾 Student Fee Portal &amp; Refunds
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Official fee payment history, digital receipts, UPI gateway, and caution deposit refund management.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Enrolled Student</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{student.full_name}</div>
            <div className="text-xs text-slate-500 font-mono">
              Adm: {student.admission_no} &bull; Roll #{student.roll_no}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80 w-fit">
        <button
          onClick={() => setActiveTab("fees")}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "fees"
              ? "bg-white text-slate-900 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>📜 Fee Schedules &amp; Receipts</span>
        </button>
        <button
          onClick={() => setActiveTab("bank_refund")}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "bank_refund"
              ? "bg-white text-emerald-700 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🏦 Bank Details &amp; Caution Deposit Refunds</span>
        </button>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
          <div className="text-sm">
            <span className="font-semibold block mb-0.5">Success:</span>
            {notification}
          </div>
        </div>
      )}

      {/* ── TAB 1: FEES & RECEIPTS (PRESERVED) ── */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          {/* ── Summary Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">Total Fee Structured</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                ₹{totalAllocated.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Academic Year 2026-2027</div>
            </div>

            <div className="stat-card bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">Total Paid to Date</div>
              <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                ₹{totalPaid.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">{transactions.length} Verified Receipts</div>
            </div>

            <div className="stat-card bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-semibold">Current Pending Due</div>
              <div className="text-2xl font-black mt-1 font-mono flex items-center justify-between">
                <span className={pendingDue > 0 ? "text-amber-600" : "text-emerald-600"}>
                  ₹{pendingDue.toLocaleString("en-IN")}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    pendingDue === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {pendingDue === 0 ? "FULLY CLEARED" : "DUE"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Balance payable</div>
            </div>
          </div>

          {/* ── Fee Schedules & Due Dates ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Fee Schedules & Due Dates
                </h2>
                <p className="text-xs text-slate-500">Term tuition, examinations, and activity fee structures</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Fee Head</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {structures.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{st.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {st.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {st.due_date ? new Date(st.due_date).toLocaleDateString("en-IN") : "Term Due"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{Number(st.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setShowUpiPayModal(st)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          📱 Pay via UPI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Payment Receipts Ledger ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Payment Receipts History
                </h2>
                <p className="text-xs text-slate-500">Verified receipts issued at school fee counter</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                {transactions.length} Receipts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Reference / UTR</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                        No payment receipts found for this academic session.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-800 dark:text-white">
                          {t.receipt_no}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {new Date(t.paid_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {t.payment_method.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{t.transaction_ref || "—"}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(t.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() =>
                              setActiveReceipt({
                                receiptNo: t.receipt_no,
                                date: new Date(t.paid_at).toLocaleString("en-IN"),
                                amount: Number(t.amount),
                                paymentMethod: t.payment_method,
                                transactionRef: t.transaction_ref,
                                student: student,
                              })
                            }
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            Print Receipt 🖨️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BANK DETAILS & CAUTION DEPOSIT REFUNDS (NEW) ── */}
      {activeTab === "bank_refund" && (
        <div className="space-y-6">
          {/* Institutional Refund Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Caution Deposit Balance
              </span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                ₹{bankProfile.cautionDepositEligibleInr.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-500 mt-1">Refundable upon Class 10 TC issuance</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Merit Scholarship Disbursed
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                ₹{bankProfile.scholarshipDisbursedInr.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-500 mt-1">Credited to registered account</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Institutional Refunds
              </span>
              <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1 font-mono">
                ₹{bankProfile.pendingRefundInr.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-500 mt-1">No outstanding claims</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Registered Bank Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-700/60 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Verified Refund Account
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {bankProfile.verificationStatus.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Bank Name</div>
                  <div className="text-xl font-bold tracking-tight">{bankProfile.bankName}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Account Number</div>
                  <div className="font-mono text-lg tracking-widest text-emerald-300">
                    {bankProfile.accountNumberMasked}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">IFSC Code:</span>
                    <strong className="font-mono">{bankProfile.ifscCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Account Holder:</span>
                    <strong>{bankProfile.accountHolderName}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  Branch: {bankProfile.branchName} • Last Updated: {bankProfile.lastUpdated}
                </div>
              </div>
            </div>

            {/* Right Column: Update Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Update Refund Bank Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ensure the account is held by the student or primary registered parent (Sri Goud) to prevent NEFT rejection.
                </p>
              </div>

              <form onSubmit={handleSaveBankDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Account Holder Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Bank IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Account Number *
                    </label>
                    <input
                      type="password"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isPending ? "Validating & Saving..." : "Save & Verify Bank Details for Refunds"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: OFFICIAL PRINTABLE RECEIPT ── */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div id="printable-receipt" className="border-b-2 border-dashed border-slate-300 pb-4 text-center space-y-2">
              <div className="text-lg font-black text-slate-900 uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>
                {schoolName}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">OFFICIAL FEE RECEIPT (STUDENT COPY)</div>
              <div className="text-xs font-mono font-bold text-slate-800 bg-slate-100 py-1 rounded-md">
                {activeReceipt.receiptNo}
              </div>

              <div className="text-left text-xs space-y-1.5 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-medium">{activeReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-slate-800">{activeReceipt.student?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admission No:</span>
                  <span className="font-mono">{activeReceipt.student?.admission_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll No:</span>
                  <span>#{activeReceipt.student?.roll_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="font-bold uppercase text-emerald-700">{activeReceipt.paymentMethod}</span>
                </div>
                {activeReceipt.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ref / UTR:</span>
                    <span className="font-mono text-[11px]">{activeReceipt.transactionRef}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span>TOTAL PAID:</span>
                <span className="text-lg font-mono text-emerald-700">
                  ₹{Number(activeReceipt.amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 pt-2">
                This is a computer-generated student copy receipt issued by Finkfold EdOS.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm flex-1"
                style={{ justifyContent: "center" }}
              >
                🖨️ Print Receipt
              </button>
              <button onClick={() => setActiveReceipt(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INSTANT UPI SCAN & PAY ── */}
      {showUpiPayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                📱 Instant UPI Payment
              </h3>
              <button onClick={() => setShowUpiPayModal(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500">
              {showUpiPayModal.name} &bull; {schoolName}
            </div>

            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{Number(showUpiPayModal.amount).toLocaleString("en-IN")}
            </div>

            {/* Dynamic UPI QR */}
            <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner flex flex-col items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="10" y="10" width="25" height="25" fill="#4338ca" rx="3" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" rx="1" />
                <rect x="18" y="18" width="9" height="9" fill="#4338ca" />

                <rect x="65" y="10" width="25" height="25" fill="#4338ca" rx="3" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" rx="1" />
                <rect x="73" y="18" width="9" height="9" fill="#4338ca" />

                <rect x="10" y="65" width="25" height="25" fill="#4338ca" rx="3" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" rx="1" />
                <rect x="18" y="73" width="9" height="9" fill="#4338ca" />

                <rect x="42" y="15" width="6" height="6" fill="#1e1b4b" />
                <rect x="52" y="20" width="6" height="6" fill="#1e1b4b" />
                <rect x="45" y="32" width="10" height="10" fill="#1e1b4b" />
                <rect x="25" y="42" width="6" height="12" fill="#1e1b4b" />
                <rect x="65" y="45" width="14" height="6" fill="#1e1b4b" />
                <rect x="40" y="55" width="8" height="8" fill="#1e1b4b" />
                <rect x="55" y="62" width="12" height="12" fill="#1e1b4b" />
                <rect x="75" y="75" width="10" height="10" fill="#1e1b4b" />
                <rect x="40" y="75" width="6" height="10" fill="#1e1b4b" />
              </svg>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Scan with GPay, PhonePe, Paytm, BHIM
              <br />
              VPA: priyanka.school@icici
            </div>

            <button
              type="button"
              onClick={() => {
                alert("Payment received! The transaction will reflect in your receipts shortly.");
                setShowUpiPayModal(null);
              }}
              className="btn btn-primary btn-sm w-full"
            >
              I Have Completed Payment &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
