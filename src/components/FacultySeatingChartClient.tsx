"use client";

import { useState, useTransition } from "react";
import { SeatingDesk, BehavioralPairingWarning, DeviceLockState } from "@/types/faculty";
import { swapSeatingDesksAction, toggleDeviceLockAction } from "@/actions/faculty";

interface Props {
  initialDesks: SeatingDesk[];
  initialWarnings: BehavioralPairingWarning[];
  initialDeviceLock: DeviceLockState;
}

export default function FacultySeatingChartClient({
  initialDesks,
  initialWarnings,
  initialDeviceLock,
}: Props) {
  const [desks, setDesks] = useState<SeatingDesk[]>(initialDesks);
  const [warnings] = useState<BehavioralPairingWarning[]>(initialWarnings);
  const [deviceLock, setDeviceLock] = useState<DeviceLockState>(initialDeviceLock);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // Selected desk for swap
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);

  const handleDeskClick = (desk: SeatingDesk) => {
    if (!selectedDeskId) {
      setSelectedDeskId(desk.deskId);
      setNotification(`Selected ${desk.studentName || "Empty Desk"}. Now click a second desk to swap seats.`);
    } else {
      if (selectedDeskId === desk.deskId) {
        setSelectedDeskId(null);
        setNotification(null);
        return;
      }

      startTransition(async () => {
        const res = await swapSeatingDesksAction(selectedDeskId, desk.deskId);
        if (res.success) {
          setDesks(res.desks);
          setNotification(res.message);
          setSelectedDeskId(null);
          setTimeout(() => setNotification(null), 5000);
        }
      });
    }
  };

  const handleToggleDeviceLock = () => {
    startTransition(async () => {
      const res = await toggleDeviceLockAction();
      if (res.success) {
        setDeviceLock((prev) => ({
          ...prev,
          isLocked: res.isLocked,
          lockedAt: res.isLocked ? new Date().toLocaleTimeString() : undefined,
        }));
        setNotification(res.message);
        setTimeout(() => setNotification(null), 6000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-blue-600 hover:text-blue-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner with "Eyes on Me" Device Lock Button - Clean Reference Style */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wide">
                ClassDojo &amp; Apple Classroom Inspired
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Spatial Seating &amp; Device Management
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Smart Seating Chart &amp; Behavioral Heatmap
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Arrange classroom desks visually, automatically flag incompatible student pairings, and instantly freeze student screens with the 1-click &ldquo;Eyes on Me&rdquo; device lock.
            </p>
          </div>

          {/* EYES ON ME LOCK BUTTON */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleDeviceLock}
              disabled={isPending}
              className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center gap-2.5 cursor-pointer ${
                deviceLock.isLocked
                  ? "bg-rose-600 text-white animate-pulse hover:bg-rose-700 ring-4 ring-rose-200"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <span className="text-base">{deviceLock.isLocked ? "🔒" : "🤫"}</span>
              <div className="text-left">
                <div>{deviceLock.isLocked ? 'RELEASE "EYES ON ME" LOCK' : 'ACTIVATE "EYES ON ME"'}</div>
                <div className="text-[9px] opacity-80 font-normal">
                  {deviceLock.isLocked ? "42 Devices Frozen on Network" : "Freeze all classroom student tablets"}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Active Device Lock Alert Banner if locked */}
      {deviceLock.isLocked && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <span className="font-extrabold uppercase tracking-wider">Device Freeze Active</span>: Student screens currently display:
              <span className="italic font-semibold ml-1">&ldquo;{deviceLock.lockMessage}&rdquo;</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">Locked at {deviceLock.lockedAt}</span>
        </div>
      )}

      {/* Conflict Warning Card */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <span className="font-bold">Incompatible Pairing Alert:</span>{" "}
              {warnings[0].studentA} and {warnings[0].studentB} are seated nearby. {warnings[0].reason}
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20">
            Conduct Ledger Sync
          </span>
        </div>
      )}

      {/* Classroom Seating Grid (Blackboard at Top) */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        {/* Blackboard / Smart Board Indicator */}
        <div className="w-full max-w-md mx-auto py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-center text-slate-700 text-xs font-bold tracking-wider uppercase">
          📖 TEACHER PODIUM &amp; SMART BOARD FRONT
        </div>

        {/* 2 Rows x 3 Columns Desks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {desks.map((desk) => {
            const isSelected = selectedDeskId === desk.deskId;

            return (
              <div
                key={desk.deskId}
                onClick={() => handleDeskClick(desk)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10 shadow-lg scale-102"
                    : desk.hasConflictRisk
                    ? "border-amber-500/60 bg-amber-500/5 hover:border-amber-500"
                    : desk.studentId
                    ? "border-border bg-muted/20 hover:border-blue-400 hover:bg-muted/40"
                    : "border-dashed border-border bg-muted/5 hover:border-muted-foreground/50"
                }`}
              >
                {/* Desk coordinate header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60 text-[10px] text-muted-foreground">
                  <span>Row {desk.row}, Seat {desk.col}</span>
                  {desk.hasConflictRisk && (
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      <span>⚠️</span> Conflict
                    </span>
                  )}
                </div>

                {desk.studentId ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {desk.photoInitials}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-foreground truncate">{desk.studentName}</div>
                      <div className="text-[10px] text-muted-foreground">Roll #{desk.rollNo} • {desk.gender === "M" ? "Male" : "Female"}</div>
                      {desk.behaviorNote && (
                        <div className="text-[9px] text-amber-600 dark:text-amber-400 font-medium truncate mt-0.5">
                          {desk.behaviorNote}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-2 text-xs text-muted-foreground italic">
                    Empty Seat (Click to assign)
                  </div>
                )}

                {isSelected && (
                  <div className="mt-2 text-center text-[10px] font-bold text-blue-600 animate-pulse">
                    Selected for Swap — Click another desk
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Substitute Teacher Instructions */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>
              <strong>Substitute Teacher View:</strong> When relief teachers open this portal, they see this exact photo map so they immediately know who is sitting where.
            </span>
          </div>
          <span className="text-[10px] font-semibold text-foreground">Click any 2 desks to swap</span>
        </div>
      </div>
    </div>
  );
}
