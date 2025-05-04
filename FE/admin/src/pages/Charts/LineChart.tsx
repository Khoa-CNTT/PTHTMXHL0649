import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import LineChartOne from "../../components/charts/line/LineChartOne";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "@/utils";

export default function LineChart() {
  return (
    <>
      <PageMeta title={`User Chart - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="User Chart" />
      <div className="space-y-6">
        <ComponentCard title="Overview">
          <LineChartOne />
        </ComponentCard>
      </div>
    </>
  );
}
