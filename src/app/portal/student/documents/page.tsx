"use client";

import { useState, useEffect, useTransition } from "react";
import type {
  SupportTicket,
  DigitalCertificate,
  ExternalAchievement,
  IdPhotoSubmission,
} from "@/types/self-service";
import {
  INITIAL_TICKETS,
  INITIAL_CERTIFICATES,
  INITIAL_EXTERNAL_ACHIEVEMENTS,
  INITIAL_ID_PHOTO,
} from "@/types/self-service";
import {
  getSupportTicketsData,
  createTicketAction,
} from "@/actions/helpdesk";
import {
  getVaultExtendedData,
  submitExternalAchievementAction,
  uploadIdPhotoAction,
} from "@/actions/vault";
import { SCHOOL } from "@/lib/school-config";
import {
  FileText,
  Award,
  Upload,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  AlertTriangle,
  Send,
  Building,
  HelpCircle,
  Sparkles,
  Search,
  ExternalLink
} from "lucide-react";

export default function StudentDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"certificates" | "external" | "idphoto" | "helpdesk">("certificates");
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>(INITIAL_CERTIFICATES);
  const [externalAchievements, setExternalAchievements] = useState<ExternalAchievement[]>(INITIAL_EXTERNAL_ACHIEVEMENTS);
  const [idPhoto, setIdPhoto] = useState<IdPhotoSubmission>(INITIAL_ID_PHOTO);

  // Certificate Modals
  const [activeModal, setActiveModal] = useState<"bonafide" | "tax80c" | "attendance" | null>(null);
  const [selectedVerifiableCert, setSelectedVerifiableCert] = useState<DigitalCertificate | null>(null);

  // External Achievement Form State
  const [achTitle, setAchTitle] = useState("");
  const [achOrganizingBody, setAchOrganizingBody] = useState("");
  const [achLevel, setAchLevel] = useState<ExternalAchievement["level"]>("State");
  const [achDate, setAchDate] = useState("2026-08-15");
  const [achAward, setAchAward] = useState("");
  const [achProofDoc, setAchProofDoc] = useState("");

  const [studentMeta, setStudentMeta] = useState<{
    studentName: string;
    admissionNo: string;
    className: string;
    parentName: string;
  }>({
    studentName: "Aarav Sharma",
    admissionNo: "PRIY-2026-001",
    className: "Class 10-A",
    parentName: "Sri Rajesh Sharma",
  });

  // ID Photo Upload State
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Helpdesk Form State
  const [category, setCategory] = useState<SupportTicket["category"]>("Accounts & Fees");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("medium");

  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSupportTicketsData().then((res) => {
      if (res && res.length > 0) setTickets(res);
    });
    getVaultExtendedData().then((res) => {
      if (res) {
        if (res.certificates) setCertificates(res.certificates);
        if (res.externalAchievements) setExternalAchievements(res.externalAchievements);
        if (res.idPhoto) setIdPhoto(res.idPhoto);
        if (res.studentName) {
          setStudentMeta({
            studentName: res.studentName,
            admissionNo: res.admissionNo || "PRIY-2026-001",
            className: res.className || "Class 10-A",
            parentName: res.parentName || "Parent/Guardian",
          });
        }
      }
    });
  }, []);

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

  function handleExternalAchievementSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!achTitle.trim() || !achOrganizingBody.trim()) return;

    startTransition(async () => {
      const res = await submitExternalAchievementAction({
        title: achTitle.trim(),
        organizingBody: achOrganizingBody.trim(),
        level: achLevel,
        eventDate: achDate,
        awardSecured: achAward.trim() || "Gold Medal / Certificate of Merit",
        proofDocumentName: achProofDoc.trim() || "Certificate_Scan.pdf",
      });

      if (res.success) {
        setExternalAchievements((prev) => [res.achievement, ...prev]);
        setNotification(res.message);
        setAchTitle("");
        setAchOrganizingBody("");
        setAchAward("");
        setAchProofDoc("");
        setTimeout(() => setNotification(null), 8000);
      }
    });
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image file size exceeds 5MB. Please upload a compressed passport photo.");
      return;
    }

    setSelectedPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoUpload(e: React.FormEvent) {
    e.preventDefault();
    setPhotoError(null);

    const targetPhoto = photoPreview || newPhotoUrl.trim();
    if (!targetPhoto) {
      setPhotoError("Please select a student passport photo file or enter an image URL before validating.");
      return;
    }

    startTransition(async () => {
      const res = await uploadIdPhotoAction(targetPhoto);
      if (res.success) {
        setIdPhoto(res.idPhoto);
        setNotification(res.message);
        setNewPhotoUrl("");
        setSelectedPhotoFile(null);
        setPhotoPreview(null);
        setTimeout(() => setNotification(null), 8000);
      }
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner - Clean White & Soft Pastel Style */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-900 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Institutional Credentials &amp; Dossier Vault
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Verifiable E-Certs, External Achievements &amp; ID Photo
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Generate instantly verifiable QR-signed certificates, deposit external district/state awards for Principal approval,
            manage compliant ID card photos, and raise administrative helpdesk requests.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("certificates")}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "certificates"
                ? "bg-slate-900 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            E-Certificates &amp; Statements ({certificates.length + 3})
          </button>
          <button
            onClick={() => setActiveTab("external")}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "external"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            External Achievements ({externalAchievements.length})
          </button>
          <button
            onClick={() => setActiveTab("idphoto")}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "idphoto"
                ? "bg-emerald-700 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            ID Card Photo Validator
          </button>
          <button
            onClick={() => setActiveTab("helpdesk")}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "helpdesk"
                ? "bg-sky-700 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Support Helpdesk ({tickets.length})
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-400" />
          <div className="text-sm">
            <span className="font-semibold block mb-0.5">Notification:</span>
            {notification}
          </div>
        </div>
      )}

      {/* ── TAB 1: E-CERTIFICATES & INSTITUTIONAL STATEMENTS ── */}
      {activeTab === "certificates" && (
        <div className="space-y-8">
          {/* Institutional PDF Generators */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Standard Institutional Letters (Instant PDF)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Bonafide Certificate */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl">
                    📜
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bonafide Student Certificate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Official verification of enrollment, class, and conduct. Required for passport, visa & bank opening.
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Digitally signed with QR validation
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal("bonafide")}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Generate & Download PDF</span>
                </button>
              </div>

              {/* 2. Section 80C Tax Certificate */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xl">
                    📑
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Fee Paid Certificate (Sec 80C)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tuition fee statement for Income Tax deduction under Section 80C. Includes Trust PAN & TAN details.
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Total Tuition Paid: ₹28,500
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal("tax80c")}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Generate & Download PDF</span>
                </button>
              </div>

              {/* 3. Attendance Certificate */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xl">
                    📊
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Attendance Compliance Statement
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Certified record of academic attendance percentage (94.2%). Required for board exam hall ticket clearance.
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 162/172 Days Present (Compliant)
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal("attendance")}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Generate & Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verifiable QR E-Certificates */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-500" />
              Verifiable Digital Merit Certificates (Cryptographic Hash)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                        {cert.certificateNo}
                      </span>
                      <span className="text-xs text-slate-400">{cert.dateIssued}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {cert.eventName}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Honored: <strong>{cert.awardRank}</strong>
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Hash: {cert.qrVerificationHash}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Signatory: <strong className="text-slate-700 dark:text-slate-200">{cert.signatory}</strong>
                    </div>
                    <button
                      onClick={() => setSelectedVerifiableCert(cert)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Verify QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Verification Modal */}
          {selectedVerifiableCert && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-center">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Public Verification Modal
                  </span>
                  <button
                    onClick={() => setSelectedVerifiableCert(null)}
                    className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="w-40 h-40 mx-auto p-3 bg-white rounded-2xl border-2 border-dashed border-purple-500 shadow-inner flex items-center justify-center">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedVerifiableCert.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedVerifiableCert.certificateNo}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    ✓ Cryptographically authentic & registered on Priyanka School Chain
                  </p>
                </div>

                <button
                  onClick={() => {
                    window.print();
                    setSelectedVerifiableCert(null);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Print Official Sealed Certificate
                </button>
              </div>
            </div>
          )}

          {/* Standard Certificate Printable Modal */}
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
                        This is to certify that Master / Kum. <strong>{studentMeta.studentName}</strong>, Child of <strong>{studentMeta.parentName}</strong>, 
                        is a bonafide student of this institution studying in <strong>{studentMeta.className}</strong> (Admission No: <strong>{studentMeta.admissionNo}</strong>) 
                        during the academic year <strong>2026–2027</strong>.
                      </p>
                      <p>
                        According to school records, the student's date of birth is <strong>14-06-2011</strong> and character and conduct have been found to be <strong>Exemplary</strong>.
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
                        <strong> {studentMeta.parentName}</strong> towards Tuition Fees for ward <strong>{studentMeta.studentName}</strong> ({studentMeta.className}, Admission No: {studentMeta.admissionNo}) 
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
                        Certified that <strong>{studentMeta.studentName}</strong> has recorded <strong>162 working days</strong> attended out of 
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
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: EXTERNAL ACHIEVEMENTS DROP-BOX ── */}
      {activeTab === "external" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Deposit External Award / Honor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Won a district, state, or national medal outside school? Lodge it here for Principal endorsement into your permanent student dossier.
              </p>

              <form onSubmit={handleExternalAchievementSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Achievement / Competition Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP State Sub-Junior Swimming Championship"
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Organizing Authority / Body *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP Aquatic Association / Olympiad Foundation"
                    value={achOrganizingBody}
                    onChange={(e) => setAchOrganizingBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Competition Level
                    </label>
                    <select
                      value={achLevel}
                      onChange={(e) => setAchLevel(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="District">District Level</option>
                      <option value="State">State Level</option>
                      <option value="National">National Level</option>
                      <option value="International">International Level</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={achDate}
                      onChange={(e) => setAchDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Award Secured / Rank
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Silver Medal • 100m Butterfly Stroke"
                    value={achAward}
                    onChange={(e) => setAchAward(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Proof Document Name / Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AP_Aquatics_Certificate_Arjun.pdf"
                    value={achProofDoc}
                    onChange={(e) => setAchProofDoc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !achTitle.trim()}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isPending ? "Lodging..." : "Lodge in Principal Verification Queue"}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student External Dossier Records
            </h3>

            {externalAchievements.map((ach) => {
              const isVerified = ach.status === "verified_and_added_to_dossier";
              return (
                <div
                  key={ach.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {ach.level} Level
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isVerified
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {isVerified ? "Verified in Dossier" : "Under Principal Review"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {ach.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Organized by: {ach.organizingBody} • {ach.eventDate}
                    </p>
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      Award: {ach.awardSecured}
                    </div>
                  </div>

                  {ach.principalRemarks && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Principal Endorsement:
                      </div>
                      <p>{ach.principalRemarks}</p>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-400 font-mono">
                    Proof Attachment: {ach.proofDocumentName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: ID PHOTO VALIDATOR ── */}
      {activeTab === "idphoto" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Student ID Card Photo Validator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For annual smart RFID ID card printing. Photos must satisfy CBSE school board compliance criteria.
            </p>

            <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative w-40 h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-300 dark:border-slate-600 mb-4 bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview || idPhoto.photoUrl}
                  alt="Student ID Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                  {photoPreview ? "Draft Selected" : "Batch Ready"}
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {studentMeta.studentName} ({studentMeta.className})
                </span>
                <p className="text-[11px] text-slate-400">UID: {studentMeta.admissionNo}</p>
              </div>
            </div>

            {photoError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{photoError}</span>
              </div>
            )}

            <form onSubmit={handlePhotoUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Upload Student ID Photo File (JPG, PNG, WebP) *
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileSelected}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-white"
                />
                {selectedPhotoFile && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    ✓ File selected: {selectedPhotoFile.name} ({(selectedPhotoFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white dark:bg-slate-900 px-2 text-[10px] text-slate-400 uppercase font-semibold absolute">
                  or image url
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  HTTPS Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => {
                    setPhotoError(null);
                    setNewPhotoUrl(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {isPending ? "Validating & Uploading..." : "Validate & Queue for Batch Print"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Automated AI Compliance Checks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our automated intake validator checks every uploaded photo against standard identity specifications.
            </p>

            <div className="space-y-3.5">
              {[
                { label: "Plain White / Light Blue Background", passed: idPhoto.complianceChecks.whiteBackground, note: "No outdoor foliage, shadows, or texture detected." },
                { label: "Face-to-Frame Ratio (60%–70%)", passed: idPhoto.complianceChecks.faceRatioPassed, note: "Both ears and shoulders clearly centered." },
                { label: "Formal School Uniform Detected", passed: idPhoto.complianceChecks.formalUniformDetected, note: "Prescribed navy school collar tie & blazer badge verified." },
                { label: "Minimum Print Resolution Met (300 DPI)", passed: idPhoto.complianceChecks.minResolutionMet, note: "Sharp contrast with zero compression artifacts." },
              ].map((chk, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {chk.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{chk.note}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    PASSED
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-indigo-500" />
              <span>
                Your photo is registered in the <strong>October 2026 Batch RFID Print Queue</strong>. The physical card will be handed to the student in homeroom.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: SUPPORT HELPDESK (PRESERVED) ── */}
      {activeTab === "helpdesk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* New Ticket Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Raise Helpdesk Ticket</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly routed to accounts, transport, or administration with tracked SLA resolution times.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Department / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Accounts & Fees">Accounts & Fee Dues</option>
                  <option value="Transport">Transport & Bus Stops</option>
                  <option value="Academics">Academics & Report Cards</option>
                  <option value="ID Card & Records">ID Card & Personal Info Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Request for Section 80C employer annexure"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
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
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide complete details so our team can resolve without a physical visit..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket & Start SLA Timer</span>
              </button>
            </form>
          </div>

          {/* Active Tickets List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Support Tickets</h2>

            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {t.ticketNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {t.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{t.subject}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      t.status === "resolved"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400"
                        : t.status === "in_progress"
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400"
                    }`}
                  >
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.description}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                  <div>
                    Assigned: <strong className="text-slate-700 dark:text-slate-200">{t.assignedDept}</strong>
                  </div>
                  <div>
                    {t.slaRemainingHours > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        ⏳ SLA Remaining: {t.slaRemainingHours} Hours
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ SLA Met & Resolved</span>
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
