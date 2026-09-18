import { getFacultyMaintenanceDataAction } from "@/actions/faculty";
import FacultyMaintenanceClient from "@/components/FacultyMaintenanceClient";

export const metadata = {
  title: "Campus Maintenance & Helpdesk | Finkfold Faculty",
  description: "Report classroom facility repairs, AC leaks, and smart board issues directly to the Estate Manager.",
};

export default async function FacultyMaintenancePage() {
  const data = await getFacultyMaintenanceDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultyMaintenanceClient initialTickets={data.tickets} />
    </div>
  );
}
