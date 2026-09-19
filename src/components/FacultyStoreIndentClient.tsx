"use client";

import { useState, useTransition } from "react";
import { StoreInventoryItem, StoreRequisitionOrder } from "@/types/faculty";
import { submitStoreIndentAction } from "@/actions/faculty";

interface Props {
  initialCatalog: StoreInventoryItem[];
  initialOrders: StoreRequisitionOrder[];
}

export default function FacultyStoreIndentClient({
  initialCatalog,
  initialOrders,
}: Props) {
  const [catalog] = useState<StoreInventoryItem[]>(initialCatalog);
  const [orders, setOrders] = useState<StoreRequisitionOrder[]>(initialOrders);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // Cart state: itemId -> quantity
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [deliveryRoom, setDeliveryRoom] = useState("Staff Room Locker #4 (Class 10-A)");

  const handleUpdateCart = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleCheckout = () => {
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = catalog.find((c) => c.id === id);
      return { itemId: id, itemName: item?.itemName || "Item", quantity: qty };
    });

    if (items.length === 0) return;

    startTransition(async () => {
      const res = await submitStoreIndentAction({
        items,
        deliveryRoom,
      });
      if (res.success && res.order) {
        setOrders((prev) => [res.order!, ...prev]);
        setNotification(res.message);
        setCart({});
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner - Clean Reference Style */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                Digital Inventory Requisition
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Desk Delivery by Campus Logistics
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Digital Store Indent &amp; Classroom Supplies
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Never leave class to search for markers or lab chemicals. Request items digitally and campus peons deliver them straight to your classroom desk.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50/80 border border-amber-200 px-4 py-2 rounded-xl text-center">
              <div className="text-xl font-extrabold text-amber-700">{cartTotalItems} Items</div>
              <div className="text-[10px] text-amber-800 uppercase font-semibold">Active In Cart</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Store Catalog (Left) + Cart & Past Orders (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Digital Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Campus Store Inventory Catalog</h3>
              <span className="text-[11px] text-muted-foreground">{catalog.length} Available Supplies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalog.map((item) => {
                const inCartQty = cart[item.id] || 0;

                return (
                  <div key={item.id} className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">{item.itemName}</h4>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Stock: <strong className="text-foreground">{item.stockAvailable} {item.unit}s</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-xs text-muted-foreground">Qty:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateCart(item.id, -1)}
                          disabled={inCartQty === 0}
                          className="h-7 w-7 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold flex items-center justify-center text-xs disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-foreground">{inCartQty}</span>
                        <button
                          onClick={() => handleUpdateCart(item.id, 1)}
                          disabled={item.stockAvailable <= inCartQty}
                          className="h-7 w-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold flex items-center justify-center text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Cart Checkout & Requisition Status */}
        <div className="space-y-6">
          {/* Cart Box */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Requisition Cart</h3>

            {cartTotalItems === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground italic">
                Cart is empty. Select supplies from catalog.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-border">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = catalog.find((c) => c.id === id);
                    return (
                      <div key={id} className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-foreground truncate max-w-[160px]">{item?.itemName}</span>
                        <span className="font-bold text-orange-600">x{qty}</span>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Delivery Destination</label>
                  <input
                    type="text"
                    value={deliveryRoom}
                    onChange={(e) => setDeliveryRoom(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                  />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>{isPending ? "Submitting..." : "Submit Supplies Indent"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Past Orders Tracker */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Recent Requisitions</h3>
            <div className="space-y-2.5">
              {orders.map((ord) => (
                <div key={ord.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">Order #{ord.id}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {ord.status === "packed_dispatched" ? "📦 Packed & Dispatched" : ord.status === "delivered" ? "✓ Delivered" : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {ord.items.map((it) => `${it.itemName} (x${it.quantity})`).join(", ")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Destination: {ord.deliveryRoom} • {ord.requestedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
