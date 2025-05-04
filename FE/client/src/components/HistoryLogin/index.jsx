import { useEffect, useState, useMemo } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { FiLock, FiSearch, FiInfo, FiAlertCircle } from "react-icons/fi";
import * as UserService from "~/services/UserService";
import { useQuery } from "@tanstack/react-query";
import DeviceItem from "~/components/HistoryLogin/DeviceItem";
import CustomModal from "~/components/CustomModal";
import { useTranslation } from "react-i18next";

const HistoryLogin = ({ setting }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["loginHistory"],
    queryFn: UserService.getLoginHistory,
    enabled: open, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback to mock data if API fails or during development
  const devices = useMemo(() => {
    if (data?.result?.data && data.result.data.length > 0) {
      return data.result.data;
    }

    // Mock data for development or fallback
    return [
      {
        id: 1,
        deviceInfo: {
          deviceType: "Desktop",
          ipAddress: "192.168.1.1",
          browser: "Chrome",
        },
        location: "New York, USA",
        loginTime: "2024-01-20T10:30:00",
        status: "Active",
        isCurrentDevice: true,
      },
      {
        id: 2,
        deviceInfo: {
          deviceType: "Mobile",
          ipAddress: "192.168.1.2",
          browser: "Safari",
        },
        location: "London, UK",
        loginTime: "2024-01-20T09:15:00",
        status: "Inactive",
      },
      {
        id: 3,
        deviceInfo: {
          deviceType: "Tablet",
          ipAddress: "192.168.1.3",
          browser: "Firefox",
        },
        location: "Tokyo, Japan",
        loginTime: "2024-01-20T08:45:00",
        status: "Active",
      },
    ];
  }, [data]);

  const filteredDevices = useMemo(() => {
    if (!searchTerm.trim()) return devices;

    return devices.filter((device) => {
      const deviceType = device.deviceInfo?.deviceType || "";
      const location = device.location || "";
      const browser = device.deviceInfo?.browser || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        deviceType.toLowerCase().includes(searchLower) ||
        location.toLowerCase().includes(searchLower) ||
        browser.toLowerCase().includes(searchLower)
      );
    });
  }, [devices, searchTerm]);

  return (
    <div>
      {setting && (
        <IoIosArrowForward
          onClick={handleOpen}
          size={20}
          className="cursor-pointer text-bgStandard hover:text-blue-600 transition-colors"
          aria-label="View login history"
        />
      )}

      <CustomModal
        className="bg-primary max-h-[90vh] w-[95%] sm:w-[90%] sm:max-w-2xl rounded-lg sm:rounded-2xl shadow-lg p-3 sm:p-6"
        isOpen={open}
        onClose={handleClose}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <FiLock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-semibold text-ascent-1">
              {t("Thiết bị đang hoạt động")}
            </h1>
            <span className="ml-1 sm:ml-2 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full">
              {filteredDevices.length}{" "}
              {filteredDevices.length === 1 ? "device" : t("thiết bị")}
            </span>
          </div>

          <button
            onClick={refetch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium self-end sm:self-auto"
            disabled={isLoading}
          >
            {t("Làm mới")}
          </button>
        </div>

        <div className="relative mb-4 sm:mb-6">
          <input
            type="text"
            placeholder={t(
              "Tìm kiếm theo thiết bị, vị trí hoặc trình duyệt..."
            )}
            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-bgSearch border-1 border-borderNewFeed rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-6 sm:py-8 bg-primary border-1 border-borderNewFeed rounded-lg">
            <FiAlertCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-red-500" />
            <h3 className="mt-2 text-base sm:text-lg font-medium text-red-900">
              Error loading devices
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-red-700">
              {error?.message ||
                "Failed to load login history. Please try again."}
            </p>
            <button
              onClick={refetch}
              className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-primary border-1 border-borderNewFeed rounded-lg">
            <FiInfo className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">
              {t("Không tìm thấy thiết bị nào")}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {searchTerm
                ? t("Không có thiết bị nào khớp với tiêu chí tìm kiếm của bạn.")
                : t("Bạn chưa có lịch sử đăng nhập nào.")}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                {t("Xóa tìm kiếm")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[300px] sm:max-h-[400px] pr-1">
            {filteredDevices.map((device) => (
              <DeviceItem
                key={device.id}
                id={device.id}
                type={device.deviceInfo?.deviceType || "Unknown"}
                browser={device.deviceInfo?.browser || "Unknown"}
                location={device.location || "Unknown"}
                ip={device.deviceInfo?.ipAddress || "Unknown"}
                lastActive={device.loginTime}
                status={device.status || "Unknown"}
                isCurrentDevice={device.isCurrentDevice}
              />
            ))}
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default HistoryLogin;
