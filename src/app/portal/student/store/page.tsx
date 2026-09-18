"use client";

import { useState, useEffect, useTransition } from "react";
import type { StoreItem, StoreOrder } from "@/types/self-service";
import { INITIAL_STORE_ITEMS, INITIAL_ORDERS } from "@/types/self-service";
import { getStoreData, placeStoreOrderAction } from "@/actions/store";

interface CartItem {
  item: StoreItem;
  size?: string;
  qty: number;
}

export default function StudentStorePage() {
  const [items] = useState<StoreItem[]>(INITIAL_STORE_ITEMS);
  const [orders, setOrders] = useState<StoreOrder[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    "prod-uniform-reg": "32 (Large)",
    "prod-uniform-sports": "30 (Medium)",
    "prod-shoes-formal": "Size 7",
  });
  const [userPoints, setUserPoints] = useState(150);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getStoreData().then((res) => {
      if (res?.orders && res.orders.length > 0) {
        setOrders(res.orders);
      }
    });
  }, []);

  function addToCart(item: StoreItem) {
    const size = item.availableSizes ? selectedSizes[item.id] || item.availableSizes[0] : undefined;
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id && c.size === size);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id && c.size === size ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { item, size, qty: 1 }];
    });
    setNotification(`Added "${item.name}" to cart!`);
    setTimeout(() => setNotification(null), 3000);
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = cart.reduce((sum, c) => sum + c.item.priceInr * c.qty, 0);
  const pointsDiscount = redeemPoints && subtotal > 0 ? Math.min(userPoints, 50) : 0;
  const grandTotal = Math.max(0, subtotal - pointsDiscount);

  function handleCheckout() {
    if (cart.length === 0) return;

    startTransition(async () => {
      const payload = {
        items: cart.map((c) => ({
          itemId: c.item.id,
          name: c.item.name,
          size: c.size,
          qty: c.qty,
          price: c.item.priceInr,
        })),
        totalAmount: grandTotal,
        pointsRedeemed: pointsDiscount,
      };

      const res = await placeStoreOrderAction(payload);
      if (res.success && res.order) {
        setOrders((prev) => [res.order, ...prev]);
        setCart([]);
        setUserPoints((prev) => prev - pointsDiscount);
        setRedeemPoints(false);
        setActiveTab("orders");
        setNotification(res.message);
      }
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <span>🛍️</span>
            <span>Zero-Queue Campus E-Commerce</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Store & Uniform Sizing
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Order official school kits, sizing-matrix uniforms, and books. Collect with digital pass at lunch break.
          </p>
        </div>

        {/* Finkfold Reward Points Badge */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 px-5 py-3 rounded-2xl shadow-sm border border-amber-400/50 flex items-center gap-3 self-start sm:self-auto">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-950">
              Finkfold Reward Points
            </div>
            <div className="text-lg font-black leading-tight">
              {userPoints} Points Available
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Store Catalog ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>My Orders & Pickup Passes</span>
          <span className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
            {orders.length}
          </span>
        </button>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
          <span className="text-lg">✅</span>
          <div className="font-medium flex-1">{notification}</div>
        </div>
      )}

      {/* ── Catalog View ── */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Products List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">• {item.gradeEligibility}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="text-right sm:pl-4 sm:border-l sm:border-slate-100">
                    <div className="text-xl font-extrabold text-slate-900">
                      ₹{item.priceInr.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold">
                      or {item.pointsPrice} Points
                    </div>
                  </div>
                </div>

                {/* Sizing Matrix Selection (if applicable) */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {item.availableSizes ? (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-700">Size Matrix:</label>
                      <select
                        value={selectedSizes[item.id] || item.availableSizes[0]}
                        onChange={(e) =>
                          setSelectedSizes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      >
                        {item.availableSizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Standard Pack Size</span>
                  )}

                  <button
                    onClick={() => addToCart(item)}
                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 ml-auto"
                  >
                    <span>🛒</span>
                    <span>Add to Pack</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart & Checkout Drawer */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Your Kit Basket</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                {cart.reduce((s, c) => s + c.qty, 0)} Items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Your basket is empty. Select your uniforms or book kit to begin.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cart.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate">{c.item.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.size && <span>Size: {c.size} • </span>}
                          Qty: {c.qty}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">₹{c.item.priceInr * c.qty}</div>
                        <button
                          onClick={() => removeFromCart(i)}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Points Redemption Toggle */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Redeem Finkfold Points</span>
                    <input
                      type="checkbox"
                      checked={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.checked)}
                      className="h-4 w-4 rounded text-amber-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-amber-800 leading-tight">
                    Apply 50 points for a ₹50 instant discount on this order.
                  </p>
                </div>

                {/* Bill Summary */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {redeemPoints && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Points Discount:</span>
                      <span>-₹{pointsDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🧾</span>
                  <span>Confirm Order & Get Lunch-Break Pickup Pass</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Payment is charged to your Student Ledger. No cash needed at store.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Orders & Pickup Passes View ── */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Active Fulfillment & Lunch-Break Pickup Passes
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Show this digital QR pass to the campus storekeeper during your assigned lunch break to collect your packaged items.
            </p>

            <div className="space-y-6">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/30 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-blue-950">
                        {ord.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                        {ord.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          • <strong>{it.name}</strong> {it.size && `(Size: ${it.size})`} × {it.qty} — ₹{it.price}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500 pt-2 border-t border-blue-100 flex flex-wrap gap-4">
                      <div>
                        Total Charged: <strong>₹{ord.totalAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        Pickup Slot: <strong className="text-blue-900">{ord.pickupSlot}</strong>
                      </div>
                    </div>
                  </div>

                  {/* QR Pickup Pass */}
                  <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 w-44">
                    <div className="h-28 w-28 p-1.5 border-2 border-slate-900 rounded-lg flex items-center justify-center">
                      <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-blue-950">
                      {ord.pickupPassQr}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Ready for Lunch Pickup
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
