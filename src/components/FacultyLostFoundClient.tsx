"use client";

import { useState } from "react";
import { LostFoundItem } from "@/types/self-service";
import { snapUploadLostFoundItemAction } from "@/actions/faculty";

interface Props {
  initialItems: LostFoundItem[];
}

export default function FacultyLostFoundClient({ initialItems }: Props) {
  const [items, setItems] = useState<LostFoundItem[]>(initialItems);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<LostFoundItem["category"]>("clothing");
  const [foundLocation, setFoundLocation] = useState("Room 101 (Mathematics)");
  const [lockerBin, setLockerBin] = useState("Bin A-04 (Reception Store)");
  const [photoEmoji, setPhotoEmoji] = useState("🧥");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const emojiOptions = [
    { emoji: "🧥", label: "Uniform / Jacket" },
    { emoji: "🍶", label: "Water Bottle" },
    { emoji: "⌚", label: "Watch" },
    { emoji: "📐", label: "Geometry Box" },
    { emoji: "👓", label: "Eyeglasses" },
    { emoji: "🎒", label: "School Bag" },
    { emoji: "📱", label: "Electronic Device" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please provide title and description.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await snapUploadLostFoundItemAction({
        title: title.trim(),
        category,
        description: description.trim(),
        foundLocation: foundLocation.trim(),
        lockerBin: lockerBin.trim(),
        photoEmoji,
      });

      if (res.success && res.item) {
        setItems((prev) => [res.item, ...prev]);
        setFeedback(res.message);
        setTitle("");
        setDescription("");
      }
    } catch {
      alert("Failed to upload item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c2d5a 0%, #1a4d8f 50%, #2060b0 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            Faculty Workspace &middot; Campus Lost &amp; Found
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🎒 Lost &amp; Found &ldquo;Snap &amp; Upload&rdquo; Desk
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Found an item left behind after class? Snap and tag it here in 10 seconds to publish it directly to parents&apos; mobile portals.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-6 card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Quick Upload Item Found on Campus
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Item will immediately show up on parents&apos; digital claim board.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Navy Blue Cardigan / Milton Black Flask"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-xs w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="input text-xs w-full"
                >
                  <option value="clothing">Uniforms &amp; Clothing</option>
                  <option value="bottle">Water Bottles &amp; Flasks</option>
                  <option value="watch">Watches &amp; Fitness Bands</option>
                  <option value="books_stationery">Books &amp; Geometry Boxes</option>
                  <option value="accessories">Eyeglasses &amp; Accessories</option>
                  <option value="other">Other Campus Articles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visual Tag Icon</label>
                <select
                  value={photoEmoji}
                  onChange={(e) => setPhotoEmoji(e.target.value)}
                  className="input text-xs w-full"
                >
                  {emojiOptions.map((o) => (
                    <option key={o.emoji} value={o.emoji}>
                      {o.emoji} {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Found Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 101 Table 4 / Pavilion"
                  value={foundLocation}
                  onChange={(e) => setFoundLocation(e.target.value)}
                  className="input text-xs w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deposited Storage Bin</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bin A-04 / Reception Safe"
                  value={lockerBin}
                  onChange={(e) => setLockerBin(e.target.value)}
                  className="input text-xs w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Identifying Marks / Description *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Size 32 woolen blazer, 'Arjun' written faintly in collar tag..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input text-xs w-full resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {submitting ? "Uploading Item..." : "✓ Publish to Student & Parent Board"}
            </button>
          </form>
        </div>

        {/* Live Catalog Feed */}
        <div className="lg:col-span-6 card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Active Lost &amp; Found Catalog
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {items.length} items logged campus-wide
              </p>
            </div>
            <span className="badge badge-blue">Live Sync</span>
          </div>

          <div className="card-body space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                  {item.photoEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                    <span
                      className={`badge ${
                        item.status === "available" ? "badge-green" : item.status === "claimed_pending" ? "badge-amber" : "badge-slate"
                      }`}
                    >
                      {item.status === "available" ? "Unclaimed" : item.status === "claimed_pending" ? "Claim Pending" : "Returned"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>📍 {item.foundLocation}</span>
                    <span>📦 {item.lockerBin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
