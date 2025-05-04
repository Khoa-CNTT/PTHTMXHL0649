import { useTranslation } from "react-i18next";
import { MdBallot } from "react-icons/md";
import { PiArticleFill } from "react-icons/pi";
import { FaUserFriends } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi2";
import { useState, useEffect } from "react";

const SearchFilterCard = ({
  keyword,
  onFilterChange,
  activeFilter = "all",
  searchQuery = "",
}) => {
  const { t } = useTranslation();
  const [localActiveFilter, setLocalActiveFilter] = useState(activeFilter);

  useEffect(() => {
    setLocalActiveFilter(activeFilter);
  }, [activeFilter]);

  const filters = [
    { id: "all", icon: MdBallot, label: "Tất cả" },
    { id: "posts", icon: PiArticleFill, label: "Bài viết" },
    { id: "users", icon: FaUserFriends, label: "Người dùng" },
    { id: "groups", icon: HiUserGroup, label: "Nhóm" },
  ];

  const handleFilterChange = (filterId) => {
    setLocalActiveFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl px-5 py-4 shadow-md border border-gray-200">
      <div className="flex flex-col justify-between border-b border-gray-200 pb-3 mb-2">
        <span className="font-semibold text-lg text-gray-800">
          Kết quả tìm kiếm cho
        </span>
        <span className="text-gray-500 font-medium mt-1">
          "{keyword || searchQuery}"
        </span>
      </div>

      <div className="w-full">
        <span className="block text-sm font-semibold text-gray-700 py-3">
          Bộ lọc
        </span>

        <ul className="w-full flex flex-col space-y-1">
          {filters.map((filter) => (
            <li key={filter.id}>
              <div
                className={`w-full flex items-center gap-x-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  localActiveFilter === filter.id
                    ? "bg-blue text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => handleFilterChange(filter.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    localActiveFilter === filter.id ? "bg-blue" : "bg-gray-700"
                  }`}
                >
                  <filter.icon color="#fff" size={18} />
                </div>
                <span className="font-medium">{filter.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchFilterCard;
