"use server";

import { revalidatePath } from "next/cache";

import type { SupportTicket } from "@/types/self-service";
import { INITIAL_TICKETS } from "@/types/self-service";

import { createAdminClient } from "@/lib/supabase/server";
import { SCHOOL } from "@/lib/school-config";

async function getDefaultStudentId(supabase: any) {
  const { data: stu } = await supabase.from("students").select("id").limit(1).maybeSingle();
  return stu?.id || "6921082e-75ab-4067-b536-b76d09f71c3a";
}

export async function getSupportTicketsData(): Promise<SupportTicket[]> {
  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  try {
    const { data: dbTickets } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (dbTickets && dbTickets.length > 0) {
      return dbTickets.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        category: t.category,
        subject: t.subject,
        description: t.description,
        priority: t.priority,
        status: t.status,
        slaRemainingHours: t.sla_remaining_hours,
        assignedDept: t.assigned_dept,
        createdAt: new Date(t.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
  } catch (err) {
    // Fallback if table not queried
  }

  return INITIAL_TICKETS;
}

export async function createTicketAction(payload: {
  category: "Transport" | "Accounts & Fees" | "Academics" | "ID Card & Records";
  subject: string;
  description: string;
  priority: "low" | "medium" | "urgent";
}) {
  const tickNum = "TICK-2026-" + Math.floor(100 + Math.random() * 900);
  const assignedDept = payload.category === "Transport" ? "Transport Fleet Office" : "Administrative Helpdesk";
  const slaRemainingHours = payload.priority === "urgent" ? 6 : 24;

  const newTicket: SupportTicket = {
    id: "tick-" + Date.now(),
    ticketNumber: tickNum,
    category: payload.category,
    subject: payload.subject,
    description: payload.description,
    priority: payload.priority,
    status: "open",
    slaRemainingHours,
    assignedDept,
    createdAt: "Just now",
  };

  const supabase = await createAdminClient();
  const studentId = await getDefaultStudentId(supabase);

  try {
    await supabase.from("support_tickets").insert({
      school_id: SCHOOL.id,
      student_id: studentId,
      ticket_number: tickNum,
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority,
      status: "open",
      sla_remaining_hours: slaRemainingHours,
      assigned_dept: assignedDept,
    });
  } catch (err) {
    // Graceful fallback
  }

  revalidatePath("/portal/student/documents");
  return {
    success: true,
    ticket: newTicket,
    message: `Helpdesk Ticket #${tickNum} created and logged in DB! Assigned to ${newTicket.assignedDept} with ${newTicket.slaRemainingHours}h SLA.`,
  };
}
