import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import UserTable from "../../components/tables/BasicTables/UserTable";
import useExportToExcel from "../../hooks/useExportToExcel";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserManagement() {
  const exportToExcel = useExportToExcel();

  const handleExportToExcel = () => {
    exportToExcel({
      data: [
        { name: "tuan", id: 1 },
        { name: "yen", id: 2 },
      ],
      fileName: "test",
      sheetName: "test",
    });
  };

  return (
    <>
      <PageMeta title={`User Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        <ComponentCard
          title="Users"
          btn={
            <>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white w-full sm:w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button onClick={handleExportToExcel}>Export to Excel</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Export this table</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Export</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        >
          <UserTable />
        </ComponentCard>
      </div>
    </>
  );
}
