import { useTranslation } from "react-i18next";
import * as FriendService from "~/services/FriendService";
import { Button } from "..";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spin } from "antd";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import StoryItemSkeleton from "~/components/Skeleton/StoryItemSkeleton";

const FriendRequest = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const fetchFriendsRequest = async () => {
    const res = await FriendService.getFriendRequests();
    return res;
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["friendsRequest"],
    queryFn: fetchFriendsRequest,
  });

  // accept
  const handleAccept = async (id) => {
    const res = await FriendService.accept(id);
    if (res) {
      refetch();
      queryClient.invalidateQueries(["myFriends"]);
    }
  };

  // decline
  const handleDecline = async (id) => {
    const res = await FriendService.reject(id);
    if (res?.code === 9999 || res?.status === "REJECTED") {
      refetch();
    }
  };

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-3xl px-5 py-5 border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
        <span>{t("Lời mời kết bạn")}</span>
        <span>{data?.length || 0}</span>
      </div>

      <div className="w-full items-center flex flex-col gap-4 pt-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => <StoryItemSkeleton key={index} />)
        ) : data?.length > 0 ? (
          data.map((request) => (
            <div
              key={request.id}
              className="flex items-center w-full justify-between"
            >
              <Link
                to={`/profile/${request?.userId}`}
                className="w-full flex gap-4 items-center cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={request?.imageUrl ?? BlankAvatar}
                    alt={request?.userId}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                </div>

                <div className="flex-1 w-full">
                  <p
                    id="text-ellipsis"
                    className="text-base font-medium text-ascent-1"
                  >
                    {request?.username ?? "No username"}
                  </p>
                  <span id="text-ellipsis" className="text-sm text-ascent-2">
                    {request?.firstName + " " + request?.lastName || "No name"}
                  </span>
                </div>
              </Link>

              <div className="flex gap-1 w-full h-full items-center justify-end">
                <IoIosCheckmark
                  onClick={() => handleAccept(request.userId)}
                  size={32}
                  className="cursor-pointer"
                />
                <IoIosClose
                  onClick={() => handleDecline(request.userId)}
                  size={30}
                  className="cursor-pointer"
                />
              </div>
            </div>
          ))
        ) : (
          <span className="text-ascent-1">{t("Không có lời mời kết bạn")}</span>
        )}
      </div>
    </div>
  );
};

export default FriendRequest;
