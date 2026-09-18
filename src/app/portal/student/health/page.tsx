"use client";

import { useState, useEffect, useTransition } from "react";
import type { StudentMedicalProfile } from "@/types/self-service";
import { INITIAL_MEDICAL_PROFILE, INITIAL_INFIRMARY_LOGS } from "@/types/self-service";
import {
  getHealthData,
  updateMedicalProfileAction,
} from "@/actions/health";

export default function StudentHealthPage() {
  const [profile, setProfile] = useState<StudentMedicalProfile>(INITIAL_MEDICAL_PROFILE);
  const [logs, setLogs] = useState(INITIAL_INFIRMARY_LOGS);
  const [isEditing, setIsEditing] = useState(false);
  const [allergyInput, setAllergyInput] = useState(profile.knownAllergies.join(", "));
  const [conditionsInput, setConditionsInput] = useState(profile.chronicConditions.join(", "));
  const [pediatricianPhone, setPediatricianPhone] = useState(profile.pediatricianPhone);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getHealthData().then((res) => {
      if (res) {
        if (res.profile) {
          setProfile(res.profile);
          setAllergyInput(res.profile.knownAllergies.join(", "));
          setConditionsInput(res.profile.chronicConditions.join(", "));
          setPediatricianPhone(res.profile.pediatricianPhone);
        }
        if (res.logs && res.logs.length > 0) {
          setLogs(res.logs);
        }
      }
    });
  }, []);

  function handleSaveMedicalProfile(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const updated: StudentMedicalProfile = {
        ...profile,
        knownAllergies: allergyInput.split(",").map((s) => s.trim()).filter(Boolean),
        chronicConditions: conditionsInput.split(",").map((s) => s.trim()).filter(Boolean),
        pediatricianPhone,
      };

      const res = await updateMedicalProfileAction(updated);
      setProfile(updated);
      setIsEditing(false);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 6000);
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-2">
            <span>🩺</span>
            <span>Student Wellness & Infirmary Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Health, Diet & Medical Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain critical allergy profiles, emergency physician contacts, and track real-time infirmary nurse logs.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          {isEditing ? "✕ Cancel Editing" : "✏️ Edit Emergency Profile"}
        </button>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
          <span className="text-lg">✅</span>
          <div className="font-medium flex-1">{notification}</div>
        </div>
      )}

      {/* ── Emergency Health Card ── */}
      <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-rose-800/40 relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-600/30 border border-rose-400/30 flex items-center justify-center text-2xl font-black text-rose-300">
              {profile.bloodGroup}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 block">
                Emergency Medical Card
              </span>
              <h2 className="text-xl font-extrabold text-white">Arjun Reddy (Class 10A)</h2>
              <div className="text-xs text-white/60">Admission No: PRIY-2026-001</div>
            </div>
          </div>

          {/* Active Allergy Alert Badge */}
          <div className="px-4 py-2 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-2 animate-pulse">
            <span>⚠️</span>
            <span>Allergy Flags Active on Faculty Roster</span>
          </div>
        </div>

        {/* Vitals & Emergency Contacts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 block">Blood Group:</span>
            <span className="text-base font-extrabold text-white">{profile.bloodGroup}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 block">Height / Weight:</span>
            <span className="text-base font-extrabold text-white">
              {profile.heightCm} cm • {profile.weightKg} kg
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 block">Pediatrician:</span>
            <span className="font-bold text-white block truncate">{profile.pediatricianName}</span>
            <a href={`tel:${profile.pediatricianPhone}`} className="text-rose-300 hover:underline">
              {profile.pediatricianPhone}
            </a>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-white/50 block">Emergency Parent:</span>
            <span className="font-bold text-white block truncate">{profile.emergencyContactName}</span>
            <a href={`tel:${profile.emergencyContactPhone}`} className="text-emerald-300 hover:underline">
              {profile.emergencyContactPhone}
            </a>
          </div>
        </div>

        {/* Known Allergies & Conditions Chips */}
        <div className="pt-2 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-white/60 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              Known Severe Allergies:
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.knownAllergies.map((a, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-rose-500/30 border border-rose-400/50 text-rose-100 font-bold"
                >
                  🛑 {a}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-white/60 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              Ongoing Medical Directives:
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.chronicConditions.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-semibold"
                >
                  💊 {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Medical Profile Form (Conditional) ── */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900">
            Update Student Medical Profile & Allergies
          </h3>
          <p className="text-xs text-slate-500">
            Any allergy updates here are instantly highlighted to the class teacher and infirmary staff.
          </p>

          <form onSubmit={handleSaveMedicalProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Known Allergies (Comma separated)
              </label>
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder="e.g. Peanuts, Penicillin, Dust, Shellfish"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ongoing Chronic Conditions / Daily Medications
              </label>
              <input
                type="text"
                value={conditionsInput}
                onChange={(e) => setConditionsInput(e.target.value)}
                placeholder="e.g. Mild Asthma (carries Salbutamol inhaler in school bag)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Family Pediatrician Emergency Phone
              </label>
              <input
                type="text"
                value={pediatricianPhone}
                onChange={(e) => setPediatricianPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                Push Update to Faculty Roster & Infirmary →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Chronological Infirmary Visit Logs ── */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            School Infirmary & Nurse Care Logs
          </h2>
          <p className="text-xs text-slate-500">
            Real-time chronological timeline of first-aid, medications, and temperature checks administered on campus.
          </p>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🩺</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{log.symptoms}</h3>
                    <div className="text-xs text-slate-500">
                      Attending Nurse: <strong>{log.nurseName}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 self-start sm:self-auto">
                  <div className="font-bold text-slate-800">{log.visitDate} • {log.visitTime}</div>
                  {log.parentAlertDispatched && (
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      ✓ Parent notified via WhatsApp
                    </span>
                  )}
                </div>
              </div>

              {/* Vitals & Medication */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">
                    Recorded Vitals:
                  </span>
                  <div className="font-bold text-slate-900">
                    Temperature: <span className="text-rose-600">{log.vitals.tempF}</span> • Pulse: {log.vitals.pulseBpm}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">
                    First Aid / Medication Administered:
                  </span>
                  <div className="font-bold text-slate-900">{log.medicationGiven}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium">
                <strong>Outcome:</strong> {log.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
