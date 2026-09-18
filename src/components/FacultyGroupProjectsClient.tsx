"use client";

import { useState, useTransition } from "react";
import { ProjectTeam } from "@/types/faculty";
import { submitPeerReviewAction } from "@/actions/faculty";

interface Props {
  initialProjects: ProjectTeam[];
}

export default function FacultyGroupProjectsClient({ initialProjects }: Props) {
  const [projects, setProjects] = useState<ProjectTeam[]>(initialProjects);
  const [selectedTeam, setSelectedTeam] = useState<ProjectTeam>(initialProjects[0]);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // Simulation state for adding peer review
  const [targetStudentId, setTargetStudentId] = useState<string>(
    initialProjects[0]?.members[0]?.studentId || ""
  );
  const [peerScore, setPeerScore] = useState<number>(4);

  const handleSimulatePeerReview = () => {
    if (!selectedTeam || !targetStudentId) return;
    startTransition(async () => {
      const res = await submitPeerReviewAction({
        teamId: selectedTeam.teamId,
        targetStudentId,
        score: peerScore,
      });
      if (res.success) {
        setNotification(res.message);
        setSelectedTeam((prev) => ({
          ...prev,
          members: prev.members.map((m) =>
            m.studentId === targetStudentId
              ? { ...m, peerScoreAvg: Number(((m.peerScoreAvg + peerScore) / 2).toFixed(1)) }
              : m
          ),
        }));
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span>🧩</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-400 text-slate-950 uppercase tracking-wide">
                Fair Grading Engine
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-white/80">
                Blind Peer Evaluation & Heatmaps
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Group Project & Peer-Review Hub
            </h1>
            <p className="text-white/70 text-xs mt-1 max-w-xl">
              End unfair group grading where one child works while others take the credit. Anonymous peer evaluations generate automated contribution heatmaps for individual accountability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 rounded-xl text-center">
              <div className="text-xl font-extrabold text-teal-300">
                {selectedTeam.milestonesCompleted} / {selectedTeam.totalMilestones}
              </div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Milestones Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Details & Contribution Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Project Team Card & Contribution Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">Active Team Roster</span>
                <h2 className="text-base font-bold text-foreground mt-0.5">{selectedTeam.teamName}</h2>
                <div className="text-xs text-muted-foreground mt-0.5">{selectedTeam.projectTitle}</div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">
                Peer Reviews Complete
              </span>
            </div>

            {/* Individual Contribution Heatmap Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Contribution Share</th>
                    <th className="py-2.5 px-3">Peer Rating (1-5)</th>
                    <th className="py-2.5 px-3 text-right">Fair Grade Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedTeam.members.map((mem) => {
                    const isSlacking = mem.contributionPercentage < 15;
                    const isLeader = mem.contributionPercentage >= 50;

                    return (
                      <tr key={mem.studentId} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground">{mem.studentName}</div>
                          <div className="text-[10px] text-muted-foreground">Roll #{mem.rollNo}</div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground text-xs">{mem.assignedRole}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isLeader ? "bg-teal-500" : isSlacking ? "bg-rose-500" : "bg-cyan-500"
                                }`}
                                style={{ width: `${mem.contributionPercentage}%` }}
                              />
                            </div>
                            <span className="font-extrabold text-foreground w-10">
                              {mem.contributionPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="text-amber-400">★</span>
                            <span className="font-bold text-foreground">{mem.peerScoreAvg}</span>
                            <span className="text-[10px] text-muted-foreground">/ 5.0</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isLeader
                                ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                                : isSlacking
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                            }`}
                          >
                            {isLeader ? "Grade A+ (Leader)" : isSlacking ? "Grade C (Free-Rider Flag)" : "Grade A (Solid)"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Blind Peer Evaluation Simulator */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Blind Peer Evaluation Desk
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Students anonymously submit ratings through their student portal. You can also manually adjust peer contribution ratings here.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Target Team Member</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                >
                  {selectedTeam.members.map((m) => (
                    <option key={m.studentId} value={m.studentId}>
                      {m.studentName} ({m.assignedRole})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Peer Score (1 = No Effort, 5 = Exceptional)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={peerScore}
                  onChange={(e) => setPeerScore(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1.0 (Low)</span>
                  <span className="font-bold text-foreground text-xs">{peerScore} Stars</span>
                  <span>5.0 (High)</span>
                </div>
              </div>

              <button
                onClick={handleSimulatePeerReview}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{isPending ? "Calculating..." : "Submit Anonymous Peer Rating"}</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Why This Matters</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              In traditional schools, group projects generate huge parent resentment because diligent students get weighed down by unmotivated teammates. Finkfold&apos;s blind peer review isolates contribution ratios so marks are 100% fair.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
