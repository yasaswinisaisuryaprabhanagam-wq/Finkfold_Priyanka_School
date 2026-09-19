"use client";

import { useState, useTransition } from "react";
import { SubjectiveSubmission, RubricCriterion } from "@/types/faculty";
import { evaluateEssayWithAiRubricAction, dispatchVoiceFeedbackAction } from "@/actions/faculty";

interface Props {
  initialSubmissions: SubjectiveSubmission[];
}

export default function FacultyVoiceGraderClient({ initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState<SubjectiveSubmission[]>(initialSubmissions);
  const [selectedSubId, setSelectedSubId] = useState<string>(initialSubmissions[0]?.id || "");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  // Audio recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [writtenRemark, setWrittenRemark] = useState("");

  const activeSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const handleRunAiEvaluation = () => {
    if (!activeSub) return;
    startTransition(async () => {
      const res = await evaluateEssayWithAiRubricAction(activeSub.id);
      if (res.success) {
        setNotification(res.message);
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecordedAudio(true);
    } else {
      setIsRecording(true);
      setRecordDuration(0);
      setHasRecordedAudio(false);
      // Simulate recording timer
      const timer = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 15) {
            clearInterval(timer);
            setIsRecording(false);
            setHasRecordedAudio(true);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleDispatchFeedback = () => {
    if (!activeSub) return;
    startTransition(async () => {
      const finalScore = activeSub.rubric.reduce((acc, r) => acc + r.score, 0);
      const res = await dispatchVoiceFeedbackAction({
        submissionId: activeSub.id,
        score: finalScore,
        voiceDurationSec: recordDuration || 14,
        writtenRemark: writtenRemark || "Excellent analysis of algorithmic liability. Pay close attention to paragraph 3 transitions.",
      });
      if (res.success) {
        setNotification(res.message);
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === activeSub.id
              ? {
                  ...s,
                  status: "graded",
                  teacherVoiceDurationSec: recordDuration || 14,
                  teacherWrittenRemark: writtenRemark,
                }
              : s
          )
        );
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
            <span>🎙️</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Header Banner - Clean White & Soft Pastel Style */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                Canvas LMS &amp; Toddle Inspired
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                1-Tap Voice Notes &amp; AI Rubric Grader
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Voice-Note Feedback &amp; AI Rubric Assistant
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Eliminate hours of manual red-pen marking. Upload student essays for instant AI rubric grading, then hold the microphone to send personalized 15-second audio feedback directly to the child.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAiEvaluation}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>✨</span>
              <span>{isPending ? "Analyzing..." : "Re-Analyze with AI Rubric"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Submissions List (Left) + Grading Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submissions Queue */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Submissions Queue</h3>
            <span className="text-[11px] text-muted-foreground">{submissions.length} Total</span>
          </div>

          <div className="space-y-2">
            {submissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubId(sub.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  sub.id === activeSub.id
                    ? "border-rose-500 bg-rose-500/10 shadow-xs"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{sub.studentName}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      sub.status === "graded"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {sub.status === "graded" ? "Graded" : "Needs Review"}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate mt-1">
                  {sub.assignmentTitle}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                  <span>Roll #{sub.rollNo}</span>
                  <span>{sub.submittedAt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Essay Viewer + Rubric & Voice Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Essay Reader */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">Student Subjective Submission</span>
                <h2 className="text-sm font-bold text-foreground mt-0.5">{activeSub.studentName} — {activeSub.assignmentTitle}</h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">AI Suggested Score</div>
                <div className="text-base font-extrabold text-foreground">
                  <span className="text-rose-600">{activeSub.aiSuggestedScore}</span> / {activeSub.maxScore}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border text-xs leading-relaxed font-serif text-foreground whitespace-pre-line max-h-56 overflow-y-auto">
              {activeSub.essayContent}
            </div>
          </div>

          {/* AI Rubric Breakdown */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Standard Rubric Assessment</h3>
              <span className="text-[11px] font-semibold text-rose-600">4 Core Criteria</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSub.rubric.map((crit, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{crit.category}</span>
                    <span className="text-xs font-extrabold text-rose-600">
                      {crit.score} / {crit.maxScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {crit.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Tap Voice Feedback Console */}
          <div className="p-5 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎙️</span>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">1-Tap Voice Feedback (Direct to Student)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                15-Second Audio Note
              </span>
            </div>

            {/* Audio Recording UI */}
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleRecord}
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md transition-all ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse"
                      : hasRecordedAudio
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  }`}
                >
                  {isRecording ? "⏹" : hasRecordedAudio ? "✓" : "🎤"}
                </button>

                <div>
                  <div className="text-xs font-bold text-foreground">
                    {isRecording ? "Recording Teacher Voice..." : hasRecordedAudio ? "Audio Remark Recorded" : "Click Mic to Record"}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{isRecording ? `0:${recordDuration.toString().padStart(2, "0")}` : hasRecordedAudio ? "0:14 Recorded" : "Hold & speak up to 15s"}</span>
                    {isRecording && (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-rose-500 font-semibold">Live Audio</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {hasRecordedAudio && (
                <div className="flex items-center gap-2">
                  <div className="h-8 px-3 rounded-lg bg-muted flex items-center gap-1 text-[11px] font-mono text-foreground">
                    <span>▶️</span>
                    <span>voice-remark.wav</span>
                  </div>
                  <button
                    onClick={() => { setHasRecordedAudio(false); setRecordDuration(0); }}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Re-record
                  </button>
                </div>
              )}
            </div>

            {/* Optional written remarks */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Companion Written Remark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Great analysis Arjun! Pay close attention to paragraph 3 transitions next time."
                value={writtenRemark}
                onChange={(e) => setWrittenRemark(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Dispatch Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleDispatchFeedback}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>🚀</span>
                <span>{isPending ? "Dispatching..." : "Approve & Dispatch Voice Feedback to Student"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
