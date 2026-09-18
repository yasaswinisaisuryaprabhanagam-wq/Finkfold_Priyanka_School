import { getFacultyCurriculumDataAction } from "@/actions/faculty";
import FacultyCurriculumClient from "@/components/FacultyCurriculumClient";

export const metadata = {
  title: "Collaborative Unit Planner & OBE Tracker | Finkfold Faculty",
  description: "Co-author lesson plans and track outcome-based education standards with NEP 2020 compliance.",
};

export default async function FacultyCurriculumPage() {
  const data = await getFacultyCurriculumDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultyCurriculumClient
        initialUnitPlans={data.unitPlans}
        nepAttainmentAvg={data.nepAttainmentAvg}
        coTeachersSyncedCount={data.coTeachersSyncedCount}
      />
    </div>
  );
}
