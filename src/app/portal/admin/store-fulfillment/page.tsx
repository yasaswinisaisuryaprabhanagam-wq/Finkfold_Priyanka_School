"use client";

import { useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerRole: "student" | "faculty";
  gradeOrRoom: string;
  items: { itemName: string; qty: number; aisle: string }[];
  totalInr: number;
  status: "unfulfilled" | "packing" | "ready_for_pickup" | "collected";
  timestamp: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-PRIY-1042",
    customerName: "Kiran Kumar",
    customerRole: "student",
    gradeOrRoom: "Class 10-A",
    items: [
      { itemName: "Class 10 CBSE Standard Uniform (Size 34)", qty: 1, aisle: "Aisle 2, Bin B" },
      { itemName: "Class 10 Academic Textbook Bundle (14 Books)", qty: 1, aisle: "Aisle 4, Shelf 1" },
    ],
    totalInr: 2650,
    status: "unfulfilled",
    timestamp: "Today at 09:15 AM",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-PRIY-1043",
    customerName: "Mrs. Priyanka Devi",
    customerRole: "faculty",
    gradeOrRoom: "Room 302 - Senior Wing",
    items: [
      { itemName: "Whiteboard Dry-Erase Markers (Box of 10 - Blue)", qty: 2, aisle: "Aisle 1, Rack C" },
      { itemName: "A4 White Laser Printing Paper Ream (500 sheets)", qty: 1, aisle: "Aisle 1, Pallet A" },
    ],
    totalInr: 850,
    status: "packing",
    timestamp: "Today at 09:40 AM",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-PRIY-1039",
    customerName: "Yasaswini S.",
    customerRole: "student",
    gradeOrRoom: "Class 10-A",
    items: [
      { itemName: "School Sports Tracksuit (Size 32)", qty: 1, aisle: "Aisle 3, Bin A" },
    ],
    totalInr: 950,
    status: "ready_for_pickup",
    timestamp: "Yesterday at 03:20 PM",
  },
];

const LOW_STOCK_ITEMS = [
  { item: "Size 32 Boys Regular Polo Shirt", currentStock: 8, threshold: 20, supplier: "Sri Balaji Garments Ltd.", unitCost: 350 },
  { item: "A4 Printing Paper Reams", currentStock: 14, threshold: 30, supplier: "Nellore Stationery Wholesalers", unitCost: 280 },
  { item: "Physics Lab Vernier Calipers", currentStock: 4, threshold: 10, supplier: "Modern Scientific Supplies", unitCost: 450 },
];

export default function AdminStoreFulfillmentPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "picklist" | "vendor">("orders");
  const [notification, setNotification] = useState<string | null>(null);

  function handleScanBarcode(e: React.FormEvent) {
    e.preventDefault();
    const query = barcodeInput.trim().toUpperCase();
    const match = orders.find((o) => o.orderNumber.toUpperCase() === query || o.id === query);

    if (match) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === match.id
            ? { ...o, status: "ready_for_pickup" }
            : o
        )
      );
      setNotification(`⚡ Barcode verified! Order #${match.orderNumber} marked 'Ready for Pickup'. Automated WhatsApp voucher sent to ${match.customerName}.`);
      setBarcodeInput("");
    } else {
      setNotification("⚠️ No matching order found for barcode: " + query);
    }
    setTimeout(() => setNotification(null), 5000);
  }

  function advanceOrderStatus(orderId: string, nextStatus: Order["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    setNotification(`Order #${orderId} moved to '${nextStatus}'`);
    setTimeout(() => setNotification(null), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100 mb-2">
              <span>Section 2: Smart Campus Logistics</span>
              <span>·</span>
              <span>E-Commerce & Warehouse Dispatch</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Store Indent & Fulfillment Command
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Centralized warehouse operations: fulfill student uniform bundles, dispatch teacher lab supplies, scan pickup QR vouchers, and automate vendor PO re-orders.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "orders" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Order Queue
            </button>
            <button
              onClick={() => setActiveTab("picklist")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "picklist" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Master Pick List
            </button>
            <button
              onClick={() => setActiveTab("vendor")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "vendor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Vendor PO Re-orders
            </button>
          </div>
        </div>
      </div>

      {/* Quick 1-Scan Barcode Dispatch Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <div>
            <div className="text-xs font-bold text-slate-900">1-Scan Barcode Dispatch Terminal</div>
            <div className="text-[10px] text-slate-400">Scan student phone QR or order sheet barcode to trigger instant WhatsApp pickup alert</div>
          </div>
        </div>
        <form onSubmit={handleScanBarcode} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Scan or type ORD-PRIY-1042..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-400 outline-hidden font-mono min-w-[220px]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
          >
            Dispatch ⚡
          </button>
        </form>
      </div>

      {/* TAB 1: Live Orders Queue */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 font-mono">{ord.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === "ready_for_pickup"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : ord.status === "packing"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {ord.status === "ready_for_pickup" ? "✓ Ready for Pickup" : ord.status === "packing" ? "⏳ In Packing" : "📥 New Order"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ord.customerName}</h3>
                    <div className="text-xs text-slate-500">{ord.customerRole === "student" ? "Student" : "Faculty"} • {ord.gradeOrRoom}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Items:</div>
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-slate-700">
                        <span className="truncate max-w-[200px]">{it.itemName}</span>
                        <span className="font-bold text-amber-700">x{it.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">₹{ord.totalInr.toLocaleString("en-IN")}</span>
                  <div className="flex items-center gap-1.5">
                    {ord.status === "unfulfilled" && (
                      <button
                        onClick={() => advanceOrderStatus(ord.id, "packing")}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                      >
                        Start Packing
                      </button>
                    )}
                    {ord.status === "packing" && (
                      <button
                        onClick={() => advanceOrderStatus(ord.id, "ready_for_pickup")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Mark Ready ✓
                      </button>
                    )}
                    {ord.status === "ready_for_pickup" && (
                      <button
                        onClick={() => advanceOrderStatus(ord.id, "collected")}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
                      >
                        Handed Over
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Consolidated Pick List */}
      {activeTab === "picklist" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Consolidated Warehouse Pick List (Morning Batch)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Optimized warehouse path routing to fulfill 18 pending orders with minimum walking distance.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
            >
              🖨️ Print Manifest
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              <span>Warehouse Location</span>
              <span>Item &amp; Specifications</span>
              <span>Total Qty to Pull</span>
              <span className="text-right">Assigned Orders</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="font-mono text-amber-700 font-bold">Aisle 1, Rack C</span>
              <span className="font-bold text-slate-800">Whiteboard Dry-Erase Markers (Box of 10 - Blue)</span>
              <span className="font-extrabold text-slate-900 text-sm">2 Boxes</span>
              <span className="text-slate-500 font-mono text-[11px]">ORD-PRIY-1043</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="font-mono text-amber-700 font-bold">Aisle 2, Bin B</span>
              <span className="font-bold text-slate-800">Class 10 CBSE Standard Uniform (Size 34)</span>
              <span className="font-extrabold text-slate-900 text-sm">1 Set</span>
              <span className="text-slate-500 font-mono text-[11px]">ORD-PRIY-1042</span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <span className="font-mono text-amber-700 font-bold">Aisle 4, Shelf 1</span>
              <span className="font-bold text-slate-800">Class 10 Academic Textbook Bundle (14 Books)</span>
              <span className="font-extrabold text-slate-900 text-sm">1 Bundle</span>
              <span className="text-slate-500 font-mono text-[11px]">ORD-PRIY-1042</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Automated Vendor Re-Ordering */}
      {activeTab === "vendor" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Automated Vendor Re-ordering &amp; Purchase Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">When stock drops below safety thresholds, system pre-drafts PO PDFs for registered suppliers.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {LOW_STOCK_ITEMS.map((item, idx) => (
              <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.item}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Registered Supplier: <strong className="text-slate-700">{item.supplier}</strong> • Unit Cost: ₹{item.unitCost}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                      {item.currentStock} Units (Min: {item.threshold})
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">Deficit: {item.threshold - item.currentStock} Units</div>
                  </div>

                  <button
                    onClick={() => {
                      setNotification(`Generated Purchase Order PO-PRIY-2026-0${idx + 1} and emailed to ${item.supplier}`);
                      setTimeout(() => setNotification(null), 5000);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                  >
                    Draft PO &amp; Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
