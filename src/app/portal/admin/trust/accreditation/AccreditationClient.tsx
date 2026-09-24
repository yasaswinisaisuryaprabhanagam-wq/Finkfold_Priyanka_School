"use client";

import { useState, useTransition } from "react";
import { uploadAccreditationCertificate } from "@/actions/superAdminEnterprise";
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Clock,
  Upload,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink,
  Flame,
  Droplets,
  HardHat,
  Award,
  FileText
} from "lucide-react";

interface CertificateItem {
  id: string;
  campusName: string;
  documentType: string;
  issuingAuthority: string;
  certNumber: string;
  validUntil: string;
  daysRemaining: number;
  status: "nominal" | "amber_warning" | "red_critical";
  lastVerifiedDate: string;
  iconType: "fire" | "building" | "water" | "cbse" | "rte" | "deed";
}

const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-01",
    campusName: "North Campus (HYD-02)",
    documentType: "Fire Safety NOC & Evacuation Clearance",
    issuingAuthority: "State Disaster Response & Fire Services Dept.",
    certNumber: "FS/NOC/TG/2025/9082",
    validUntil: "2026-10-15",
    daysRemaining: 22, // Critical (<30 days)
    status: "red_critical",
    lastVerifiedDate: "14 Oct 2025",
    iconType: "fire",
  },
  {
    id: "cert-02",
    campusName: "East City (HYD-03)",
    documentType: "Drinking Water Purity & Sanitary Hygiene",
    issuingAuthority: "District Medical & Health Officer (DMHO)",
    certNumber: "DMHO/HYD/SAN/2025/112",
    validUntil: "2026-11-28",
    daysRemaining: 66, // Warning (<90 days)
    status: "amber_warning",
    lastVerifiedDate: "27 Nov 2025",
    iconType: "water",
  },
  {
    id: "cert-03",
    campusName: "Main Campus (HYD-01)",
    documentType: "CBSE Senior Secondary Affiliation (SARAS 4.0)",
    issuingAuthority: "Central Board of Secondary Education, New Delhi",
    certNumber: "CBSE/AFF/3630248/EX-0284",
    validUntil: "2028-03-31",
    daysRemaining: 554, // Nominal
    status: "nominal",
    lastVerifiedDate: "01 Apr 2023",
    iconType: "cbse",
  },
  {
    id: "cert-04",
    campusName: "Main Campus (HYD-01)",
    documentType: "Structural Soundness & Building Safety",
    issuingAuthority: "Executive Engineer, Roads & Buildings (R&B)",
    certNumber: "PWD/STR/2024/774",
    validUntil: "2027-06-30",
    daysRemaining: 280, // Nominal
    status: "nominal",
    lastVerifiedDate: "01 Jul 2024",
    iconType: "building",
  },
  {
    id: "cert-05",
    campusName: "North Campus (HYD-02)",
    documentType: "State Education Dept. Recognition (RTE Form II)",
    issuingAuthority: "District Educational Officer (DEO)",
    certNumber: "DEO/RTE/HYD/2023/449",
    validUntil: "2026-12-31",
    daysRemaining: 99, // Nominal
    status: "nominal",
    lastVerifiedDate: "01 Jan 2024",
    iconType: "rte",
  },
  {
    id: "cert-06",
    campusName: "East City (HYD-03)",
    documentType: "Registered Trust Campus Lease Deed (30 Yrs)",
    issuingAuthority: "Sub-Registrar Office, Govt. of Telangana",
    certNumber: "DOC-REG-2018-88392",
    validUntil: "2048-08-15",
    daysRemaining: 7995, // Long-term Nominal
    status: "nominal",
    lastVerifiedDate: "15 Aug 2018",
    iconType: "deed",
  },
];

export default function AccreditationClient() {
  const [certs, setCerts] = useState<CertificateItem[]>(INITIAL_CERTIFICATES);
  const [filterCampus, setFilterCampus] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  // Form State
  const [renewCampus, setRenewCampus] = useState("North Campus (HYD-02)");
  const [renewDocType, setRenewDocType] = useState("Fire Safety NOC & Evacuation Clearance");
  const [renewCertNum, setRenewCertNum] = useState("");
  const [renewValidUntil, setRenewValidUntil] = useState("2027-10-15");
  const [isUploading, startTransition] = useTransition();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredCerts =
    filterCampus === "all" ? certs : certs.filter((c) => c.campusName.includes(filterCampus));

  const criticalCount = certs.filter((c) => c.status === "red_critical").length;
  const warningCount = certs.filter((c) => c.status === "amber_warning").length;
  const nominalCount = certs.filter((c) => c.status === "nominal").length;

  const handleOpenRenewModal = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setRenewCampus(cert.campusName);
    setRenewDocType(cert.documentType);
    setRenewCertNum(cert.certNumber);
    setUploadModalOpen(true);
  };

  const handleConfirmUpload = () => {
    if (!renewCertNum.trim()) {
      alert("Please provide the official certificate reference number.");
      return;
    }

    startTransition(async () => {
      const res = await uploadAccreditationCertificate(
        renewCampus,
        renewDocType,
        renewValidUntil,
        renewCertNum
      );

      if (res.success) {
        setCerts((prev) =>
          prev.map((c) =>
            selectedCert && c.id === selectedCert.id
              ? {
                  ...c,
                  certNumber: renewCertNum,
                  validUntil: renewValidUntil,
                  daysRemaining: 365,
                  status: "nominal",
                  lastVerifiedDate: new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                }
              : c
          )
        );

        setSuccessToast(res.message);
        setUploadModalOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-red-950/40 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              CBSE SARAS 4.0 & Legal Sovereignty Vault
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Accreditation & Affiliation Vault
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Centralized repository for statutory licenses, fire safety NOCs, CBSE affiliation decrees, and state recognitions.
              Automated 90-day & 30-day proactive countdown timers prevent administrative lapses or closure notices.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCert(null);
              setRenewCertNum("");
              setUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Upload Renewed Certificate
          </button>
        </div>

        {/* Global SLA Countdown Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-blue-500" />
              Total Monitored Instruments
            </div>
            <div className="text-2xl font-bold text-foreground">{certs.length} Licenses</div>
            <div className="text-[11px] text-muted-foreground">Across all 3 campuses</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Critical Red SLA (&lt;30 Days)
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {criticalCount} Urgent
            </div>
            <div className="text-[11px] text-muted-foreground">Escalated to Super Admin</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Proactive Amber (&lt;90 Days)
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {warningCount} Renewal Active
            </div>
            <div className="text-[11px] text-muted-foreground">Principal inspection booked</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Nominal Standing (&gt;90 Days)
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {nominalCount} Fully Valid
            </div>
            <div className="text-[11px] text-muted-foreground">100% compliant</div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Certificates Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" />
            Trust Legal Affiliations & Mandatory Compliance Repository
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterCampus("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterCampus === "all" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground"
              }`}
            >
              All Campuses
            </button>
            <button
              onClick={() => setFilterCampus("Main")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterCampus === "Main" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground"
              }`}
            >
              Main Campus
            </button>
            <button
              onClick={() => setFilterCampus("North")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterCampus === "North" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground"
              }`}
            >
              North Campus
            </button>
            <button
              onClick={() => setFilterCampus("East")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterCampus === "East" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground"
              }`}
            >
              East City
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCerts.map((cert) => {
            const isRed = cert.status === "red_critical";
            const isAmber = cert.status === "amber_warning";

            return (
              <div
                key={cert.id}
                className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-all flex flex-col justify-between ${
                  isRed
                    ? "border-red-500/70 bg-red-500/5 dark:bg-red-950/20"
                    : isAmber
                    ? "border-amber-500/60 bg-amber-500/5 dark:bg-amber-950/15"
                    : "border-border/80 bg-card hover:border-border"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      {cert.campusName}
                    </span>

                    {isRed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> {cert.daysRemaining} Days Left
                      </span>
                    )}
                    {isAmber && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> {cert.daysRemaining} Days Left
                      </span>
                    )}
                    {!isRed && !isAmber && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> {cert.daysRemaining} Days (Nominal)
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {cert.documentType}
                    </h3>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      Authority: <strong>{cert.issuingAuthority}</strong>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-3 border border-border/60 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate #:</span>
                      <code className="text-foreground font-semibold font-mono">{cert.certNumber}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <strong className="text-foreground font-mono">{cert.validUntil}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border/40 text-[10px]">
                      <span className="text-muted-foreground">Last Audited:</span>
                      <span>{cert.lastVerifiedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleOpenRenewModal(cert)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                      isRed
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        : isAmber
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isRed ? "Urgent: Upload Renewed NOC" : "Update / Renew Document"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Upload / Renewal Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-red-500/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Upload Compliance Certificate</h3>
                  <p className="text-xs text-muted-foreground">Renew legal standing under Super Admin authority</p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Campus</label>
                <select
                  value={renewCampus}
                  onChange={(e) => setRenewCampus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                >
                  <option value="Main Campus (HYD-01)">Main Campus (HYD-01)</option>
                  <option value="North Campus (HYD-02)">North Campus (HYD-02)</option>
                  <option value="East City (HYD-03)">East City (HYD-03)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Document Type</label>
                <input
                  type="text"
                  value={renewDocType}
                  onChange={(e) => setRenewDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Certificate # / Ref</label>
                  <input
                    type="text"
                    value={renewCertNum}
                    onChange={(e) => setRenewCertNum(e.target.value)}
                    placeholder="e.g. NOC-2026-991"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Renewed Expiry Date</label>
                  <input
                    type="date"
                    value={renewValidUntil}
                    onChange={(e) => setRenewValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-mono"
                  />
                </div>
              </div>

              <div className="border border-dashed border-border rounded-xl p-5 text-center space-y-1">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                <div className="text-xs font-semibold text-foreground">Attach Scanned Govt Decree (PDF / JPG)</div>
                <div className="text-[10px] text-muted-foreground">Certified digital scan up to 25 MB</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                {isUploading ? "Verifying & Updating..." : "Verify & Commit to Vault"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
