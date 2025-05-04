import { Space, Table, TablePaginationConfig } from "antd";
import { useState } from "react";
import * as AdminService from "@/services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export default function GroupTable() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const TABLE_GROUPS = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 100,
    },
    {
      title: "Member Count",
      dataIndex: "memberCount",
      key: "memberCount",
      width: 100,
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      width: 100,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <a>Update</a>
          <a>Delete</a>
        </Space>
      ),
      width: 100,
    },
  ];

  const fetchGroups = async () => {
    const page = pagination.current - 1;
    const size = pagination.pageSize;

    const res = await AdminService.getAllGroups({ page, size });

    setPagination((prev) => ({
      ...prev,
      total: res?.result?.totalElements || 0,
    }));

    return res?.result;
  };

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups", pagination.current, pagination.pageSize],
    queryFn: fetchGroups,
    placeholderData: keepPreviousData,
  });

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table
          bordered
          columns={TABLE_GROUPS}
          dataSource={groups?.content}
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          rowKey="id"
        />
      </div>
    </div>
  );
}
