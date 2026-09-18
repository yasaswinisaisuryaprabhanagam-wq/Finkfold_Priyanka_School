"use client";

import { useState, useTransition } from "react";
import { switchCampus } from "@/actions/switchCampus";
import type { School } from "@/types/erp";

export default function BranchSwitcher({
  currentSchoolId,
  campuses,
  isSuperAdmin,
}: {
  currentSchoolId: string;
  campuses: any[];
  isSuperAdmin: boolean;
}) {
  const [selectedId, setSelectedId] = useState(currentSchoolId);
  const [isPending, startTransition] = useTransition();

  const currentCampus = campuses.find((c) => c.id === selectedId) || campuses[0];

  function handleChange(newId: string) {
    if (newId === selectedId) return;
    setSelectedId(newId);
    startTransition(async () => {
      const res = await switchCampus(newId);
      if (res.success) {
        window.location.reload();
      }
    });
  }

  // If user is not super_admin or there's only 1 campus, show static badge
  if (!isSuperAdmin && campuses.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold">
        <span>🏫</span>
        <span className="truncate max-w-[140px]">{currentCampus?.name || "Main Campus"}</span>
        {currentCampus?.branch_code && (
          <span className="text-[10px] text-white/60 font-mono">({currentCampus.branch_code})</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center">
        <label htmlFor="branch-switcher" className="sr-only">
          Select Active Campus Branch
        </label>
        <span className="absolute left-2.5 text-xs pointer-events-none">🏫</span>
        <select
          id="branch-switcher"
          disabled={isPending}
          value={selectedId}
          onChange={(e) => handleChange(e.target.value)}
          className="appearance-none pl-7 pr-8 py-1.5 rounded-xl text-xs font-bold bg-slate-900/5 text-slate-800 border border-slate-300 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          {campuses.map((c) => (
            <option key={c.id} value={c.id} className="text-slate-900 bg-white font-medium py-1">
              {c.name} {c.branch_code ? `(${c.branch_code})` : ""} {c.city ? `• ${c.city}` : ""}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 text-[10px] pointer-events-none text-slate-500">▼</span>
      </div>
      {isPending && (
        <span className="h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
    </div>
  );
}
