import { useTranslation } from "react-i18next";
import { AiOutlineInteraction } from "react-icons/ai";
import { BsShare } from "react-icons/bs";
import { ImConnection } from "react-icons/im";

const Illustration = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden w-1/2 h-full lg:flex flex-col items-center justify-center bg-blue">
      <div className="relative w-full flex items-center justify-center">
        <img
          src="/register.jpeg"
          alt="bg"
          className="w-48 2xl:w-64 h-48 2xl:h-64 rounded-full object-cover shadow-xl"
        />

        <div className="absolute flex items-center gap-1 bg-primary right-10 top-10 py-2 px-5 rounded-full shadow-xl">
          <BsShare size={14} className="text-ascent-1" />
          <span className="text-xs font-medium text-ascent-1">
            {t("Chia sẻ")}
          </span>
        </div>

        <div className="absolute flex items-center gap-1 bg-primary left-10 top-6 py-2 px-5 rounded-full shadow-xl">
          <ImConnection size={14} className="text-ascent-1" />
          <span className="text-xs font-medium text-ascent-1">
            {t("Kết nối")}
          </span>
        </div>

        <div className="absolute flex items-center gap-1 bg-primary left-12 bottom-6 py-2 px-5 rounded-full shadow-xl">
          <AiOutlineInteraction size={14} className="text-ascent-1" />
          <span className="text-xs font-medium text-ascent-1">
            {t("Tương tác")}
          </span>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-white text-base">
          {t("Kết nối với bạn bè và chia sẻ những điều thú vị")}
        </p>
        <span className="text-sm text-white/80">
          {t("Chia sẻ kỉ niệm với bạn bè và thế giới")}
        </span>
      </div>
    </div>
  );
};

export default Illustration;
