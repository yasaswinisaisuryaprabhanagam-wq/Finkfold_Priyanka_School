import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SCHOOL } from "@/lib/school-config";

export const metadata = {
  title: `${SCHOOL.name} – Excellence in English Medium Education`,
  description: `Welcome to ${SCHOOL.name}, Rasapūdipalem. A progressive English-medium school providing quality education, dedicated faculty, and automated parent communication.`,
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-900 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#123B6D] to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6">
          {/* Subtle background glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-amber-300">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  Admissions Open for Academic Year {SCHOOL.academicYear}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                  Where Curiosity Meets{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
                    Excellence & Purpose.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  Welcome to <strong className="text-white">{SCHOOL.name}</strong>. We empower students with strong academic foundations, ethical values, and transparent daily communication with families through our next-gen digital portal.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/admissions"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-base shadow-lg hover:bg-amber-400 transition-all active:scale-95"
                  >
                    <span>Apply for Admissions</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-base transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    School Portal
                  </Link>

                  <Link
                    href="/portal/student"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-semibold text-sm transition-all active:scale-95"
                  >
                    <span>🎓</span>
                    <span>Student Portal</span>
                  </Link>
                </div>

                <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6 text-slate-300">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">15+</p>
                    <p className="text-xs sm:text-sm text-slate-400">Years of Service</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
                    <p className="text-xs sm:text-sm text-slate-400">Board Pass Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-white">1:20</p>
                    <p className="text-xs sm:text-sm text-slate-400">Student:Teacher</p>
                  </div>
                </div>
              </div>

              {/* Hero Feature Card: The WhatsApp Connected School */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl bg-gradient-to-b from-white/15 to-white/5 p-6 backdrop-blur-xl border border-white/20 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                        Live Parent Connectivity
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      Meta Cloud API
                    </span>
                  </div>

                  {/* Simulated WhatsApp Notification Card */}
                  <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        💬
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Priyanka EM School Desk
                        </p>
                        <p className="text-[11px] text-emerald-400">Official WhatsApp Verified</p>
                      </div>
                      <span className="ml-auto text-[10px] text-slate-400">Just now</span>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-200 space-y-1.5 border border-slate-700">
                      <p className="font-medium text-amber-300">
                        🔔 Absence Alert – Class 10A
                      </p>
                      <p>
                        Dear Parent, your child was marked absent today ({new Date().toISOString().slice(0, 10)}). Please reply to this message if you have an update or need assistance.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>✓ Delivered via n8n</span>
                      <span>Verified: 7090476291</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400">✓</span> Instant attendance roll call by class teachers
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400">✓</span> Automated WhatsApp notifications for absent students
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400">✓</span> Two-way parent conversation routing with AI bot
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Priyanka EM School */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-900">
              Why Families Choose Us
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Complete Foundation for Academic & Personal Success
            </p>
            <p className="text-slate-600 text-base sm:text-lg">
              We combine traditional values and disciplined mentorship with modern digital communication and inquiry-driven learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center text-2xl mb-6">
                📚
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Rigorous Academic Curriculum
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                State board-aligned curriculum enriched with practical sciences, computer skills, spoken English, and continuous weekly assessments to build genuine mastery.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl mb-6">
                📱
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Full Digital Transparency
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Parents are never kept in the dark. Our automated Finkfold system sends immediate WhatsApp alerts for absences, announcements, and term progress reports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center text-2xl mb-6">
                🌱
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Care & Individual Mentorship
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                With an average ratio of 1:20, our dedicated faculty identify each child&apos;s strengths, offer remedial guidance where needed, and celebrate every milestone.
              </p>
            </div>
          </div>
        </section>

        {/* Academic Stages Overview */}
        <section className="bg-slate-100/70 border-y border-slate-200/80 py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-blue-900 mb-2">
                  Academic Stages
                </h2>
                <p className="text-3xl font-extrabold text-slate-900">
                  Comprehensive Learning Pathway
                </p>
              </div>
              <Link
                href="/academics"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-900 hover:text-blue-800"
              >
                <span>View Full Academic Framework</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  Grades I – V
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">
                  Primary Wing
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Focuses on foundational reading fluency, mathematical intuition, environmental awareness, creative expression, and cultivating joyful learning habits.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                  Grades VI – VIII
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">
                  Middle School
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Deepens scientific inquiry, analytical problem solving, bilingual proficiency (English, Telugu, Hindi), computer literacy, and team collaboration.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full uppercase">
                  Grades IX – X
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">
                  Secondary Board Wing
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Rigorous preparation for board examinations with intensive revision schedules, individual mentoring sessions, mock tests, and career counseling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Admissions Callout Banner */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider">
                Limited Seats for 2026–2027
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Give Your Child the Advantage of Purposeful Learning.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Admissions are now open across primary and secondary grades. Speak directly with our admissions counselor or visit our Rasapūdipalem campus.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/admissions"
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all"
                >
                  View Admission Process & Criteria
                </Link>
                <a
                  href={`tel:${SCHOOL.phone}`}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all"
                >
                  Call Admissions: {SCHOOL.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}