"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SCHOOL } from "@/lib/school-config";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission / dispatch to inquiry endpoint
    setTimeout(() => {
      setLoading(false);
      setFormSubmitted(true);
    }, 600);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-slate-900 to-[#123B6D] text-white py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Reach Out to Us
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Contact & Campus Visit
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              We welcome questions from prospective parents, current families, and community members. Visit our campus in Nellore or send us a message below.
            </p>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📍</span>
                  <h3 className="font-bold text-slate-900 text-base">Campus Location</h3>
                </div>
                <p className="text-sm font-semibold text-slate-900">{SCHOOL.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{SCHOOL.address}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📞</span>
                  <h3 className="font-bold text-slate-900 text-base">Phone & WhatsApp</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-xs text-slate-500">General Office: </span>
                    <a href={`tel:${SCHOOL.phone}`} className="font-semibold text-blue-900 hover:underline">
                      {SCHOOL.phone}
                    </a>
                  </p>
                  <p>
                    <span className="text-xs text-slate-500">Parent WhatsApp Desk: </span>
                    <span className="font-semibold text-emerald-700">{SCHOOL.supportPhone}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">✉️</span>
                  <h3 className="font-bold text-slate-900 text-base">Email Enquiries</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-xs text-slate-500">General: </span>
                    <a href={`mailto:${SCHOOL.email}`} className="font-semibold text-blue-900 hover:underline">
                      {SCHOOL.email}
                    </a>
                  </p>
                  <p>
                    <span className="text-xs text-slate-500">Admissions: </span>
                    <a href={`mailto:${SCHOOL.admissionsEmail}`} className="font-semibold text-blue-900 hover:underline">
                      {SCHOOL.admissionsEmail}
                    </a>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🕒</span>
                  <h3 className="font-bold text-slate-900 text-base">Office Visiting Hours</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>Monday – Friday: 8:30 AM – 4:00 PM</li>
                  <li>Saturday: 8:30 AM – 1:00 PM</li>
                  <li>Sunday & Public Holidays: Closed</li>
                </ul>
              </div>
            </div>

            {/* Online Message / Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Send an Admission or General Inquiry
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Our administrative office will review your request and get in touch within one working day.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
                    <span className="text-4xl">🎉</span>
                    <h4 className="text-lg font-bold text-emerald-900">
                      Thank You! Message Received.
                    </h4>
                    <p className="text-sm text-emerald-800 max-w-md mx-auto">
                      We have received your enquiry for {SCHOOL.name}. Our admissions counselor will contact you shortly via phone or email.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                    >
                      Submit Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lakshmi Kumari"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="parent@example.com"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Inquiry Topic *
                        </label>
                        <select
                          required
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-white"
                        >
                          <option value="">Select Topic...</option>
                          <option value="admissions">New Student Admission (2026–2027)</option>
                          <option value="fee">Fee Structure & Prospectus</option>
                          <option value="tour">Campus Tour & Principal Meeting</option>
                          <option value="other">General Community Query</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Message or Query *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Please share details about your child's age or any specific questions..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-hidden focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-900 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-98 shadow-sm"
                    >
                      {loading ? "Sending..." : "Submit Inquiry →"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
