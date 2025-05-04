import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CustomModal from "~/components/CustomModal";

const Welcome = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token");
    if (!isLoggedIn) {
      setShow(true);
    }
  }, []);

  return (
    <CustomModal
      className="w-11/12 max-w-2xl bg-primary border-1 border-borderNewFeed px-2 py-8 md:py-14 text-center gap-y-4 md:gap-y-7 flex-col rounded-2xl flex items-center justify-center"
      isOpen={show}
      onClose={handleClose}
    >
      <div className="px-3">
        <h1 className="text-ascent-1 tracking-tight text-2xl md:text-3xl font-extrabold">
          {t("Chào mừng đến với LinkVerse")}
        </h1>
        <h1 className="text-ascent-1 tracking-tight text-2xl md:text-3xl font-extrabold">
          {t("Vũ trụ xã hội đang chờ đón bạn")}
        </h1>
      </div>
      <div className="flex flex-col px-4 md:px-6">
        <p className="text-center text-neutral-600">
          {t("Tham gia LinkVerse để kết nối, chia sẻ và khám phá vô tận")}
        </p>
        <span className="text-neutral-400">
          {t("khả năng giao lưu với bạn bè và cộng đồng")}
        </span>
        <span className="text-neutral-400">
          {t("Đăng nhập ngay và tham gia cuộc trò chuyện")}
        </span>
      </div>
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="text-white bg-[#2557D6] hover:scale-105 transition-transform focus:outline-none font-medium rounded-lg text-sm gap-x-2 px-5 py-2.5 text-center inline-flex items-center justify-center mt-2 md:mt-4"
      >
        {t("Tiếp tục với LinkVerse")}
      </button>
    </CustomModal>
  );
};

export default Welcome;
