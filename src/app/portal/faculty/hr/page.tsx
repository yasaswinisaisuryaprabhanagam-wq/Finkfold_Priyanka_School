import { getFacultyHrDataAction } from "@/actions/faculty";
import FacultyHrClient from "@/components/FacultyHrClient";

export const metadata = {
  title: "Staff Self-Service HR Hub | Finkfold Faculty",
  description: "Live leave quotas, downloadable monthly bank payslips, and biometric attendance regularization.",
};

export default async function FacultyHrPage() {
  const data = await getFacultyHrDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultyHrClient
        initialLeaveBalance={data.leaveBalance}
        initialPayslips={data.payslips}
        initialBiometrics={data.biometrics}
      />
    </div>
  );
}
