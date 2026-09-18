"use client";

import { useState, useTransition } from "react";
import {
  INITIAL_TICKETS,
  SupportTicket,
  createTicketAction,
} from "@/actions/helpdesk";
import { SCHOOL } from "@/lib/school-config";

export default function StudentDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"certificates" | "helpdesk">("certificates");
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [activeModal, setActiveModal] = useState<"bonafide" | "tax80c" | "attendance" | null>(null);

  // New Ticket Form State
  const [category, setCategory] = useState<SupportTicket["category"]>("Accounts & Fees");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("medium");
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    startTransition(async () => {
      const res = await createTicketAction({
        category,
        subject,
        description,
        priority,
      });

      if (res.success && res.ticket) {
        setTickets((prev) => [res.ticket, ...prev]);
        setSubject("");
        setDescription("");
        setNotification(res.message);
        setTimeout(() => setNotification(null), 6000);
      }
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-2">
          <span>🏛️</span>
          <span>Zero-Visit Front Office & Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Document Vault & Support Helpdesk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Instantly generate digitally signed bonafide/tax certificates and track school administrative support tickets.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "certificates"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Institutional Certificates (3)
        </button>
        <button
          onClick={() => setActiveTab("helpdesk")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "helpdesk"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Support Helpdesk</span>
          <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
            {tickets.length}
          </span>
        </button>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
          <span className="text-lg">✅</span>
          <div className="font-medium flex-1">{notification}</div>
        </div>
      )}

      {/* ── Tab 1: Certificates ── */}
      {activeTab === "certificates" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Bonafide Certificate */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl">
                  📜
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Bonafide Student Certificate
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Official verification of student enrollment, class, and conduct. Required for passport, visa & bank opening.
                </p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span>✓</span> Digitally signed with QR validation
                </div>
              </div>

              <button
                onClick={() => setActiveModal("bonafide")}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>Generate & Download PDF</span>
              </button>
            </div>

            {/* 2. Section 80C Tax Certificate */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl">
                  📑
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Fee Paid Certificate (Sec 80C)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Itemized tuition fee statement for Income Tax deduction under Section 80C. Includes Trust PAN & TAN details.
                </p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span>✓</span> Total Tuition Paid: ₹28,500
                </div>
              </div>

              <button
                onClick={() => setActiveModal("tax80c")}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>Generate & Download PDF</span>
              </button>
            </div>

            {/* 3. Attendance Certificate */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl">
                  📊
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Attendance Compliance Statement
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Certified record of academic attendance percentage (94.2%). Required for board exam hall ticket clearance.
                </p>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span>✓</span> 162/172 Days Present (Compliant)
                </div>
              </div>

              <button
                onClick={() => setActiveModal("attendance")}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>Generate & Download PDF</span>
              </button>
            </div>
          </div>

          {/* Certificate Modal Viewer */}
          {activeModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Official Institutional Document
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Printable Certificate Template */}
                <div className="p-8 border-4 border-double border-slate-300 rounded-2xl bg-amber-50/15 space-y-6 text-slate-900 font-serif">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      {SCHOOL.name}
                    </h2>
                    <p className="text-xs text-slate-600 font-sans">
                      {SCHOOL.affiliation} • {SCHOOL.address}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 font-sans pt-1">
                      Certificate Ref: CERT-PRIY-2026-8812 • Academic Year 2026–27
                    </div>
                  </div>

                  <div className="h-0.5 bg-slate-200 my-2" />

                  {activeModal === "bonafide" && (
                    <div className="space-y-4 text-sm leading-relaxed">
                      <div className="text-center font-sans font-bold text-sm uppercase tracking-widest text-indigo-900">
                        BONAFIDE CERTIFICATE
                      </div>
                      <p>
                        This is to certify that Master / Kum. <strong>Arjun Reddy</strong>, Son of <strong>Sri Goud garu</strong>, 
                        is a bonafide student of this institution studying in <strong>Class 10 - Section A</strong> (Admission No: <strong>PRIY-2026-001</strong>) 
                        during the academic year <strong>2026–2027</strong>.
                      </p>
                      <p>
                        According to school records, his date of birth is <strong>14-06-2011</strong> and his character and conduct have been found to be <strong>Exemplary</strong>.
                      </p>
                    </div>
                  )}

                  {activeModal === "tax80c" && (
                    <div className="space-y-4 text-sm leading-relaxed">
                      <div className="text-center font-sans font-bold text-sm uppercase tracking-widest text-emerald-900">
                        TUITION FEE CERTIFICATE (SECTION 80C OF I.T. ACT 1961)
                      </div>
                      <p>
                        Certified that the sum of <strong>₹28,500 (Rupees Twenty Eight Thousand Five Hundred Only)</strong> has been received from 
                        <strong> Sri Goud garu</strong> towards Tuition Fees for his ward <strong>Arjun Reddy</strong> (Class 10A, Admission No: PRIY-2026-001) 
                        for the Financial Year <strong>2026–2027</strong>.
                      </p>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-sans space-y-1">
                        <div>Institution PAN: <strong>AABTP1248K</strong> • TAN: <strong>HYDP08212B</strong></div>
                        <div>Eligible for tax rebate strictly under Section 80C(2)(xvii) of the Income Tax Act.</div>
                      </div>
                    </div>
                  )}

                  {activeModal === "attendance" && (
                    <div className="space-y-4 text-sm leading-relaxed">
                      <div className="text-center font-sans font-bold text-sm uppercase tracking-widest text-blue-900">
                        ATTENDANCE COMPLIANCE CERTIFICATE
                      </div>
                      <p>
                        Certified that <strong>Arjun Reddy</strong> has recorded <strong>162 working days</strong> attended out of 
                        <strong> 172 working days</strong> held up to 18 September 2026, which computes to an attendance percentage of <strong>94.2%</strong>.
                      </p>
                      <p className="text-xs text-slate-600 font-sans">
                        Complies with Directorate of School Education mandatory 75% attendance criteria for Board Examinations.
                      </p>
                    </div>
                  )}

                  {/* Signature and QR */}
                  <div className="pt-6 border-t border-slate-200 flex items-end justify-between font-sans text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 p-1 border border-slate-900 rounded bg-white">
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        VERIFIED SEAL<br />
                        UID: 8812-OK
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-script text-base text-blue-950 font-bold italic">
                        K. Radhika Devi, M.A., B.Ed.
                      </div>
                      <div className="text-xs font-bold text-slate-900">Principal</div>
                      <div className="text-[10px] text-slate-500">{SCHOOL.name}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 font-sans">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-2"
                  >
                    <span>🖨️</span>
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Helpdesk Support Tickets ── */}
      {activeTab === "helpdesk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* New Ticket Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Raise Helpdesk Ticket</h2>
              <p className="text-xs text-slate-500">
                Directly routed to accounts, transport, or administration with tracked SLA resolution times.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Accounts & Fees">Accounts & Fee Dues</option>
                  <option value="Transport">Transport & Bus Stops</option>
                  <option value="Academics">Academics & Report Cards</option>
                  <option value="ID Card & Records">ID Card & Personal Info Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Spelling error in Student Mother's Name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {(["low", "medium", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl border font-bold capitalize transition-all cursor-pointer ${
                        priority === p
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide complete details so our team can resolve without a physical visit..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>📬</span>
                <span>Submit Ticket & Start SLA Timer</span>
              </button>
            </form>
          </div>

          {/* Active Tickets List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Your Support Tickets</h2>

            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-950">
                        {t.ticketNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {t.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{t.subject}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      t.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : t.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div>
                    Assigned: <strong className="text-slate-700">{t.assignedDept}</strong>
                  </div>
                  <div>
                    {t.slaRemainingHours > 0 ? (
                      <span className="text-amber-700 font-bold">
                        ⏳ SLA Remaining: {t.slaRemainingHours} Hours
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">✓ SLA Met & Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
