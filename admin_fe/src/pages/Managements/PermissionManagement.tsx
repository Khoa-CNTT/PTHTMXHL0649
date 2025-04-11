import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";

export default function PermissionManagement() {
  return (
    <>
      <PageMeta title={`Group Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <div></div>
        </ComponentCard>
      </div>
    </>
  );
}
