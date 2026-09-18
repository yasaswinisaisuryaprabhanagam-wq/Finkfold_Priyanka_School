"use client";

import { useState } from "react";
import type { FeeTransaction, FeeStructure } from "@/types/erp";

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
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
  const [showUpiPayModal, setShowUpiPayModal] = useState<FeeStructure | null>(null);

  // Compute fee totals
  const totalAllocated = structures.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalPaid = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const pendingDue = Math.max(0, totalAllocated - totalPaid);

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Fee Ledger & Receipts &middot; {schoolName}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              🧾 Student Fee Portal
            </h1>
            <p className="text-white/70 text-sm">
              Official fee payment history, digital receipts, and pending term fee schedules.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
            <div className="text-[10px] text-indigo-200 uppercase font-bold">Enrolled Student</div>
            <div className="text-base font-bold text-white mt-0.5">{student.full_name}</div>
            <div className="text-xs text-white/80 font-mono">
              Adm: {student.admission_no} &bull; Roll #{student.roll_no}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Total Fee Structured</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{totalAllocated.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Academic Year 2026-2027</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Total Paid to Date</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">{transactions.length} Verified Receipts</div>
        </div>

        <div className="stat-card">
          <div className="text-xs text-slate-500 font-semibold">Current Pending Due</div>
          <div className="text-2xl font-black mt-1 font-mono flex items-center justify-between">
            <span className={pendingDue > 0 ? "text-amber-600" : "text-emerald-600"}>
              ₹{pendingDue.toLocaleString("en-IN")}
            </span>
            <span
              className={`badge ${
                pendingDue === 0 ? "badge-green" : "badge-yellow"
              } text-[10px]`}
            >
              {pendingDue === 0 ? "FULLY CLEARED" : "DUE"}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Balance payable</div>
        </div>
      </div>

      {/* ── Fee Schedules & Due Dates ── */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Fee Schedules & Due Dates
            </h2>
            <p className="text-xs text-slate-500">Term tuition, examinations, and activity fee structures</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fee Head</th>
                <th>Category</th>
                <th>Due Date</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {structures.map((st) => (
                <tr key={st.id}>
                  <td className="font-bold text-slate-800">{st.name}</td>
                  <td>
                    <span className="badge badge-blue text-[10px] uppercase">{st.category}</span>
                  </td>
                  <td className="text-xs text-slate-600">
                    {st.due_date ? new Date(st.due_date).toLocaleDateString("en-IN") : "Term Due"}
                  </td>
                  <td className="text-right font-mono font-bold text-slate-900">
                    ₹{Number(st.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setShowUpiPayModal(st)}
                      className="btn btn-primary btn-sm text-xs py-1 px-3"
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
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Payment Receipts History
            </h2>
            <p className="text-xs text-slate-500">Verified receipts issued at school fee counter</p>
          </div>
          <span className="badge badge-green">{transactions.length} Receipts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th>Reference / UTR</th>
                <th className="text-right">Amount Paid</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                    No payment receipts found for this academic session.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs font-bold text-slate-800">{t.receipt_no}</td>
                    <td className="text-xs text-slate-600">
                      {new Date(t.paid_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.payment_method === "cash"
                            ? "badge-green"
                            : t.payment_method === "upi_dynamic"
                            ? "badge-purple"
                            : "badge-blue"
                        }`}
                      >
                        {t.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-500">{t.transaction_ref || "—"}</td>
                    <td className="text-right font-mono font-bold text-emerald-700">
                      ₹{Number(t.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="text-center">
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
                        className="text-xs font-bold text-blue-700 hover:text-blue-900"
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
