import { Table } from "antd";

const PermissionTable = ({ columns, dataSource, loading }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table columns={columns} dataSource={dataSource} loading={loading} />
      </div>
    </div>
  );
};

export default PermissionTable;
