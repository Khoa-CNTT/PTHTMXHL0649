import { Table } from "antd";
import * as AdminService from "../../../services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { TABLE_ROLES } from "@/constants";

export default function UserTable() {
  const fetchRoles = async () => {
    const res = await AdminService.getAllRoles();
    return res?.result;
  };

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table columns={TABLE_ROLES} dataSource={roles} loading={isLoading} />
      </div>
    </div>
  );
}
