import React from "react";
import { Skeleton } from "antd";

const StoryItemSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-4 overflow-y-auto">
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
  );
};

export default StoryItemSkeleton;
