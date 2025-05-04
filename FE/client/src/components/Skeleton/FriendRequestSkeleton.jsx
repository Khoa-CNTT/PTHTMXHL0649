import { Skeleton } from "antd";

const FriendRequestSkeleton = () => {
  return (
    <div className="w-full bg-primary rounded-2xl px-6 py-5 shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <div className="flex items-center justify-between text-ascent-1 pb-2 border-b border-[#66666645]">
        <span>Lời mời kết bạn</span>
      </div>

      <div className="flex items-center w-full flex-col gap-4 pt-4">
        <div className="flex gap-4 w-full items-center cursor-pointer">
          <div className="relative">
            <Skeleton.Avatar active size={41} shape="circle" />
          </div>

          <div className="flex-1 flex flex-col gap-y-1">
            <Skeleton.Input active size="small" />
            <Skeleton.Input active size="small" />
          </div>
        </div>
        <div className="flex gap-4 w-full items-center cursor-pointer">
          <div className="relative">
            <Skeleton.Avatar active size={41} shape="circle" />
          </div>

          <div className="flex-1 flex flex-col gap-y-1">
            <Skeleton.Input active size="small" />
            <Skeleton.Input active size="small" />
          </div>
        </div>
        <div className="flex gap-4 w-full items-center cursor-pointer">
          <div className="relative">
            <Skeleton.Avatar active size={41} shape="circle" />
          </div>

          <div className="flex-1 flex flex-col gap-y-1">
            <Skeleton.Input active size="small" />
            <Skeleton.Input active size="small" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestSkeleton;
