import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";

export default function FundraisingManagement() {
  return (
    <>
      <PageMeta title={`User Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="User">
          <div></div>
        </ComponentCard>
      </div>
    </>
  );
}
