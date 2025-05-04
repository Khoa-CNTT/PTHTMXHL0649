import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CustomModal from "~/components/CustomModal";

const AlertWelcome = ({ type, open, handleClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <div className="w-full sm:w-[600px] bg-primary py-8 sm:py-14 text-center gap-y-4 sm:gap-y-7 flex-col rounded-xl sm:rounded-2xl flex items-center justify-center px-4 sm:px-0">
        {type === "like" && (
          <h1 className="text-ascent-1 px-2 text-2xl sm:text-3xl font-bold">
            {t("Đăng ký để chia sẻ cảm xúc")}
          </h1>
        )}

        {type === "share" && (
          <h1 className="text-ascent-1 px-2 text-2xl sm:text-3xl font-bold">
            {t("Đăng ký để chia sẻ bài viết")}
          </h1>
        )}

        {type === "comment" && (
          <h1 className="text-ascent-1 px-2 text-2xl sm:text-3xl font-bold">
            {t("Đăng ký để chia sẻ cảm xúc")}
          </h1>
        )}

        {type === "notifications" && (
          <h1 className="text-ascent-1 px-2 text-2xl sm:text-3xl font-bold">
            {t("Đăng ký để nhận thông báo mới nhất")}
          </h1>
        )}

        {type === "save" && (
          <h1 className="text-ascent-1 px-2 text-2xl sm:text-3xl font-bold">
            {t("Đăng ký để có thể lưu bài viết")}
          </h1>
        )}

        {type === "chat" && (
          <h1 className="text-ascent-1 px-2 text-2xl sm:text-3xl font-bold">
            {t("Đăng ký để trò chuyện với bạn bè")}
          </h1>
        )}

        <div className="flex flex-col">
          <p className="text-center text-neutral-600 px-3 sm:px-6 text-sm sm:text-base">
            {t("Tham gia LinkVerse để kết nối, chia sẻ và khám phá vô tận")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-white bg-[#2557D6] hover:scale-105 transition-transform focus:outline-none font-medium rounded-lg text-sm gap-x-2 px-4 sm:px-5 py-2 sm:py-2.5 text-center inline-flex items-center justify-center mt-2 sm:mt-0"
        >
          {t("Tiếp tục với LinkVerse")}
        </button>
      </div>
    </CustomModal>
  );
};

export default AlertWelcome;
