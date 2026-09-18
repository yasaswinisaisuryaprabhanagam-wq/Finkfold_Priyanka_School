import { getFacultySeatingChartDataAction } from "@/actions/faculty";
import FacultySeatingChartClient from "@/components/FacultySeatingChartClient";

export const metadata = {
  title: "Smart Seating Chart & Device Lock | Finkfold Faculty",
  description: "Visual classroom seating maps with conduct conflict alerts and 1-click Eyes on Me device freeze.",
};

export default async function FacultySeatingChartPage() {
  const data = await getFacultySeatingChartDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultySeatingChartClient
        initialDesks={data.desks}
        initialWarnings={data.warnings}
        initialDeviceLock={data.deviceLock}
      />
    </div>
  );
}
