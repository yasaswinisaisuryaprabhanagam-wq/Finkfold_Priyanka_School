"use client";

import { useState, useTransition } from "react";
import { executeInterCampusTransfer } from "@/actions/superAdminEnterprise";
import {
  Users,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Award,
  Fingerprint,
  Briefcase,
  History,
  Building,
  UserCheck,
  Clock,
  Sparkles
} from "lucide-react";

interface StaffProfile {
  id: string;
  trustEmpId: string;
  name: string;
  email: string;
  currentCampus: string;
  currentRole: string;
  subjectSpecialization: string;
  tenureYears: number;
  uanNumber: string;
  biometricId: string;
  leaveBalances: { earned: number; sick: number; casual: number };
  avgAppraisalRating: number;
  avatarColor: string;
}

interface TransferRecord {
  id: string;
  staffName: string;
  trustEmpId: string;
  fromCampus: string;
  toCampus: string;
  designation: string;
  effectiveDate: string;
  transferRef: string;
  reason: string;
  status: "completed" | "in_transit";
}

const INITIAL_STAFF: StaffProfile[] = [
  {
    id: "st-1",
    trustEmpId: "EMP-TRUST-0042",
    name: "Dr. Priyanka Sharma",
    email: "priyanka.sharma@finkfold.edu.in",
    currentCampus: "Main Campus (HYD-01)",
    currentRole: "Senior PGT Physics & STEM Coordinator",
    subjectSpecialization: "Physics (Class 11-12)",
    tenureYears: 6,
    uanNumber: "100982348123",
    biometricId: "BIO-HYD-8821",
    leaveBalances: { earned: 18, sick: 7, casual: 4 },
    avgAppraisalRating: 4.9,
    avatarColor: "from-blue-600 to-indigo-600",
  },
  {
    id: "st-2",
    trustEmpId: "EMP-TRUST-0089",
    name: "Mr. Rajeshwar Rao",
    email: "rajeshwar.rao@finkfold.edu.in",
    currentCampus: "North Campus (HYD-02)",
    currentRole: "TGT Mathematics",
    subjectSpecialization: "Mathematics (Class 8-10)",
    tenureYears: 4,
    uanNumber: "100771239982",
    biometricId: "BIO-HYD-5412",
    leaveBalances: { earned: 12, sick: 5, casual: 2 },
    avgAppraisalRating: 4.7,
    avatarColor: "from-emerald-600 to-teal-600",
  },
  {
    id: "st-3",
    trustEmpId: "EMP-TRUST-0114",
    name: "Ms. Ananya Deshmukh",
    email: "ananya.deshmukh@finkfold.edu.in",
    currentCampus: "East City (HYD-03)",
    currentRole: "Headmistress Primary Wing",
    subjectSpecialization: "Early Childhood Education",
    tenureYears: 8,
    uanNumber: "100445678901",
    biometricId: "BIO-HYD-3190",
    leaveBalances: { earned: 24, sick: 9, casual: 6 },
    avgAppraisalRating: 4.95,
    avatarColor: "from-purple-600 to-pink-600",
  },
];

const INITIAL_TRANSFER_HISTORY: TransferRecord[] = [
  {
    id: "tr-01",
    staffName: "Mr. Suresh Kulkarni",
    trustEmpId: "EMP-TRUST-0019",
    fromCampus: "North Campus (HYD-02)",
    toCampus: "Main Campus (HYD-01)",
    designation: "Vice Principal (Senior Secondary)",
    effectiveDate: "01 Jun 2026",
    transferRef: "TXFER-MK882A",
    reason: "Administrative promotion and CBSE SARAS 4.0 inspection coordination",
    status: "completed",
  },
  {
    id: "tr-02",
    staffName: "Ms. Shalini Gupta",
    trustEmpId: "EMP-TRUST-0073",
    fromCampus: "East City (HYD-03)",
    toCampus: "North Campus (HYD-02)",
    designation: "HOD Chemistry",
    effectiveDate: "15 Jul 2026",
    transferRef: "TXFER-NK190B",
    reason: "Inter-branch curriculum alignment and IIT Foundation batch setup",
    status: "completed",
  },
];

const CAMPUSES = [
  "Main Campus (HYD-01)",
  "North Campus (HYD-02)",
  "East City (HYD-03)",
];

export default function StaffMobilityClient() {
  const [staffList, setStaffList] = useState<StaffProfile[]>(INITIAL_STAFF);
  const [history, setHistory] = useState<TransferRecord[]>(INITIAL_TRANSFER_HISTORY);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetCampus, setTargetCampus] = useState(CAMPUSES[1]);
  const [effectiveDate, setEffectiveDate] = useState("2026-10-01");
  const [revisedRole, setRevisedRole] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [checklist, setChecklist] = useState({
    marksUploaded: true,
    assetsReturned: true,
    biometricsPreserved: true,
    leaveLedgerTransferred: true,
  });
  const [isTransferring, startTransition] = useTransition();
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenTransferModal = (staff: StaffProfile) => {
    setSelectedStaff(staff);
    setRevisedRole(staff.currentRole);
    // pick a campus different from their current one
    const diff = CAMPUSES.find((c) => c !== staff.currentCampus) || CAMPUSES[0];
    setTargetCampus(diff);
    setTransferReason("");
    setFormError(null);
    setTransferModalOpen(true);
  };

  const handleConfirmTransfer = () => {
    if (!selectedStaff) return;
    if (!transferReason.trim()) {
      setFormError("Please provide an executive transfer justification reason.");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      const res = await executeInterCampusTransfer(
        selectedStaff.id,
        selectedStaff.name,
        selectedStaff.currentCampus,
        targetCampus,
        effectiveDate,
        revisedRole || selectedStaff.currentRole,
        transferReason
      );

      if (res.success) {
        // Update staff in local state
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === selectedStaff.id
              ? {
                  ...s,
                  currentCampus: targetCampus,
                  currentRole: revisedRole || s.currentRole,
                }
              : s
          )
        );

        // Add to history
        setHistory((prev) => [
          {
            id: `tr-${Date.now()}`,
            staffName: selectedStaff.name,
            trustEmpId: selectedStaff.trustEmpId,
            fromCampus: selectedStaff.currentCampus,
            toCampus: targetCampus,
            designation: revisedRole || selectedStaff.currentRole,
            effectiveDate,
            transferRef: res.transferRef,
            reason: transferReason,
            status: "completed",
          },
          ...prev,
        ]);

        setConfirmationNotice(res.message);
        setTransferModalOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-blue-950/40 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Workday & Darwinbox Class Architecture
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Inter-Campus Staff Mobility & Unified History
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Eliminate duplicate profiles and fragmented employment records. When faculty or staff transfer between campuses,
              their unified Trust ID, biometrics, leave ledger, PF/UAN, and 360° student appraisal history remain intact.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Fingerprint className="w-3.5 h-3.5" />
              Universal Biometric Sync: Active
            </span>
          </div>
        </div>

        {/* Global Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Total Trust Personnel
            </div>
            <div className="text-2xl font-bold text-foreground">214 Faculty & Staff</div>
            <div className="text-[11px] text-muted-foreground">Main (98), North (72), East (44)</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" />
              Inter-Campus Transfers YTD
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">14 Cross-Branch</div>
            <div className="text-[11px] text-muted-foreground">0 Day administrative downtime</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
              Data Integrity Guarantee
            </div>
            <div className="text-2xl font-bold text-foreground">100% Unified</div>
            <div className="text-[11px] text-muted-foreground">PF, Gratuity & Leave preserved</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Trust Retention Rate
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">96.8%</div>
            <div className="text-[11px] text-muted-foreground">Enabled by inter-branch mobility</div>
          </div>
        </div>
      </div>

      {/* Confirmation Notification Toast */}
      {confirmationNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{confirmationNotice}</span>
          </div>
          <button
            onClick={() => setConfirmationNotice(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Faculty Roster with 1-Click Mobility Trigger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Trust Unified Faculty Roster
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Click &quot;Initiate Transfer&quot; to relocate staff across campuses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${staff.avatarColor} text-white font-bold flex items-center justify-center shadow-md`}
                    >
                      {staff.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{staff.name}</h3>
                      <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        {staff.trustEmpId}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    ★ {staff.avgAppraisalRating}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>Role:</strong> {staff.currentRole}</div>
                  <div><strong>Discipline:</strong> {staff.subjectSpecialization}</div>
                  <div className="flex items-center gap-1.5 text-foreground font-medium pt-1">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    <span>{staff.currentCampus}</span>
                  </div>
                </div>

                {/* Unified Identifiers Card */}
                <div className="rounded-xl bg-muted/40 p-3 border border-border/60 text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UAN / PF ID:</span>
                    <code className="text-foreground font-semibold">{staff.uanNumber}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biometric Key:</span>
                    <code className="text-foreground font-semibold">{staff.biometricId}</code>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Preserved Leaves:</span>
                    <span className="text-foreground font-bold">
                      EL: {staff.leaveBalances.earned} | SL: {staff.leaveBalances.sick} | CL: {staff.leaveBalances.casual}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenTransferModal(staff)}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Initiate Inter-Campus Transfer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer History & Audit Trail */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            Inter-Campus Transfer Log & Audit Trail
          </h2>
          <span className="text-xs text-muted-foreground">Immutable Trust HQ Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
              <tr>
                <th className="p-3">Transfer Ref</th>
                <th className="p-3">Personnel</th>
                <th className="p-3">Source Campus</th>
                <th className="p-3">Destination Campus</th>
                <th className="p-3">Effective Date</th>
                <th className="p-3">Reason / Justification</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {record.transferRef}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{record.staffName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{record.trustEmpId}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{record.fromCampus}</td>
                  <td className="p-3 font-semibold text-foreground">{record.toCampus}</td>
                  <td className="p-3 font-mono">{record.effectiveDate}</td>
                  <td className="p-3 text-muted-foreground max-w-xs truncate">{record.reason}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Transferred
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Execution Wizard Modal */}
      {transferModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-card border border-blue-500/50 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Execute Cross-Campus Relocation</h3>
                  <p className="text-xs text-muted-foreground">Unified Staff Mobility Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Staff Summary */}
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground">Candidate: </span>
                <strong className="text-foreground">{selectedStaff.name}</strong> ({selectedStaff.trustEmpId})
              </div>
              <div>
                <span className="text-muted-foreground">Current: </span>
                <strong className="text-blue-600 dark:text-blue-400">{selectedStaff.currentCampus}</strong>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Destination Campus</label>
                  <select
                    value={targetCampus}
                    onChange={(e) => setTargetCampus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                  >
                    {CAMPUSES.filter((c) => c !== selectedStaff.currentCampus).map((campus) => (
                      <option key={campus} value={campus}>
                        {campus}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Effective Transfer Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Assigned Designation at Destination</label>
                <input
                  type="text"
                  value={revisedRole}
                  onChange={(e) => setRevisedRole(e.target.value)}
                  placeholder="e.g. HOD Physics & Senior Academic Lead"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Executive Transfer Justification</label>
                <textarea
                  rows={2}
                  value={transferReason}
                  onChange={(e) => {
                    setTransferReason(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="State the institutional reason (e.g. CBSE lab commissioning, promotion, staffing balance)..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                />
                {formError && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{formError}</span>
                  </p>
                )}
              </div>

              {/* Handover & Integrity Checklist */}
              <div className="rounded-xl bg-muted/40 p-3 border border-border/60 space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  Preservation & Handover Safeguards:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.marksUploaded}
                      onChange={(e) => setChecklist({ ...checklist, marksUploaded: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Academic marks signed off</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.assetsReturned}
                      onChange={(e) => setChecklist({ ...checklist, assetsReturned: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Campus assets surrendered</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.biometricsPreserved}
                      onChange={(e) => setChecklist({ ...checklist, biometricsPreserved: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Sync Biometric Turnstiles</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.leaveLedgerTransferred}
                      onChange={(e) => setChecklist({ ...checklist, leaveLedgerTransferred: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>Preserve EL/SL/CL Ledger</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isTransferring}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isTransferring ? "Executing Protocol..." : "Authorize & Execute Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
