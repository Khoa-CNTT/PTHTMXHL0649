import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import RoleTable from "../../components/tables/BasicTables/RoleTable";
import { Button } from "antd";

export default function RoleManagement() {
  return (
    <>
      <PageMeta title={`Role Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Roles" />
      <div className="space-y-6">
        <ComponentCard
          title="Roles Table"
          btn={<Button>Create permission</Button>}
        >
          <RoleTable />
        </ComponentCard>
      </div>
    </>
  );
}
