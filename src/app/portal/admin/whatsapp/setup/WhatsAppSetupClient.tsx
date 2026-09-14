"use client";

import { useState, useTransition } from "react";
import { sendTestWhatsApp, pingWebhook } from "@/actions/whatsappSetup";

export default function WhatsAppSetupClient({
  webhookConfigured,
  schoolPhone,
  statusCallbackUrl,
}: {
  webhookConfigured: boolean;
  schoolPhone: string;
  statusCallbackUrl: string;
}) {
  const [pingResult, setPingResult] = useState<{
    reachable?: boolean; latencyMs?: number; message?: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<{
    success?: boolean; message?: string;
  } | null>(null);
  const [isPinging, startPing] = useTransition();
  const [isTesting, startTest] = useTransition();

  function handlePing() {
    startPing(async () => {
      const r = await pingWebhook();
      setPingResult(r);
    });
  }

  function handleTestSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTest(async () => {
      const r = await sendTestWhatsApp(fd);
      setTestResult(r);
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Step 1: n8n Webhook Status ── */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Step 1 — n8n Webhook Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Connect n8n to receive attendance events</p>
          </div>
          <div className="flex items-center gap-2">
            {webhookConfigured ? (
              <span className="badge badge-green">✓ Configured</span>
            ) : (
              <span className="badge badge-red">✗ Not Set</span>
            )}
            <button
              onClick={handlePing}
              disabled={isPinging || !webhookConfigured}
              className="btn btn-ghost btn-sm"
            >
              {isPinging ? "Pinging..." : "Ping Webhook"}
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Environment variables status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${webhookConfigured ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              <div className="text-xs font-bold mb-1 text-slate-700">N8N_ATTENDANCE_WEBHOOK_URL</div>
              <div className={`text-xs font-mono ${webhookConfigured ? "text-emerald-700" : "text-rose-600"}`}>
                {webhookConfigured ? "✓ Set in .env.local" : "✗ Not configured"}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${webhookConfigured ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              <div className="text-xs font-bold mb-1 text-slate-700">N8N_ATTENDANCE_WEBHOOK_SECRET</div>
              <div className={`text-xs font-mono ${webhookConfigured ? "text-emerald-700" : "text-rose-600"}`}>
                {webhookConfigured ? "✓ Set in .env.local" : "✗ Not configured"}
              </div>
            </div>
          </div>

          {/* Ping result */}
          {pingResult && (
            <div className={`p-3 rounded-xl border text-xs ${pingResult.reachable ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
              {pingResult.reachable ? "✓" : "✗"} {pingResult.message}
            </div>
          )}

          {/* How to configure */}
          {!webhookConfigured && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs font-bold text-amber-800 mb-2">Add to your .env.local file:</div>
              <pre className="text-xs font-mono text-amber-900 bg-amber-100 rounded-lg p-3 overflow-auto">{`N8N_ATTENDANCE_WEBHOOK_URL=https://your-n8n.domain/webhook/attendance
N8N_ATTENDANCE_WEBHOOK_SECRET=your-strong-secret-key`}</pre>
            </div>
          )}

          {/* Status callback URL for n8n */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-xs font-bold text-blue-800 mb-1">Status Callback URL (give this to n8n)</div>
            <div className="text-xs font-mono text-blue-900 bg-blue-100 rounded-lg p-2 break-all">
              POST {statusCallbackUrl}
            </div>
            <div className="text-[10px] text-blue-600 mt-1">
              n8n must POST delivery results here so the Audit Log shows real status.
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 2: n8n Workflow Import ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Step 2 — Import n8n Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Download and import the automation workflow into your n8n instance</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { step: "1", title: "Open n8n", desc: "Go to your n8n dashboard. Self-hosted or cloud.finkfold.com" },
              { step: "2", title: "Import Workflow", desc: 'Click "+ Add Workflow" → "Import from JSON" → paste the workflow below' },
              { step: "3", title: "Set Credentials", desc: "Add your Meta WhatsApp API token and phone number ID in n8n Credentials" },
            ].map((s) => (
              <div key={s.step} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="h-7 w-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center mb-2">{s.step}</div>
                <div className="text-xs font-bold text-slate-800 mb-1">{s.title}</div>
                <div className="text-[10px] text-slate-500">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* n8n Workflow JSON */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">n8n Workflow JSON (copy & paste into n8n)</div>
            <pre className="text-[10px] font-mono text-slate-600 bg-slate-900 text-green-400 rounded-xl p-4 overflow-auto max-h-64 leading-relaxed">{`{
  "name": "Finkfold - Attendance WhatsApp Alert",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Receive Attendance Event",
      "parameters": {
        "path": "attendance",
        "httpMethod": "POST",
        "authentication": "headerAuth",
        "headerName": "x-finkfold-secret",
        "headerValue": "={{ $env.FINKFOLD_WEBHOOK_SECRET }}"
      }
    },
    {
      "type": "n8n-nodes-base.if",
      "name": "Skip if Test",
      "parameters": {
        "conditions": {
          "string": [{ "value1": "={{ $json.is_test }}", "value2": "true", "operation": "notEqual" }]
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Send WhatsApp via Meta API",
      "parameters": {
        "method": "POST",
        "url": "=https://graph.facebook.com/v19.0/{{ $env.WA_PHONE_NUMBER_ID }}/messages",
        "headers": {
          "Authorization": "Bearer {{ $env.WA_ACCESS_TOKEN }}",
          "Content-Type": "application/json"
        },
        "body": {
          "messaging_product": "whatsapp",
          "to": "={{ $json.parent_phone }}",
          "type": "template",
          "template": {
            "name": "school_absence_alert_v1",
            "language": { "code": "en" },
            "components": [{
              "type": "body",
              "parameters": [
                { "type": "text", "text": "={{ $json.parent_name }}" },
                { "type": "text", "text": "={{ $json.student_name }}" },
                { "type": "text", "text": "={{ $json.class_label }}" },
                { "type": "text", "text": "={{ $json.attendance_date }}" }
              ]
            }]
          }
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Write Status Back to Finkfold",
      "parameters": {
        "method": "POST",
        "url": "${statusCallbackUrl}",
        "headers": {
          "x-finkfold-secret": "={{ $env.FINKFOLD_WEBHOOK_SECRET }}",
          "Content-Type": "application/json"
        },
        "body": {
          "school_id": "={{ $('Receive Attendance Event').item.json.school_id }}",
          "session_id": "={{ $('Receive Attendance Event').item.json.session_id }}",
          "student_id": "={{ $('Receive Attendance Event').item.json.student_id }}",
          "parent_phone": "={{ $('Receive Attendance Event').item.json.parent_phone }}",
          "event_type": "={{ $('Receive Attendance Event').item.json.event_type }}",
          "attendance_date": "={{ $('Receive Attendance Event').item.json.attendance_date }}",
          "template_name": "school_absence_alert_v1",
          "status": "={{ $json.messages ? 'delivered' : 'failed' }}",
          "meta_message_id": "={{ $json.messages?.[0]?.id || '' }}"
        }
      }
    }
  ]
}`}</pre>
          </div>
        </div>
      </div>

      {/* ── Step 3: WhatsApp Templates ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Step 3 — WhatsApp Message Templates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Create these templates in your Meta Business Manager</p>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              name: "school_absence_alert_v1",
              event: "absent",
              badge: "badge-amber",
              body: "Dear *{{1}}*, your child *{{2}}* was marked *absent* from Class *{{3}}* on *{{4}}*. Please contact the school if this is incorrect.\n\n— Priyanka EM School",
              params: ["Parent Name", "Student Name", "Class-Section", "Date"],
            },
            {
              name: "school_correction_v1",
              event: "correction_to_present",
              badge: "badge-green",
              body: "Dear *{{1}}*, this is to inform you that the attendance of *{{2}}* (Class *{{3}}*) has been *corrected to PRESENT* for *{{4}}*. No action needed.\n\n— Priyanka EM School",
              params: ["Parent Name", "Student Name", "Class-Section", "Date"],
            },
          ].map((t) => (
            <div key={t.name} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-800">{t.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Category: UTILITY · Language: English</div>
                </div>
                <span className={`badge ${t.badge}`}>{t.event}</span>
              </div>
              <div className="p-4">
                <div className="bg-[#dcf8c6] rounded-xl p-3 text-xs text-slate-700 font-sans whitespace-pre-wrap mb-3 max-w-xs border border-slate-200">
                  {t.body.replace(/\*\*\*?/g, "").replace(/\{\{(\d+)\}\}/g, (_, n) => `[${t.params[parseInt(n)-1]}]`)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.params.map((p, i) => (
                    <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {`{{${i+1}}}`} = {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
            <strong>ℹ️ How to create:</strong> Go to Meta Business Manager → WhatsApp Manager → Message Templates → Create Template. Use the template names exactly as shown above. Approval takes 24-48 hours.
          </div>
        </div>
      </div>

      {/* ── Step 4: Test Notification ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Step 4 — Send Test Notification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Send a real test message via n8n to verify the full pipeline</p>
        </div>
        <div className="p-5">
          <form onSubmit={handleTestSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  defaultValue={schoolPhone}
                  className="input"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Default: school support number. Enter any test number.</p>
              </div>
              <div>
                <label className="label">Parent Name</label>
                <input name="parent_name" type="text" placeholder="e.g. Sunitha Devi" defaultValue="Test Parent" className="input" />
              </div>
              <div>
                <label className="label">Student Name</label>
                <input name="student_name" type="text" placeholder="e.g. Ravi Kumar" defaultValue="Test Student" className="input" />
              </div>
              <div>
                <label className="label">Class</label>
                <input name="class_label" type="text" placeholder="e.g. 10-A" defaultValue="10-A" className="input" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isTesting || !webhookConfigured}
              className="btn btn-primary"
            >
              {isTesting ? (
                <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Sending...</>
              ) : (
                "📤 Send Test WhatsApp"
              )}
            </button>

            {!webhookConfigured && (
              <p className="text-xs text-amber-600">⚠️ Configure N8N_ATTENDANCE_WEBHOOK_URL first to enable test sending.</p>
            )}

            {testResult && (
              <div className={`p-3 rounded-xl text-xs border ${testResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                {testResult.success ? "✓" : "✗"} {testResult.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Full Flow Diagram ── */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
          Full Automation Flow
        </h2>
        <div className="flex flex-col gap-0 max-w-lg mx-auto">
          {[
            { icon: "👩‍🏫", label: "Teacher marks attendance", sub: "Faculty portal → Submit" },
            { icon: "⚡", label: "submitAttendance() fires", sub: "Server Action detects absent students" },
            { icon: "🔗", label: "POST → n8n Webhook", sub: `N8N_ATTENDANCE_WEBHOOK_URL`, mono: true },
            { icon: "🤖", label: "n8n processes workflow", sub: "Validates secret, skips duplicates" },
            { icon: "📱", label: "Meta WhatsApp Cloud API", sub: "Sends template message to parent" },
            { icon: "↩️", label: "n8n writes status back", sub: `POST ${statusCallbackUrl}`, mono: true },
            { icon: "📊", label: "Audit Log updated", sub: "WhatsApp page shows delivered/failed" },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                {i < arr.length - 1 && <div className="h-6 w-0.5 bg-slate-200 my-0.5" />}
              </div>
              <div className="pt-1.5">
                <div className="text-xs font-bold text-slate-800">{step.label}</div>
                <div className={`text-[10px] mt-0.5 ${step.mono ? "font-mono text-violet-600" : "text-slate-500"}`}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
