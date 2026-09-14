import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SCHOOL } from "@/lib/school-config";

export const metadata = {
  title: `Academics – ${SCHOOL.name}`,
  description: `Explore the academic program at ${SCHOOL.name}: curriculum, classes, assessments, and learning support.`,
};

export default function AcademicsPage() {
  const sections = [
    {
      title: "Primary Wing",
      grades: "Grades I – V",
      description: "Building foundational literacy, mathematical thinking, and curiosity in a joyful, supportive atmosphere.",
      highlights: [
        "Phonics & English reading fluency",
        "Foundational arithmetic & mental math",
        "Environmental Studies (EVS)",
        "Art, music, and interactive storytelling",
      ],
    },
    {
      title: "Middle School",
      grades: "Grades VI – VIII",
      description: "Cultivating critical inquiry, scientific concepts, and multilingual communication skills.",
      highlights: [
        "Comprehensive General Science (Physics, Chemistry, Biology basics)",
        "Advanced Mathematics and geometry",
        "Social Studies (History, Civics, Geography)",
        "Computer science fundamentals and coding logic",
      ],
    },
    {
      title: "Secondary Wing",
      grades: "Grades IX – X",
      description: "Focused board exam readiness coupled with deep mentorship, structured revision, and mock assessments.",
      highlights: [
        "Board-aligned syllabus with intensive review cycles",
        "Weekly unit tests and detailed teacher feedback",
        "Laboratory experiments and practical science training",
        "Career guidance & board examination strategy workshops",
      ],
    },
  ];

  const subjects = [
    "English Language & Literature",
    "Telugu (First / Second Language)",
    "Hindi",
    "Mathematics",
    "Physical Science",
    "Biological Science",
    "Social Studies",
    "Computer Science",
    "Physical Education & Sports",
    "Moral & Value Education",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-slate-900 to-[#123B6D] text-white py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Curriculum & Learning
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Academic Excellence at {SCHOOL.name}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              Our academic model blends conceptual understanding, continuous formative assessment, and nurturing support so every student achieves their fullest potential.
            </p>
          </div>
        </section>

        {/* Academic Sections */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-900">
              Structured Pathway
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              Tailored for Every Developmental Stage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sections.map((sec) => (
              <div
                key={sec.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full uppercase">
                    {sec.grades}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">
                    {sec.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {sec.description}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {sec.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-10 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-900">
                Core Curriculum
              </h2>
              <p className="text-3xl font-extrabold text-slate-900">
                Subjects Offered
              </p>
              <p className="text-slate-600 text-sm">
                Aligned with Andhra Pradesh State Board curriculum with enriched English medium instruction.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {subjects.map((s) => (
                <div
                  key={s}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center font-medium text-xs sm:text-sm text-slate-800 shadow-2xs hover:bg-blue-50 hover:text-blue-900 transition-colors"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assessment & Remedial Support */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center text-xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Continuous Evaluation & PTMs
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Rather than relying solely on end-of-year exams, we conduct regular weekly chapter check-ins, monthly assessments, and term examinations. Parents receive detailed progress cards and attend scheduled Parent-Teacher Meetings (PTMs).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl">
                🤝
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Personalized Remedial Guidance
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No child is left behind. Teachers conduct small-group doubt-clearing sessions after regular school hours for students needing additional clarity in subjects like Mathematics and Sciences, with no extra tuition fees.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
