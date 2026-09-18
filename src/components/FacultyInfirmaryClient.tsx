"use client";

import { useState } from "react";
import { InfirmaryIncidentReport, StudentRosterItem } from "@/types/faculty";
import { reportInfirmaryIncidentAction } from "@/actions/faculty";

interface Props {
  initialReports: InfirmaryIncidentReport[];
  students: StudentRosterItem[];
}

export default function FacultyInfirmaryClient({ initialReports, students }: Props) {
  const [reports, setReports] = useState<InfirmaryIncidentReport[]>(initialReports);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [incidentType, setIncidentType] = useState<InfirmaryIncidentReport["incidentType"]>("playground_injury");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "urgent">("mild");
  const [locationDetails, setLocationDetails] = useState("Playground / Basketball Court");
  const [symptoms, setSymptoms] = useState("");
  const [firstAidGiven, setFirstAidGiven] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim() || !firstAidGiven.trim()) {
      alert("Please provide symptoms and first-aid administered.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await reportInfirmaryIncidentAction({
        studentId: selectedStudentId,
        incidentType,
        locationDetails,
        symptoms: symptoms.trim(),
        firstAidGiven: firstAidGiven.trim(),
        severity,
      });

      if (res.success && res.report) {
        setReports((prev) => [res.report, ...prev]);
        setFeedback(res.message);
        setSymptoms("");
        setFirstAidGiven("");
      }
    } catch {
      alert("Failed to record incident.");
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
            Faculty Workspace &middot; Student Health &amp; Emergency Response
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            🏥 Physical Trauma &amp; Infirmary Incident Logger
          </h1>
          <p className="text-white/70 text-xs mt-0.5">
            Report playground scrapes, faints, or sports injuries instantly. Syncs with the School Nurse vault and pushes automated WhatsApp alerts to parents.
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
        {/* Logger Form */}
        <div className="lg:col-span-6 card">
          <div className="card-header">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Log Trauma or Infirmary Visit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mobile-optimized report form for playground, PE, assembly, or classroom incidents.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Student Affected *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="input text-xs w-full font-semibold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    Roll #{s.rollNo} — {s.fullName} ({s.parentPhone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Incident Type</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as any)}
                  className="input text-xs w-full"
                >
                  <option value="playground_injury">Playground Scrape / Cut / Sprain</option>
                  <option value="fainting_dizziness">Fainting / Heat Exhaustion</option>
                  <option value="allergy_flare">Allergic Reaction / Asthma Flare</option>
                  <option value="stomach_pain">Acute Stomach Pain / Nausea</option>
                  <option value="other">Other Physical Distress</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Severity Tier</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="input text-xs w-full font-semibold"
                >
                  <option value="mild">Mild (Rested, returned to class)</option>
                  <option value="moderate">Moderate (Nurse monitored)</option>
                  <option value="urgent">Urgent (Parent pickup requested)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Incident Location</label>
              <input
                type="text"
                required
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="input text-xs w-full"
                placeholder="e.g. Cricket pitch / Assembly courtyard / Science Lab Table 4"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms &amp; Observations *</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Complained of dizziness after 100m sprint. Slight pale complexion, normal pulse."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="input text-xs w-full resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First-Aid Administered *</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Made student sit in shade with ORS electrolyte hydration. Accompanied to school infirmary."
                value={firstAidGiven}
                onChange={(e) => setFirstAidGiven(e.target.value)}
                className="input text-xs w-full resize-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2 font-medium">
              <span className="text-base">⚡</span>
              <span>
                <strong>Automated Multi-Channel Dispatch:</strong> Submitting this instantly alerts Sister Anitha (School Nurse) and pushes an official WhatsApp notification to {selectedStudent?.parentPhone}.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {submitting ? "Logging Incident & Sending Alerts..." : "✓ Log Trauma Report & Dispatch WhatsApp Alert"}
            </button>
          </form>
        </div>

        {/* Incident History */}
        <div className="lg:col-span-6 card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                Active Infirmary &amp; Incident Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {reports.length} recorded incidents this term
              </p>
            </div>
            <span className="badge badge-green">Nurse Synced</span>
          </div>

          <div className="card-body space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{r.studentName}</span>
                    <span className="text-xs text-slate-500 ml-1.5">({r.classGrade} &middot; Roll #{r.rollNo})</span>
                  </div>
                  <span
                    className={`badge ${
                      r.severity === "urgent" ? "badge-rose" : r.severity === "moderate" ? "badge-amber" : "badge-green"
                    }`}
                  >
                    {r.severity.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <div><strong className="text-slate-900">Location:</strong> {r.locationDetails}</div>
                  <div><strong className="text-slate-900">Symptoms:</strong> {r.symptoms}</div>
                  <div><strong className="text-slate-900">Action:</strong> {r.firstAidGiven}</div>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reported: {r.reportedAt} by {r.reportedByTeacher}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span>💬</span> WhatsApp Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
