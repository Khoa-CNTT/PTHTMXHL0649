import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets/index";
import StoryItemSkeleton from "~/components/Skeleton/StoryItemSkeleton";
import * as FriendService from "~/services/FriendService";

const FriendCard = () => {
  const { t } = useTranslation();

  const fetchMyFriends = async () => {
    const res = await FriendService.getMyFriends();
    return res;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["myFriends"],
    queryFn: fetchMyFriends,
  });

  return (
    <div className="w-full bg-primary rounded-3xl px-6 py-5 shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <div className="flex items-center justify-between text-ascent-1 pb-2 border-b border-[#66666645]">
        <span>{t("Bạn bè")}</span>
        <span>{data?.length}</span>
      </div>

      <div className="flex items-center w-full flex-col gap-4 pt-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => <StoryItemSkeleton key={index} />)
        ) : data?.length > 0 ? (
          data?.map((friend) => (
            <Link
              key={friend.id}
              to={"/profile/" + friend?.userId}
              className="flex gap-4 w-full items-center cursor-pointer"
            >
              <div className="relative">
                <img
                  src={friend?.imageUrl ?? BlankAvatar}
                  alt={friend?.firstName}
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>

              <div className="flex-1">
                <span className="text-sm font-semibold text-ascent-1">
                  {friend?.username ?? "No profession"}
                </span>
                <p className="text-sm text-ascent-2">
                  {friend?.firstName} {friend?.lastName}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <span className="text-ascent-1">{t("Chưa có bạn nào")}</span>
        )}
      </div>
    </div>
  );
};

export default FriendCard;
