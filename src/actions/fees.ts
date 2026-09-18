"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { PaymentMethod, FeeCategory } from "@/types/erp";

/**
 * Retrieves today's active cash drawer for the cashier, or opens one if not yet created.
 */
export async function getOrCreateTodayDrawer(schoolId: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { success: false, error: "Unauthorized" };

    const adminClient = await createAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    // 1. Check existing drawer
    const { data: existingDrawer } = await adminClient
      .from("cash_drawers")
      .select("*")
      .eq("school_id", schoolId)
      .eq("cashier_id", profile.id)
      .eq("drawer_date", today)
      .maybeSingle();

    if (existingDrawer) {
      return { success: true, drawer: existingDrawer };
    }

    // 2. Create today's drawer
    const { data: newDrawer, error: insertError } = await adminClient
      .from("cash_drawers")
      .insert({
        school_id: schoolId,
        cashier_id: profile.id,
        drawer_date: today,
        opening_cash: 0.0,
        system_cash_collected: 0.0,
        status: "open",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return { success: true, drawer: newDrawer };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to initialize cash drawer" };
  }
}

/**
 * Record Counter POS Fee Collection
 */
export async function collectFeePayment(input: {
  schoolId: string;
  studentId: string;
  feeStructureId?: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  remarks?: string;
}) {
  try {
    const profile = await getProfile();
    if (!profile) return { success: false, error: "Unauthorized" };

    if (input.amount <= 0) {
      return { success: false, error: "Amount must be greater than zero" };
    }

    const adminClient = await createAdminClient();
    const currentYear = new Date().getFullYear();

    // Generate unique sequential receipt number
    const { count } = await adminClient
      .from("fee_transactions")
      .select("id", { count: "exact", head: true })
      .eq("school_id", input.schoolId);

    const receiptNo = `REC-${currentYear}-${String((count || 0) + 1).padStart(5, "0")}`;

    // If payment method is cash, link to cashier's active cash drawer
    let cashDrawerId: string | null = null;
    if (input.paymentMethod === "cash") {
      const drawerRes = await getOrCreateTodayDrawer(input.schoolId);
      if (drawerRes.success && drawerRes.drawer) {
        cashDrawerId = drawerRes.drawer.id;

        // Increment system cash collected
        const newTotal = Number(drawerRes.drawer.system_cash_collected || 0) + Number(input.amount);
        await adminClient
          .from("cash_drawers")
          .update({ system_cash_collected: newTotal })
          .eq("id", cashDrawerId);
      }
    }

    // Insert fee transaction
    const { data: transaction, error: txError } = await adminClient
      .from("fee_transactions")
      .insert({
        school_id: input.schoolId,
        organization_id: profile.organization_id || null,
        student_id: input.studentId,
        fee_structure_id: input.feeStructureId || null,
        cash_drawer_id: cashDrawerId,
        receipt_no: receiptNo,
        amount: input.amount,
        payment_method: input.paymentMethod,
        payment_status: "completed",
        transaction_ref: input.transactionRef || null,
        collected_by: profile.id,
        remarks: input.remarks || null,
        paid_at: new Date().toISOString(),
      })
      .select("*, student:students(full_name, admission_no, roll_no, parent_phone, class:classes(name, section))")
      .single();

    if (txError) throw txError;

    revalidatePath("/portal/admin/fees");
    return { success: true, transaction, receiptNo };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record payment" };
  }
}

/**
 * Cashier EOD Blind-Close Submission
 */
export async function submitDrawerClose(drawerId: string, declaredCash: number, notes?: string) {
  try {
    const profile = await getProfile();
    if (!profile) return { success: false, error: "Unauthorized" };

    const adminClient = await createAdminClient();

    const { data: drawer, error } = await adminClient
      .from("cash_drawers")
      .update({
        declared_cash: declaredCash,
        notes: notes || null,
        status: "submitted_for_verification",
      })
      .eq("id", drawerId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/portal/admin/fees");
    return { success: true, drawer };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit drawer close" };
  }
}

/**
 * Admin EOD Cash Verification & Maker-Checker Audit
 */
export async function verifyDrawer(drawerId: string, adminNotes?: string) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "school_admin" && profile.role !== "super_admin")) {
      return { success: false, error: "Only administrators can verify cash drawers" };
    }

    const adminClient = await createAdminClient();

    // Fetch drawer to inspect discrepancy
    const { data: drawer } = await adminClient
      .from("cash_drawers")
      .select("opening_cash, system_cash_collected, declared_cash, notes")
      .eq("id", drawerId)
      .single();

    if (!drawer) return { success: false, error: "Cash drawer not found" };

    const expectedCash = Number(drawer.opening_cash) + Number(drawer.system_cash_collected);
    const declared = Number(drawer.declared_cash ?? expectedCash);
    const hasDiscrepancy = Math.abs(declared - expectedCash) > 0.01;

    const newStatus = hasDiscrepancy ? "discrepancy_flagged" : "verified";
    const combinedNotes = adminNotes
      ? `${drawer.notes ? drawer.notes + " | " : ""}Audit: ${adminNotes}`
      : drawer.notes;

    const { data: updatedDrawer, error } = await adminClient
      .from("cash_drawers")
      .update({
        status: newStatus,
        verified_by: profile.id,
        verified_at: new Date().toISOString(),
        notes: combinedNotes,
      })
      .eq("id", drawerId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/portal/admin/fees");
    return { success: true, drawer: updatedDrawer, hasDiscrepancy };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to verify drawer" };
  }
}

/**
 * Create a new Fee Structure item
 */
export async function createFeeStructure(
  schoolId: string,
  classId: string | null,
  name: string,
  category: FeeCategory,
  amount: number,
  dueDate: string | null,
  isMandatory: boolean = true
) {
  try {
    const profile = await getProfile();
    if (!profile || (profile.role !== "school_admin" && profile.role !== "super_admin")) {
      return { success: false, error: "Unauthorized" };
    }

    const adminClient = await createAdminClient();

    const { data, error } = await adminClient
      .from("fee_structures")
      .insert({
        school_id: schoolId,
        class_id: classId || null,
        name: name.trim(),
        category: category,
        amount: amount,
        due_date: dueDate || null,
        is_mandatory: isMandatory,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/portal/admin/fees");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create fee structure" };
  }
}
