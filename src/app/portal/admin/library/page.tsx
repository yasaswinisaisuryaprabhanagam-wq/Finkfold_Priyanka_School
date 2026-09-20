"use client";

import { useState } from "react";
import {
  INITIAL_LIBRARY_BOOKS,
  INITIAL_BOOK_LOANS,
  issueLibraryBook,
  returnLibraryBook,
  syncOverdueFinesToFeeLedger,
} from "@/actions/admin-library";
import type { LibraryBook, BookLoan } from "@/types/admin-extended";

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "loans" | "overdue" | "inventory">("catalog");
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_LIBRARY_BOOKS);
  const [loans, setLoans] = useState<BookLoan[]>(INITIAL_BOOK_LOANS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || "");
  const [studentAdmissionInput, setStudentAdmissionInput] = useState("PRIY-2026-001");
  const [studentNameInput, setStudentNameInput] = useState("Kiran Kumar");
  const [loanDurationDays, setLoanDurationDays] = useState(14);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const criticalOverdueLoans = loans.filter((l) => l.status === "overdue" && l.overdueDays >= 7);

  async function handleIssueBook(e: React.FormEvent) {
    e.preventDefault();
    const book = books.find((b) => b.id === selectedBookId);
    if (!book || book.availableCopies <= 0) return;

    const res = await issueLibraryBook({
      bookId: book.id,
      bookTitle: book.title,
      isbn: book.isbn,
      studentId: "stu-new",
      studentName: studentNameInput,
      admissionNumber: studentAdmissionInput,
      classGrade: "Class 10-A",
      durationDays: Number(loanDurationDays),
    });

    if (res.success && res.loan) {
      setLoans([res.loan, ...loans]);
      setBooks(
        books.map((b) => (b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b))
      );
      setShowIssueModal(false);
    }
  }

  async function handleReturnBook(loanId: string, bookId: string) {
    const res = await returnLibraryBook(loanId);
    if (res.success) {
      setLoans(
        loans.map((l) =>
          l.id === loanId ? { ...l, status: "returned", returnDate: res.returnDate } : l
        )
      );
      setBooks(
        books.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b))
      );
    }
  }

  async function handleSyncOverdueFines() {
    setSyncStatus("Syncing overdue library fines to student fee ledger...");
    const res = await syncOverdueFinesToFeeLedger(loans);
    if (res.success) {
      setSyncStatus(`✓ Successfully synced ${res.syncedCount} fine(s) directly to Central Fee POS ledger.`);
      setLoans(
        loans.map((l) => (l.status === "overdue" && l.overdueDays >= 7 ? { ...l, ledgerSynced: true } : l))
      );
      setTimeout(() => setSyncStatus(null), 5000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 mb-2">
              <span>Level 1: Daily Admin Core</span>
              <span>·</span>
              <span>Circulation & Barcodes</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Library & Media Center Console
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Catalog titles by ISBN, barcode loan check-out/check-in, track overdue fines, and automatically post 7+ day overdue penalties directly into the student fee ledger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowIssueModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Issue Book (Barcode Scan)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catalog Volumes</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {books.reduce((acc, b) => acc + b.totalCopies, 0)} Copies
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Across {books.length} distinct ISBN titles</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Circulation</div>
          <div className="text-xl font-bold text-sky-700 mt-1 font-mono">
            {loans.filter((l) => l.status === "active").length} Books Out
          </div>
          <div className="text-[10px] text-slate-500 mt-1">14-day standard lending period</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue Returns</div>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">
            {overdueLoans.length} Loans
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">
            {criticalOverdueLoans.length} Loans ≥ 7 days overdue
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Late Fine Accrued</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">
            ₹{overdueLoans.reduce((acc, l) => acc + l.fineAmount, 0)}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">₹5 / day standard penalty</div>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Main View Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        {/* Navigation Tabs + Search Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "catalog"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📚 Book Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "loans"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🔄 Active Loans ({loans.length})
            </button>
            <button
              onClick={() => setActiveTab("overdue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "overdue"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <span>⚠️ Overdue & Ledger Fines</span>
              <span className="h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono">
                {overdueLoans.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "inventory"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📋 Missing Inventory
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search ISBN, title, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-1.5 pl-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tab 1: Catalog */}
        {activeTab === "catalog" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Barcode / ISBN</th>
                  <th className="p-3">Title & Author</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Shelf Location</th>
                  <th className="p-3 text-center">Availability</th>
                  <th className="p-3 text-right">Replacement Cost</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-slate-600">
                      <div className="font-semibold text-slate-900">{b.barcode}</div>
                      <div className="text-[10px] text-slate-400">{b.isbn}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.title}</div>
                      <div className="text-slate-500 text-[11px]">{b.author}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{b.shelfLocation}</td>
                    <td className="p-3 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          b.availableCopies > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {b.availableCopies} / {b.totalCopies} Available
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-800">₹{b.replacementCost}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedBookId(b.id);
                          setShowIssueModal(true);
                        }}
                        disabled={b.availableCopies <= 0}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Issue →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Loans */}
        {activeTab === "loans" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Loan ID</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Borrower (Student)</th>
                  <th className="p-3">Issued Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-slate-500">{l.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{l.bookTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.isbn}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{l.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{l.admissionNumber} ({l.classGrade})</div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{l.issueDate}</td>
                    <td className="p-3 text-slate-600 font-mono">{l.dueDate}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          l.status === "active"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : l.status === "overdue"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {l.status !== "returned" ? (
                        <button
                          onClick={() => handleReturnBook(l.id, l.bookId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold"
                        >
                          Check In ✓
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Returned on {l.returnDate}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Overdue & Central Ledger Sync */}
        {activeTab === "overdue" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-amber-900">
                  Automated Central Fee Ledger Sync (7-Day Rule)
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Finkfold automatically detects books overdue by ≥ 7 days and posts the penalty to the student&apos;s central tuition & fee counter POS ledger.
                </p>
              </div>
              <button
                onClick={handleSyncOverdueFines}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition shrink-0"
              >
                ⚡ Post Eligible Fines to Central Fee Ledger
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Borrower Student</th>
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-center">Days Overdue</th>
                    <th className="p-3 text-right">Accrued Fine (₹5/day)</th>
                    <th className="p-3 text-center">Fee Ledger Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {overdueLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{l.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{l.admissionNumber} ({l.classGrade})</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{l.bookTitle}</td>
                      <td className="p-3 font-mono text-slate-600">{l.dueDate}</td>
                      <td className="p-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px]">
                          +{l.overdueDays} Days
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700 text-sm">
                        ₹{l.fineAmount}
                      </td>
                      <td className="p-3 text-center">
                        {l.ledgerSynced ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            ✓ Synced to Central POS
                          </span>
                        ) : l.overdueDays >= 7 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold animate-pulse">
                            ● Eligible for Ledger Sync
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Grace period (&lt;7 days)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Missing Inventory */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-900">Missing Volumes & Replacement Valuation</div>
                <div className="text-[11px] text-purple-700">1 title currently fully checked out with 0 shelf reserve.</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 font-mono">Est. Replacement Value: ₹650</div>
                <div className="text-[10px] text-slate-500">Oxford Student Atlas for India</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Issue Library Book (Barcode Scan)
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Catalog Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.title} ({b.availableCopies} available) — {b.barcode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Admission Number</label>
                <input
                  type="text"
                  value={studentAdmissionInput}
                  onChange={(e) => setStudentAdmissionInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lending Duration</label>
                <select
                  value={loanDurationDays}
                  onChange={(e) => setLoanDurationDays(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option value={7}>7 Days (Reserve copy)</option>
                  <option value={14}>14 Days (Standard Student)</option>
                  <option value={30}>30 Days (Faculty Reference)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Confirm Issue & Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
