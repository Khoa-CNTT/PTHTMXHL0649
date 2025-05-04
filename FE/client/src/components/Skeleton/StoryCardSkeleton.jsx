import { useTranslation } from "react-i18next";
import { Skeleton } from "antd";

const StoryCardSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-primary shadow-newFeed rounded-2xl px-5 py-5 border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <div className="flex items-center justify-between text-xl text-ascent-1 pb-4 border-b border-[#66666645]">
        <span className="text-lg font-medium">{t("Tin")}</span>
      </div>
      <div className="w-full items-center max-h-[360px] flex flex-col gap-4 pt-4 overflow-hidden">
        <div className="flex gap-4 w-full items-center cursor-pointer">
          <Skeleton.Avatar active size={41} shape="circle" />
          <div className="flex-1 flex-col flex gap-y-1">
            <Skeleton.Input active size="small" />
            <Skeleton.Input active size="small" />
          </div>
        </div>

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
    </div>
  );
};

export default StoryCardSkeleton;
