import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";

const UserCard = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = (e) => {
    e.preventDefault();
    setIsFollowing(!isFollowing);
  };

  return (
    <Link
      to={`/profile/${user.id}`}
      className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue text-white font-bold">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{user.name}</h3>
          <div className="text-xs text-gray-500 mt-1">
            {user.followers} người theo dõi
          </div>
        </div>
      </div>

      <button
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
          isFollowing ? "bg-gray-100 text-gray-700" : "bg-blue text-white"
        }`}
        onClick={handleFollow}
      >
        {isFollowing ? (
          <>
            <FaUserCheck size={14} />
            <span>Đang theo dõi</span>
          </>
        ) : (
          <>
            <FaUserPlus size={14} />
            <span>Theo dõi</span>
          </>
        )}
      </button>
    </Link>
  );
};

export default UserCard;
