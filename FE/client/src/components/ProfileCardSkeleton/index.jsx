import { Skeleton } from "antd";

const ProfileCardSkeleton = () => {
  return (
    <div className="w-full bg-primary flex flex-col items-center rounded-2xl px-6 py-4 shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed ">
      <div className="w-full flex items-center justify-between border-b pb-5 border-[#66666645]">
        <div className="flex gap-2">
          <div className="relative">
            <Skeleton.Avatar active size={50} shape="circle" />
          </div>
          <div className="flex flex-col gap-y-1 justify-center">
            <Skeleton.Input active size="small" />
            <Skeleton.Input active size="small" />
          </div>
        </div>
        <div className="">
          <Skeleton.Avatar active size={30} shape="square" />
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
        <div className="flex gap-2 items-center text-ascent-2">
          <Skeleton.Input active size="small" />
        </div>

        <div className="flex gap-2 items-center text-ascent-2">
          <Skeleton.Input active size="small" />
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
        <Skeleton.Input active size="small" style={{ width: 200 }} />

        <Skeleton.Input active size="small" />

        <div className="flex items-center justify-between">
          <Skeleton.Input active size="small" />

          <Skeleton.Avatar active size={30} shape="square" />
        </div>
      </div>
      <div className="w-full flex flex-col gap-4 py-4 pb-6">
        <Skeleton.Input active size="small" />

        <div className="flex gap-2 items-center text-ascent-2">
          <Skeleton.Input active size="small" />
        </div>
        <div className="flex gap-2 items-center text-ascent-2">
          <Skeleton.Input active size="small" />
        </div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
