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

// ── 9. Collaborative Unit Planner & OBE Tracker Types (Feature 15) ─────────────
export type BloomLevel = "Remembering" | "Understanding" | "Applying" | "Analyzing" | "Evaluating" | "Creating";

export interface LearningOutcomeItem {
  id: string;
  code: string; // e.g. "LO-MATH-10.4"
  description: string;
  bloomLevel: BloomLevel;
  nep2020Pillar: "Critical Thinking" | "Foundational Numeracy" | "Experiential Learning" | "Scientific Inquiry";
  attainedPercent: number;
}

export interface UnitPlan {
  id: string;
  subject: string;
  grade: string;
  title: string;
  targetDurationWeeks: number;
  coTeachers: {
    teacherName: string;
    section: string;
    lastSyncedAt: string;
  }[];
  objectives: string[];
  learningOutcomes: LearningOutcomeItem[];
  digitalResources: {
    title: string;
    url: string;
    type: "video" | "simulation" | "worksheet" | "slide_deck";
  }[];
  assessmentPlan: string;
  nepCompliant: boolean;
}

export const INITIAL_UNIT_PLANS: UnitPlan[] = [
  {
    id: "unit-math-10-quad",
    subject: "Mathematics",
    grade: "Grade 10",
    title: "Unit 4: Quadratic Equations & Parabolic Optimization",
    targetDurationWeeks: 3,
    coTeachers: [
      { teacherName: "Mrs. Priyanka Devi", section: "10-A", lastSyncedAt: "Today, 10:45 AM" },
      { teacherName: "Mr. Satish Kumar", section: "10-B", lastSyncedAt: "Today, 10:45 AM" },
    ],
    objectives: [
      "Formulate real-world financial and spatial projectile models using quadratic polynomials.",
      "Evaluate roots using factorisation, completing the square, and discriminant analysis.",
      "Analyse real vs complex discriminant boundaries in projectile trajectories.",
    ],
    learningOutcomes: [
      { id: "lo-1", code: "LO-M10.4.1", description: "Identify quadratic standard form ax² + bx + c = 0", bloomLevel: "Remembering", nep2020Pillar: "Foundational Numeracy", attainedPercent: 94 },
      { id: "lo-2", code: "LO-M10.4.2", description: "Solve contextual projectile problems using quadratic formula", bloomLevel: "Applying", nep2020Pillar: "Experiential Learning", attainedPercent: 82 },
      { id: "lo-3", code: "LO-M10.4.3", description: "Analyse roots nature using discriminant (D > 0, D = 0, D < 0)", bloomLevel: "Analyzing", nep2020Pillar: "Critical Thinking", attainedPercent: 76 },
    ],
    digitalResources: [
      { title: "Geogebra Parabola Simulator (Interactive)", url: "https://geogebra.org/m/parabola", type: "simulation" },
      { title: "Khan Academy: Deriving Quadratic Formula", url: "https://khanacademy.org/math/algebra", type: "video" },
      { title: "CBSE Exemplar Problem Set PDF", url: "https://cbseacademic.nic.in/exemplar", type: "worksheet" },
    ],
    assessmentPlan: "1 Formative diagnostic drill (OMR 15-Q) + 1 peer collaborative bridge project + 1 summative term paper.",
    nepCompliant: true,
  },
];

// ── 10. Voice-Note Feedback & AI Rubric Grader Types (Feature 16) ─────────────
export interface RubricCriterion {
  category: "Structure & Coherence" | "Vocabulary & Language" | "Depth of Argument" | "Grammar & Mechanics";
  score: number;
  maxScore: number;
  rationale: string;
}

export interface SubjectiveSubmission {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  assignmentTitle: string;
  submittedAt: string;
  essayContent: string;
  status: "pending_review" | "graded";
  aiSuggestedScore?: number;
  maxScore: number;
  rubric: RubricCriterion[];
  teacherVoiceNoteUrl?: string;
  teacherVoiceDurationSec?: number;
  teacherWrittenRemark?: string;
}

export const INITIAL_ESSAY_SUBMISSIONS: SubjectiveSubmission[] = [
  {
    id: "sub-eng-10a-01",
    studentId: "s-10a-01",
    studentName: "Arjun Reddy",
    rollNo: 1,
    assignmentTitle: "Reflective Essay: Ethical Implications of Artificial Intelligence in Healthcare",
    submittedAt: "Yesterday, 04:30 PM",
    essayContent:
      "Artificial Intelligence has transformed modern diagnostics by analyzing radiological scans faster than human clinicians. However, the ethical liability in cases of algorithmic misdiagnosis remains unaddressed in Indian health jurisprudence. Diagnostic autonomy cannot replace empathetic physician care...",
    status: "pending_review",
    aiSuggestedScore: 17,
    maxScore: 20,
    rubric: [
      { category: "Structure & Coherence", score: 4, maxScore: 5, rationale: "Strong thesis statement and fluid paragraph transitions with clear intro and conclusion." },
      { category: "Vocabulary & Language", score: 5, maxScore: 5, rationale: "Sophisticated vocabulary usage ('jurisprudence', 'algorithmic liability', 'autonomous triage')." },
      { category: "Depth of Argument", score: 4, maxScore: 5, rationale: "Presents balanced view of algorithmic efficiency vs humane care; could cite 1 more statutory act." },
      { category: "Grammar & Mechanics", score: 4, maxScore: 5, rationale: "Minor punctuation slip in paragraph 3; overall clean syntax." },
    ],
  },
  {
    id: "sub-eng-10a-05",
    studentId: "s-10a-05",
    studentName: "Rahul Varma",
    rollNo: 5,
    assignmentTitle: "Reflective Essay: Ethical Implications of Artificial Intelligence in Healthcare",
    submittedAt: "Yesterday, 06:12 PM",
    essayContent:
      "AI is very good because computers dont get tired and can check xray easily. But what if computer makes mistake? Doctor is responsible. We must teach computers better.",
    status: "pending_review",
    aiSuggestedScore: 11,
    maxScore: 20,
    rubric: [
      { category: "Structure & Coherence", score: 3, maxScore: 5, rationale: "Brief paragraphs without formal connective transitions." },
      { category: "Vocabulary & Language", score: 2, maxScore: 5, rationale: "Colloquial diction ('dont get tired', 'xray easily'). Needs academic terminology." },
      { category: "Depth of Argument", score: 3, maxScore: 5, rationale: "Core ethical point identified but lacks elaboration or evidence." },
      { category: "Grammar & Mechanics", score: 3, maxScore: 5, rationale: "Missing apostrophes ('dont') and capitalization." },
    ],
  },
];

// ── 11. Group Project & Peer-Review Hub Types (Feature 17) ───────────────────
export interface PeerRating {
  evaluatorStudentId: string;
  targetStudentId: string;
  ratingScore: number; // 1 to 5
  feedbackComment: string;
}

export interface ProjectTeam {
  teamId: string;
  teamName: string;
  projectTitle: string;
  members: {
    studentId: string;
    studentName: string;
    rollNo: number;
    assignedRole: string;
    contributionPercentage: number; // e.g. 75 vs 25
    peerScoreAvg: number; // out of 5
  }[];
  milestonesCompleted: number;
  totalMilestones: number;
  peerEvaluationsCompleted: boolean;
}

export const INITIAL_GROUP_PROJECTS: ProjectTeam[] = [
  {
    teamId: "team-eco-10a-01",
    teamName: "EcoTurbine Alpha",
    projectTitle: "Designing Low-Cost Wind Kinetic Turbines for Rural Schools",
    members: [
      { studentId: "s-10a-01", studentName: "Arjun Reddy", rollNo: 1, assignedRole: "Hardware Prototype & 3D Blades", contributionPercentage: 65, peerScoreAvg: 4.8 },
      { studentId: "s-10a-02", studentName: "Yasaswini Prabha", rollNo: 2, assignedRole: "Mathematical Modeling & Circuit Design", contributionPercentage: 30, peerScoreAvg: 4.6 },
      { studentId: "s-10a-05", studentName: "Rahul Varma", rollNo: 5, assignedRole: "Poster & Slide Presentation", contributionPercentage: 5, peerScoreAvg: 2.1 },
    ],
    milestonesCompleted: 3,
    totalMilestones: 4,
    peerEvaluationsCompleted: true,
  },
];

// ── 12. Smart Seating Chart & "Eyes on Me" Lock Types (Features 18 & 19) ───────
export interface SeatingDesk {
  deskId: string;
  row: number;
  col: number;
  studentId: string | null;
  studentName?: string;
  rollNo?: number;
  gender?: "M" | "F";
  photoInitials?: string;
  behaviorNote?: string;
  hasConflictRisk?: boolean;
}

export interface BehavioralPairingWarning {
  studentA: string;
  studentB: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface DeviceLockState {
  isLocked: boolean;
  lockMessage: string;
  lockedAt?: string;
  totalLockedDevices: number;
}

export const INITIAL_SEATING_DESKS: SeatingDesk[] = [
  { deskId: "d-r1-c1", row: 1, col: 1, studentId: "s-10a-01", studentName: "Arjun Reddy", rollNo: 1, gender: "M", photoInitials: "AR" },
  { deskId: "d-r1-c2", row: 1, col: 2, studentId: "s-10a-02", studentName: "Yasaswini Prabha", rollNo: 2, gender: "F", photoInitials: "YP" },
  { deskId: "d-r1-c3", row: 1, col: 3, studentId: "s-10a-03", studentName: "Kiran Kumar", rollNo: 3, gender: "M", photoInitials: "KK" },
  { deskId: "d-r2-c1", row: 2, col: 1, studentId: "s-10a-04", studentName: "Priya Varma", rollNo: 4, gender: "F", photoInitials: "PV" },
  { deskId: "d-r2-c2", row: 2, col: 2, studentId: "s-10a-05", studentName: "Rahul Varma", rollNo: 5, gender: "M", photoInitials: "RV", hasConflictRisk: true, behaviorNote: "Chatty when seated next to Arjun" },
  { deskId: "d-r2-c3", row: 2, col: 3, studentId: null },
];

export const INITIAL_PAIRING_WARNINGS: BehavioralPairingWarning[] = [
  { studentA: "Arjun Reddy", studentB: "Rahul Varma", reason: "Repeated classroom disruption & cross-talk logged on Conduct Ledger.", severity: "medium" },
];

// ── 13. Inclusive Education & SEN Accommodations Vault Types (Feature 20) ──────
export interface SenAccommodationProfile {
  studentId: string;
  studentName: string;
  rollNo: number;
  primaryDiagnosis: "Dyslexia (Specific Learning Disability)" | "ADHD (Inattentive Type)" | "Sensory Processing Disorder" | "Generalized Academic Anxiety";
  confidentialStarTag: boolean;
  counselorName: string;
  actionableAccommodations: string[];
  examAccommodations: string[];
  safePassGranted: boolean;
}

export const INITIAL_SEN_PROFILES: SenAccommodationProfile[] = [
  {
    studentId: "s-10a-03",
    studentName: "Kiran Kumar",
    rollNo: 3,
    primaryDiagnosis: "Dyslexia (Specific Learning Disability)",
    confidentialStarTag: true,
    counselorName: "Dr. Sumathi (Licensed Clinical Child Psychologist)",
    actionableAccommodations: [
      "DO NOT force student to read aloud in front of the classroom without voluntary hand-raise.",
      "Allow audio recordings of complex lectures or provide companion slide handouts.",
      "Give verbal instructions in concise 2-step chunks.",
    ],
    examAccommodations: [
      "Grant 15 minutes extra time per 1 hour of written examination.",
      "Font size on exam papers should be minimum 14pt Arial or OpenDyslexic.",
      "Ignore minor phonetic spelling slips in non-language subjects (Science, Social Studies).",
    ],
    safePassGranted: true,
  },
  {
    studentId: "s-10a-05",
    studentName: "Rahul Varma",
    rollNo: 5,
    primaryDiagnosis: "ADHD (Inattentive Type)",
    confidentialStarTag: true,
    counselorName: "Mrs. Meenakshi (School Counselor)",
    actionableAccommodations: [
      "Seat near the teacher front desk away from windows or noisy corridor doors.",
      "Allow discreet 2-minute movement/sensory break every 30 minutes.",
      "Break long multi-part assignments into sequential milestones.",
    ],
    examAccommodations: [
      "Provide noise-dampening ear defenders or quiet side-room seating.",
      "Allow water sip breaks during exam.",
    ],
    safePassGranted: false,
  },
];

// ── 14. Faculty Self-Service HR, Payroll & Biometrics Types (Feature 21) ───────
export interface TeacherLeaveBalance {
  casualLeave: { total: number; used: number; remaining: number };
  sickLeave: { total: number; used: number; remaining: number };
  earnedLeave: { total: number; used: number; remaining: number };
}

export interface StaffPayslip {
  id: string;
  monthYear: string;
  grossSalaryInr: number;
  deductions: {
    epf: number;
    professionalTax: number;
    tdsIncomeTax: number;
    totalDeductions: number;
  };
  netPayInr: number;
  disbursedDate: string;
  downloadPdfUrl: string;
}

export interface BiometricLogEntry {
  id: string;
  date: string;
  inTime: string;
  outTime: string;
  status: "on_time" | "late" | "missing_punch" | "regularized";
  regularizationReason?: string;
}

export const INITIAL_TEACHER_HR: {
  leaveBalance: TeacherLeaveBalance;
  payslips: StaffPayslip[];
  biometrics: BiometricLogEntry[];
} = {
  leaveBalance: {
    casualLeave: { total: 12, used: 3, remaining: 9 },
    sickLeave: { total: 10, used: 2, remaining: 8 },
    earnedLeave: { total: 15, used: 0, remaining: 15 },
  },
  payslips: [
    {
      id: "pay-2026-08",
      monthYear: "August 2026",
      grossSalaryInr: 58000,
      deductions: { epf: 1800, professionalTax: 200, tdsIncomeTax: 2500, totalDeductions: 4500 },
      netPayInr: 53500,
      disbursedDate: "01 September 2026",
      downloadPdfUrl: "#payslip-aug-2026",
    },
    {
      id: "pay-2026-07",
      monthYear: "July 2026",
      grossSalaryInr: 58000,
      deductions: { epf: 1800, professionalTax: 200, tdsIncomeTax: 2500, totalDeductions: 4500 },
      netPayInr: 53500,
      disbursedDate: "01 August 2026",
      downloadPdfUrl: "#payslip-jul-2026",
    },
  ],
  biometrics: [
    { id: "bio-1", date: "Today (18 Sep)", inTime: "08:14 AM", outTime: "Active", status: "on_time" },
    { id: "bio-2", date: "Yesterday (17 Sep)", inTime: "08:18 AM", outTime: "04:45 PM", status: "on_time" },
    { id: "bio-3", date: "Monday (15 Sep)", inTime: "08:42 AM", outTime: "04:50 PM", status: "missing_punch", regularizationReason: "Scanner failed to register thumb at Gate 2" },
  ],
};

// ── 15. Digital Store Indent / Inventory Requisition Types (Feature 22) ────────
export interface StoreInventoryItem {
  id: string;
  itemName: string;
  category: "Stationery" | "Lab Chemicals" | "Classroom Electronics" | "Registers & Printing";
  unit: string;
  stockAvailable: number;
}

export interface StoreRequisitionOrder {
  id: string;
  requestedBy: string;
  requestedAt: string;
  items: { itemId: string; itemName: string; quantity: number }[];
  deliveryRoom: string;
  status: "pending_approval" | "packed_dispatched" | "delivered";
}

export const INITIAL_STORE_ITEMS: StoreInventoryItem[] = [
  { id: "st-01", itemName: "Whiteboard Dry Erase Markers (Blue/Black Pack of 4)", category: "Stationery", unit: "pack", stockAvailable: 85 },
  { id: "st-02", itemName: "Whiteboard Duster / Felt Eraser", category: "Stationery", unit: "piece", stockAvailable: 40 },
  { id: "st-03", itemName: "A4 Printing & Exam Ream (75 GSM - 500 Sheets)", category: "Registers & Printing", unit: "ream", stockAvailable: 120 },
  { id: "st-04", itemName: "Red Gel Valuation Pens (Box of 10)", category: "Stationery", unit: "box", stockAvailable: 65 },
  { id: "st-05", itemName: "Hydrochloric Acid HCl 0.1M (500ml Laboratory Grade)", category: "Lab Chemicals", unit: "bottle", stockAvailable: 18 },
  { id: "st-06", itemName: "HDMI to USB-C Projector Display Cable (3m)", category: "Classroom Electronics", unit: "piece", stockAvailable: 12 },
];

export const INITIAL_STORE_ORDERS: StoreRequisitionOrder[] = [
  {
    id: "indent-881",
    requestedBy: "Mrs. Priyanka Devi",
    requestedAt: "Today, 09:20 AM",
    items: [
      { itemId: "st-01", itemName: "Whiteboard Dry Erase Markers (Blue/Black Pack of 4)", quantity: 2 },
      { itemId: "st-04", itemName: "Red Gel Valuation Pens (Box of 10)", quantity: 1 },
    ],
    deliveryRoom: "Staff Room Locker #4 (Class 10-A)",
    status: "packed_dispatched",
  },
];

// ── 16. Campus Maintenance Helpdesk Ticketing Types (Feature 23) ───────────────
export interface MaintenanceTicket {
  id: string;
  title: string;
  location: string;
  category: "HVAC / Air Conditioning" | "Electrical & Projector" | "Plumbing" | "Carpentry & Desks";
  severity: "low" | "medium" | "high" | "emergency";
  reportedAt: string;
  status: "pending" | "assigned" | "technician_in_progress" | "resolved";
  assignedTechnician?: string;
  description: string;
  photoUrl?: string;
}

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: "maint-104",
    title: "Split AC Water Leaking on Front Row Desks",
    location: "Room 204 (Grade 10-A)",
    category: "HVAC / Air Conditioning",
    severity: "high",
    reportedAt: "Today, 08:30 AM",
    status: "assigned",
    assignedTechnician: "Ramu (Campus HVAC Technician)",
    description: "Water condensation dripping continuously directly onto Student Desk Row 1 during 1st period.",
  },
  {
    id: "maint-098",
    title: "Overhead Projector HDMI Port Glitch (Screen Flickering)",
    location: "Physics Lab 2",
    category: "Electrical & Projector",
    severity: "medium",
    reportedAt: "Yesterday, 02:15 PM",
    status: "resolved",
    assignedTechnician: "Suresh (AV Engineer)",
    description: "Display loses connection every 5 minutes when moving cable. Replaced wall plate connector.",
  },
];

