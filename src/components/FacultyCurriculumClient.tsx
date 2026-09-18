"use client";

import { useState, useTransition } from "react";
import { UnitPlan, LearningOutcomeItem } from "@/types/faculty";
import { syncUnitPlanAction } from "@/actions/faculty";

interface Props {
  initialUnitPlans: UnitPlan[];
  nepAttainmentAvg: number;
  coTeachersSyncedCount: number;
}

export default function FacultyCurriculumClient({
  initialUnitPlans,
  nepAttainmentAvg,
  coTeachersSyncedCount,
}: Props) {
  const [unitPlans, setUnitPlans] = useState<UnitPlan[]>(initialUnitPlans);
  const [selectedUnit, setSelectedUnit] = useState<UnitPlan>(initialUnitPlans[0]);
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New resource form state
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState<"video" | "simulation" | "worksheet" | "slide_deck">("video");

  const handleSyncResource = () => {
    if (!resourceTitle || !resourceUrl) return;
    startTransition(async () => {
      const res = await syncUnitPlanAction({
        unitId: selectedUnit.id,
        newResourceTitle: resourceTitle,
        newResourceUrl: resourceUrl,
        resourceType: resourceType,
      });
      if (res.success) {
        setNotification(res.message);
        setSelectedUnit((prev) => ({
          ...prev,
          digitalResources: [
            ...prev.digitalResources,
            { title: resourceTitle, url: resourceUrl, type: resourceType },
          ],
          coTeachers: prev.coTeachers.map((ct) => ({ ...ct, lastSyncedAt: "Just now (Synced)" })),
        }));
        setModalOpen(false);
        setResourceTitle("");
        setResourceUrl("");
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  const getBloomBadgeClass = (bloom: string) => {
    switch (bloom) {
      case "Remembering": return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
      case "Understanding": return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20";
      case "Applying": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case "Analyzing": return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
      case "Evaluating": return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
      case "Creating": return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                NEP 2020 Compliant
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-white/80">
                Outcome-Based Education (OBE)
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Collaborative Unit Planner & Curriculum Hub
            </h1>
            <p className="text-white/70 text-xs mt-1 max-w-xl">
              Co-author multi-section lesson units with real-time sync across Grade 10-A and 10-B. Every unit is aligned with Bloom&apos;s Taxonomy and CBSE pedagogical standards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-amber-300">{nepAttainmentAvg}%</div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">OBE Attainment</div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <span>➕</span>
              <span>Sync New Resource</span>
            </button>
          </div>
        </div>
      </div>

      {/* Co-Teacher Sync Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-base">
            🤝
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Co-Teacher Section Synchronization</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Curriculum updates made here automatically mirror to all co-teachers in real time.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedUnit.coTeachers.map((ct) => (
            <div key={ct.section} className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/80 text-[11px] flex items-center gap-2">
              <span className="font-bold text-foreground">{ct.section}:</span>
              <span className="text-muted-foreground">{ct.teacherName}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">({ct.lastSyncedAt})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Details & Learning Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unit Objectives & Bloom Outcomes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{selectedUnit.subject} • {selectedUnit.grade}</span>
                <h2 className="text-base font-bold text-foreground mt-0.5">{selectedUnit.title}</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Duration: {selectedUnit.targetDurationWeeks} Weeks
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Core Unit Objectives</h3>
              <ul className="mt-2 space-y-1.5">
                {selectedUnit.objectives.map((obj, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bloom's Taxonomy Learning Outcomes Table */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Outcome-Based Learning Indicators (Bloom&apos;s Taxonomy)</h3>
                <p className="text-[11px] text-muted-foreground">Formally mapped against NEP 2020 Foundational & Critical Thinking Rubrics.</p>
              </div>
              <span className="text-[11px] font-semibold text-purple-600">{selectedUnit.learningOutcomes.length} Outcomes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Outcome Description</th>
                    <th className="py-2.5 px-3">Bloom&apos;s Level</th>
                    <th className="py-2.5 px-3">NEP Pillar</th>
                    <th className="py-2.5 px-3 text-right">Attainment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedUnit.learningOutcomes.map((lo) => (
                    <tr key={lo.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-purple-600">{lo.code}</td>
                      <td className="py-3 px-3 text-foreground font-medium">{lo.description}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBloomBadgeClass(lo.bloomLevel)}`}>
                          {lo.bloomLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">{lo.nep2020Pillar}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                lo.attainedPercent >= 80 ? "bg-emerald-500" : lo.attainedPercent >= 60 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${lo.attainedPercent}%` }}
                            />
                          </div>
                          <span className="font-bold text-foreground w-8">{lo.attainedPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Shared Digital Teaching Resources */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Synchronized Class Resources</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Shared 10-A & 10-B
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Resources linked here appear immediately on the lesson projector and student self-study vaults.
            </p>

            <div className="space-y-3">
              {selectedUnit.digitalResources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all flex items-start gap-3 group block"
                >
                  <span className="text-xl">
                    {res.type === "video" ? "📺" : res.type === "simulation" ? "🧪" : res.type === "worksheet" ? "📄" : "📑"}
                  </span>
                  <div className="overflow-hidden flex-1">
                    <div className="text-xs font-semibold text-foreground group-hover:text-purple-600 transition-colors truncate">
                      {res.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                      {res.type.replace("_", " ")}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:translate-x-0.5 transition-transform">↗</span>
                </a>
              ))}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full mt-4 py-2 rounded-lg border border-dashed border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-xs font-bold transition-colors"
            >
              + Add Shared Video or Simulation
            </button>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Assessment Strategy</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {selectedUnit.assessmentPlan}
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add Shared Resource */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Add Synchronized Curriculum Resource</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>
            <p className="text-xs text-muted-foreground">
              This resource will immediately synchronize to Mr. Satish Kumar&apos;s Class 10-B portal and the school lesson projector.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube: Deriving Quadratic Roots Visually"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Link URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Content Type</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                >
                  <option value="video">📺 Educational Video (YouTube / Khan Academy)</option>
                  <option value="simulation">🧪 Interactive Simulator (Geogebra / PhET)</option>
                  <option value="worksheet">📄 Problem Worksheet (PDF)</option>
                  <option value="slide_deck">📑 Presentation Deck (Google Slides)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSyncResource}
                disabled={isPending || !resourceTitle || !resourceUrl}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isPending ? "Syncing..." : "Sync Across All Sections"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
