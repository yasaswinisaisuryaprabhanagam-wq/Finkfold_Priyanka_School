"use client";

import { useState } from "react";
import {
  INITIAL_CAMPUS_VISITORS,
  checkInVisitor,
  approveVisitorPass,
  checkOutVisitor,
} from "@/actions/admin-visitors";
import type { CampusVisitor } from "@/types/admin-extended";

export default function AdminVisitorManagementPage() {
  const [visitors, setVisitors] = useState<CampusVisitor[]>(INITIAL_CAMPUS_VISITORS);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [organization, setOrganization] = useState("");
  const [purpose, setPurpose] = useState<CampusVisitor["purposeOfVisit"]>("PTM Consultation");
  const [hostName, setHostName] = useState("Mrs. Priyanka Devi");
  const [hostDept, setHostDept] = useState("Senior Mathematics");
  const [idType, setIdType] = useState<CampusVisitor["idProofType"]>("Aadhaar");
  const [idNumberLast4, setIdNumberLast4] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<CampusVisitor | null>(INITIAL_CAMPUS_VISITORS[0]);

  const activeVisitorsInside = visitors.filter((v) => v.status === "approved_inside");
  const waitingApproval = visitors.filter((v) => v.status === "waiting_approval");

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    const res = await checkInVisitor({
      fullName,
      phone,
      organizationOrRelationship: organization,
      purposeOfVisit: purpose,
      hostStaffName: hostName,
      hostDepartment: hostDept,
      idProofType: idType,
      idProofNumberLast4: idNumberLast4 || "1234",
    });

    if (res.success && res.visitor) {
      setVisitors([res.visitor, ...visitors]);
      setSelectedBadge(res.visitor);
      setShowCheckInModal(false);
      setFullName("");
      setPhone("+91 ");
      setOrganization("");
    }
  }

  async function handleApprove(visitorId: string) {
    const res = await approveVisitorPass(visitorId);
    if (res.success) {
      setVisitors(
        visitors.map((v) => (v.id === visitorId ? { ...v, status: "approved_inside" } : v))
      );
    }
  }

  async function handleCheckOut(visitorId: string) {
    const res = await checkOutVisitor(visitorId);
    if (res.success) {
      setVisitors(
        visitors.map((v) =>
          v.id === visitorId ? { ...v, status: "checked_out", checkOutTime: res.checkOutTime } : v
        )
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100 mb-2">
              <span>Level 2: Campus Security</span>
              <span>·</span>
              <span>Digital Reception & Gatepass</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Digital Visitor Management System (VMS)
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Replace illegible paper logbooks at front desk reception. Digitize visitor photos, host staff approvals, print thermal visitor badges, and monitor live campus headcount.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCheckInModal(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              + Front-Desk Visitor Check-In
            </button>
          </div>
        </div>
      </div>

      {/* Live Campus Headcount KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live On-Campus Visitors</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono flex items-center gap-2">
            <span>{activeVisitorsInside.length} Active</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Checked in & verified inside</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Host Approval</div>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">{waitingApproval.length} Waiting</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">At front reception desk</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Departed Today</div>
          <div className="text-xl font-bold text-slate-700 mt-1 font-mono">
            {visitors.filter((v) => v.status === "checked_out").length} Checked Out
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Average visit duration: 42 mins</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Campus Footfall</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">{visitors.length} Registrations</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">All ID proofs cross-verified</div>
        </div>
      </div>

      {/* Grid: Visitor Stream + Badge Printable View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visitors Log Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Campus Visitors Feed & Gate Log
              </h2>
              <span className="text-xs font-mono text-slate-400">Live Telemetry Gate 01</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Visitor</th>
                    <th className="p-3">Purpose & Host</th>
                    <th className="p-3">Check-In Time</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={v.photoUrl}
                            alt={v.fullName}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{v.fullName}</div>
                            <div className="text-[10px] text-slate-500">{v.organizationOrRelationship}</div>
                            <div className="text-[9px] text-slate-400 font-mono">
                              {v.phone} · {v.idProofType} ***{v.idProofNumberLast4}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {v.purposeOfVisit}
                        </span>
                        <div className="text-slate-800 font-semibold mt-1">Host: {v.hostStaffName}</div>
                        <div className="text-[10px] text-slate-400">{v.hostDepartment}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        <div>{v.checkInTime}</div>
                        {v.checkOutTime && (
                          <div className="text-[10px] text-slate-400">Out: {v.checkOutTime}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {v.status === "approved_inside" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            ● Inside Campus
                          </span>
                        )}
                        {v.status === "waiting_approval" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                            Waiting Host
                          </span>
                        )}
                        {v.status === "checked_out" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                            Checked Out
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBadge(v)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                            title="View Badge"
                          >
                            Badge 🎫
                          </button>
                          {v.status === "waiting_approval" && (
                            <button
                              onClick={() => handleApprove(v.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                            >
                              Approve ✓
                            </button>
                          )}
                          {v.status === "approved_inside" && (
                            <button
                              onClick={() => handleCheckOut(v.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold"
                            >
                              Check Out →
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Thermal Badge Preview Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Thermal Visitor Badge Preview
              </h3>
              <button
                onClick={() => window.print()}
                className="text-xs text-sky-600 font-bold hover:underline"
              >
                Print Badge 🖨️
              </button>
            </div>

            {selectedBadge ? (
              <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-center space-y-3 font-mono">
                <div className="text-[11px] font-bold text-slate-900 uppercase">PRIYANKA ENGLISH MEDIUM SCHOOL</div>
                <div className="text-[9px] text-slate-500 font-sans">CAMPUS VISITOR PASS</div>

                <div className="h-16 w-16 mx-auto rounded-full overflow-hidden border-2 border-slate-800 shadow-xs">
                  <img src={selectedBadge.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                </div>

                <div>
                  <div className="text-sm font-extrabold text-slate-900">{selectedBadge.fullName}</div>
                  <div className="text-[10px] text-slate-600 font-sans">{selectedBadge.organizationOrRelationship}</div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700 space-y-0.5 text-left">
                  <div>Badge: <strong>{selectedBadge.badgeNumber}</strong></div>
                  <div>Visiting: <strong>{selectedBadge.hostStaffName}</strong></div>
                  <div>In Time: <strong>{selectedBadge.checkInTime}</strong></div>
                  <div>Gate: <strong>{selectedBadge.issuedGate}</strong></div>
                </div>

                <div className="h-16 w-16 mx-auto bg-white border border-slate-800 rounded p-1 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
                    <div className="bg-slate-900" />
                    <div className="bg-slate-900" />
                    <div className="bg-slate-200" />
                    <div className="bg-slate-900" />
                    <div className="bg-slate-200" />
                    <div className="bg-slate-900" />
                    <div className="bg-slate-900" />
                    <div className="bg-slate-900" />
                    <div className="bg-slate-900" />
                  </div>
                </div>

                <div className="text-[9px] text-slate-400">Scan at Gate Turnstile for Exit Clearance</div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">Select a visitor to view thermal badge.</div>
            )}
          </div>
        </div>
      </div>

      {/* Front-Desk Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                New Visitor Registration (Reception Tablet)
              </h3>
              <button onClick={() => setShowCheckInModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98490 12345"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Relationship</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Father of Arjun (Class 9-A) or Textbook Vendor"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  >
                    <option value="PTM Consultation">PTM Consultation</option>
                    <option value="Admission Inquiry">Admission Inquiry</option>
                    <option value="Vendor / Supplies">Vendor / Supplies</option>
                    <option value="Official Inspection">Official Inspection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Host Staff Member</label>
                  <select
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  >
                    <option value="Mrs. Priyanka Devi">Mrs. Priyanka Devi (Math)</option>
                    <option value="Dr. K. Srinivas">Dr. K. Srinivas (Principal)</option>
                    <option value="Campus Bursar">Campus Bursar (Fees)</option>
                    <option value="Admissions Desk">Admissions Counselor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">ID Proof Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="PAN">PAN Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={idNumberLast4}
                    onChange={(e) => setIdNumberLast4(e.target.value)}
                    placeholder="4821"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
                >
                  Check In & Issue Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
