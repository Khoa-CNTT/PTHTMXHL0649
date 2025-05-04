import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import PermissionTable from "@/components/tables/BasicTables/PermissionTable";
import * as AdminService from "@/services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { Search } from "lucide-react";

export default function PermissionManagement() {
  const fetchPermission = async () => {
    const res = await AdminService.getAllPermissions();
    return res?.result;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermission,
    placeholderData: keepPreviousData,
  });

  const columns = [
    {
      title: "Permission Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <>
      <PageMeta title={`Permission Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Permissions" />
      <div className="space-y-6">
        <ComponentCard
          title="Permissions Table"
          btn={
            <>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white w-full sm:w-64"
                />
              </div>
              <Button>Create permission</Button>
            </>
          }
        >
          <PermissionTable
            dataSource={data}
            loading={isLoading}
            columns={columns}
          />
        </ComponentCard>
      </div>
    </>
  );
}
