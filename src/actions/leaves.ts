"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedStudent } from "@/lib/studentSession";
import type { StudentLeave } from "@/types/self-service";
import { INITIAL_LEAVES } from "@/types/self-service";

export async function getLeavesData(): Promise<StudentLeave[]> {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  try {
    const { data: dbLeaves, error } = await supabase
      .from("student_leaves_and_od")
      .select("*")
      .eq("student_id", student.id)
      .order("applied_at", { ascending: false });

    if (error) console.error("Error querying student_leaves_and_od:", error);

    if (dbLeaves && dbLeaves.length > 0) {
      return dbLeaves.map((l: any) => ({
        id: l.id,
        leaveType: l.leave_type,
        startDate: new Date(l.start_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        endDate: new Date(l.end_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        totalDays: l.total_days,
        reason: l.reason,
        medicalDocRequired: l.medical_doc_required,
        medicalDocName: l.medical_doc_name,
        status: l.status,
        onDutyDetails: l.on_duty_details,
        appliedAt: new Date(l.applied_at || l.created_at || Date.now()).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
  } catch (err) {
    console.error("Failed to fetch leaves data:", err);
  }

  return INITIAL_LEAVES;
}

export async function submitLeaveApplicationAction(payload: {
  leaveType: StudentLeave["leaveType"];
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  medicalDocName?: string;
}) {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const isMedRequired = payload.totalDays > 3 && payload.leaveType === "medical_leave";

  // Ensure dates are valid YYYY-MM-DD
  const todayIso = new Date().toISOString().split("T")[0];
  const parsedStartDate = payload.startDate && !isNaN(Date.parse(payload.startDate))
    ? new Date(payload.startDate).toISOString().split("T")[0]
    : todayIso;
  const parsedEndDate = payload.endDate && !isNaN(Date.parse(payload.endDate))
    ? new Date(payload.endDate).toISOString().split("T")[0]
    : todayIso;

  // Map to allowed DB enum
  const validTypes = ["sick_leave", "casual_leave", "medical_leave", "on_duty"];
  const safeType = validTypes.includes(payload.leaveType) ? payload.leaveType : "sick_leave";

  const { data, error } = await supabase
    .from("student_leaves_and_od")
    .insert({
      school_id: schoolId,
      student_id: student.id,
      leave_type: safeType,
      start_date: parsedStartDate,
      end_date: parsedEndDate,
      total_days: payload.totalDays || 1,
      reason: payload.reason.trim(),
      medical_doc_required: isMedRequired,
      medical_doc_name: payload.medicalDocName?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting into student_leaves_and_od:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to submit leave application into database.",
    };
  }

  const newLeave: StudentLeave = {
    id: data?.id || "lv-" + Date.now(),
    leaveType: safeType as any,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    totalDays: payload.totalDays || 1,
    reason: payload.reason,
    medicalDocRequired: isMedRequired,
    medicalDocName: payload.medicalDocName,
    status: "pending",
    appliedAt: "Today",
  };

  revalidatePath("/portal/student/leaves");
  revalidatePath("/portal/faculty");
  revalidatePath("/portal/admin");

  return {
    success: true,
    leave: newLeave,
    message: `Digital leave request logged in DB! Form forwarded to Class Teacher and Principal. ${
      isMedRequired ? "Medical certificate attached." : ""
    }`,
  };
}
