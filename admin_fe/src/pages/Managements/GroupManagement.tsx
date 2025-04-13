import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import GroupTable from "@/components/tables/BasicTables/GroupTable";

export default function GroupManagement() {
  return (
    <>
      <PageMeta title={`Group Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <GroupTable />
        </ComponentCard>
      </div>
    </>
  );
}
