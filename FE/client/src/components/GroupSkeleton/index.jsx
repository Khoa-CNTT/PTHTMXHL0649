import { GoPlus } from "react-icons/go";
import CreateGroup from "../CreateGroup";
import { GroupCard } from "..";
import { useTranslation } from "react-i18next";
import { GroupAvatar } from "~/assets";
import { Skeleton } from "antd";

const GroupSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-2xl px-5 py-5 border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <CreateGroup />
      <div className="flex items-center justify-between text-xl text-ascent-1 pb-4 border-b border-[#66666645]">
        <span className="text-lg font-medium">{t("Nhóm")}</span>
      </div>

      <div className="w-full items-center max-h-[360px] flex flex-col gap-4 pt-4 overflow-hidden">
        <div className="flex gap-4 w-full items-center cursor-pointer">
          <div className="w-12 h-12 rounded-full border-1 border-borderNewFeed opacity-100 hover:opacity-80 hover:scale-105 transition-transform shadow-2xl flex items-center justify-center">
            <GoPlus size={30} color="#005DFF" />
          </div>
          <div className="flex-1">
            <p className="text-base font-medium text-ascent-1">
              {t("Tạo nhóm của bạn")}
            </p>
            <span className="text-sm text-ascent-2">
              {t("Tạo nhóm để chia sẻ với mọi người")}
            </span>
          </div>
        </div>

        <ul className="w-full gap-y-2 flex flex-col">
          <li>
            <div className="flex gap-4 w-full items-center cursor-pointer">
              <Skeleton.Avatar active size={41} shape="circle" />

              <div className="flex-1 flex flex-col gap-y-1">
                <Skeleton.Input active size="small" style={{ width: 200 }} />
                <Skeleton.Input active size="small" />
              </div>
            </div>
          </li>
          <li>
            <div className="flex gap-4 w-full items-center cursor-pointer">
              <Skeleton.Avatar active size={41} shape="circle" />

              <div className="flex-1 flex flex-col gap-y-1">
                <Skeleton.Input active size="small" style={{ width: 200 }} />
                <Skeleton.Input active size="small" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GroupSkeleton;
