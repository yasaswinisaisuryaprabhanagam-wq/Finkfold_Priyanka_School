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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 mb-2">
            <span>📲 WhatsApp Automation</span>
            <span>·</span>
            <span>{SCHOOL.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Phase A — n8n Setup Guide
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure the full pipeline: Attendance → n8n → WhatsApp → Status log
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portal/admin/whatsapp" className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
            ← Audit Log
          </Link>
          {webhookConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pipeline Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              Setup Required
            </span>
          )}
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
