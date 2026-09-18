"use client";

import { useState, useTransition } from "react";
import {
  INITIAL_ROUTES,
  subscribeRouteAction,
  toggleBusOptOutAction,
  simulateBoardingScanAction,
} from "@/actions/transport";

export default function StudentTransportPage() {
  const [routes] = useState(INITIAL_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState("route-04");
  const [selectedStopId, setSelectedStopId] = useState("s-04-3");
  const [optedOut, setOptedOut] = useState(false);
  const [lastBoarded, setLastBoarded] = useState("08:04 AM Today");
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const activeStop = activeRoute.stops.find((s) => s.id === selectedStopId) || activeRoute.stops[0];

  function handleSubscribe(stopId: string) {
    setSelectedStopId(stopId);
    startTransition(async () => {
      const res = await subscribeRouteAction(selectedRouteId, stopId);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 4000);
    });
  }

  function handleToggleOptOut() {
    const nextVal = !optedOut;
    setOptedOut(nextVal);
    startTransition(async () => {
      const res = await toggleBusOptOutAction(nextVal);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  function handleBoardingScan() {
    startTransition(async () => {
      const res = await simulateBoardingScanAction(activeRoute.busNumber);
      setLastBoarded(`Just now (${res.scannedAt})`);
      setNotification(res.message);
      setTimeout(() => setNotification(null), 5000);
    });
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
          <span>🚌</span>
          <span>Self-Service Commute & Logistics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Smart Transport & Safe-Ride
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dynamic route subscription, live bus GPS tracking, and QR boarding passes.
        </p>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in duration-200 shadow-sm">
          <span className="text-lg">✅</span>
          <div className="font-medium flex-1">{notification}</div>
        </div>
      )}

      {/* ── Grid: Live Map Tracking & Boarding Pass ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Tracking Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Live Safe-Ride Status
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {activeRoute.routeNumber} ({activeRoute.busNumber})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live GPS Active
              </span>
            </div>
          </div>

          {/* Simulated Interactive Route Map */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-6 border border-slate-800 min-h-[220px] flex flex-col justify-between">
            {/* Background grid visual */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
              <div>📍 Current Route: {activeRoute.routeName}</div>
              <div className="font-mono text-amber-400 font-bold">
                SPEED: {activeRoute.currentGps.speedKmH} km/h • {activeRoute.currentGps.heading}
              </div>
            </div>

            {/* Stepper stops line */}
            <div className="relative z-10 py-6">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(activeRoute.currentStopIndex / (activeRoute.stops.length - 1)) * 100}%` }}
                />

                {activeRoute.stops.map((stop, i) => {
                  const isPassed = i < activeRoute.currentStopIndex;
                  const isCurrent = i === activeRoute.currentStopIndex;
                  const isSelected = stop.id === selectedStopId;

                  return (
                    <div key={stop.id} className="relative z-10 flex flex-col items-center group">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-110"
                            : isPassed
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-600"
                        }`}
                      >
                        {isCurrent ? "🚌" : i + 1}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-2 max-w-[80px] text-center leading-tight truncate ${
                          isSelected ? "text-amber-300 font-bold" : "text-slate-300"
                        }`}
                      >
                        {stop.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div>
                Driver: <strong className="text-white">{activeRoute.driverName}</strong> ({activeRoute.driverPhone})
              </div>
              <div className="text-right">
                Next Stop: <strong className="text-amber-300">{activeRoute.stops[activeRoute.currentStopIndex]?.name}</strong>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 block">Estimated Arrival</span>
              <span className="text-lg font-extrabold text-blue-900">7 Mins</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 block">Bus Occupancy</span>
              <span className="text-lg font-extrabold text-slate-900">
                {activeRoute.currentBoarded} / {activeRoute.capacity}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 block">Last Boarded</span>
              <span className="text-sm font-bold text-emerald-700">{lastBoarded}</span>
            </div>
          </div>
        </div>

        {/* Right: Digital Boarding Pass & Opt-Out */}
        <div className="lg:col-span-5 space-y-6">
          {/* Boarding Pass Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                  Official Transit Pass
                </span>
                <h3 className="text-lg font-bold text-white">Student Boarding QR</h3>
              </div>
              <span className="text-2xl">🎫</span>
            </div>

            {/* QR Mock */}
            <div className="bg-white text-slate-950 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner space-y-2">
              <div className="h-32 w-32 border-4 border-slate-900 p-2 rounded-xl flex items-center justify-center bg-slate-50 relative">
                {/* Visual SVG QR Code */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="font-mono text-xs font-extrabold text-slate-900 tracking-wider">
                QR-BUS-PRIY-2026-001
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Scan when stepping onto the bus. Dispatches safe boarding alert to parents.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
              <span>Assigned Stop:</span>
              <strong className="text-amber-300 font-semibold">{activeStop.name}</strong>
            </div>

            {/* Simulate Boarding scan */}
            <button
              onClick={handleBoardingScan}
              disabled={isPending}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📲</span>
              <span>Test Boarding Scan (Simulate Bus Ingress)</span>
            </button>
          </div>

          {/* Daily Opt-Out Toggle ("Not taking bus today") */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daily Manifest Status
                </h3>
                <p className="text-xs text-slate-500">
                  Picking child up personally today? Notify the driver so the bus doesn't wait.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleOptOut}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  optedOut ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    optedOut ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                optedOut
                  ? "bg-amber-50 border border-amber-200 text-amber-900"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-900"
              }`}
            >
              {optedOut ? (
                <span>
                  ⚠️ <strong>Self-Pickup Active:</strong> Bus driver manifest updated. Bus will skip your stop today.
                </span>
              ) : (
                <span>
                  ✅ <strong>Active on Bus Manifest:</strong> Bus will pick up your child at {activeStop.pickupTime}.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Route Subscription & Stop Selection ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Available School Bus Routes & Stops
          </h2>
          <p className="text-xs text-slate-500">
            Select your route and nearest pickup stop. Distance-based fees are automatically appended to your school fee ledger.
          </p>
        </div>

        {/* Route Tabs */}
        <div className="flex flex-wrap gap-2">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRouteId(route.id);
                setSelectedStopId(route.stops[0].id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRouteId === route.id
                  ? "bg-blue-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {route.routeNumber}: {route.routeName.split("•")[0].trim()}
            </button>
          ))}
        </div>

        {/* Stops Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Stop Name</th>
                <th className="py-3 px-4">Morning Pickup</th>
                <th className="py-3 px-4">Evening Drop</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Term Fee</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeRoute.stops.map((stop) => {
                const isCurrent = stop.id === selectedStopId;
                return (
                  <tr key={stop.id} className={isCurrent ? "bg-blue-50/50 font-semibold" : "hover:bg-slate-50/50"}>
                    <td className="py-3.5 px-4 text-slate-900 font-medium">
                      {isCurrent && <span className="mr-1.5 text-blue-700">📍</span>}
                      {stop.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-950">{stop.pickupTime}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{stop.dropTime}</td>
                    <td className="py-3.5 px-4">{stop.distanceKm} km</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹{stop.termFee.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      {isCurrent ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                          Current Stop
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(stop.id)}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-700 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                        >
                          Select Stop
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
