import { getFacultyVoiceGraderDataAction } from "@/actions/faculty";
import FacultyVoiceGraderClient from "@/components/FacultyVoiceGraderClient";

export const metadata = {
  title: "Voice-Note Feedback & AI Rubric Grader | Finkfold Faculty",
  description: "AI-assisted rubric grading for subjective essays and 1-tap personalized audio voice note dispatches.",
};

export default async function FacultyVoiceGraderPage() {
  const data = await getFacultyVoiceGraderDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultyVoiceGraderClient initialSubmissions={data.submissions} />
    </div>
  );
}
