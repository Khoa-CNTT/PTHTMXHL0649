import { Table } from "antd";

export default function PostHistoryTable({
  columns,
  data,
  loading,
  pagination,
  onChange,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table
          bordered
          className="custom-table"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
