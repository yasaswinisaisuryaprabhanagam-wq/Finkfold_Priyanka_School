"use client";

import { useState, useTransition } from "react";
import { MaintenanceTicket } from "@/types/faculty";
import { createMaintenanceTicketAction } from "@/actions/faculty";

interface Props {
  initialTickets: MaintenanceTicket[];
}

export default function FacultyMaintenanceClient({ initialTickets }: Props) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Room 204 (Grade 10-A)");
  const [category, setCategory] = useState<MaintenanceTicket["category"]>("HVAC / Air Conditioning");
  const [severity, setSeverity] = useState<MaintenanceTicket["severity"]>("medium");
  const [description, setDescription] = useState("");

  const handleCreateTicket = () => {
    if (!title || !description) return;
    startTransition(async () => {
      const res = await createMaintenanceTicketAction({
        title,
        location,
        category,
        severity,
        description,
      });
      if (res.success && res.ticket) {
        setTickets((prev) => [res.ticket!, ...prev]);
        setNotification(res.message);
        setModalOpen(false);
        setTitle("");
        setDescription("");
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  const getStatusBadge = (status: MaintenanceTicket["status"]) => {
    switch (status) {
      case "resolved":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">✓ Resolved</span>;
      case "technician_in_progress":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">⚙️ In Progress</span>;
      case "assigned":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">👤 Technician Assigned</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">⏳ Pending Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>🛠️</span>
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
                Campus Estate &amp; Maintenance Helpdesk
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                SLA-Tracked Facility Repairs
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Campus Maintenance Ticketing &amp; Repairs
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Report leaking ACs, flickering projectors, or broken desks directly to the Estate Manager. Track technician assignments and resolution progress without chasing janitors.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>➕</span>
            <span>Report Facility Issue</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Active Campus Work Orders</h3>
          <span className="text-[11px] text-muted-foreground">{tickets.length} Logged Tickets</span>
        </div>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-amber-600">#{t.id}</span>
                  <h4 className="text-xs font-bold text-foreground">{t.title}</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    {t.category}
                  </span>
                </div>
                <div>{getStatusBadge(t.status)}</div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex items-center gap-3">
                  <span>📍 Location: <strong className="text-foreground">{t.location}</strong></span>
                  <span>•</span>
                  <span>Reported: {t.reportedAt}</span>
                </div>
                {t.assignedTechnician && (
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span>🔧</span>
                    <span>Assigned: {t.assignedTechnician}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Report Issue */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Report Maintenance or Facility Issue</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Split AC leaking water continuously"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                  >
                    <option value="low">🟢 Low (Cosmetic / Noise)</option>
                    <option value="medium">🟡 Medium (Affects Class)</option>
                    <option value="high">🟠 High (Direct Disruption)</option>
                    <option value="emergency">🔴 Emergency (Electrical / Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                >
                  <option value="HVAC / Air Conditioning">HVAC / Air Conditioning</option>
                  <option value="Electrical & Projector">Electrical & Projector / Smart Board</option>
                  <option value="Plumbing">Plumbing & Restroom</option>
                  <option value="Carpentry & Desks">Carpentry & Broken Desks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the exact location and symptoms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                />
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
                onClick={handleCreateTicket}
                disabled={isPending || !title || !description}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold disabled:opacity-50"
              >
                {isPending ? "Logging..." : "Log Maintenance Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
