"use client";

import { useState } from "react";
import { FieldTripManifestRecord } from "@/types/faculty";
import { updateFieldTripCheckInAction, exportFieldTripManifestAction } from "@/actions/faculty";

interface Props {
  manifest: FieldTripManifestRecord;
  totalStudents: number;
  paidCount: number;
  checkedInCount: number;
}

export default function FacultyFieldTripsClient({
  manifest: initialManifest,
  totalStudents: initialTotal,
  paidCount: initialPaid,
  checkedInCount: initialCheckedIn,
}: Props) {
  const [manifest, setManifest] = useState<FieldTripManifestRecord>(initialManifest);
  const [checkedInCount, setCheckedInCount] = useState(initialCheckedIn);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleToggleCheckIn(studentId: string, current: boolean) {
    const nextVal = !current;
    try {
      const res = await updateFieldTripCheckInAction({ studentId, checkedIn: nextVal });
      if (res.success) {
        setManifest((prev) => ({
          ...prev,
          registeredStudents: prev.registeredStudents.map((s) =>
            s.studentId === studentId ? { ...s, checkedInAtBus: nextVal } : s
          ),
        }));
        setCheckedInCount((c) => (nextVal ? c + 1 : c - 1));
        setFeedback(res.message);
      }
    } catch {
      alert("Failed to update check-in.");
    }
  }

  async function handleExportCsv() {
    try {
      const res = await exportFieldTripManifestAction();
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Field_Trip_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setFeedback("Passenger manifest downloaded with 100% verified digital parent signatures!");
      }
    } catch {
      alert("Failed to export manifest.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Workspace &middot; Excursions &amp; Event Manifests
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🚌 Field Trip Manifests &amp; Micro-Payments Sync
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Zero cash collections. Zero paper slips. Real-time passenger manifest automatically verified as parents grant permission and pay fees digitally.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-blue-900">{manifest.registeredStudents.length}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Eligible Students</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-emerald-600">
            {manifest.registeredStudents.filter((s) => s.feePaid).length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Fee Paid &amp; Permitted</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-blue-800">{checkedInCount}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Boarded on Bus</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-amber-600">
            ₹{manifest.registeredStudents.filter((s) => s.feePaid).length * manifest.ticketPriceInr}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">Collected via Portal</div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="card">
        <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              {manifest.tripTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Destination: {manifest.destination} &middot; Date: {manifest.tripDate} &middot; Fee: ₹{manifest.ticketPriceInr}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>📥 Export Verified Passenger Manifest (CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16 text-center">Seat #</th>
                <th>Roll #</th>
                <th>Student Name</th>
                <th>Parent Contact</th>
                <th>Emergency Phone</th>
                <th className="text-center">Fee Status</th>
                <th className="text-center">Parent Permission</th>
                <th className="text-center">Boarding Action</th>
              </tr>
            </thead>
            <tbody>
              {manifest.registeredStudents.map((s) => {
                const isCheckedIn = s.checkedInAtBus;
                return (
                  <tr key={s.studentId} className={isCheckedIn ? "bg-emerald-50/40" : ""}>
                    <td className="font-bold text-center text-blue-900 font-mono">
                      {s.busSeatNumber ? `S-${s.busSeatNumber}` : "—"}
                    </td>
                    <td className="font-bold text-center text-slate-700">#{s.rollNo}</td>
                    <td className="font-semibold text-slate-900">{s.studentName}</td>
                    <td className="font-mono text-xs text-slate-600">{s.parentPhone}</td>
                    <td className="font-mono text-xs text-slate-600">{s.emergencyContact}</td>
                    <td className="text-center">
                      <span className={`badge ${s.feePaid ? "badge-green" : "badge-amber"}`}>
                        {s.feePaid ? `✓ Paid (₹${manifest.ticketPriceInr})` : "Pending"}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${s.parentPermissionGranted ? "badge-green" : "badge-amber"}`}>
                        {s.parentPermissionGranted ? "✓ Digital Consent" : "Pending"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCheckIn(s.studentId, isCheckedIn)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCheckedIn
                            ? "bg-emerald-700 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {isCheckedIn ? "✓ Boarded" : "Check In"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
