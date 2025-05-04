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

export default function UserManagement() {
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

  type DataIndex = keyof DataType;

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue !== undefined && recordValue !== null
        ? recordValue
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false;
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleDeleteUser = async (id: string) => {
    const res = await AdminService.deleteUser(id);
    if (res) {
      message.success({ content: res });
      refetch();
    }
  };

  const TABLE_USERS: TableColumnsType<DataType> = [
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Avatar",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (_, record) => (
        <img
          src={record?.imageUrl || BlankAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full bg-no-repeat"
        />
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
      render: (_, record) => (
        <span className={`text-xs ${!record?.email && "text-zinc-400"}`}>
          {record?.email || "No email"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <span
          className={`${
            record?.status === "ONLINE" ? "text-green-700" : "text-zinc-400"
          } text-xs`}
        >
          {record?.status}
        </span>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (_, record) => (
        <span className={`text-xs ${!record?.phoneNumber && "text-zinc-400"}`}>
          {record?.phoneNumber || "No phone number"}
        </span>
      ),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      render: (_, record) => (
        <span
          className={`${
            record.roles?.[0]?.name === "ADMIN"
              ? "text-red-600"
              : "text-blue-600"
          } font-semibold`}
        >
          {record.roles?.[0]?.name}
        </span>
      ),
      key: "roles",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, record) =>
        `${moment(record?.createdAt).format("MMMM D, YYYY h:mm A")}`,
    },
    {
      title: "Email Verify",
      dataIndex: "emailVerified",
      key: "emailVerified",
      render: (value) => String(value),
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

          {record?.roles[0]?.name === "USER" && (
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
          )}
        </Space>
      ),
      width: 100,
    },
  ];

  const fetchUsers = async () => {
    try {
      const page = pagination.current - 1;
      const size = pagination.pageSize;

      const res = await AdminService.getAllUsers({ page, size });

      if (res?.result?.totalElements !== undefined) {
        setPagination((prev) => ({
          ...prev,
          total: res.result.totalElements,
        }));
      }

      return res?.result;
    } catch (error) {
      console.error("Error fetching users:", error);
      return { content: [] }; // Return empty content on error
    }
  };

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users", pagination.current, pagination.pageSize],
    queryFn: fetchUsers,
    placeholderData: keepPreviousData,
  });

  // Apply global search filter
  useEffect(() => {
    if (users?.content && users.content.length > 0) {
      if (globalSearchText) {
        const filtered = users.content.filter((user) =>
          user.username.toLowerCase().includes(globalSearchText.toLowerCase())
        );
        setFilteredData(filtered);
      } else {
        setFilteredData(users.content);
      }
    } else {
      setFilteredData([]);
    }
  }, [globalSearchText, users?.content]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  };

  const handleExportToExcel = () => {
    if (users?.content) {
      exportToExcel({
        data: users.content,
        fileName: "users-export",
        sheetName: "Users",
      });
    }
  };

  // Global search function
  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalSearchText(e.target.value);
    // Reset to first page when searching
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  return (
    <>
      <PageMeta title={`User Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Users" />
      <CreateUser
        open={isCreateUserModalOpen}
        handleClose={handleCloseCreateUserModal}
      />

      <div className="space-y-6">
        <ComponentCard
          title="Users Table"
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
                  onChange={handleGlobalSearch}
                />
              </div>
              <Button onClick={() => setIsCreateUserModalOpen(true)}>
                Create user
              </Button>
              <Tooltip title="Export this table" placement="top">
                <Button
                  onClick={handleExportToExcel}
                  disabled={!users?.content?.length}
                >
                  Export to Excel
                </Button>
              </Tooltip>
            </>
          }
        >
          <UserTable
            pagination={pagination}
            handleUpdateUser={handleUpdateUser}
            handleTableChange={handleTableChange}
            loading={isLoading}
            data={globalSearchText ? filteredData : users?.content || []}
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
