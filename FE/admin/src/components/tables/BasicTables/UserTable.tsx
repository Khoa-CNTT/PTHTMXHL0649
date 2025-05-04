import UpdateUser from "@/components/modal/UpdateUser";
import { Table } from "antd";

export default function UserTable({
  columns,
  data,
  loading,
  handleTableChange,
  handleUpdateUser,
  pagination,
  isUpdateModalOpen,
  handleCloseUpdateModal,
  selectedUserId,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <UpdateUser
          open={isUpdateModalOpen}
          handleClose={handleCloseUpdateModal}
          data={selectedUserId}
        />

        <Table
          bordered
          className="custom-table"
          columns={columns}
          dataSource={data}
          loading={loading}
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
