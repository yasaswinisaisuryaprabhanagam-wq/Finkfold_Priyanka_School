"use client";

import { useState } from "react";
import { ClubMembershipItem, CertificateVerificationItem } from "@/types/faculty";
import { reviewCertificateAction } from "@/actions/faculty";

interface Props {
  clubName: string;
  sponsorName: string;
  schedule: string;
  initialRoster: ClubMembershipItem[];
  initialCerts: CertificateVerificationItem[];
}

export default function FacultyClubsClient({
  clubName,
  sponsorName,
  schedule,
  initialRoster,
  initialCerts,
}: Props) {
  const [activeTab, setActiveTab] = useState<"club" | "certs">("club");
  const [roster] = useState<ClubMembershipItem[]>(initialRoster);
  const [certs, setCerts] = useState<CertificateVerificationItem[]>(initialCerts);
  const [clubNotice, setClubNotice] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingCerts = certs.filter((c) => c.status === "pending_verification");

  async function handleReviewCert(certId: string, approved: boolean) {
    setProcessingId(certId);
    try {
      const res = await reviewCertificateAction({
        certId,
        approved,
        remarks: approved ? "Verified by Class Teacher." : "Requires re-upload of official stamp.",
      });
      if (res.success) {
        setCerts((prev) =>
          prev.map((c) =>
            c.id === certId
              ? { ...c, status: approved ? "verified_and_added_to_dossier" : "rejected" }
              : c
          )
        );
        setFeedback(res.message);
      }
    } catch {
      alert("Failed to update certificate status.");
    } finally {
      setProcessingId(null);
    }
  }

  function handleBroadcastNotice(e: React.FormEvent) {
    e.preventDefault();
    if (!clubNotice.trim()) return;
    setFeedback(`Club announcement broadcast to all ${roster.length} members!`);
    setClubNotice("");
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
            Faculty Workspace &middot; Clubs &amp; Verified Credentials
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🏆 Club Sponsor Hub &amp; Certificate Verification Queue
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Manage your sponsored student club roster, track specialized attendance, and verify external achievement certificates into the permanent school dossier.
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

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("club")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "club"
              ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🤖 Club Sponsor: {clubName.split("&")[0]}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full">{roster.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "certs"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🎖️ Certificate Verification Queue</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-full">
            {pendingCerts.length} Pending
          </span>
        </button>
      </div>

      {/* ── TAB 1: CLUB SPONSOR DASHBOARD ── */}
      {activeTab === "club" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 card">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {clubName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sponsor: {sponsorName} &middot; Schedule: {schedule}
                </p>
              </div>
              <span className="badge badge-blue">{roster.length} Enrolled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll #</th>
                    <th>Member Name</th>
                    <th>Class</th>
                    <th>Club Role</th>
                    <th>Attendance</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((m) => (
                    <tr key={m.id}>
                      <td className="font-bold text-slate-700">#{m.rollNo}</td>
                      <td className="font-semibold text-slate-900">{m.studentName}</td>
                      <td className="text-xs text-slate-500">{m.classGrade}</td>
                      <td>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                          {m.role}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-xs text-emerald-700">{m.attendancePercent}%</span>
                      </td>
                      <td className="text-xs text-slate-400">{m.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Broadcast Club Notice</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sends an announcement exclusively to students enrolled in this club.
              </p>
            </div>

            <form onSubmit={handleBroadcastNotice} className="space-y-3">
              <textarea
                rows={4}
                required
                placeholder="e.g. Reminder: Bring your Arduino Uno kits and micro-USB cables for tomorrow's sensor calibration session..."
                value={clubNotice}
                onChange={(e) => setClubNotice(e.target.value)}
                className="input text-xs w-full resize-none"
              />
              <button
                type="submit"
                className="btn btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>📢 Broadcast to Club Members</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: CERTIFICATE VERIFICATION QUEUE ── */}
      {activeTab === "certs" && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                External Student Certificates Pending Verification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve external awards uploaded by students into their digital credentials vault.
              </p>
            </div>
            <span className="badge badge-amber">{pendingCerts.length} Pending Review</span>
          </div>

          <div className="card-body space-y-4">
            {certs.map((cert) => {
              const isPending = cert.status === "pending_verification";
              const isApproved = cert.status === "verified_and_added_to_dossier";

              return (
                <div
                  key={cert.id}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    isPending
                      ? "bg-amber-50/40 border-amber-200 shadow-2xs"
                      : isApproved
                      ? "bg-emerald-50/30 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {cert.studentName} ({cert.classGrade})
                      </span>
                      <span className="badge badge-blue text-[10px] font-bold">{cert.level} Level</span>
                      <span
                        className={`badge ${
                          isApproved ? "badge-green" : isPending ? "badge-amber" : "badge-rose"
                        }`}
                      >
                        {isApproved ? "✓ Added to Dossier" : isPending ? "⏳ Pending Review" : "Rejected"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{cert.title}</h4>
                    <p className="text-xs text-slate-600">
                      Organized by: <strong className="text-slate-800">{cert.organizingBody}</strong> &middot; Award:{" "}
                      <strong className="text-blue-900">{cert.awardSecured}</strong>
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>📅 Date: {cert.eventDate}</span>
                      <span>📄 Document: {cert.proofDocumentName}</span>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReviewCert(cert.id, false)}
                        disabled={processingId === cert.id}
                        className="btn btn-secondary text-xs px-3 py-1.5 text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewCert(cert.id, true)}
                        disabled={processingId === cert.id}
                        className="btn btn-primary text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {processingId === cert.id ? "Approving..." : "✓ Approve & Append to Dossier"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
