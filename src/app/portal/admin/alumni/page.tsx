"use client";

import { useState } from "react";
import {
  INITIAL_ALUMNI_PROFILES,
  INITIAL_ENDOWMENT_CAMPAIGNS,
  INITIAL_ALUMNI_DONATIONS,
  recordAlumniDonation,
} from "@/actions/admin-alumni";
import type { AlumniProfile, EndowmentCampaign, AlumniDonation } from "@/types/admin-extended";

export default function AdminAlumniPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>(INITIAL_ALUMNI_PROFILES);
  const [campaigns, setCampaigns] = useState<EndowmentCampaign[]>(INITIAL_ENDOWMENT_CAMPAIGNS);
  const [donations, setDonations] = useState<AlumniDonation[]>(INITIAL_ALUMNI_DONATIONS);
  const [activeTab, setActiveTab] = useState<"directory" | "campaigns" | "donations">("directory");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedAlumniId, setSelectedAlumniId] = useState(alumni[0]?.id || "");
  const [panNumber, setPanNumber] = useState("ABCDE1234F");
  const [donationAmount, setDonationAmount] = useState(25000);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || "");
  const [previewDonation, setPreviewDonation] = useState<AlumniDonation | null>(INITIAL_ALUMNI_DONATIONS[0]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const totalEndowmentsRaised = campaigns.reduce((acc, c) => acc + c.collectedAmount, 0);
  const tier1AlumniCount = alumni.filter((a) => a.tier1Status).length;

  async function handleRecordDonation(e: React.FormEvent) {
    e.preventDefault();
    const donor = alumni.find((a) => a.id === selectedAlumniId);
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!donor || !campaign) return;

    const res = await recordAlumniDonation({
      alumniId: donor.id,
      donorName: donor.fullName,
      panNumber,
      donationAmount: Number(donationAmount),
      campaignId: campaign.id,
      campaignTitle: campaign.campaignTitle,
      paymentMode: "UPI",
      utrOrRefNumber: `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    });

    if (res.success && res.donation) {
      setDonations([res.donation, ...donations]);
      setPreviewDonation(res.donation);
      setCampaigns(
        campaigns.map((c) =>
          c.id === campaign.id
            ? { ...c, collectedAmount: c.collectedAmount + Number(donationAmount), backersCount: c.backersCount + 1 }
            : c
        )
      );
      setShowDonationModal(false);
      setStatusMessage(`✓ Donation recorded! Official 80G Tax Exemption Receipt generated: ${res.donation.receiptNumber}`);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <span>Level 3: Institutional Prestige</span>
              <span>·</span>
              <span>Alumni Network & 80G Endowments</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Alumni Network & Endowment CRM
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Maintain lifelong institutional connections with graduating cohorts. Track admissions to IITs, NITs, and AIIMS, launch campus endowment funds, and issue official Section 80G Tax Exemption receipts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDonationModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              + Record Alumni Endowment Donation
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats / Marketing Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tier-1 Admissions</div>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">42 Scholars</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Currently at IITs, NITs, BITS, AIIMS</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Endowment Raised</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
            ₹{(totalEndowmentsRaised / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">100% 80G Tax-Deductible</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</div>
          <div className="text-xl font-bold text-sky-700 mt-1 font-mono">{campaigns.length} Projects</div>
          <div className="text-[10px] text-slate-500 mt-1">AI Robotics Lab & STEM Scholarships</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alumni Mentors</div>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">
            {alumni.filter((a) => a.isMentorAvailable).length} Mentors
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Available for Class 10 career guidance</div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-xs">
          {statusMessage}
        </div>
      )}

      {/* Main Tabs Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "directory" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🎓 Alumni Directory ({alumni.length})
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "campaigns" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🏛️ Endowment Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "donations" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            📜 80G Tax Receipts ({donations.length})
          </button>
        </div>

        {/* Tab 1: Alumni Directory */}
        {activeTab === "directory" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Alumni Name & Batch</th>
                  <th className="p-3">Higher Ed Institution / Employer</th>
                  <th className="p-3">City & Contact</th>
                  <th className="p-3 text-right">Lifetime Giving</th>
                  <th className="p-3 text-center">Prestige Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {alumni.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{a.fullName}</div>
                      <div className="text-[10px] text-purple-700 font-semibold">{a.graduationBatch} · {a.admissionNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{a.currentInstitutionOrEmployer}</div>
                      <div className="text-[11px] text-slate-500">{a.designationOrDegree}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      <div>{a.cityCountry}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{a.email}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      ₹{a.totalEndowmentContributed.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-center">
                      {a.tier1Status && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          ⭐ Tier-1 Star
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Campaigns */}
        {activeTab === "campaigns" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((c) => {
              const progressPct = Math.min(100, Math.round((c.collectedAmount / c.targetAmount) * 100));
              return (
                <div key={c.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                        {c.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{c.campaignTitle}</h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Closes {c.deadline}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-semibold">
                      <span className="text-emerald-700">₹{c.collectedAmount.toLocaleString("en-IN")} raised</span>
                      <span className="text-slate-500">Goal: ₹{c.targetAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{progressPct}% Funded</span>
                      <span>{c.backersCount} Alumni Backers</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: 80G Receipts */}
        {activeTab === "donations" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Endowment Contributions</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {donations.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setPreviewDonation(d)}
                    className="p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{d.donorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Receipt: {d.receiptNumber} · PAN: {d.panNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-700 text-xs">₹{d.donationAmount.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-slate-400">{d.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-xl border border-slate-300 bg-slate-50/70 space-y-3 font-mono text-xs">
                <div className="text-center pb-3 border-b border-slate-300">
                  <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                    PRIYANKA EDUCATIONAL TRUST • 80G TAX EXEMPTION
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-sans mt-0.5">
                    DONATION RECEIPT (UNDER SECTION 80G)
                  </div>
                  <div className="text-[9px] text-slate-500">Income Tax Registration No: CIT(E)/HYD/80G/2018-19/A-412</div>
                </div>

                {previewDonation && (
                  <>
                    <div className="flex justify-between text-[11px]">
                      <span>Receipt: <strong>{previewDonation.receiptNumber}</strong></span>
                      <span>Date: <strong>{previewDonation.date}</strong></span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
                      <div>Received with thanks from: <strong>{previewDonation.donorName}</strong></div>
                      <div>PAN: <strong>{previewDonation.panNumber}</strong></div>
                      <div>Sum of Rupees: <strong>₹{previewDonation.donationAmount.toLocaleString("en-IN")}</strong></div>
                      <div>For Campaign: <strong>{previewDonation.campaignTitle}</strong></div>
                      <div>Payment Ref: <span className="font-mono text-slate-500">{previewDonation.utrOrRefNumber}</span></div>
                    </div>

                    <div className="text-[10px] text-slate-600 italic leading-normal">
                      &quot;Donations made to Priyanka Educational Trust are eligible for 50% deduction under Section 80G(5)(vi) of the Income Tax Act, 1961.&quot;
                    </div>

                    <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
                      <div className="text-[9px] text-emerald-700 font-bold">✓ 80G Tax-Compliant Voucher</div>
                      <button onClick={() => window.print()} className="text-xs text-purple-700 font-bold hover:underline">
                        Print 80G Receipt 🖨️
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Record Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Record Alumni Endowment Donation
              </h3>
              <button onClick={() => setShowDonationModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordDonation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donor (Alumni Profile)</label>
                <select
                  value={selectedAlumniId}
                  onChange={(e) => setSelectedAlumniId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  {alumni.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.graduationBatch}) — {a.currentInstitutionOrEmployer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Amount (INR)</label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  min={1000}
                  step={500}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allocate to Endowment Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.campaignTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                >
                  Record & Issue 80G Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
