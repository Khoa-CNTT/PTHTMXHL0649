import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";

const SearchUserResult = ({ user }) => {
  return (
    <Link
      to={`/profile/${user?.userId}`}
      className="flex justify-between cursor-pointer p-2 rounded-2xl hover:bg-hoverItem items-center w-full gap-x-2"
    >
      <img
        src={user?.imageUrl || BlankAvatar}
        alt="Profile avatar"
        className="w-12 h-12 rounded-full object-cover"
      />

      <div className="flex justify-between items-center flex-1">
        <div className="flex flex-col ">
          <span className="font-semibold text-[15px] antialiased text-ascent-1">
            {user?.username}
          </span>
          <span className="font-normal text-[15px] text-[#999999]">
            {`${user?.firstName} ${user?.lastName}`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SearchUserResult;
