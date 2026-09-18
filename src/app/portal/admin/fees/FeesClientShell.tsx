"use client";

import { useState, useTransition, useMemo } from "react";
import { collectFeePayment, submitDrawerClose, verifyDrawer, createFeeStructure } from "@/actions/fees";
import type { CashDrawer, FeeTransaction, FeeStructure, Student, PaymentMethod, FeeCategory } from "@/types/erp";

export default function FeesClientShell({
  schoolId,
  schoolName,
  initialDrawer,
  initialTransactions,
  initialStructures,
  students,
  currentCashierName,
  isAdmin,
}: {
  schoolId: string;
  schoolName: string;
  initialDrawer: CashDrawer | null;
  initialTransactions: FeeTransaction[];
  initialStructures: FeeStructure[];
  students: any[];
  currentCashierName: string;
  isAdmin: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"pos" | "drawer" | "ledger" | "structures">("pos");
  const [drawer, setDrawer] = useState<CashDrawer | null>(initialDrawer);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(initialTransactions);
  const [structures, setStructures] = useState<FeeStructure[]>(initialStructures);
  const [isPending, startTransition] = useTransition();
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── POS State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string>("");
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  // ── Drawer Blind-Close & Verify State ──
  const [declaredCash, setDeclaredCash] = useState<number>(
    drawer ? Number(drawer.system_cash_collected || 0) : 0
  );
  const [drawerNotes, setDrawerNotes] = useState("");
  const [adminAuditNotes, setAdminAuditNotes] = useState("");

  // ── Fee Structure Form State ──
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [structName, setStructName] = useState("");
  const [structCategory, setStructCategory] = useState<FeeCategory>("tuition");
  const [structAmount, setStructAmount] = useState<number>(10000);
  const [structDueDate, setStructDueDate] = useState("2026-07-15");

  // Filter students for autocomplete
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return students
      .filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.admission_no?.toLowerCase().includes(q) ||
          String(s.roll_no) === q
      )
      .slice(0, 8);
  }, [searchQuery, students]);

  // When fee structure selection changes, auto-populate amount
  function handleStructureSelect(structId: string) {
    setSelectedStructureId(structId);
    if (!structId) return;
    const found = structures.find((s) => s.id === structId);
    if (found) {
      setAmount(Number(found.amount));
    }
  }

  // Handle Fee Collection
  function handleCollectFee(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) {
      setAlertMsg({ type: "error", text: "Please search and select a student first." });
      return;
    }

    setAlertMsg(null);
    startTransition(async () => {
      const res = await collectFeePayment({
        schoolId,
        studentId: selectedStudent.id,
        feeStructureId: selectedStructureId || null,
        amount: Number(amount),
        paymentMethod,
        transactionRef,
        remarks,
      });

      if (res.success && res.transaction) {
        setAlertMsg({
          type: "success",
          text: `Fee collected! Receipt #${res.receiptNo} generated successfully.`,
        });

        // Prepend transaction
        setTransactions((prev) => [res.transaction, ...prev]);

        // If cash, update local drawer
        if (paymentMethod === "cash" && drawer) {
          setDrawer({
            ...drawer,
            system_cash_collected: Number(drawer.system_cash_collected || 0) + Number(amount),
          });
        }

        // Open Receipt Modal
        setActiveReceipt({
          receiptNo: res.receiptNo,
          student: selectedStudent,
          amount: Number(amount),
          paymentMethod,
          transactionRef,
          remarks,
          feeName:
            structures.find((s) => s.id === selectedStructureId)?.name ||
            "Term School Fee",
          date: new Date().toLocaleString("en-IN"),
        });

        // Reset form
        setSelectedStudent(null);
        setSearchQuery("");
        setRemarks("");
        setTransactionRef("");
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to collect fee" });
      }
    });
  }

  // Submit Drawer Close
  function handleSubmitDrawerClose() {
    if (!drawer) return;
    startTransition(async () => {
      const res = await submitDrawerClose(drawer.id, declaredCash, drawerNotes);
      if (res.success && res.drawer) {
        setDrawer(res.drawer);
        setAlertMsg({
          type: "success",
          text: "EOD Drawer close submitted for Admin verification.",
        });
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to close drawer" });
      }
    });
  }

  // Admin Verify Drawer
  function handleVerifyDrawer() {
    if (!drawer) return;
    startTransition(async () => {
      const res = await verifyDrawer(drawer.id, adminAuditNotes);
      if (res.success && res.drawer) {
        setDrawer(res.drawer);
        setAlertMsg({
          type: "success",
          text: res.hasDiscrepancy
            ? "⚠️ Cash drawer verified with DISCREPANCY flagged."
            : "✅ Cash drawer verified. Zero discrepancy confirmed.",
        });
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to verify drawer" });
      }
    });
  }

  // Create Fee Structure
  function handleCreateStructure(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createFeeStructure(
        schoolId,
        null,
        structName,
        structCategory,
        structAmount,
        structDueDate,
        true
      );
      if (res.success && res.data) {
        setStructures((prev) => [...prev, res.data]);
        setShowStructureModal(false);
        setStructName("");
        setAlertMsg({ type: "success", text: `Fee Head "${structName}" added.` });
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to add fee head" });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Banner Header ── */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              Treasury & Counter POS &middot; {schoolName}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              💳 Fee Counter & Maker-Checker Cash Till
            </h1>
            <p className="text-emerald-100 text-sm">
              Instant fee collections, dynamic UPI QR generation, and daily maker-checker cash till audits.
            </p>
          </div>

          {/* Active Till Status Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
            <div className="text-[10px] text-emerald-200 uppercase font-bold">Today's Cash Drawer</div>
            <div className="text-sm font-black text-white mt-0.5 flex items-center justify-end gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  drawer?.status === "verified"
                    ? "bg-emerald-400"
                    : drawer?.status === "discrepancy_flagged"
                    ? "bg-rose-400"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              {drawer?.status ? drawer.status.replace("_", " ").toUpperCase() : "OPEN"}
            </div>
            <div className="text-xs text-white/80 font-mono mt-0.5">
              System Cash: ₹{Number(drawer?.system_cash_collected || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert Notification ── */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            alertMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pos")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "pos"
              ? "border-emerald-600 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          ⚡ Counter POS Collection
        </button>
        <button
          onClick={() => setActiveTab("drawer")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "drawer"
              ? "border-emerald-600 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🔒 Daily Cash Till (Maker-Checker)
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "ledger"
              ? "border-emerald-600 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          📜 Transactions Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("structures")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "structures"
              ? "border-emerald-600 text-emerald-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🏷️ Fee Structures Master ({structures.length})
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: COUNTER POS FEE COLLECTION ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Student Search & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                1. Select Student
              </h2>

              {/* Student Search Box */}
              <div className="relative">
                <label className="form-label">Search by Student Name, Admission No, or Roll No</label>
                <input
                  type="text"
                  placeholder="e.g. Kiran, Yasaswini, ADM-2026-001..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input text-sm"
                />

                {/* Autocomplete Dropdown */}
                {filteredStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 z-20 max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(s);
                          setSearchQuery("");
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-800">{s.full_name}</div>
                          <div className="text-xs text-slate-500">
                            Adm: {s.admission_no} &bull; Roll: #{s.roll_no} &bull; {s.class ? `Class ${s.class.name}-${s.class.section}` : ""}
                          </div>
                        </div>
                        <span className="badge badge-blue">Select &rarr;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Student Card */}
              {selectedStudent ? (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎓</span>
                      <span className="font-bold text-base text-blue-950">{selectedStudent.full_name}</span>
                      <span className="badge badge-green">Roll #{selectedStudent.roll_no}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Admission No: <span className="font-mono font-semibold">{selectedStudent.admission_no}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Parent: <span className="font-medium">{selectedStudent.parent_name || "—"}</span> ({selectedStudent.parent_phone || "No phone"})
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No student selected yet. Search above to begin fee collection.
                </div>
              )}

              {/* 2. Payment Configuration Form */}
              <form onSubmit={handleCollectFee} className="space-y-4 pt-4 border-t border-slate-100">
                <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  2. Payment Details
                </h2>

                <div>
                  <label className="form-label">Fee Head / Structure</label>
                  <select
                    value={selectedStructureId}
                    onChange={(e) => handleStructureSelect(e.target.value)}
                    className="form-input text-sm"
                  >
                    <option value="">Custom / General School Fee</option>
                    {structures.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} — ₹{Number(st.amount).toLocaleString("en-IN")} ({st.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Collection Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="form-input text-lg font-bold font-mono text-emerald-800"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="form-label">Payment Mode</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "cash", label: "💵 Cash", desc: "Adds to physical till" },
                      { key: "upi_dynamic", label: "📱 Dynamic UPI", desc: "Scan on counter" },
                      { key: "upi_manual", label: "💳 UPI UTR", desc: "Manual reference" },
                      { key: "bank_transfer", label: "🏦 Bank / Cheque", desc: "NEFT / Cheque" },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setPaymentMethod(m.key as PaymentMethod)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === m.key
                            ? "border-emerald-600 bg-emerald-50/80 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800">{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference ID / Cheque Number */}
                {paymentMethod !== "cash" && (
                  <div>
                    <label className="form-label">
                      {paymentMethod === "upi_dynamic" || paymentMethod === "upi_manual"
                        ? "UPI Transaction Ref / UTR"
                        : "Cheque / Bank Reference Number"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 423871928371 / CHQ-1002"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="form-input font-mono text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Remarks / Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Term 1 Part-payment by father"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !selectedStudent}
                  className="btn btn-primary btn-lg w-full mt-2"
                  style={{ justifyContent: "center" }}
                >
                  {isPending ? (
                    "Processing Receipt..."
                  ) : (
                    `Collect ₹${Number(amount).toLocaleString("en-IN")} & Print Receipt →`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right 5 Cols: Counter Display / Dynamic QR */}
          <div className="lg:col-span-5 space-y-6">
            {paymentMethod === "upi_dynamic" ? (
              <div className="card p-6 text-center space-y-4 border-2 border-emerald-500 bg-emerald-50/20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  DYNAMIC UPI QR CODE
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Pay via PhonePe, GPay, Paytm, BHIM</div>
                </div>

                {/* Mocked clean high-res dynamic UPI QR render */}
                <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner flex flex-col items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Corner anchors */}
                    <rect x="10" y="10" width="25" height="25" fill="#047857" rx="3" />
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff" rx="1" />
                    <rect x="18" y="18" width="9" height="9" fill="#047857" />

                    <rect x="65" y="10" width="25" height="25" fill="#047857" rx="3" />
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff" rx="1" />
                    <rect x="73" y="18" width="9" height="9" fill="#047857" />

                    <rect x="10" y="65" width="25" height="25" fill="#047857" rx="3" />
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff" rx="1" />
                    <rect x="18" y="73" width="9" height="9" fill="#047857" />

                    {/* Data matrix pattern */}
                    <rect x="42" y="15" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="20" width="6" height="6" fill="#0f172a" />
                    <rect x="45" y="32" width="10" height="10" fill="#0f172a" />
                    <rect x="25" y="42" width="6" height="12" fill="#0f172a" />
                    <rect x="65" y="45" width="14" height="6" fill="#0f172a" />
                    <rect x="40" y="55" width="8" height="8" fill="#0f172a" />
                    <rect x="55" y="62" width="12" height="12" fill="#0f172a" />
                    <rect x="75" y="75" width="10" height="10" fill="#0f172a" />
                    <rect x="40" y="75" width="6" height="10" fill="#0f172a" />
                  </svg>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  UPI ID: priyanka.school@icici
                  <br />
                  Ref: POS-{new Date().getTime().toString().slice(-6)}
                </div>
              </div>
            ) : (
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  💡 POS Counter Guidelines
                </h3>
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      <strong>Cash Payments:</strong> Instantly added to the Cashier's Active Till. Count notes carefully before printing receipt.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      <strong>Dynamic UPI:</strong> Direct bank account settlement with zero cash shrinkage.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      <strong>Receipts:</strong> Serialized receipt numbers are permanent and tamper-proof.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: DAILY CASH DRAWER TILL (MAKER-CHECKER) ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "drawer" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="text-xs text-slate-500 font-semibold">Opening Float Cash</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{Number(drawer?.opening_cash || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Morning starting cash</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-slate-500 font-semibold">System Cash Collected</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ₹{Number(drawer?.system_cash_collected || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">From completed cash receipts</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-slate-500 font-semibold">Expected Cash in Till</div>
              <div className="text-2xl font-black text-blue-900 mt-1">
                ₹{(
                  Number(drawer?.opening_cash || 0) + Number(drawer?.system_cash_collected || 0)
                ).toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Opening + System collected</div>
            </div>
            <div className="stat-card">
              <div className="text-xs text-slate-500 font-semibold">Audit Reconciliation Status</div>
              <div className="text-base font-black text-slate-800 mt-2">
                <span
                  className={`badge ${
                    drawer?.status === "verified"
                      ? "badge-green"
                      : drawer?.status === "discrepancy_flagged"
                      ? "badge-red"
                      : "badge-yellow"
                  }`}
                >
                  {drawer?.status ? drawer.status.replace("_", " ").toUpperCase() : "OPEN"}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Maker-checker EOD lock</div>
            </div>
          </div>

          {/* Maker-Checker Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cashier EOD Blind-Close (Maker) */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  1. Cashier EOD Declaration (Maker)
                </h3>
                <span className="badge badge-slate">Cashier: {currentCashierName}</span>
              </div>
              <p className="text-xs text-slate-500">
                At EOD (4:00 PM), physically count all cash in the till and submit declaration for verification.
              </p>

              <div>
                <label className="form-label">Physically Counted Cash in Till (₹)</label>
                <input
                  type="number"
                  disabled={drawer?.status === "verified"}
                  value={declaredCash}
                  onChange={(e) => setDeclaredCash(Number(e.target.value))}
                  className="form-input text-lg font-bold font-mono"
                />
              </div>

              <div>
                <label className="form-label">Cashier Closing Notes (Denominations / Remarks)</label>
                <textarea
                  rows={3}
                  disabled={drawer?.status === "verified"}
                  placeholder="e.g. 500x10, 200x5, 100x10. No damaged currency."
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <button
                type="button"
                disabled={isPending || drawer?.status === "verified"}
                onClick={handleSubmitDrawerClose}
                className="btn btn-primary btn-sm w-full"
              >
                {isPending ? "Submitting..." : "Submit Drawer for Audit Verification →"}
              </button>
            </div>

            {/* Admin Audit & Sign-off (Checker) */}
            <div className="card p-6 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  2. Admin Verification (Checker)
                </h3>
                {isAdmin ? (
                  <span className="badge badge-blue">Admin Authorized</span>
                ) : (
                  <span className="badge badge-slate">Admin Only</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Independent reconciliation audit comparing declared cash against system ledger.
              </p>

              <div className="space-y-2 p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Declared Physical Cash:</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(drawer?.declared_cash ?? declaredCash).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">System Expected Total:</span>
                  <span className="font-bold text-slate-900">
                    ₹{(
                      Number(drawer?.opening_cash || 0) + Number(drawer?.system_cash_collected || 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between text-xs font-bold">
                  <span>Discrepancy (Variance):</span>
                  <span
                    className={
                      Math.abs(
                        Number(drawer?.declared_cash ?? declaredCash) -
                          (Number(drawer?.opening_cash || 0) + Number(drawer?.system_cash_collected || 0))
                      ) > 0.01
                        ? "text-rose-600 font-mono"
                        : "text-emerald-600"
                    }
                  >
                    ₹{(
                      Number(drawer?.declared_cash ?? declaredCash) -
                      (Number(drawer?.opening_cash || 0) + Number(drawer?.system_cash_collected || 0))
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="form-label">Admin Audit Notes</label>
                <input
                  type="text"
                  disabled={!isAdmin || drawer?.status === "verified"}
                  placeholder="e.g. Physical till verified by Principal"
                  value={adminAuditNotes}
                  onChange={(e) => setAdminAuditNotes(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <button
                type="button"
                disabled={isPending || !isAdmin || drawer?.status === "verified"}
                onClick={handleVerifyDrawer}
                className="btn btn-secondary btn-sm w-full"
              >
                {drawer?.status === "verified"
                  ? "✓ Till Fully Verified & Locked"
                  : isPending
                  ? "Verifying..."
                  : "Verify Till & Complete Audit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: FEE TRANSACTIONS LEDGER ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "ledger" && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              All Fee Transactions
            </h2>
            <span className="badge badge-blue">{transactions.length} Total Receipts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Student</th>
                  <th>Date & Time</th>
                  <th>Payment Mode</th>
                  <th>Reference</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                      No transactions recorded yet today.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td className="font-mono text-xs font-bold text-slate-800">
                        {tx.receipt_no}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900">{tx.student?.full_name || "Student"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Adm: {tx.student?.admission_no}
                        </div>
                      </td>
                      <td className="text-xs text-slate-500">
                        {new Date(tx.paid_at).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tx.payment_method === "cash"
                              ? "badge-green"
                              : tx.payment_method === "upi_dynamic"
                              ? "badge-purple"
                              : "badge-blue"
                          }`}
                        >
                          {tx.payment_method.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-500">
                        {tx.transaction_ref || "—"}
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-700">
                        ₹{Number(tx.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() =>
                            setActiveReceipt({
                              receiptNo: tx.receipt_no,
                              student: tx.student || { full_name: "Student", admission_no: "—" },
                              amount: Number(tx.amount),
                              paymentMethod: tx.payment_method,
                              transactionRef: tx.transaction_ref,
                              feeName: "School Term Fee",
                              date: new Date(tx.paid_at).toLocaleString("en-IN"),
                            })
                          }
                          className="text-xs font-bold text-blue-700 hover:text-blue-900"
                        >
                          View / Print 🖨️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: FEE STRUCTURES MASTER ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "structures" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Fee Heads & Structures
              </h2>
              <p className="text-xs text-slate-500">Configured tuition, admission, and miscellaneous fee schedules</p>
            </div>
            <button
              onClick={() => setShowStructureModal(true)}
              className="btn btn-primary btn-sm"
            >
              + Add Fee Structure
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.map((st) => (
              <div key={st.id} className="card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {st.name}
                    </h3>
                    <span className="badge badge-blue text-[10px] mt-1">{st.category.toUpperCase()}</span>
                  </div>
                  <div className="text-lg font-black text-emerald-700 font-mono">
                    ₹{Number(st.amount).toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Due Date:</span>
                  <span className="font-semibold text-slate-700">
                    {st.due_date ? new Date(st.due_date).toLocaleDateString("en-IN") : "Term Due"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: THERMAL / PRINTABLE RECEIPT ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            {/* Receipt Printable Area */}
            <div id="printable-receipt" className="border-b-2 border-dashed border-slate-300 pb-4 text-center space-y-2">
              <div className="text-lg font-black text-slate-900 uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>
                {schoolName}
              </div>
              <div className="text-[10px] text-slate-500 uppercase">OFFICIAL FEE RECEIPT</div>
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
                  <span className="text-slate-400">Fee Head:</span>
                  <span>{activeReceipt.feeName}</span>
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
                This is a computer-generated receipt issued via Finkfold EdOS. No signature required.
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn btn-primary btn-sm flex-1"
                style={{ justifyContent: "center" }}
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD FEE STRUCTURE ── */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Add Fee Head
              </h3>
              <button onClick={() => setShowStructureModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div>
                <label className="form-label">Fee Head Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Tuition Fee, Annual Lab Fee"
                  value={structName}
                  onChange={(e) => setStructName(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={structCategory}
                  onChange={(e) => setStructCategory(e.target.value as FeeCategory)}
                  className="form-input text-xs"
                >
                  <option value="tuition">Tuition Fee</option>
                  <option value="admission">Admission Fee</option>
                  <option value="exam">Examination Fee</option>
                  <option value="transport">Transport Fee</option>
                  <option value="books_uniform">Books & Uniform</option>
                  <option value="digital_portal">Digital Portal & Diary Fee</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={structAmount}
                  onChange={(e) => setStructAmount(Number(e.target.value))}
                  className="form-input font-mono font-bold"
                />
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  value={structDueDate}
                  onChange={(e) => setStructDueDate(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary btn-sm"
                >
                  {isPending ? "Saving..." : "Save Fee Head"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
