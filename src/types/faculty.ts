// ==============================================================================
// FINKFOLD EdOS — FACULTY & TEACHER PORTAL SHARED TYPES & INITIAL DATA
// Path: src/types/faculty.ts
// ==============================================================================

import {
  StudentMedicalProfile,
  INITIAL_MEDICAL_PROFILE,
  StudentLeave,
  INITIAL_LEAVES,
  MultiTierExamRecord,
  INITIAL_EXAM_RECORDS,
  AiSkillCompetency,
  INITIAL_SKILL_GAPS,
  ConductEntry,
  INITIAL_CONDUCT_ENTRIES,
  PtmSlot,
  INITIAL_PTM_SLOTS,
  ExternalAchievement,
  INITIAL_EXTERNAL_ACHIEVEMENTS,
  LostFoundItem,
  INITIAL_LOST_FOUND_ITEMS,
} from "./self-service";

// ── 1. Daily Logistics & Attendance Types ─────────────────────────────────────
export interface StudentRosterItem {
  id: string;
  fullName: string;
  rollNo: number;
  admissionNo: string;
  gender: "M" | "F";
  classId: string;
  parentName: string;
  parentPhone: string;
  consentWhatsapp: boolean;
  medicalProfile: {
    allergies: string[];
    chronicConditions: string[];
    emergencyContact: string;
  };
  transportMode: "Bus 04" | "Bus 07" | "Private Pickup" | "Walking" | "After-School Club";
  approvedLeaveToday?: {
    type: "sick_leave" | "on_duty" | "medical_leave" | "casual_leave";
    reason: string;
  };
}

export const INITIAL_FACULTY_STUDENTS: StudentRosterItem[] = [
  {
    id: "s-10a-01",
    fullName: "Arjun Reddy",
    rollNo: 1,
    admissionNo: "ADM-2026-001",
    gender: "M",
    classId: "c10a2026-1701-4cc0-9c59-8812324eb396",
    parentName: "Sri Goud garu",
    parentPhone: "+91 9440266743",
    consentWhatsapp: true,
    medicalProfile: {
      allergies: ["Peanuts & Tree Nuts", "Penicillin Sensitivity"],
      chronicConditions: ["Mild seasonal bronchial asthma (carries Salbutamol inhaler)"],
      emergencyContact: "+91 9440266743",
    },
    transportMode: "Bus 04",
  },
  {
    id: "s-10a-02",
    fullName: "Yasaswini Prabha",
    rollNo: 2,
    admissionNo: "ADM-2026-002",
    gender: "F",
    classId: "c10a2026-1701-4cc0-9c59-8812324eb396",
    parentName: "Ramesh Babu",
    parentPhone: "+91 8247220252",
    consentWhatsapp: true,
    medicalProfile: {
      allergies: [],
      chronicConditions: [],
      emergencyContact: "+91 8247220252",
    },
    transportMode: "Private Pickup",
  },
  {
    id: "s-10a-03",
    fullName: "Kiran Kumar",
    rollNo: 3,
    admissionNo: "ADM-2026-003",
    gender: "M",
    classId: "c10a2026-1701-4cc0-9c59-8812324eb396",
    parentName: "Srinivas Rao",
    parentPhone: "+91 7981067780",
    consentWhatsapp: true,
    medicalProfile: {
      allergies: ["Dust allergy"],
      chronicConditions: [],
      emergencyContact: "+91 7981067780",
    },
    transportMode: "Bus 04",
    approvedLeaveToday: {
      type: "on_duty",
      reason: "District STEM Robotics Hackathon Delegation",
    },
  },
  {
    id: "s-10a-04",
    fullName: "Priya Varma",
    rollNo: 4,
    admissionNo: "ADM-2026-004",
    gender: "F",
    classId: "c10a2026-1701-4cc0-9c59-8812324eb396",
    parentName: "K. S. Varma",
    parentPhone: "+91 98480 34129",
    consentWhatsapp: true,
    medicalProfile: {
      allergies: ["Lactose intolerance"],
      chronicConditions: [],
      emergencyContact: "+91 98480 34129",
    },
    transportMode: "After-School Club",
  },
  {
    id: "s-10a-05",
    fullName: "Rahul Varma",
    rollNo: 5,
    admissionNo: "ADM-2026-005",
    gender: "M",
    classId: "c10a2026-1701-4cc0-9c59-8812324eb396",
    parentName: "D. Venkatesh",
    parentPhone: "+91 94901 88421",
    consentWhatsapp: true,
    medicalProfile: {
      allergies: ["Bee sting allergy"],
      chronicConditions: ["Low blood pressure tendencies during prolonged sun"],
      emergencyContact: "+91 94901 88421",
    },
    transportMode: "Bus 07",
  },
];

// ── 2. Academics, Marks Entry & AI Remedial Radar ─────────────────────────────
export interface StudentScoreEntry {
  studentId: string;
  studentName: string;
  rollNo: number;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  isFlaggedRemedial: boolean;
  topicDeficits: string[];
}

export interface SyllabusLessonUnit {
  id: string;
  subject: string;
  unitNo: number;
  unitTitle: string;
  totalSubtopics: number;
  completedSubtopics: number;
  status: "completed" | "in_progress" | "upcoming";
  subtopics: {
    id: string;
    title: string;
    completedAt?: string;
    hoursSpent: number;
  }[];
}

export const INITIAL_SYLLABUS_UNITS: SyllabusLessonUnit[] = [
  {
    id: "unit-mat-01",
    subject: "Mathematics",
    unitNo: 1,
    unitTitle: "Real Numbers & Polynomials",
    totalSubtopics: 4,
    completedSubtopics: 4,
    status: "completed",
    subtopics: [
      { id: "sub-1-1", title: "Euclid's Division Lemma & Fundamental Theorem of Arithmetic", completedAt: "12 Jun 2026", hoursSpent: 4 },
      { id: "sub-1-2", title: "Revisiting Irrational Numbers & Decimal Expansions", completedAt: "18 Jun 2026", hoursSpent: 3 },
      { id: "sub-1-3", title: "Geometrical Meaning of Zeroes of a Polynomial", completedAt: "26 Jun 2026", hoursSpent: 5 },
      { id: "sub-1-4", title: "Relationship between Zeroes and Coefficients of a Quadratic", completedAt: "04 Jul 2026", hoursSpent: 4 },
    ],
  },
  {
    id: "unit-mat-02",
    subject: "Mathematics",
    unitNo: 2,
    unitTitle: "Quadratic Equations & Arithmetic Progressions",
    totalSubtopics: 4,
    completedSubtopics: 3,
    status: "in_progress",
    subtopics: [
      { id: "sub-2-1", title: "Standard form of Quadratic Equations & Factorization Method", completedAt: "18 Jul 2026", hoursSpent: 5 },
      { id: "sub-2-2", title: "Nature of Roots & Quadratic Formula Discriminant", completedAt: "28 Jul 2026", hoursSpent: 4 },
      { id: "sub-2-3", title: "Arithmetic Progressions: Finding the nth Term", completedAt: "10 Aug 2026", hoursSpent: 4 },
      { id: "sub-2-4", title: "Sum of First n Terms of an AP & Real-Life Word Problems", hoursSpent: 0 },
    ],
  },
  {
    id: "unit-mat-03",
    subject: "Mathematics",
    unitNo: 3,
    unitTitle: "Surface Areas and Volumes (3D Mensuration)",
    totalSubtopics: 3,
    completedSubtopics: 1,
    status: "in_progress",
    subtopics: [
      { id: "sub-3-1", title: "Surface Area of a Combination of Solids", completedAt: "02 Sep 2026", hoursSpent: 5 },
      { id: "sub-3-2", title: "Volume of a Combination of Solids & Frustum Derivations", hoursSpent: 0 },
      { id: "sub-3-3", title: "Conversion of Solid from One Shape to Another", hoursSpent: 0 },
    ],
  },
];

export const INITIAL_CLASS_10A_MARKS: StudentScoreEntry[] = [
  { studentId: "s-10a-01", studentName: "Arjun Reddy", rollNo: 1, marksObtained: 88, maxMarks: 100, grade: "A1", isFlaggedRemedial: false, topicDeficits: ["Frustums Curved Surface Area"] },
  { studentId: "s-10a-02", studentName: "Yasaswini Prabha", rollNo: 2, marksObtained: 92, maxMarks: 100, grade: "A1", isFlaggedRemedial: false, topicDeficits: [] },
  { studentId: "s-10a-03", studentName: "Kiran Kumar", rollNo: 3, marksObtained: 52, maxMarks: 100, grade: "C1", isFlaggedRemedial: true, topicDeficits: ["3D Mensuration", "Quadratic Roots", "Word Problems"] },
  { studentId: "s-10a-04", studentName: "Priya Varma", rollNo: 4, marksObtained: 78, maxMarks: 100, grade: "B1", isFlaggedRemedial: false, topicDeficits: ["AP Series"] },
  { studentId: "s-10a-05", studentName: "Rahul Varma", rollNo: 5, marksObtained: 46, maxMarks: 100, grade: "C2", isFlaggedRemedial: true, topicDeficits: ["Solid Frustums", "Quadratic Discriminant", "Negative Sign Rules"] },
];

// ── 3. Conduct Ledger & E-Signature Lock ──────────────────────────────────────
export interface FacultyConductAction {
  id: string;
  studentId: string;
  studentName: string;
  type: "merit" | "demerit";
  category: string;
  points: number;
  reason: string;
  requireParentSignature: boolean;
  parentSigned: boolean;
  issuedAt: string;
}

export const INITIAL_FACULTY_CONDUCT: FacultyConductAction[] = [
  {
    id: "fac-con-01",
    studentId: "s-10a-01",
    studentName: "Arjun Reddy",
    type: "merit",
    category: "Peer Tutoring & Helpfulness",
    points: 15,
    reason: "Voluntarily assisted classmates in understanding 3D geometry cross-sections during free period.",
    requireParentSignature: false,
    parentSigned: true,
    issuedAt: "17 Sep 2026",
  },
  {
    id: "fac-con-02",
    studentId: "s-10a-05",
    studentName: "Rahul Varma",
    type: "demerit",
    category: "Unexcused Classroom Disruption",
    points: -10,
    reason: "Repeatedly talked during mathematics instruction and distracted neighboring bench.",
    requireParentSignature: true,
    parentSigned: false,
    issuedAt: "18 Sep 2026",
  },
];

// ── 4. Regulated Office Hours & PTM Itinerary ─────────────────────────────────
export interface PtmConsultationNote {
  slotId: string;
  studentId: string;
  studentName: string;
  parentName: string;
  timeSlot: string;
  status: "scheduled" | "completed" | "no_show";
  privateMeetingNotes: string;
  agreedActionPlan: string;
}

export const INITIAL_PTM_NOTES: PtmConsultationNote[] = [
  {
    slotId: "ptm-01",
    studentId: "s-10a-01",
    studentName: "Arjun Reddy",
    parentName: "Sri Goud garu",
    timeSlot: "09:30 AM – 09:40 AM",
    status: "scheduled",
    privateMeetingNotes: "Discussed SA-1 performance. Commended strong algebra work, agreed on weekend practice for frustum problems.",
    agreedActionPlan: "Father will monitor completion of 15-question targeted geometry remedial drill.",
  },
  {
    slotId: "ptm-02",
    studentId: "s-10a-02",
    studentName: "Yasaswini Prabha",
    parentName: "Ramesh Babu",
    timeSlot: "09:40 AM – 09:50 AM",
    status: "scheduled",
    privateMeetingNotes: "Consistently top 5% in all subjects. Recommended preparing for Inter-School State Science Quiz.",
    agreedActionPlan: "Student will enroll in Science Olympiad coaching session on Thursdays.",
  },
];

// ── 5. Physical Trauma & Infirmary Reporting ──────────────────────────────────
export interface InfirmaryIncidentReport {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classGrade: string;
  incidentType: "playground_injury" | "fainting_dizziness" | "allergy_flare" | "stomach_pain" | "other";
  locationDetails: string;
  symptoms: string;
  firstAidGiven: string;
  nurseNotified: boolean;
  parentWhatsappDispatched: boolean;
  reportedAt: string;
  reportedByTeacher: string;
  severity: "mild" | "moderate" | "urgent";
}

export const INITIAL_TRAUMA_REPORTS: InfirmaryIncidentReport[] = [
  {
    id: "trauma-01",
    studentId: "s-10a-01",
    studentName: "Arjun Reddy",
    rollNo: 1,
    classGrade: "Class 10-A",
    incidentType: "playground_injury",
    locationDetails: "Basketball Court (Outdoor Quadrangle)",
    symptoms: "Abrasions on right knee after slipping on court edge; no fracture or swelling.",
    firstAidGiven: "Cleaned with sterile saline, applied Betadine antiseptic ointment and waterproof dressing.",
    nurseNotified: true,
    parentWhatsappDispatched: true,
    reportedAt: "17 Sep 2026 • 11:30 AM",
    reportedByTeacher: "Mrs. K. Radhika",
    severity: "mild",
  },
];

// ── 6. External Achievements & Club Sponsor Types ─────────────────────────────
export interface ClubMembershipItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classGrade: string;
  attendancePercent: number;
  role: "Member" | "Team Captain" | "Project Lead";
  joinedDate: string;
}

export const INITIAL_ROBOTICS_CLUB_ROSTER: ClubMembershipItem[] = [
  { id: "cm-01", studentId: "s-10a-01", studentName: "Arjun Reddy", rollNo: 1, classGrade: "Class 10-A", attendancePercent: 96, role: "Project Lead", joinedDate: "15 Jun 2026" },
  { id: "cm-02", studentId: "s-10a-03", studentName: "Kiran Kumar", rollNo: 3, classGrade: "Class 10-A", attendancePercent: 88, role: "Member", joinedDate: "18 Jun 2026" },
  { id: "cm-03", studentId: "s-10a-04", studentName: "Priya Varma", rollNo: 4, classGrade: "Class 10-A", attendancePercent: 92, role: "Team Captain", joinedDate: "12 Jun 2026" },
];

export interface CertificateVerificationItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classGrade: string;
  title: string;
  organizingBody: string;
  level: "District" | "State" | "National" | "International";
  awardSecured: string;
  eventDate: string;
  proofDocumentName: string;
  status: "pending_verification" | "verified_and_added_to_dossier" | "rejected";
  submittedAt: string;
}

export const INITIAL_CERT_VERIFICATIONS: CertificateVerificationItem[] = [
  {
    id: "cert-v-01",
    studentId: "s-10a-01",
    studentName: "Arjun Reddy",
    rollNo: 1,
    classGrade: "Class 10-A",
    title: "Andhra Pradesh State Sub-Junior Swimming Championship 2026",
    organizingBody: "AP State Aquatic Association",
    level: "State",
    awardSecured: "Silver Medal (100m Butterfly Stroke)",
    eventDate: "12 Aug 2026",
    proofDocumentName: "AP_Aquatics_Certificate_Arjun.pdf",
    status: "verified_and_added_to_dossier",
    submittedAt: "16 Aug 2026",
  },
  {
    id: "cert-v-02",
    studentId: "s-10a-02",
    studentName: "Yasaswini Prabha",
    rollNo: 2,
    classGrade: "Class 10-A",
    title: "Nellore District Inter-School Chess Championship",
    organizingBody: "District Chess Federation",
    level: "District",
    awardSecured: "1st Place Gold Trophy (Under-16)",
    eventDate: "05 Sep 2026",
    proofDocumentName: "Nellore_Chess_Gold_Yasaswini.pdf",
    status: "pending_verification",
    submittedAt: "08 Sep 2026",
  },
];

// ── 7. Substitution & Relief Desk Types ───────────────────────────────────────
export interface ReliefPeriodRequest {
  id: string;
  absentTeacherName: string;
  absentTeacherSubject: string;
  classGrade: string;
  section: string;
  room: string;
  periodNo: number;
  periodTime: string;
  date: string;
  lessonInstructions: string;
  status: "available" | "accepted" | "declined";
  acceptedByTeacher?: string;
}

export const INITIAL_RELIEF_REQUESTS: ReliefPeriodRequest[] = [
  {
    id: "rel-01",
    absentTeacherName: "Mr. D. Rajesh (On Medical Leave)",
    absentTeacherSubject: "Computer Science",
    classGrade: "Class 8",
    section: "B",
    room: "Comp Lab 2",
    periodNo: 3,
    periodTime: "10:15 AM – 11:00 AM",
    date: "Today",
    lessonInstructions: "Supervise Python Turtle Graphics practical exercise on page 48. Students have code files in their shared folder.",
    status: "available",
  },
  {
    id: "rel-02",
    absentTeacherName: "Mrs. Revathi Sundar (Attending Training)",
    absentTeacherSubject: "English Literature",
    classGrade: "Class 9",
    section: "A",
    room: "Room 204",
    periodNo: 6,
    periodTime: "01:15 PM – 02:00 PM",
    date: "Today",
    lessonInstructions: "Conduct silent reading of Chapter 5 'The Great Stone Face' and assign 5 short-answer questions.",
    status: "available",
  },
];

// ── 8. Field Trip & Micro-Payments Passenger Manifest Types ───────────────────
export interface FieldTripManifestRecord {
  id: string;
  tripTitle: string;
  destination: string;
  tripDate: string;
  ticketPriceInr: number;
  registeredStudents: {
    studentId: string;
    studentName: string;
    rollNo: number;
    parentPhone: string;
    emergencyContact: string;
    feePaid: boolean;
    parentPermissionGranted: boolean;
    busSeatNumber?: number;
    checkedInAtBus: boolean;
  }[];
}

export const INITIAL_FIELD_TRIP_MANIFEST: FieldTripManifestRecord = {
  id: "trip-sci-01",
  tripTitle: "Educational Field Study: AP Regional Science Centre & Planetarium",
  destination: "Regional Science Centre & Space Gallery, Vijayawada",
  tripDate: "Friday, 09 October 2026",
  ticketPriceInr: 300,
  registeredStudents: [
    { studentId: "s-10a-01", studentName: "Arjun Reddy", rollNo: 1, parentPhone: "+91 9440266743", emergencyContact: "+91 9440266743", feePaid: true, parentPermissionGranted: true, busSeatNumber: 4, checkedInAtBus: true },
    { studentId: "s-10a-02", studentName: "Yasaswini Prabha", rollNo: 2, parentPhone: "+91 8247220252", emergencyContact: "+91 8247220252", feePaid: true, parentPermissionGranted: true, busSeatNumber: 5, checkedInAtBus: true },
    { studentId: "s-10a-03", studentName: "Kiran Kumar", rollNo: 3, parentPhone: "+91 7981067780", emergencyContact: "+91 7981067780", feePaid: true, parentPermissionGranted: true, busSeatNumber: 6, checkedInAtBus: false },
    { studentId: "s-10a-04", studentName: "Priya Varma", rollNo: 4, parentPhone: "+91 98480 34129", emergencyContact: "+91 98480 34129", feePaid: false, parentPermissionGranted: true, busSeatNumber: undefined, checkedInAtBus: false },
    { studentId: "s-10a-05", studentName: "Rahul Varma", rollNo: 5, parentPhone: "+91 94901 88421", emergencyContact: "+91 94901 88421", feePaid: true, parentPermissionGranted: true, busSeatNumber: 7, checkedInAtBus: true },
  ],
};
