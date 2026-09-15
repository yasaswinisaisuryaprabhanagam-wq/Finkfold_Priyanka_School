import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SCHOOL } from "@/lib/school-config";

export const metadata = {
  title: `Admissions 2026–2027 – ${SCHOOL.name}`,
  description: `Admissions process, eligibility, documents required, and enquiry form for ${SCHOOL.name}, Nellore.`,
};

export default function AdmissionsPage() {
  const steps = [
    {
      step: "01",
      title: "Inquiry & Campus Tour",
      desc: "Call our admissions office or submit an online inquiry. Visit our campus to meet the teachers and tour our classrooms.",
    },
    {
      step: "02",
      title: "Friendly Interaction",
      desc: "A warm, informal interaction with the child and parents to understand learning readiness and assign the appropriate grade.",
    },
    {
      step: "03",
      title: "Document Verification",
      desc: "Submit copy of birth certificate, previous school records (for Grade II and above), and photographs.",
    },
    {
      step: "04",
      title: "Seat Confirmation",
      desc: "Complete the admission formalities and receive the welcome kit, academic calendar, and parent portal access details.",
    },
  ];

  const ageCriteria = [
    { grade: "Grade I", age: "5 Years 6 Months" },
    { grade: "Grade II", age: "6 Years 6 Months" },
    { grade: "Grade III", age: "7 Years 6 Months" },
    { grade: "Grade IV", age: "8 Years 6 Months" },
    { grade: "Grade V", age: "9 Years 6 Months" },
    { grade: "Grade VI", age: "10 Years 6 Months" },
    { grade: "Grade VII", age: "11 Years 6 Months" },
    { grade: "Grade VIII", age: "12 Years 6 Months" },
    { grade: "Grade IX", age: "13 Years 6 Months" },
    { grade: "Grade X", age: "14 Years 6 Months" },
  ];

  const documents = [
    "Birth Certificate (Original for verification + 2 photocopies)",
    "Transfer Certificate (TC) & Mark sheet from previous school",
    "Aadhaar Card photocopy of student and both parents",
    "4 recent passport-size photographs of the student",
    "Record of routine immunizations / medical history (if any)",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-slate-900 to-[#123B6D] text-white py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Academic Session {SCHOOL.academicYear}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Admissions Open at {SCHOOL.name}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              We welcome applications for students seeking a values-driven, academically stimulating, and parent-friendly learning environment in Nellore.
            </p>
          </div>
        </section>

        {/* 4-Step Process */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-900">
              Admission Journey
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              Four Simple Steps to Join Us
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden"
              >
                <div className="text-3xl font-black text-blue-900/15 mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility & Documents */}
        <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Age Criteria Table */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Age Eligibility Criteria
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Applicable for students enrolling for the {SCHOOL.academicYear} academic year (as of June 1).
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                    <tr>
                      <th className="px-5 py-3.5">Grade / Class</th>
                      <th className="px-5 py-3.5">Minimum Age Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ageCriteria.map((c) => (
                      <tr key={c.grade} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {c.grade}
                        </td>
                        <td className="px-5 py-3 text-slate-600">{c.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Required Documents */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Documents Required
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Please bring the following during the admission verification stage:
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <span className="text-blue-900 font-bold">✓</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>

              {/* Assistance Card */}
              <div className="rounded-2xl bg-blue-900 text-white p-6 shadow-md space-y-3">
                <h4 className="font-bold text-base">Have Admission Questions?</h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Our admissions office is happy to guide you through fee structures, prospectus details, and campus visits.
                </p>
                <div className="pt-1 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${SCHOOL.phone}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                  >
                    📞 Call {SCHOOL.phone}
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-colors"
                  >
                    Enquire Online
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
