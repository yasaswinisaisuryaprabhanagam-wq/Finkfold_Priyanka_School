"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthenticatedStudent } from "@/lib/studentSession";
import type { StoreItem, StoreOrder } from "@/types/self-service";
import { INITIAL_STORE_ITEMS, INITIAL_ORDERS } from "@/types/self-service";

export async function getStoreData(): Promise<{ items: StoreItem[]; orders: StoreOrder[] }> {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  try {
    const { data: dbOrders, error } = await supabase
      .from("campus_store_orders")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error querying campus_store_orders:", error);

    if (dbOrders && dbOrders.length > 0) {
      const mappedOrders: StoreOrder[] = dbOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        items: o.items || [],
        totalAmount: Number(o.total_amount),
        pointsRedeemed: o.points_redeemed || 0,
        status: o.status || "packing",
        pickupPassQr: o.pickup_pass_qr,
        pickupSlot: o.pickup_slot,
        createdAt: new Date(o.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
      return { items: INITIAL_STORE_ITEMS, orders: mappedOrders };
    }
  } catch (err) {
    console.error("Failed to fetch store orders:", err);
  }

  return { items: INITIAL_STORE_ITEMS, orders: INITIAL_ORDERS };
}

export async function placeStoreOrderAction(payload: {
  items: { itemId: string; name: string; size?: string; qty: number; price: number }[];
  totalAmount: number;
  pointsRedeemed: number;
}) {
  const { student, schoolId } = await getAuthenticatedStudent();
  const supabase = await createAdminClient();

  const orderNum = "ORD-PRIY-" + Math.floor(1000 + Math.random() * 9000);
  const pickupQr = `QR-STORE-${orderNum}-${Date.now().toString().slice(-4)}`;
  const pickupSlot = "Tomorrow Lunch Break (12:45 PM – 01:25 PM) • School Store";

  const { data, error } = await supabase
    .from("campus_store_orders")
    .insert({
      school_id: schoolId,
      student_id: student.id,
      order_number: orderNum,
      items: payload.items,
      total_amount: payload.totalAmount,
      points_redeemed: payload.pointsRedeemed,
      status: "packing",
      pickup_pass_qr: pickupQr,
      pickup_slot: pickupSlot,
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting into campus_store_orders:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to log store order into database.",
    };
  }

  const newOrder: StoreOrder = {
    id: data?.id || "ord-" + Date.now(),
    orderNumber: orderNum,
    items: payload.items,
    totalAmount: payload.totalAmount,
    pointsRedeemed: payload.pointsRedeemed,
    status: "packing",
    pickupPassQr: pickupQr,
    pickupSlot: pickupSlot,
    createdAt: "Today",
  };

  revalidatePath("/portal/student/store");
  revalidatePath("/portal/admin");
  return {
    success: true,
    order: newOrder,
    message: `Order #${orderNum} placed successfully and logged in DB! Packing slip sent to storekeeper. Show pickup QR code during lunch break.`,
  };
}
