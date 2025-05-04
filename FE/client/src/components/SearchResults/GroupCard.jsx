import { useState } from "react";
import { Link } from "react-router-dom";
import { HiUserGroup } from "react-icons/hi";
import { FaPlus, FaCheck } from "react-icons/fa";

const GroupCard = ({ group }) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    setIsJoined(!isJoined);
  };

  return (
    <Link
      to={`/group/${group.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-24 bg-gray-200 relative">
        {group.coverImage ? (
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue text-white">
            <HiUserGroup size={32} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{group.name}</h3>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
              isJoined ? "bg-gray-100 text-gray-700" : "bg-blue text-white"
            }`}
            onClick={handleJoin}
          >
            {isJoined ? (
              <>
                <FaCheck size={12} />
                <span>Đã tham gia</span>
              </>
            ) : (
              <>
                <FaPlus size={12} />
                <span>Tham gia</span>
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          {group.members} thành viên
        </div>

        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
          {group.description}
        </p>
      </div>
    </Link>
  );
};

export default GroupCard;
