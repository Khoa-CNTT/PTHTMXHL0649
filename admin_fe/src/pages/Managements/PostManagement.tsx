import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PostTable from "../../components/tables/PostTables/PostTables";
import { APP_NAME } from "../../utils";

export default function PostManagement() {
  return (
    <>
      <PageMeta title={`Post Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Posts" />
      <div className="space-y-6">
        <ComponentCard title="Posts">
          <PostTable />
        </ComponentCard>
      </div>
    </>
  );
}
