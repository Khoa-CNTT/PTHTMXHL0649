import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import UserTable from "../../components/tables/BasicTables/UserTable";
import useExportToExcel from "../../hooks/useExportToExcel";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as AdminService from "@/services/AdminService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  InputRef,
  message,
  Popconfirm,
  Space,
  TablePaginationConfig,
  Tooltip,
} from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TableColumnType } from "antd";
import { Button, Input } from "antd";
import Highlighter from "react-highlight-words";
import moment from "moment";
import { BlankAvatar } from "@/assets";
import CreateUser from "@/components/modal/CreateUser";
import FundraisingTable from "@/components/tables/BasicTables/FundraisingTable";

interface DataType {
  id: string;
  firstName: string;
  lastName: string;
  fullname: string;
  username: string;
  email: string;
  status: string;
  phoneNumber: string;
  roles: { name: string }[];
  createdAt: string;
  emailVerified: boolean;
  [key: string]: any;
}

export default function FundraisingManagement() {
  const exportToExcel = useExportToExcel();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [globalSearchText, setGlobalSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<DataType[]>([]);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const handleCloseCreateUserModal = () => setIsCreateUserModalOpen(false);

  const handleUpdateUser = (data) => () => {
    setSelectedUserId(data);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedUserId(null);
  };

  const handleDeleteUser = async (id: string) => {
    const res = await AdminService.deleteUser(id);
    if (res) {
      message.success({ content: res });
      refetch();
    }
  };

  const TABLE_USERS: TableColumnsType<DataType> = [
    {
      title: "Received",
      dataIndex: "receiver_id",
      key: "receiver_id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Current Amount",
      dataIndex: "current_amount",
      key: "current_amount",
    },
    {
      title: "Target Amount",
      dataIndex: "target_amount",
      key: "target_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Created Date",
      dataIndex: "created_date",
      key: "created_date",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <button onClick={handleUpdateUser(record)} className="text-blue-800">
            Update
          </button>

          <Popconfirm
            placement="topLeft"
            title="Delete user"
            description="Are you sure to delete this user?"
            onConfirm={() => handleDeleteUser(record?.id)}
            onCancel={handleCloseUpdateModal}
            okText="Yes"
            cancelText="No"
          >
            <span className="text-red-800 cursor-pointer">Delete</span>
          </Popconfirm>
        </Space>
      ),
      width: 100,
    },
  ];

  const fetchCampaigns = async () => {
    const res = await AdminService.getAllCampaign();
    return res?.result;
  };

  const {
    data: campaigns,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageMeta title={`Fundraising Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Fundraising" />

      <div className="space-y-6">
        <ComponentCard
          title="Fundraising Table"
          btn={
            <>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by username..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white w-full sm:w-64"
                  value={globalSearchText}
                  // onChange={handleGlobalSearch}
                />
              </div>
              <Button onClick={() => setIsCreateUserModalOpen(true)}>
                Create campaign
              </Button>
              <Tooltip title="Export this table" placement="top">
                <Button
                // onClick={handleExportToExcel}
                // disabled={!users?.content?.length}
                >
                  Export to Excel
                </Button>
              </Tooltip>
            </>
          }
        >
          <FundraisingTable
            handleUpdateUser={handleUpdateUser}
            loading={isLoading}
            data={campaigns}
            columns={TABLE_USERS}
            isUpdateModalOpen={isUpdateModalOpen}
            handleCloseUpdateModal={handleCloseUpdateModal}
            selectedUserId={selectedUserId}
          />
        </ComponentCard>
      </div>
    </>
  );
}
