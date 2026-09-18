"use server";

import { revalidatePath } from "next/cache";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: "Transport" | "Accounts & Fees" | "Academics" | "ID Card & Records";
  subject: string;
  description: string;
  priority: "low" | "medium" | "urgent";
  status: "open" | "in_progress" | "resolved";
  slaRemainingHours: number;
  assignedDept: string;
  createdAt: string;
}

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tick-01",
    ticketNumber: "TICK-2026-104",
    category: "Accounts & Fees",
    subject: "Request for Section 80C Employer Format Annexure",
    description: "Need school's official registration certificate attached alongside Term 1 tuition fee receipt for company HRA/tax declaration.",
    priority: "medium",
    status: "in_progress",
    slaRemainingHours: 14,
    assignedDept: "Central Accounts Desk",
    createdAt: "16 Sep 2026",
  },
  {
    id: "tick-02",
    ticketNumber: "TICK-2026-089",
    category: "Transport",
    subject: "Change of Evening Drop Stop to Santhi Nagar Main",
    description: "Child will be dropped at grandfather's house on Tuesdays and Thursdays. Bus Route 04 driver has been informed verbally.",
    priority: "low",
    status: "resolved",
    slaRemainingHours: 0,
    assignedDept: "Transport Fleet Office",
    createdAt: "12 Sep 2026",
  },
];

export async function createTicketAction(payload: {
  category: "Transport" | "Accounts & Fees" | "Academics" | "ID Card & Records";
  subject: string;
  description: string;
  priority: "low" | "medium" | "urgent";
}) {
  const tickNum = "TICK-2026-" + Math.floor(100 + Math.random() * 900);
  const newTicket: SupportTicket = {
    id: "tick-" + Date.now(),
    ticketNumber: tickNum,
    category: payload.category,
    subject: payload.subject,
    description: payload.description,
    priority: payload.priority,
    status: "open",
    slaRemainingHours: payload.priority === "urgent" ? 6 : 24,
    assignedDept: payload.category === "Transport" ? "Transport Fleet Office" : "Administrative Helpdesk",
    createdAt: "Just now",
  };

  revalidatePath("/portal/student/documents");
  return {
    success: true,
    ticket: newTicket,
    message: `Helpdesk Ticket #${tickNum} created! Assigned to ${newTicket.assignedDept} with ${newTicket.slaRemainingHours}h SLA.`,
  };
}
