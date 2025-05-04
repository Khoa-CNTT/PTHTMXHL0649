import React from "react";
import { useTranslation } from "react-i18next";
import { FaChrome, FaFirefox, FaSafari } from "react-icons/fa";
import { FiLogOut, FiMonitor, FiSmartphone, FiTablet } from "react-icons/fi";

const DeviceItem = ({
  id = "",
  type = " ",
  browser = "",
  location = "",
  ip = "",
  lastActive = "",
  status = "",
  isCurrentDevice = "",
}) => {
  const { t } = useTranslation();
  const getDeviceIcon = (type) => {
    switch (type) {
      case "Desktop":
        return <FiMonitor className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Mobile":
        return <FiSmartphone className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Tablet":
        return <FiTablet className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <FiMonitor className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getBrowserIcon = (browser) => {
    switch (browser) {
      case "Chrome":
        return <FaChrome className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Safari":
        return <FaSafari className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Firefox":
        return <FaFirefox className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return null;
    }
  };

  // Format date string for better display on mobile
  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    // For larger screens, use full date format
    const fullFormat = date.toLocaleString();

    // For mobile, use shorter format
    const shortFormat = date.toLocaleString(undefined, options);

    return <span className="hidden sm:inline">{fullFormat}</span>;
  };

  return (
    <div
      key={id}
      className="bg-primary border-1 border-borderNewFeed rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
    >
      {/* Desktop and Tablet View */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`p-2 rounded-full ${
              status === "Active"
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {getDeviceIcon(type)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-ascent-1">{type}</h3>
              {isCurrentDevice && (
                <span className="bg-blue text-ascent-1 text-xs font-medium px-2.5 py-0.5 rounded">
                  {t("Thiết bị hiện tại")}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {getBrowserIcon(browser)}
              <span>{browser}</span>
              <span>•</span>
              <span>{location}</span>
              <span>•</span>
              <span>{ip}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div
              className={`text-sm font-medium ${
                status === "Active" ? "text-green-600" : "text-gray-500"
              }`}
            >
              {status}
            </div>
            <div className="text-sm text-gray-500">
              {t("Hoạt động lần cuối")}: {new Date(lastActive).toLocaleString()}
            </div>
          </div>
          {/* {!isCurrentDevice && (
            <button
                onClick={() => handleLogout(id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              aria-label="Logout device"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          )} */}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`p-1.5 rounded-full ${
                status === "Active"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {getDeviceIcon(type)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1">
                <h3 className="text-base font-medium text-ascent-1">{type}</h3>
                {isCurrentDevice && (
                  <span className="bg-blue text-ascent-1 text-xs font-medium px-1.5 py-0.5 rounded">
                    {t("Hiện tại")}
                  </span>
                )}
                <span
                  className={`text-xs font-medium ${
                    status === "Active" ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  • {status}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                {getBrowserIcon(browser)}
                <span className="ml-1">{browser}</span>
              </div>
            </div>
          </div>

          {/* {!isCurrentDevice && (
            <button
              onClick={() => handleLogout(id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              aria-label="Logout device"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          )} */}
        </div>

        <div className="mt-1 text-xs text-gray-500 space-y-0.5">
          <div className="flex items-center justify-between">
            <span>{location}</span>
            <span>{ip}</span>
          </div>
          <div>
            {t("Hoạt động lần cuối")}:{" "}
            {new Date(lastActive).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceItem;
