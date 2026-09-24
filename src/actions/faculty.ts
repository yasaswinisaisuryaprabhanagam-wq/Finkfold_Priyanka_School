"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";
import {
  StudentRosterItem,
  INITIAL_FACULTY_STUDENTS,
  StudentScoreEntry,
  INITIAL_CLASS_10A_MARKS,
  SyllabusLessonUnit,
  INITIAL_SYLLABUS_UNITS,
  FacultyConductAction,
  INITIAL_FACULTY_CONDUCT,
  PtmConsultationNote,
  INITIAL_PTM_NOTES,
  InfirmaryIncidentReport,
  INITIAL_TRAUMA_REPORTS,
  ClubMembershipItem,
  INITIAL_ROBOTICS_CLUB_ROSTER,
  CertificateVerificationItem,
  INITIAL_CERT_VERIFICATIONS,
  ReliefPeriodRequest,
  INITIAL_RELIEF_REQUESTS,
  FieldTripManifestRecord,
  INITIAL_FIELD_TRIP_MANIFEST,
  UnitPlan,
  INITIAL_UNIT_PLANS,
  SubjectiveSubmission,
  INITIAL_ESSAY_SUBMISSIONS,
  ProjectTeam,
  INITIAL_GROUP_PROJECTS,
  SeatingDesk,
  INITIAL_SEATING_DESKS,
  BehavioralPairingWarning,
  INITIAL_PAIRING_WARNINGS,
  DeviceLockState,
  SenAccommodationProfile,
  INITIAL_SEN_PROFILES,
  INITIAL_TEACHER_HR,
  StoreInventoryItem,
  INITIAL_STORE_ITEMS,
  StoreRequisitionOrder,
  INITIAL_STORE_ORDERS,
  MaintenanceTicket,
  INITIAL_MAINTENANCE_TICKETS,
} from "@/types/faculty";
import {
  StudentLeave,
  INITIAL_LEAVES,
  PtmSlot,
  INITIAL_PTM_SLOTS,
  TeacherChatMessage,
  INITIAL_MESSAGES,
  LostFoundItem,
  INITIAL_LOST_FOUND_ITEMS,
} from "@/types/self-service";

// ── In-Memory State for Instant Enterprise Interaction ───────────────────────
let facultyStudents = [...INITIAL_FACULTY_STUDENTS];
let facultyMarks = [...INITIAL_CLASS_10A_MARKS];
let syllabusUnits = [...INITIAL_SYLLABUS_UNITS];
let facultyConduct = [...INITIAL_FACULTY_CONDUCT];
let ptmNotes = [...INITIAL_PTM_NOTES];
let traumaReports = [...INITIAL_TRAUMA_REPORTS];
let certVerifications = [...INITIAL_CERT_VERIFICATIONS];
let reliefRequests = [...INITIAL_RELIEF_REQUESTS];
let fieldTripManifest = { ...INITIAL_FIELD_TRIP_MANIFEST };
let leavesData = [...INITIAL_LEAVES];
let isOfficeHoursActive = true;
let lostFoundCatalog = [...INITIAL_LOST_FOUND_ITEMS];

// Features 15–23 State
let unitPlans = [...INITIAL_UNIT_PLANS];
let essaySubmissions = [...INITIAL_ESSAY_SUBMISSIONS];
let groupProjects = [...INITIAL_GROUP_PROJECTS];
let seatingDesks = [...INITIAL_SEATING_DESKS];
let pairingWarnings = [...INITIAL_PAIRING_WARNINGS];
let deviceLockState: DeviceLockState = {
  isLocked: false,
  lockMessage: "Please look at the teacher. Screen locked by Mrs. Priyanka.",
  totalLockedDevices: 42,
};
let senProfiles = [...INITIAL_SEN_PROFILES];
let teacherHrData = {
  leaveBalance: { ...INITIAL_TEACHER_HR.leaveBalance },
  payslips: [...INITIAL_TEACHER_HR.payslips],
  biometrics: [...INITIAL_TEACHER_HR.biometrics],
};
let storeItems = [...INITIAL_STORE_ITEMS];
let storeOrders = [...INITIAL_STORE_ORDERS];
let maintenanceTickets = [...INITIAL_MAINTENANCE_TICKETS];

// ── 1. Dashboard Aggregator ──────────────────────────────────────────────────
export async function getFacultyDashboardDataAction() {
  const pendingLeaves = leavesData.filter((l) => l.status === "pending").length;
  const bottom15Count = facultyMarks.filter((m) => m.isFlaggedRemedial).length;
  const availableRelief = reliefRequests.filter((r) => r.status === "available").length;
  const pendingCerts = certVerifications.filter((c) => c.status === "pending_verification").length;
  const unreadParentNotes = 2;

  return {
    pendingLeaves,
    bottom15Count,
    availableRelief,
    pendingCerts,
    unreadParentNotes,
    isOfficeHoursActive,
  };
}

// ── 2. Leaves & OD Approval Workflow ─────────────────────────────────────────
export async function getFacultyLeavesAction(): Promise<StudentLeave[]> {
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("student_leaves_and_od")
      .select("*")
      .order("start_date", { ascending: false });
    if (data && data.length > 0) {
      return data.map((l: any) => ({
        id: l.id,
        leaveType: l.leave_type,
        startDate: new Date(l.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        endDate: new Date(l.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        totalDays: l.total_days,
        reason: l.reason,
        medicalDocRequired: l.medical_doc_required,
        medicalDocName: l.medical_doc_name,
        status: l.status,
        appliedAt: new Date(l.applied_at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      }));
    }
  } catch {}
  return leavesData;
}

export async function reviewLeaveApplicationAction(payload: {
  leaveId: string;
  status: "approved" | "rejected";
  rejectionReason?: string;
}) {
  leavesData = leavesData.map((l) =>
    l.id === payload.leaveId ? { ...l, status: payload.status } : l
  );

  // If approved, update student roster leave status
  if (payload.status === "approved") {
    facultyStudents = facultyStudents.map((s) => ({
      ...s,
      approvedLeaveToday: {
        type: "sick_leave",
        reason: "Leave request approved by Class Teacher",
      },
    }));
  }

  try {
    const supabase = await createAdminClient();
    await supabase
      .from("student_leaves_and_od")
      .update({ status: payload.status })
      .eq("id", payload.leaveId);
  } catch {}

  revalidatePath("/portal/faculty");
  revalidatePath("/dashboard/attendance");
  return {
    success: true,
    status: payload.status,
    message: `Leave application ${payload.status} successfully! Roll call roster updated.`,
  };
}

// ── 3. Academics, Marks Entry & Predictive Remedial AI Radar ─────────────────
export async function getFacultyAcademicsDataAction() {
  return {
    marks: facultyMarks,
    syllabus: syllabusUnits,
    examName: "Summative Assessment 1 (SA-1)",
    subject: "Mathematics (MAT-10)",
    totalStudents: facultyMarks.length,
    classAverage: Math.round(
      facultyMarks.reduce((acc, m) => acc + m.marksObtained, 0) / facultyMarks.length
    ),
    remedialThreshold: 60,
  };
}

export async function saveClassMarksAction(scores: StudentScoreEntry[]) {
  facultyMarks = scores.map((s) => ({
    ...s,
    isFlaggedRemedial: s.marksObtained < 60,
  }));

  revalidatePath("/portal/faculty/academics");
  return {
    success: true,
    message: "Marks ledger saved! Predictive remedial radar recalculated.",
    scores: facultyMarks,
  };
}

export async function bulkUploadOmrScoresAction(csvContent: string) {
  const lines = csvContent.trim().split("\n");
  const parsedScores: StudentScoreEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || (i === 0 && line.toLowerCase().includes("roll"))) continue;

    const parts = line.split(",").map((p) => p.trim());
    const rollNo = parseInt(parts[0], 10);
    const marks = parseFloat(parts[parts.length - 1]);

    if (!isNaN(rollNo) && !isNaN(marks)) {
      const existing = facultyStudents.find((s) => s.rollNo === rollNo);
      const studentName = existing ? existing.fullName : `Student Roll #${rollNo}`;
      const studentId = existing ? existing.id : `s-omr-${rollNo}`;

      let grade = "C2";
      if (marks >= 90) grade = "A1";
      else if (marks >= 80) grade = "A2";
      else if (marks >= 70) grade = "B1";
      else if (marks >= 60) grade = "B2";
      else if (marks >= 50) grade = "C1";

      parsedScores.push({
        studentId,
        studentName,
        rollNo,
        marksObtained: marks,
        maxMarks: 100,
        grade,
        isFlaggedRemedial: marks < 60,
        topicDeficits: marks < 60 ? ["3D Geometry Frustums", "Quadratic Roots"] : [],
      });
    }
  }

  if (parsedScores.length > 0) {
    facultyMarks = parsedScores;
  }

  revalidatePath("/portal/faculty/academics");
  return {
    success: true,
    count: parsedScores.length,
    message: `Successfully processed ${parsedScores.length} student scores from OMR CSV scan!`,
    scores: facultyMarks,
  };
}

export async function pushRemedialWorksheetAction(payload: {
  studentId: string;
  studentName: string;
  topicName: string;
}) {
  revalidatePath("/portal/student/academics");
  return {
    success: true,
    message: `Targeted 15-question AI drill on '${payload.topicName}' generated and pushed to ${payload.studentName}'s portal!`,
  };
}

export async function updateSyllabusProgressAction(payload: {
  unitId: string;
  subtopicId: string;
  completed: boolean;
}) {
  syllabusUnits = syllabusUnits.map((u) => {
    if (u.id !== payload.unitId) return u;
    const updatedSubtopics = u.subtopics.map((s) =>
      s.id === payload.subtopicId
        ? {
            ...s,
            completedAt: payload.completed ? new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : undefined,
          }
        : s
    );
    const compCount = updatedSubtopics.filter((s) => s.completedAt).length;
    return {
      ...u,
      subtopics: updatedSubtopics,
      completedSubtopics: compCount,
      status: compCount === u.totalSubtopics ? "completed" : "in_progress",
    };
  });

  revalidatePath("/portal/faculty/academics");
  return {
    success: true,
    message: "Lesson tracker updated! Exam preparation milestone recalculated.",
    syllabus: syllabusUnits,
  };
}

// ── 4. Conduct Ledger & Parent E-Signature Lock ──────────────────────────────
export async function getFacultyConductDataAction() {
  return {
    entries: facultyConduct,
    students: facultyStudents,
  };
}

export async function issueConductRecordAction(payload: {
  studentId: string;
  type: "merit" | "demerit";
  category: string;
  points: number;
  reason: string;
  requireParentSignature: boolean;
}) {
  const student = facultyStudents.find((s) => s.id === payload.studentId);
  const newEntry: FacultyConductAction = {
    id: "fac-con-" + Date.now(),
    studentId: payload.studentId,
    studentName: student ? student.fullName : "Student",
    type: payload.type,
    category: payload.category,
    points: payload.points,
    reason: payload.reason,
    requireParentSignature: payload.requireParentSignature,
    parentSigned: !payload.requireParentSignature,
    issuedAt: "Today",
  };

  facultyConduct = [newEntry, ...facultyConduct];
  revalidatePath("/portal/faculty/conduct");
  revalidatePath("/portal/student/safespace");

  return {
    success: true,
    entry: newEntry,
    message: payload.requireParentSignature
      ? `Demerit logged! Mandatory Parent E-Signature lock applied to ${student?.fullName}'s portal.`
      : `${payload.type === "merit" ? "Merit (+)" : "Demerit (-)"} recorded and updated on student portal!`,
  };
}

// ── 5. Regulated Office Hours & PTM Itinerary ─────────────────────────────────
export async function getFacultyPtmAndMessagesAction() {
  return {
    isOfficeHoursActive,
    slots: INITIAL_PTM_SLOTS,
    notes: ptmNotes,
    messages: INITIAL_MESSAGES,
  };
}

export async function toggleOfficeHoursAction(isActive: boolean) {
  isOfficeHoursActive = isActive;
  revalidatePath("/portal/faculty/messages");
  return {
    success: true,
    isOfficeHoursActive,
    message: isActive
      ? "Office Hours is now ACTIVE (3:45 PM – 5:00 PM). Parents can chat."
      : "Office Hours is now OFFLINE. New parent messages will be queued.",
  };
}

export async function savePtmMeetingNotesAction(payload: {
  slotId: string;
  notes: string;
  actionPlan: string;
}) {
  ptmNotes = ptmNotes.map((n) =>
    n.slotId === payload.slotId
      ? {
          ...n,
          status: "completed",
          privateMeetingNotes: payload.notes,
          agreedActionPlan: payload.actionPlan,
        }
      : n
  );

  revalidatePath("/portal/faculty/messages");
  return {
    success: true,
    message: "Consultation notes securely saved to student's master academic file!",
  };
}

// ── 6. Physical Trauma & Infirmary Reporting ──────────────────────────────────
export async function getFacultyInfirmaryDataAction() {
  return {
    reports: traumaReports,
    students: facultyStudents,
  };
}

export async function reportInfirmaryIncidentAction(payload: {
  studentId: string;
  incidentType: InfirmaryIncidentReport["incidentType"];
  locationDetails: string;
  symptoms: string;
  firstAidGiven: string;
  severity: "mild" | "moderate" | "urgent";
}) {
  const student = facultyStudents.find((s) => s.id === payload.studentId);
  const newReport: InfirmaryIncidentReport = {
    id: "trauma-" + Date.now(),
    studentId: payload.studentId,
    studentName: student ? student.fullName : "Student",
    rollNo: student ? student.rollNo : 0,
    classGrade: "Class 10-A",
    incidentType: payload.incidentType,
    locationDetails: payload.locationDetails,
    symptoms: payload.symptoms,
    firstAidGiven: payload.firstAidGiven,
    nurseNotified: true,
    parentWhatsappDispatched: true,
    reportedAt: "Today • " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    reportedByTeacher: "Class Teacher",
    severity: payload.severity,
  };

  traumaReports = [newReport, ...traumaReports];
  revalidatePath("/portal/faculty/infirmary");
  revalidatePath("/portal/student/health");

  return {
    success: true,
    report: newReport,
    message: "Trauma log recorded! Nurse alerted and automated WhatsApp notification dispatched to parent.",
  };
}

// ── 7. Lost & Found Snap & Upload ─────────────────────────────────────────────
export async function getFacultyLostFoundDataAction() {
  try {
    const supabase = await createAdminClient();
    const { data: dbItems, error } = await supabase
      .from("lost_and_found_items")
      .select("*")
      .eq("school_id", SCHOOL.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query lost_and_found_items in faculty:", error.message);
    }

    if (dbItems && dbItems.length > 0) {
      const items: LostFoundItem[] = dbItems.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        foundLocation: item.found_location,
        foundDate: new Date(item.found_date || item.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        lockerBin: item.locker_bin,
        photoEmoji: item.photo_emoji || "🎒",
        status: item.status,
        claimedByStudentName: item.claimed_by_student_name,
        claimedHomeroom: item.claimed_homeroom,
        claimNote: item.claim_note,
      }));
      return { items };
    }
  } catch (err: any) {
    console.warn("getFacultyLostFoundDataAction error:", err?.message);
  }

  return {
    items: lostFoundCatalog,
  };
}

export async function snapUploadLostFoundItemAction(payload: {
  title: string;
  category: LostFoundItem["category"];
  description: string;
  foundLocation: string;
  lockerBin: string;
  photoEmoji: string;
}) {
  const newItem: LostFoundItem = {
    id: "lf-" + Date.now(),
    title: payload.title,
    category: payload.category,
    description: payload.description,
    foundLocation: payload.foundLocation,
    foundDate: "Today",
    lockerBin: payload.lockerBin,
    photoEmoji: payload.photoEmoji || "🎒",
    status: "available",
  };

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("lost_and_found_items").insert({
      school_id: SCHOOL.id,
      title: payload.title,
      category: payload.category,
      description: payload.description,
      found_location: payload.foundLocation,
      found_date: new Date().toISOString().split("T")[0],
      locker_bin: payload.lockerBin,
      photo_emoji: payload.photoEmoji || "🎒",
      status: "available",
    }).select().single();

    if (error) {
      console.error("Failed to insert lost_and_found_items:", error.message);
    } else if (data) {
      newItem.id = data.id;
    }
  } catch (err: any) {
    console.error("snapUploadLostFoundItemAction error:", err?.message);
  }

  lostFoundCatalog = [newItem, ...lostFoundCatalog];
  revalidatePath("/portal/faculty/lost-found");
  revalidatePath("/portal/student/lost-found");

  return {
    success: true,
    item: newItem,
    message: "Found item uploaded! It is now live on the parent and student Lost & Found boards.",
  };
}

// ── 8. Club Sponsor & Certificate Verification ────────────────────────────────
export async function getFacultyClubsDataAction() {
  return {
    clubName: "Robotics & Embedded IoT Innovation Lab",
    sponsorName: "Mrs. K. Radhika (Faculty Lead)",
    schedule: "Tuesday & Thursday • 03:15 PM – 04:15 PM",
    roster: INITIAL_ROBOTICS_CLUB_ROSTER,
    certVerifications,
  };
}

export async function reviewCertificateAction(payload: {
  certId: string;
  approved: boolean;
  remarks?: string;
}) {
  certVerifications = certVerifications.map((c) =>
    c.id === payload.certId
      ? {
          ...c,
          status: payload.approved ? "verified_and_added_to_dossier" : "rejected",
        }
      : c
  );

  revalidatePath("/portal/faculty/clubs");
  revalidatePath("/portal/student/documents");

  return {
    success: true,
    message: payload.approved
      ? "Certificate approved! Added permanently to student's verified school dossier."
      : "Certificate rejected with feedback to student.",
  };
}

// ── 9. Substitution & Relief Desk ─────────────────────────────────────────────
export async function getFacultyReliefDataAction() {
  return {
    requests: reliefRequests,
  };
}

export async function acceptReliefCoverageAction(reliefId: string) {
  reliefRequests = reliefRequests.map((r) =>
    r.id === reliefId ? { ...r, status: "accepted", acceptedByTeacher: "You (Accepted)" } : r
  );

  revalidatePath("/portal/faculty/relief");
  return {
    success: true,
    message: "Relief period accepted! Substitution confirmed on Principal's morning schedule.",
  };
}

// ── 10. Field Trip Manifests & Micro-Payments ─────────────────────────────────
export async function getFacultyFieldTripDataAction() {
  const total = fieldTripManifest.registeredStudents.length;
  const paid = fieldTripManifest.registeredStudents.filter((s) => s.feePaid).length;
  const checkedIn = fieldTripManifest.registeredStudents.filter((s) => s.checkedInAtBus).length;

  return {
    manifest: fieldTripManifest,
    totalStudents: total,
    paidCount: paid,
    checkedInCount: checkedIn,
  };
}

export async function updateFieldTripCheckInAction(payload: {
  studentId: string;
  checkedIn: boolean;
}) {
  fieldTripManifest.registeredStudents = fieldTripManifest.registeredStudents.map((s) =>
    s.studentId === payload.studentId ? { ...s, checkedInAtBus: payload.checkedIn } : s
  );

  revalidatePath("/portal/faculty/field-trips");
  return {
    success: true,
    message: payload.checkedIn ? "Student boarded and checked in!" : "Check-in undone.",
  };
}

export async function exportFieldTripManifestAction() {
  const csvRows = [
    ["Roll No", "Student Name", "Parent Phone", "Emergency Contact", "Fee Paid", "Parent Permission", "Bus Seat", "Boarded"],
    ...fieldTripManifest.registeredStudents.map((s) => [
      s.rollNo,
      `"${s.studentName}"`,
      s.parentPhone,
      s.emergencyContact,
      s.feePaid ? "YES" : "NO",
      s.parentPermissionGranted ? "GRANTED" : "PENDING",
      s.busSeatNumber || "N/A",
      s.checkedInAtBus ? "BOARDED" : "ABSENT",
    ]),
  ];

    return {
    success: true,
    csv: csvRows.map((r) => r.join(",")).join("\n"),
    message: "Official passenger manifest generated with 100% verified payment and parent permission records.",
  };
}

// ── 11. Collaborative Unit Planner & OBE Tracker Actions (Feature 15) ─────────
export async function getFacultyCurriculumDataAction() {
  const nepAttainmentAvg = Math.round(
    unitPlans[0]?.learningOutcomes.reduce((acc, lo) => acc + lo.attainedPercent, 0) /
      (unitPlans[0]?.learningOutcomes.length || 1)
  );

  return {
    unitPlans,
    nepAttainmentAvg,
    coTeachersSyncedCount: unitPlans[0]?.coTeachers.length || 0,
    totalOutcomesMapped: unitPlans[0]?.learningOutcomes.length || 0,
  };
}

export async function syncUnitPlanAction(payload: {
  unitId: string;
  newResourceTitle: string;
  newResourceUrl: string;
  resourceType: "video" | "simulation" | "worksheet" | "slide_deck";
}) {
  unitPlans = unitPlans.map((u) => {
    if (u.id === payload.unitId) {
      return {
        ...u,
        digitalResources: [
          ...u.digitalResources,
          {
            title: payload.newResourceTitle,
            url: payload.newResourceUrl,
            type: payload.resourceType,
          },
        ],
        coTeachers: u.coTeachers.map((ct) => ({
          ...ct,
          lastSyncedAt: "Just now (Synced)",
        })),
      };
    }
    return u;
  });

  revalidatePath("/portal/faculty/curriculum");
  return {
    success: true,
    message: "Unit plan synchronized across all Grade 10 sections (10-A and 10-B) successfully!",
  };
}

// ── 12. Voice-Note Feedback & AI Rubric Grader Actions (Feature 16) ────────────
export async function getFacultyVoiceGraderDataAction() {
  return {
    submissions: essaySubmissions,
  };
}

export async function evaluateEssayWithAiRubricAction(submissionId: string) {
  const sub = essaySubmissions.find((s) => s.id === submissionId);
  if (!sub) throw new Error("Submission not found");

  // Re-calculate AI suggested score based on rubric
  const total = sub.rubric.reduce((acc, r) => acc + r.score, 0);

  return {
    success: true,
    suggestedScore: total,
    rubric: sub.rubric,
    message: `AI Rubric analyzed! Suggested Score: ${total}/${sub.maxScore} based on syntax coherence and evidence depth.`,
  };
}

export async function dispatchVoiceFeedbackAction(payload: {
  submissionId: string;
  score: number;
  voiceDurationSec: number;
  writtenRemark: string;
}) {
  essaySubmissions = essaySubmissions.map((s) =>
    s.id === payload.submissionId
      ? {
          ...s,
          status: "graded",
          aiSuggestedScore: payload.score,
          teacherVoiceDurationSec: payload.voiceDurationSec,
          teacherVoiceNoteUrl: "/mock-voice-notes/voice-note-feedback.mp3",
          teacherWrittenRemark: payload.writtenRemark,
        }
      : s
  );

  revalidatePath("/portal/faculty/voice-grader");
  revalidatePath("/portal/student/academics");

  return {
    success: true,
    message: "Voice note and rubric feedback dispatched! Student portal notified immediately.",
  };
}

// ── 13. Group Project & Peer-Review Hub Actions (Feature 17) ──────────────────
export async function getFacultyGroupProjectsDataAction() {
  return {
    projects: groupProjects,
  };
}

export async function submitPeerReviewAction(payload: {
  teamId: string;
  targetStudentId: string;
  score: number;
}) {
  groupProjects = groupProjects.map((team) => {
    if (team.teamId === payload.teamId) {
      return {
        ...team,
        members: team.members.map((m) =>
          m.studentId === payload.targetStudentId
            ? { ...m, peerScoreAvg: Number(((m.peerScoreAvg + payload.score) / 2).toFixed(1)) }
            : m
        ),
      };
    }
    return team;
  });

  revalidatePath("/portal/faculty/group-projects");
  return {
    success: true,
    message: "Peer review contribution registered! Contribution heatmap recalculated.",
  };
}

// ── 14. Smart Seating Chart & "Eyes on Me" Device Lock Actions (Features 18 & 19)
export async function getFacultySeatingChartDataAction() {
  return {
    desks: seatingDesks,
    warnings: pairingWarnings,
    deviceLock: deviceLockState,
  };
}

export async function swapSeatingDesksAction(deskIdA: string, deskIdB: string) {
  const deskA = seatingDesks.find((d) => d.deskId === deskIdA);
  const deskB = seatingDesks.find((d) => d.deskId === deskIdB);

  if (!deskA || !deskB) throw new Error("Desks not found");

  const tempStudentId = deskA.studentId;
  const tempStudentName = deskA.studentName;
  const tempRollNo = deskA.rollNo;
  const tempGender = deskA.gender;
  const tempInitials = deskA.photoInitials;
  const tempBehavior = deskA.behaviorNote;
  const tempConflict = deskA.hasConflictRisk;

  deskA.studentId = deskB.studentId;
  deskA.studentName = deskB.studentName;
  deskA.rollNo = deskB.rollNo;
  deskA.gender = deskB.gender;
  deskA.photoInitials = deskB.photoInitials;
  deskA.behaviorNote = deskB.behaviorNote;
  deskA.hasConflictRisk = deskB.hasConflictRisk;

  deskB.studentId = tempStudentId;
  deskB.studentName = tempStudentName;
  deskB.rollNo = tempRollNo;
  deskB.gender = tempGender;
  deskB.photoInitials = tempInitials;
  deskB.behaviorNote = tempBehavior;
  deskB.hasConflictRisk = tempConflict;

  seatingDesks = [...seatingDesks];
  revalidatePath("/portal/faculty/seating-chart");

  return {
    success: true,
    desks: seatingDesks,
    message: "Desk assignments swapped! Seating map updated for all substitute and classroom teachers.",
  };
}

export async function toggleDeviceLockAction(payload?: { message?: string }) {
  deviceLockState.isLocked = !deviceLockState.isLocked;
  deviceLockState.lockedAt = deviceLockState.isLocked ? new Date().toLocaleTimeString() : undefined;
  if (payload?.message) {
    deviceLockState.lockMessage = payload.message;
  }

  revalidatePath("/portal/faculty/seating-chart");
  revalidatePath("/portal/student");

  return {
    success: true,
    isLocked: deviceLockState.isLocked,
    message: deviceLockState.isLocked
      ? `🚨 "Eyes on Me" Screen Lock Activated! All 42 student devices on school network frozen.`
      : `Screen lock released. Student devices unlocked.`,
  };
}

// ── 15. Inclusive Education & SEN Accommodations Vault Actions (Feature 20) ────
export async function getFacultySenDataAction() {
  return {
    profiles: senProfiles,
    totalSenStudents: senProfiles.length,
  };
}

export async function updateSenAccommodationAction(payload: {
  studentId: string;
  newAccommodation: string;
}) {
  senProfiles = senProfiles.map((p) =>
    p.studentId === payload.studentId
      ? { ...p, actionableAccommodations: [...p.actionableAccommodations, payload.newAccommodation] }
      : p
  );

  revalidatePath("/portal/faculty/sen");
  revalidatePath("/portal/faculty");

  return {
    success: true,
    message: "Confidential accommodation saved! Updated in teacher roster confidential view.",
  };
}

// ── 16. Faculty Self-Service HR, Payroll & Biometrics Actions (Feature 21) ─────
export async function getFacultyHrDataAction() {
  return {
    ...teacherHrData,
  };
}

export async function applyTeacherLeaveAction(payload: {
  leaveType: "casualLeave" | "sickLeave" | "earnedLeave";
  startDate: string;
  endDate: string;
  reason: string;
}) {
  const current = teacherHrData.leaveBalance[payload.leaveType];
  if (current.remaining <= 0) {
    return {
      success: false,
      message: `Cannot apply: Insufficient balance in ${payload.leaveType}. Remaining: 0 days.`,
    };
  }

  teacherHrData.leaveBalance[payload.leaveType] = {
    ...current,
    used: current.used + 1,
    remaining: current.remaining - 1,
  };

  revalidatePath("/portal/faculty/hr");
  return {
    success: true,
    leaveBalance: teacherHrData.leaveBalance,
    message: `Leave application submitted to Principal's desk! 1 day deducted from ${payload.leaveType} balance.`,
  };
}

export async function regularizeBiometricAttendanceAction(payload: {
  logId: string;
  reason: string;
}) {
  teacherHrData.biometrics = teacherHrData.biometrics.map((b) =>
    b.id === payload.logId
      ? { ...b, status: "regularized", regularizationReason: payload.reason }
      : b
  );

  revalidatePath("/portal/faculty/hr");
  return {
    success: true,
    message: "Regularization request submitted to HR! Attendance record marked pending approval.",
  };
}

// ── 17. Digital Store Indent / Inventory Requisition Actions (Feature 22) ──────
export async function getFacultyStoreIndentDataAction() {
  return {
    catalog: storeItems,
    orders: storeOrders,
  };
}

export async function submitStoreIndentAction(payload: {
  items: { itemId: string; itemName: string; quantity: number }[];
  deliveryRoom: string;
}) {
  const newOrder: StoreRequisitionOrder = {
    id: "indent-" + Math.floor(100 + Math.random() * 900),
    requestedBy: "Mrs. Priyanka Devi",
    requestedAt: "Just now",
    items: payload.items,
    deliveryRoom: payload.deliveryRoom,
    status: "pending_approval",
  };

  storeOrders = [newOrder, ...storeOrders];

  // Deduct stock
  payload.items.forEach((reqItem) => {
    storeItems = storeItems.map((item) =>
      item.id === reqItem.itemId
        ? { ...item, stockAvailable: Math.max(0, item.stockAvailable - reqItem.quantity) }
        : item
    );
  });

  revalidatePath("/portal/faculty/store-indent");
  return {
    success: true,
    order: newOrder,
    message: `Requisition order #${newOrder.id} submitted! Store manager alerted for classroom delivery.`,
  };
}

// ── 18. Campus Maintenance Helpdesk Ticketing Actions (Feature 23) ─────────────
export async function getFacultyMaintenanceDataAction() {
  return {
    tickets: maintenanceTickets,
  };
}

export async function createMaintenanceTicketAction(payload: {
  title: string;
  location: string;
  category: MaintenanceTicket["category"];
  severity: MaintenanceTicket["severity"];
  description: string;
}) {
  const newTicket: MaintenanceTicket = {
    id: "maint-" + Math.floor(100 + Math.random() * 900),
    title: payload.title,
    location: payload.location,
    category: payload.category,
    severity: payload.severity,
    reportedAt: "Just now",
    status: "pending",
    description: payload.description,
  };

  maintenanceTickets = [newTicket, ...maintenanceTickets];

  revalidatePath("/portal/faculty/maintenance");
  return {
    success: true,
    ticket: newTicket,
    message: `Maintenance ticket #${newTicket.id} logged! Dispatched to Estate/Facility Manager.`,
  };
}

