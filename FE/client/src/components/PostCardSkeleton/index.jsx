import { Skeleton } from "antd";

const PostCardSkeleton = () => {
  return (
    <div className="bg-primary px-2 pt-5 rounded-xl">
      <div className="flex gap-3 px-3 items-center mb-2 cursor-pointer">
        <Skeleton.Avatar active size={50} shape="circle" />
        <Skeleton active />
      </div>
    </div>
  );
};

export default PostCardSkeleton;
