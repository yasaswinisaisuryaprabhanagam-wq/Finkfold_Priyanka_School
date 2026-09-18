import Link from "next/link";
import { SCHOOL } from "@/lib/school-config";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Overview */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {SCHOOL.logoUrl && (
                <div className="h-10 w-10 rounded-lg bg-white p-1 flex items-center justify-center">
                  <img
                    src={SCHOOL.logoUrl}
                    alt={`${SCHOOL.name} Logo`}
                    className="h-8 w-8 object-contain"
                  />
                </div>
              )}
              <span className="text-xl font-bold text-white tracking-tight">
                {SCHOOL.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {SCHOOL.tagline} Providing quality education, modern digital transparent
              tracking, and nurturing character in every student.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Meta WhatsApp Parent Alert System Active ({SCHOOL.supportPhone})
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About the School
                </Link>
              </li>
              <li>
                <Link href="/academics" className="hover:text-white transition-colors">
                  Academic Programs
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="hover:text-white transition-colors">
                  Admissions 2026–27
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Campus
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <Link href="/student/login" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🎓</span>
                  <span>Student & Parent Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/faculty/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>👨‍🏫</span>
                  <span>Faculty Workspace</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Campus Contact
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-start gap-2.5">
                <span className="text-slate-200">📍</span>
                <span>{SCHOOL.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="text-slate-200">📞</span>
                <a href={`tel:${SCHOOL.phone}`} className="hover:text-white transition-colors">
                  {SCHOOL.phone}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="text-slate-200">✉️</span>
                <a href={`mailto:${SCHOOL.email}`} className="hover:text-white transition-colors">
                  {SCHOOL.email}
                </a>
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Office Hours: {SCHOOL.workingHours}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-white tracking-wide">Finkfold Education OS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
