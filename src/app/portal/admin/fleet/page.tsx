"use client";

import { useState } from "react";

interface Bus {
  id: string;
  routeNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  speedKmH: number;
  studentsOnboard: number;
  capacity: number;
  currentLocation: string;
  nextStop: string;
  etaMins: number;
  status: "on_time" | "delayed" | "overspeeding" | "idle";
}

interface GateSwipe {
  id: string;
  name: string;
  role: "student" | "faculty" | "visitor";
  idOrAdmission: string;
  gate: string;
  action: "entry" | "exit";
  time: string;
  alert?: string;
}

const INITIAL_BUSES: Bus[] = [
  { id: "b-04", routeNumber: "Route 04", driverName: "K. Venkateswarlu", driverPhone: "+91 94401 23412", vehicleNumber: "AP 26 TE 4821", speedKmH: 34, studentsOnboard: 28, capacity: 32, currentLocation: "Trunk Road Circle", nextStop: "Santhi Nagar Circle", etaMins: 4, status: "on_time" },
  { id: "b-07", routeNumber: "Route 07", driverName: "M. Subbaiah", driverPhone: "+91 98480 91823", vehicleNumber: "AP 26 TE 9104", speedKmH: 26, studentsOnboard: 18, capacity: 30, currentLocation: "Magunta Layout Main Road", nextStop: "Children's Park", etaMins: 7, status: "on_time" },
  { id: "b-02", routeNumber: "Route 02", driverName: "R. Narayana", driverPhone: "+91 79810 44551", vehicleNumber: "AP 26 TE 1102", speedKmH: 52, studentsOnboard: 24, capacity: 32, currentLocation: "Bypass Flyover", nextStop: "Vedayapalem", etaMins: 11, status: "overspeeding" },
  { id: "b-09", routeNumber: "Route 09", driverName: "S. Ravi Teja", driverPhone: "+91 82472 88712", vehicleNumber: "AP 26 TE 3309", speedKmH: 14, studentsOnboard: 12, capacity: 25, currentLocation: "Railway Feeder Road", nextStop: "RTC Bus Stand", etaMins: 16, status: "delayed" },
];

const INITIAL_GATE_SWIPES: GateSwipe[] = [
  { id: "g-1", name: "Kiran Kumar", role: "student", idOrAdmission: "PRIY-2026-001 (10-A)", gate: "Main Turnstile 01", action: "entry", time: "08:04 AM" },
  { id: "g-2", name: "Mrs. Priyanka Devi", role: "faculty", idOrAdmission: "EMP-MATH-01", gate: "Faculty Gate 02", action: "entry", time: "08:08 AM" },
  { id: "g-3", name: "Yasaswini S.", role: "student", idOrAdmission: "PRIY-2026-002 (10-A)", gate: "Main Turnstile 02", action: "entry", time: "08:12 AM" },
  { id: "g-4", name: "Kethan Reddy", role: "student", idOrAdmission: "PRIY-2026-003 (10-A)", gate: "Main Turnstile 01", action: "exit", time: "01:15 PM", alert: "⚠️ Exit with Approved Doctor Out-Pass" },
  { id: "g-5", name: "Unrecognized Visitor", role: "visitor", idOrAdmission: "TEMP-VISITOR-901", gate: "Security Gate 03", action: "entry", time: "10:45 AM", alert: "Visiting Bursar Office" },
];

export default function AdminFleetRadarPage() {
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [swipes, setSwipes] = useState<GateSwipe[]>(INITIAL_GATE_SWIPES);
  const [activeTab, setActiveTab] = useState<"fleet" | "gate">("fleet");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wide">
                Section 2: Smart Campus Logistics
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Live GPS Telematics &amp; Perimeter Security
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Live Fleet Radar &amp; RFID Gate Control
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-2xl">
              Control tower overview: 15 school transport vehicles tracked in real time, speed adherence alerts, and real-time biometric turnstile event stream at campus perimeters.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveTab("fleet")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "fleet" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              GPS Fleet Radar (15 Buses)
            </button>
            <button
              onClick={() => setActiveTab("gate")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "gate" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Turnstile / Gate Sync
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Buses On Transit</div>
          <div className="text-2xl font-black text-slate-900 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>15 / 15</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">All GPS Transponders Active</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Students Onboard</div>
          <div className="text-2xl font-black text-sky-600 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>384</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">QR Boarding Pass Scanned</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Speed Violations</div>
          <div className="text-2xl font-black text-rose-600 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>1</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Bus 02: 52 km/h on Flyover</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gate Swipes Today</div>
          <div className="text-2xl font-black text-purple-600 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>842</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Zero perimeter breaches</div>
        </div>
      </div>

      {/* TAB 1: Live GPS Fleet Radar */}
      {activeTab === "fleet" && (
        <div className="space-y-4">
          {/* Simulated Map Container */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Live Campus Telematics Map Overlay</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time GPS coordinates stream updating every 3 seconds via 4G onboard transponders.</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Satellite Stream Connected
              </span>
            </div>

            {/* Visual Radar Mockup */}
            <div className="h-64 rounded-xl bg-slate-900 relative overflow-hidden border border-slate-800 flex items-center justify-center p-6 text-white">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Bus Pins */}
              <div className="absolute top-1/4 left-1/3 flex items-center gap-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 shadow-lg animate-bounce">
                <span className="text-lg">🚌</span>
                <div className="text-[10px]">
                  <div className="font-bold text-emerald-300">Bus 04 (AP 26 TE 4821)</div>
                  <div className="text-white/70">34 km/h • Trunk Road • 24 Students</div>
                </div>
              </div>

              <div className="absolute bottom-1/3 right-1/4 flex items-center gap-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 shadow-lg">
                <span className="text-lg">🚌</span>
                <div className="text-[10px]">
                  <div className="font-bold text-emerald-300">Bus 07 (AP 26 TE 9104)</div>
                  <div className="text-white/70">26 km/h • Magunta Layout • 18 Students</div>
                </div>
              </div>

              <div className="absolute top-1/3 right-1/3 flex items-center gap-2 p-2 rounded-lg bg-rose-950/90 border border-rose-500/80 shadow-lg">
                <span className="text-lg">⚠️</span>
                <div className="text-[10px]">
                  <div className="font-bold text-rose-300">Bus 02 (AP 26 TE 1102)</div>
                  <div className="text-rose-200">52 km/h (Overspeeding) • Bypass Flyover</div>
                </div>
              </div>

              <div className="text-center space-y-1 relative z-10 pointer-events-none">
                <div className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: "Outfit, sans-serif" }}>Priyanka EM School Fleet Radar</div>
                <div className="text-xs text-sky-400">Lat: 14.4426° N • Long: 79.9865° E (Nellore Zone)</div>
              </div>
            </div>
          </div>

          {/* Vehicle Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Active Bus Fleet Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Route</th>
                    <th className="pb-3">Vehicle / Plate</th>
                    <th className="pb-3">Driver &amp; Mobile</th>
                    <th className="pb-3">Telemetry Speed</th>
                    <th className="pb-3">Students Onboard</th>
                    <th className="pb-3">Current Location</th>
                    <th className="pb-3">Next Stop (ETA)</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-extrabold text-slate-900">{b.routeNumber}</td>
                      <td className="py-3 font-mono text-slate-700">{b.vehicleNumber}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">{b.driverName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.driverPhone}</div>
                      </td>
                      <td className="py-3">
                        <span className={`font-bold font-mono ${b.speedKmH > 40 ? "text-rose-600" : "text-emerald-700"}`}>
                          {b.speedKmH} km/h
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">{b.studentsOnboard} / {b.capacity}</td>
                      <td className="py-3 text-slate-600">{b.currentLocation}</td>
                      <td className="py-3 text-slate-800 font-medium">
                        {b.nextStop} <span className="text-amber-700 font-bold">({b.etaMins}m)</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === "on_time"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "overspeeding"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {b.status === "on_time" ? "✓ On Schedule" : b.status === "overspeeding" ? "⚠️ Overspeeding" : "⏳ 8m Delayed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RFID Turnstile & Gate Sync */}
      {activeTab === "gate" && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Perimeter Turnstiles &amp; Gate RFID Stream</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live real-time stream of student smart cards and faculty biometric access at all 3 campus gates.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Auto-Sync: Active (100ms)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {swipes.map((s) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    s.action === "entry" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}>
                    {s.action === "entry" ? "IN" : "OUT"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500">{s.idOrAdmission} • Gate: {s.gate}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800">{s.time}</div>
                  {s.alert && (
                    <div className="text-[10px] font-semibold text-amber-700">{s.alert}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
