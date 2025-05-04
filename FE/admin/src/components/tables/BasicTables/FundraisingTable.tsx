import UpdateUser from "@/components/modal/UpdateUser";
import { Table } from "antd";

export default function FundraisingTable({
  columns,
  data,
  loading,
  handleTableChange,
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
          onChange={handleTableChange}
          rowKey="id"
        />
      </div>
    </div>
  );
}
