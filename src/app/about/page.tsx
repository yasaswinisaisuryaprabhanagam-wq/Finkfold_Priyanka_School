import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SCHOOL } from "@/lib/school-config";

export const metadata = {
  title: `About Us – ${SCHOOL.name}`,
  description: `Learn about ${SCHOOL.name}: our history, mission, values, and the leadership team behind our community.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-slate-900 to-[#123B6D] text-white py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Our Identity & Legacy
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              About {SCHOOL.name}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              Serving the Rasapūdipalem community with quality English-medium education, strong ethical discipline, and open digital partnership with parents.
            </p>
          </div>
        </section>

        {/* Mission, Vision, and Values */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center text-xl font-bold mb-4">
                🎯
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                To nurture independent, compassionate, and academically accomplished young minds equipped with foundational skills, critical curiosity, and strong moral character.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center text-xl font-bold mb-4">
                🔭
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                To be the most trusted and forward-looking English-medium educational institution in the region, bridging proven pedagogical excellence with modern digital transparency.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl font-bold mb-4">
                ⚖️
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Core Values</h2>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Integrity & Honesty
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Respect for Teachers & Peers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Discipline that Builds Freedom
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Curiosity & Continuous Effort
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Campus & Educational Principles */}
        <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-900">
                School Leadership & Philosophy
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Education is a Partnership Between Teachers and Parents
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                At {SCHOOL.name}, we believe a child flourishes when home and school work as one unified team. This is why we have pioneered complete operational transparency: from daily roll-call updates on WhatsApp to regular one-on-one parent conferences.
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                Our faculty members are not just instructors; they are dedicated mentors who track each learner&apos;s individual growth, social-emotional well-being, and academic milestones.
              </p>
              <div className="pt-2">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
                >
                  Schedule a Campus Visit →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-3xl font-bold text-blue-900">15+</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Years of Service</p>
                <p className="mt-1 text-xs text-slate-500">Rooted in community trust and academic excellence.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-3xl font-bold text-amber-600">100%</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Board Pass Rate</p>
                <p className="mt-1 text-xs text-slate-500">Consistent outstanding performance in state board exams.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-3xl font-bold text-emerald-600">1:20</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Faculty Ratio</p>
                <p className="mt-1 text-xs text-slate-500">Individualized attention and personal mentorship.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-3xl font-bold text-purple-600">24/7</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Parent Connectivity</p>
                <p className="mt-1 text-xs text-slate-500">Immediate attendance alerts via Meta WhatsApp API.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
