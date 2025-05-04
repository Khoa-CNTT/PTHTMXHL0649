import { useTranslation } from "react-i18next";
import { BlankAvatar } from "~/assets";

const GroupDesc = ({ groupDetail }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-primary flex flex-col gap-2 rounded-2xl p-8 shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
      <span className="text-lg font-semibold text-ascent-1">{t("Mô tả")}</span>
      <span className="text-sm text-ascent-2 tracking-normal leading-6">
        {groupDetail?.description}
      </span>
      <div className="flex w-full justify-between items-start ">
        <div className="flex-1 flex gap-2 flex-col">
          <h3 className="text-sm font-bold text-ascent-1">{t("Thành viên")}</h3>
          <p className="text-gray-500 text-sm">
            {groupDetail?.memberCount} {t("thành viên")}
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-ascent-1">
            {t("Quản trị viên")}
          </h3>
          <div className="flex items-center space-x-2">
            <img
              src={BlankAvatar}
              alt="Admin 1"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDesc;
