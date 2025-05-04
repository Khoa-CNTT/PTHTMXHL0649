import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { BlankAvatar } from "~/assets";
import { useDebounceHook } from "~/hooks/useDebounceHook";
import * as SearchService from "~/services/SearchService";
import { Alerts, TextInput } from "..";
import { Link } from "react-router-dom";
import * as GroupService from "~/services/GroupService";
import { HiOutlinePlusSm } from "react-icons/hi";
import { Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

const AddMemberToGroup = ({ groupId, onSuccessAdd }) => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchUser = useDebounceHook(keyword, 1000);
  const [showMessage, setShowMessage] = useState(false);
  const [type, setType] = useState("success");
  const [message, setMessage] = useState("");

  const handleCloseMessage = () => setShowMessage(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const res = await SearchService.searchUser({
        keyword: searchUser,
      });
      setSearchResults(res.code === 1000 ? res.result.items || [] : []);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchUser) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchUser]);

  const handleAddToGroup = async (userId) => {
    try {
      const res = await GroupService.addUserToGroup({ userId, groupId });

      if (res?.code === 1019) {
        setType("error");
        setMessage("User is already in group");
        setShowMessage(true);
        return;
      }

      if (res?.code === 200) {
        onSuccessAdd();
        setSearchResults((prev) =>
          prev.filter((user) => user.userId !== userId)
        );
        setType("success");
        setMessage("User added to group successfully!");
        setShowMessage(true);
      }
    } catch (error) {
      setType("error");
      setMessage("User is already in group");
      setShowMessage(true);
    }
  };

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-2xl border border-borderNewFeed px-5 py-5">
      <Alerts
        type={type}
        message={message}
        position={{ vertical: "bottom", horizontal: "center" }}
        handleClose={handleCloseMessage}
        open={showMessage}
        duration={3000}
      />
      <div className="flex items-center justify-between pb-2 text-lg text-ascent-1 border-b border-[#66666645]">
        <span className="text-xl font-medium">
          {t("Thêm thành viên vào nhóm")}
        </span>
      </div>
      <div className="w-full flex flex-col gap-4 pt-4">
        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center">
            <TextInput
              placeholder={t("Tìm kiếm...")}
              styles="w-full  rounded-full py-2"
              iconLeft={<IoIosSearch size={20} />}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
        {/* Search Results */}
        <div className="w-full flex max-h-48 flex-col overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-bgStandard">Loading...</div>
          ) : searchResults.length > 0 ? (
            <ul>
              {searchResults.map((user) => (
                <div
                  key={user?.userId}
                  className="flex items-center pb-2 justify-between"
                >
                  <Link
                    to={"/profile/" + user?.userId}
                    className="flex w-full gap-4 items-center cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={user?.imageUrl ?? BlankAvatar}
                        alt={user?.firstName}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                      {user?.status === "ONLINE" ? (
                        <div className="absolute right-0 top-7 w-3 h-3 bg-[#53C259] rounded-full border-2 border-primary" />
                      ) : (
                        <div className="absolute right-0 top-7 w-2 h-2 bg-[#ccc] rounded-full border-2 border-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-ascent-1">
                        {user?.firstName + " " + user?.lastName ?? "No name"}
                      </p>
                      <span className="text-sm text-ascent-2">
                        {user.username ?? "No name"}
                      </span>
                    </div>
                  </Link>
                  <div className="flex gap-1">
                    <Tooltip title="Add to group" placement="right">
                      <button
                        onClick={() => handleAddToGroup(user?.userId)}
                        className="text-sm text-white p-1 rounded"
                      >
                        <HiOutlinePlusSm
                          size={20}
                          className="text-bluePrimary"
                        />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                // <li
                //   key={user.id}
                //   className="flex items-center p-4 hover:bg-gray-100 cursor-pointer"
                //   onClick={() =>
                //     (window.location.href = `/profile/${user.userId}`)
                //   }
                // >
                //   <img
                //     src={user.imageUrl || BlankAvatar}
                //     alt={`${user.firstName} ${user.lastName}`}
                //     className="w-10 h-10 rounded-full mr-3 object-cover"
                //   />
                //   <div>
                //     <p className="text-sm font-medium text-ascent-1">
                //       {user.firstName} {user.lastName}
                //     </p>
                //     <p className="text-xs text-gray-500">{user.username}</p>
                //   </div>
                // </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-bgStandard">
              {t("Không tìm thấy kết quả nào")}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberToGroup;
