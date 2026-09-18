import { getFacultyStoreIndentDataAction } from "@/actions/faculty";
import FacultyStoreIndentClient from "@/components/FacultyStoreIndentClient";

export const metadata = {
  title: "Store Indent Requisition | Finkfold Faculty",
  description: "Request classroom supplies, whiteboard stationery, and lab materials for direct classroom delivery.",
};

export default async function FacultyStoreIndentPage() {
  const data = await getFacultyStoreIndentDataAction();

  return (
    <div className="portal-content-container p-4 md:p-8 space-y-6">
      <FacultyStoreIndentClient
        initialCatalog={data.catalog}
        initialOrders={data.orders}
      />
    </div>
  );
}
