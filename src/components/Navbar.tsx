"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SCHOOL } from "@/lib/school-config";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Notification Bar */}
      <div className="border-b border-slate-100 bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span>📍 {SCHOOL.address}</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline">🕒 {SCHOOL.workingHours}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${SCHOOL.phone}`} className="hover:text-white transition-colors">
              📞 {SCHOOL.phone}
            </a>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-medium">WhatsApp: {SCHOOL.supportPhone}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo & School Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {SCHOOL.logoUrl && (
              <div className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 p-1 shadow-xs group-hover:scale-105 transition-transform duration-200">
                <img
                  src={SCHOOL.logoUrl}
                  alt={`${SCHOOL.name} Logo`}
                  className="h-9 w-9 object-contain"
                />
              </div>
            )}
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
                {SCHOOL.name}
              </div>
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                {SCHOOL.affiliation}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {SCHOOL.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-blue-900 bg-blue-50/80 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Institutional Portal CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/faculty/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition-all"
            >
              <span>👨‍🏫</span>
              <span>Staff Login</span>
            </Link>
            <Link
              href="/student/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:from-blue-800 hover:to-indigo-800 transition-all active:scale-[0.98]"
            >
              <span>🎓</span>
              <span>Student Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in fade-in duration-150">
            {SCHOOL.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? "text-blue-900 bg-blue-50 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/student/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-900 px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-blue-800"
              >
                <span>🎓</span>
                <span>Student & Parent Portal</span>
              </Link>
              <Link
                href="/faculty/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200"
              >
                <span>👨‍🏫</span>
                <span>Faculty & Staff Workspace</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
