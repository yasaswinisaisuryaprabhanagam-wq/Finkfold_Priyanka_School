import { getFacultySenDataAction } from "@/actions/faculty";
import FacultySenClient from "@/components/FacultySenClient";

export const metadata = {
  title: "SEN & Accommodations Vault | Finkfold Faculty",
  description: "Confidential Individualized Education Program (IEP) tracking and counselor-approved accommodations.",
};

export default async function FacultySenPage() {
  const data = await getFacultySenDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultySenClient
        initialProfiles={data.profiles}
        totalSenStudents={data.totalSenStudents}
      />
    </div>
  );
}
