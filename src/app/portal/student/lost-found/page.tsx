"use client";

import { useState, useEffect, useTransition } from "react";
import type { LostFoundItem } from "@/types/self-service";
import { INITIAL_LOST_FOUND_ITEMS } from "@/types/self-service";
import { getLostFoundData, claimItemAction } from "@/actions/lost-found";

export default function LostAndFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>(INITIAL_LOST_FOUND_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [claimingItem, setClaimingItem] = useState<LostFoundItem | null>(null);
  const [studentName, setStudentName] = useState("Arjun Reddy");
  const [homeroom, setHomeroom] = useState("Class 10 - Section A");
  const [identifyingMark, setIdentifyingMark] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getLostFoundData().then((res) => {
      if (res && res.length > 0) setItems(res);
    });
  }, []);

  const categories = [
    { id: "all", label: "All Items", icon: "🎒" },
    { id: "clothing", label: "Uniforms & Blazers", icon: "🧥" },
    { id: "bottle", label: "Water Bottles", icon: "🍶" },
    { id: "watch", label: "Watches", icon: "⌚" },
    { id: "books_stationery", label: "Books & Geometry", icon: "📐" },
    { id: "accessories", label: "Glasses & Other", icon: "👓" },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foundLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claimingItem) return;

    startTransition(async () => {
      const res = await claimItemAction({
        itemId: claimingItem.id,
        studentName,
        homeroom,
        identifyingMark,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === claimingItem.id
              ? {
                  ...it,
                  status: "claimed_pending",
                  claimedByStudentName: studentName,
                  claimedHomeroom: homeroom,
                  claimNote: identifyingMark,
                }
              : it
          )
        );
        setNotification(res.message);
        setClaimingItem(null);
        setIdentifyingMark("");
        setTimeout(() => setNotification(null), 6000);
      }
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
          <span>🔍</span>
          <span>Zero-Friction Campus Care</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Lost & Found Board
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Items discovered on campus are cataloged with photos by reception staff. Click &quot;Claim&quot; and verify your unique mark to have it delivered to your homeroom.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✅</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            <input
              type="text"
              placeholder="Search by item description, color, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing <strong className="text-slate-800">{filteredItems.length}</strong> items
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="card p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-slate-200/80"
          >
            <div>
              {/* Header Badge & Locker Tag */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.photoEmoji}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status === "available"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.status === "available" ? "🟢 Stored in Locker" : "🟡 Claim In-Progress"}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono font-medium">
                    {item.lockerBin}
                  </div>
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Found Info */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-slate-400">📍 Found:</span>
                  <span className="font-semibold text-slate-800">{item.foundLocation}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-slate-400">📅 Date:</span>
                  <span className="font-medium text-slate-700">{item.foundDate}</span>
                </div>
              </div>

              {item.status === "claimed_pending" && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 mb-4">
                  <div className="font-bold flex items-center gap-1">
                    <span>🏷️ Claimed by:</span>
                    <span>{item.claimedByStudentName} ({item.claimedHomeroom})</span>
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Caretaker dispatch scheduled for tomorrow morning.
                  </div>
                </div>
              )}
            </div>

            {/* Action */}
            <div>
              {item.status === "available" ? (
                <button
                  onClick={() => setClaimingItem(item)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🙋‍♂️</span>
                  <span>This is Mine • Claim Item</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs cursor-not-allowed"
                >
                  Claim Lodged
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="card p-12 text-center text-slate-500">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-base font-bold text-slate-800">No lost items match your search</div>
          <div className="text-xs text-slate-400 mt-1">
            Check back later or inquire directly with the reception desk.
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
                  {claimingItem.photoEmoji}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Claim Lost Item</h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{claimingItem.title}</p>
                </div>
              </div>
              <button
                onClick={() => setClaimingItem(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Child&apos;s Homeroom Section (Delivery Destination)
                </label>
                <input
                  type="text"
                  required
                  value={homeroom}
                  onChange={(e) => setHomeroom(e.target.value)}
                  placeholder="e.g. Class 10 - Section A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identifying Feature / Unique Mark (To prevent false claims)
                </label>
                <textarea
                  required
                  rows={3}
                  value={identifyingMark}
                  onChange={(e) => setIdentifyingMark(e.target.value)}
                  placeholder="Describe scratches, inside label writing, brand details, stickers, or distinctive marks only the owner would know..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                ℹ️ <strong>Delivery Protocol</strong>: Reception caretakers cross-verify the unique mark against locker inventory. Once approved, the item is delivered directly to the child&apos;s desk during the morning roll-call.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  {isPending ? "Confirming..." : "Submit Claim Request →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
