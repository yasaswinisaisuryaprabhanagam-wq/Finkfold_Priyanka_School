import { getProfile } from "@/lib/auth";
import { SCHOOL } from "@/lib/school-config";
import { redirect } from "next/navigation";
import Link from "next/link";
import WhatsAppSetupClient from "./WhatsAppSetupClient";
import { headers } from "next/headers";

export const metadata = {
  title: `WhatsApp Automation Setup | ${SCHOOL.name}`,
  description: "Configure n8n webhook, test WhatsApp notifications, and view the full automation pipeline.",
};

export default async function WhatsAppSetupPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!["school_admin", "super_admin"].includes(profile.role)) redirect("/portal/admin");

  // Check if the env vars are configured (server-side check — never expose values to client)
  const webhookConfigured = Boolean(
    process.env.N8N_ATTENDANCE_WEBHOOK_URL && process.env.N8N_ATTENDANCE_WEBHOOK_SECRET
  );

  // Build the status callback URL dynamically
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3005";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const statusCallbackUrl = `${proto}://${host}/api/webhook/whatsapp-status`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl text-white p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #10b981 0%, transparent 60%)" }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              WhatsApp Automation · {SCHOOL.name}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              📲 Phase A — n8n Setup Guide
            </h1>
            <p className="text-white/60 text-sm">
              Configure the full pipeline: Attendance → n8n → WhatsApp → Status log
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link href="/portal/admin/whatsapp" className="btn btn-ghost text-white/70 hover:text-white text-xs">
              ← Audit Log
            </Link>
            {webhookConfigured ? (
              <span className="badge badge-green">Pipeline Active</span>
            ) : (
              <span className="badge badge-amber">Setup Required</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="card p-5">
        <div className="text-xs font-bold text-slate-700 mb-3">Setup Checklist</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Env Variables", done: webhookConfigured, num: "1" },
            { label: "n8n Workflow", done: false, num: "2" },
            { label: "WA Templates", done: false, num: "3" },
            { label: "Test Message", done: false, num: "4" },
          ].map((step) => (
            <div
              key={step.num}
              className={`flex items-center gap-2 p-3 rounded-xl border ${
                step.done
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                step.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step.done ? "✓" : step.num}
              </div>
              <div className={`text-xs font-medium ${step.done ? "text-emerald-700" : "text-slate-500"}`}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client interactive section */}
      <WhatsAppSetupClient
        webhookConfigured={webhookConfigured}
        schoolPhone={SCHOOL.supportPhone}
        statusCallbackUrl={statusCallbackUrl}
      />
    </div>
  );
}
