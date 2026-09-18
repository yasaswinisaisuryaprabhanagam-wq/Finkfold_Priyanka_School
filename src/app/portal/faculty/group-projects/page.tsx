import { getFacultyGroupProjectsDataAction } from "@/actions/faculty";
import FacultyGroupProjectsClient from "@/components/FacultyGroupProjectsClient";

export const metadata = {
  title: "Group Project & Peer-Review Hub | Finkfold Faculty",
  description: "Anonymous peer evaluations and individual contribution heatmaps for fair collaborative grading.",
};

export default async function FacultyGroupProjectsPage() {
  const data = await getFacultyGroupProjectsDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultyGroupProjectsClient initialProjects={data.projects} />
    </div>
  );
}
