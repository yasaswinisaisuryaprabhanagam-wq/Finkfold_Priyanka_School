"use client";

import { useState } from "react";
import { addCircularAction, deleteCircularAction } from "@/actions/circulars";
import { CircularItem } from "@/lib/circularsStore";

const CATEGORIES = ["Event", "Exam", "Library", "Sports", "Finance", "General"];

const categoryColors: Record<string, string> = {
  Event: "bg-purple-100 text-purple-800 border-purple-200",
  Exam: "bg-rose-100 text-rose-800 border-rose-200",
  Library: "bg-blue-100 text-blue-800 border-blue-200",
  Sports: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Finance: "bg-amber-100 text-amber-800 border-amber-200",
  General: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function CircularsManager({
  initialCirculars,
  canCreate = true,
  portal = "admin",
}: {
  initialCirculars: CircularItem[];
  canCreate?: boolean;
  portal?: "admin" | "faculty";
}) {
  const [circulars, setCirculars] = useState<CircularItem[]>(initialCirculars);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [urgent, setUrgent] = useState(false);
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const filteredCirculars = circulars.filter((c) => {
    if (filterCategory === "All") return true;
    if (filterCategory === "Urgent") return c.urgent;
    return c.category === filterCategory;
  });

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFeedback({ text: "Please enter title and description.", isError: true });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await addCircularAction({
        title: title.trim(),
        category,
        urgent,
        description: description.trim(),
        publishDate,
      });

      if (res.success && res.circular) {
        setCirculars((prev) => [res.circular!, ...prev]);
        setFeedback({ text: "Circular published successfully! It is now live in the student portal." });
        setTitle("");
        setDescription("");
        setUrgent(false);
        setTimeout(() => setShowCreateModal(false), 800);
      } else {
        setFeedback({ text: res.message || "Failed to publish circular.", isError: true });
      }
    } catch (err: any) {
      setFeedback({ text: err?.message || "Error publishing circular.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this circular notice?")) return;
    try {
      const res = await deleteCircularAction(id);
      if (res.success) {
        setCirculars((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(res.message);
      }
    } catch {
      alert("Failed to delete circular.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "Urgent", ...CATEGORIES].map((cat) => {
            const isSelected = filterCategory === cat;
            const count =
              cat === "All"
                ? circulars.length
                : cat === "Urgent"
                ? circulars.filter((c) => c.urgent).length
                : circulars.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{cat === "Urgent" ? "🔔 Urgent" : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2 flex-shrink-0 cursor-pointer"
          >
            <span>📢</span>
            <span>Publish Circular</span>
          </button>
        )}
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.length === 0 ? (
          <div className="card p-10 text-center bg-slate-50 border-dashed border-slate-200">
            <div className="text-4xl mb-2">📢</div>
            <div className="text-sm font-bold text-slate-700">No Circulars Found</div>
            <p className="text-xs text-slate-400 mt-1">
              No circulars match the selected category.
            </p>
          </div>
        ) : (
          filteredCirculars.map((c) => (
            <div
              key={c.id}
              className={`card p-5 transition-all hover:shadow-md ${
                c.urgent ? "border-l-4 border-amber-400" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {c.urgent && (
                    <span className="badge badge-amber text-[10px] font-bold">
                      🔔 Urgent
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      categoryColors[c.category] || categoryColors.General
                    }`}
                  >
                    {c.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {c.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(c.publish_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete circular"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {c.description}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Publish Circular Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  📢 Publish School Circular
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notice will be immediately published to student & parent dashboards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  feedback.isError
                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Day Celebrations 2026"
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
                    onChange={(e) => setCategory(e.target.value)}
                    className="input text-xs w-full"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="input text-xs w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="urgentNotice" className="text-xs font-bold text-amber-900 cursor-pointer">
                  🔔 Mark as Urgent Notice (Highlighted on student dashboard)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notice Details / Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the full message, guidelines, dates, and instructions for parents & students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input text-xs w-full resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary text-xs font-bold px-5 py-2 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span> Publishing...
                    </>
                  ) : (
                    <>
                      <span>📢 Publish Notice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
