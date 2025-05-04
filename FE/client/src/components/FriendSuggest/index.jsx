import { Link } from "react-router-dom";
import { BsPersonFillAdd } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { BlankAvatar } from "~/assets";
import { useState } from "react";
import * as FriendService from "~/services/FriendService";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { FaUserClock } from "react-icons/fa6";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Spin } from "antd";
import StoryItemSkeleton from "~/components/Skeleton/StoryItemSkeleton";

const FriendSuggest = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state?.user);
  const [pendingUsers, setPendingUsers] = useState([]);

  const { data: suggestedUsers = [], isLoading: isLoadingSuggestions } =
    useQuery({
      queryKey: ["friendsSuggest"],
      queryFn: async () => {
        const res = await FriendService.friendSuggesstion();
        return res?.result || [];
      },
    });

  const { data: sentRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["requestSent"],
    queryFn: FriendService.getRequestSend,
  });

  // Handle friend request
  const handleRequest = async (id) => {
    try {
      setPendingUsers((prev) => [...prev, id]);
      const res = await FriendService.request(id);

      if (res?.status === "PENDING") {
        queryClient.setQueryData(["requestSent"], (old) => [
          ...(old || []),
          { userId: id },
        ]);
      }
    } catch (error) {
      message.error({ content: "Something went wrong!" });
    } finally {
      setPendingUsers((prev) => prev.filter((userId) => userId !== id));
    }
  };

  const isPending = (userId) =>
    pendingUsers.includes(userId) ||
    sentRequests.some((request) => request?.userId === userId);

  const renderUserList = () => {
    if (isLoadingSuggestions) {
      return Array(3)
        .fill(0)
        .map((_, index) => <StoryItemSkeleton key={index} />);
    }

    const filteredUsers = suggestedUsers.filter(
      (item) => item?.userId !== user?.id
    );

    if (filteredUsers.length === 0) {
      return (
        <span className="text-center text-ascent-1">
          {t("Không có bạn bè đề xuất")}
        </span>
      );
    }

    return filteredUsers.map((item) => (
      <div key={item.userId} className="flex items-center justify-between">
        <Link
          to={`/profile/${item?.userId}`}
          className="flex w-full gap-4 items-center cursor-pointer"
        >
          <img
            src={item?.imageUrl ?? BlankAvatar}
            alt={item?.firstName || "User"}
            className="w-10 h-10 object-cover rounded-full"
          />
          <div className="flex-1 flex flex-col">
            <span className="text-sm text-ascent-1 font-semibold">
              {item.username || "No username"}
            </span>
            <span className="text-sm font-normal text-ascent-2">
              {`${item?.firstName || ""} ${item?.lastName || ""}`.trim() ||
                "No name"}
            </span>
          </div>
        </Link>
        <div className="flex gap-1">
          {isPending(item.userId) ? (
            <FaUserClock size={20} className="text-ascent-2" />
          ) : (
            <button
              className="text-sm text-white p-1 rounded"
              onClick={() => handleRequest(item?.userId)}
            >
              <BsPersonFillAdd size={20} className="text-ascent-1" />
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-3xl border-x-[0.8px] border-y-[0.8px] border-borderNewFeed px-5 py-5">
      <div className="flex items-center justify-between text-lg pb-2 text-ascent-1 border-[#66666645] border-b">
        <span>{t("Gợi ý bạn bè")}</span>
      </div>
      <div className="w-full flex max-h-48 flex-col gap-4 pt-4 overflow-y-auto">
        {renderUserList()}
      </div>
    </div>
  );
};

export default FriendSuggest;
