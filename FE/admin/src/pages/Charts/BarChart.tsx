import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "@/utils";

export default function BarChart() {
  return (
    <div>
      <PageMeta title={`Post Chart - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Post Chart" />
      <div className="space-y-6">
        <ComponentCard title="Overview">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
