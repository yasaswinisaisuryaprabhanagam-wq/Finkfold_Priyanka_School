"use client";

import { useState, useEffect } from "react";
import { SCHOOL } from "@/lib/school-config";

export default function AdmissionShareBox({ schoolSlug }: { schoolSlug?: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  const slug = schoolSlug || SCHOOL.slug || "priyanka-em-school";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const defaultBase = process.env.NEXT_PUBLIC_SITE_URL || "https://finkfold-priyanka-school.vercel.app";
  const admissionLink = `${origin || defaultBase}/admissions/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(admissionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = admissionLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="card p-5 border border-slate-200 shadow-2xs">
      <div className="text-sm font-bold text-slate-800 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
        📋 Share Admission Form with Parents
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-xs text-slate-600 break-all select-all">
          {admissionLink}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className={`btn btn-sm font-semibold transition-all ${
            copied ? "bg-emerald-600 text-white hover:bg-emerald-700" : "btn-primary"
          }`}
          title="Copy public link"
        >
          {copied ? "✓ Copied!" : "📋 Copy Link"}
        </button>
        <a
          href={admissionLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm border border-slate-200 flex items-center gap-1 hover:bg-slate-50"
        >
          <span>👁️</span> Preview
        </a>
      </div>
      <div className="text-[11px] text-slate-400 mt-2">
        Share this link in your school WhatsApp groups or print as QR code. Parents fill the form directly on their mobile phones — no app download needed.
      </div>
    </div>
  );
}
