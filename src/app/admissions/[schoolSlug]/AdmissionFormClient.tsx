"use client";

import { useState } from "react";
import { submitAdmission } from "@/actions/admissions";

const CLASSES = ["1","2","3","4","5","6","7","8","9","10"];
const SECTIONS = ["A","B","C","D"];

export default function AdmissionFormClient({
  schoolId,
  schoolName,
  academicYear,
}: {
  schoolId: string;
  schoolName: string;
  academicYear: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await submitAdmission(fd);
    setLoading(false);
    if (res.success) setSubmitted(true);
    else setError(res.error || "Submission failed. Please try again.");
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Application Submitted!
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Thank you! Your child's admission application has been received by{" "}
            <strong>{schoolName}</strong>. The school will contact you on your
            WhatsApp number within 2–3 working days.
          </p>
          <div className="bg-blue-50 rounded-2xl p-4 text-left">
            <div className="text-xs font-bold text-blue-900 mb-1">What happens next?</div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>✓ Admin reviews your application</div>
              <div>✓ You receive a confirmation on WhatsApp</div>
              <div>✓ Child is enrolled for {academicYear}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
      {/* Header */}
      <div className="text-white py-8 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)" }}>
        <div className="text-4xl mb-3">🏫</div>
        <h1 className="text-2xl font-black" style={{ fontFamily: "Outfit, sans-serif" }}>
          {schoolName}
        </h1>
        <p className="text-blue-200 text-sm mt-1">Online Admission Form · {academicYear}</p>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="schoolId" value={schoolId} />

          {/* Child details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="text-base font-black text-slate-900 pb-2 border-b border-slate-100"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              👦 Child Details
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Child's Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="e.g. Aarav Sharma"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Gender</label>
                <select
                  name="gender"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Applying for Class <span className="text-rose-500">*</span>
                </label>
                <select
                  name="applying_for_class"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select class</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Section Preference</label>
                <select
                  name="applying_for_section"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Previous School (if any)</label>
              <input
                type="text"
                name="previous_school"
                placeholder="e.g. St. Mary's High School"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Parent details */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="text-base font-black text-slate-900 pb-2 border-b border-slate-100"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              👨‍👩‍👦 Parent / Guardian Details
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Parent / Guardian Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="parent_name"
                required
                placeholder="e.g. Rajesh Sharma"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                WhatsApp Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex">
                <div className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-600 font-semibold">
                  +91
                </div>
                <input
                  type="tel"
                  name="parent_phone"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  pattern="\d{10}"
                  className="flex-1 border border-slate-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                School will send attendance alerts to this WhatsApp number
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Second Parent / Alternate Contact (optional)
              </label>
              <div className="flex">
                <div className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-600 font-semibold">
                  +91
                </div>
                <input
                  type="tel"
                  name="second_parent_phone"
                  maxLength={10}
                  placeholder="9876543211"
                  className="flex-1 border border-slate-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Home Address</label>
              <textarea
                name="address"
                rows={2}
                placeholder="Door no, Street, Area, City"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Consent note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
            <span className="font-bold">📲 WhatsApp Consent:</span> By submitting this form, you agree
            to receive daily attendance alerts and school notifications on the mobile number provided above.
            Your data is securely stored and never shared with third parties.
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-black text-base transition-all"
            style={{ background: loading ? "#93c5fd" : "linear-gradient(135deg, #1e40af, #3b82f6)" }}
          >
            {loading ? "Submitting…" : "Submit Admission Application →"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by Finkfold ERP · {schoolName}
        </p>
      </div>
    </div>
  );
}
