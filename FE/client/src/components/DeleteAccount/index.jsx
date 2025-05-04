import { useState } from "react";
import { Button, TextInput } from "..";
import { IoIosArrowForward, IoMdEye, IoMdEyeOff } from "react-icons/io";
import * as UserService from "~/services/UserService";
import { useForm } from "react-hook-form";
import { FaCircleExclamation } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { resetUser } from "~/redux/Slices/userSlice";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import ConfirmDialog from "~/components/ConfirmDialog";
import { message } from "antd";
import { useMediaQuery } from "react-responsive";

function DeleteAccount({ setting }) {
  const [openMainDialog, setOpenMainDialog] = useState(false);
  const [openDialogOption0, setOpenDialogOption0] = useState(false);
  const [openDialogOption1, setOpenDialogOption1] = useState(false);
  const [openDialogOption2, setOpenDialogOption2] = useState(false);
  const [openDialogOption3, setOpenDialogOption3] = useState(false);
  const { t } = useTranslation();
  const [hide, setHide] = useState("hide");
  const dispatch = useDispatch();
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Detect mobile screen
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const handleMainDialogOpen = () => setOpenMainDialog(true);
  const handleMainDialogClose = () => setOpenMainDialog(false);

  const handleDialogOption0Open = () => {
    handleMainDialogClose();
    setOpenDialogOption0(true);
  };
  const handleDialogOption0Close = () => {
    reset({ password: "" });
    setOpenDialogOption0(false);
  };

  const handleDialogOption1Open = () => {
    setOpenDialogOption0(false);
    setOpenDialogOption1(true);
  };
  const handleDialogOption1Close = () => {
    setOpenDialogOption1(false);
  };

  const handleDialogOption2Open = () => {
    handleMainDialogClose();
    setOpenDialogOption2(true);
  };
  const handleDialogOption2Close = () => {
    reset({ password: "" });
    setOpenDialogOption2(false);
  };

  const handleDialogOption3Open = () => {
    setOpenDialogOption2(false);
    setOpenDialogOption3(true);
  };
  const handleDialogOption3Close = () => setOpenDialogOption3(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  //disable account
  const handleDisableAccount = async (data) => {
    setLoadingDisable(true);
    try {
      const res = await UserService.disableAccount({
        password: data?.password,
      });
      if (res) {
        dispatch(resetUser());
      }
    } finally {
      setLoadingDisable(false);
    }
  };

  //delete account
  const handleDeleteAccount = async (data) => {
    console.log("check", data);
    setLoadingDelete(true);
    try {
      const res = await UserService.deleteAccount({
        password: data?.password,
      });
      if (res) {
        dispatch(resetUser());
      }
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div>
      <ConfirmDialog
        open={openDialogOption1}
        onClose={handleDialogOption1Close}
        title="Vô hiệu hóa tài khoản"
        description="Bạn có chắc chắn muốn vô hiệu hóa tài khoản này? Sau khi xác nhận, bạn sẽ bị đăng xuất khỏi hệ thống."
        loading={loadingDisable}
        onConfirm={handleSubmit(handleDisableAccount)}
        confirmText="Vô hiệu hóa"
        className={`${isMobile ? "w-full max-w-xs" : "w-[330px]"}`}
        variant="danger"
      />

      <ConfirmDialog
        open={openDialogOption3}
        onClose={handleDialogOption3Close}
        title="Xóa tài khoản"
        description="Bạn có chắc chắn muốn xóa tài khoản này? Hành động này sẽ không thể hoàn tác."
        loading={loadingDelete}
        onConfirm={handleSubmit(handleDeleteAccount)}
        confirmText="Delete"
        className={`${isMobile ? "w-full max-w-xs" : "w-[330px]"}`}
        variant="danger"
      />
      {setting && (
        <IoIosArrowForward
          size={20}
          onClick={handleMainDialogOpen}
          className="cursor-pointer text-bgStandard"
        />
      )}
      {/* main */}
      <CustomModal
        className={`${
          isMobile ? "w-full max-w-sm px-4" : "w-[550px]"
        } bg-primary p-8 rounded-2xl shadow-lg`}
        isOpen={openMainDialog}
        onClose={handleMainDialogClose}
      >
        <div className="w-full flex font-semibold items-center justify-center text-lg mb-4">
          {t("Vô hiệu hóa hoặc xóa tài khoản")}
        </div>

        <div className="h-full flex flex-col w-full pb-6">
          {/* Deactivation Section */}
          <div className="w-full flex py-4 flex-col gap-2 border-b border-borderNewFeed">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </span>
              <span
                className={`font-semibold ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                {t("Vô hiệu hóa trang cá nhân chỉ mang tính tạm thời")}
              </span>
            </div>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7`}
            >
              {t(
                "Trang cá nhân, nội dung, lượt thích và người theo dõi trên LinkVerse của bạn sẽ không hiển thị với bất kỳ ai cho đến khi bạn đăng nhập lại để kích hoạt trang cá nhân"
              )}
            </p>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7 mt-1`}
            >
              {t(
                "Bạn có thể kích hoạt lại tài khoản bất cứ lúc nào bằng cách đăng nhập vào LinkVerse"
              )}
            </p>
          </div>

          {/* Deletion Section */}
          <div className="w-full flex py-4 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </span>
              <h2
                className={`font-semibold ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                {t("Xóa trang cá nhân là mang tính vĩnh viễn")}
              </h2>
            </div>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7`}
            >
              {t(
                "Trước khi bị gỡ vĩnh viễn, trang cá nhân, nội dung, lượt thích và người theo dõi trên LinkVerse của bạn sẽ ẩn trong 30 ngày."
              )}
            </p>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7 mt-1`}
            >
              {t(
                "Sau 30 ngày, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục."
              )}
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-y-3 items-center justify-between mt-2">
          <Button
            onClick={handleDialogOption0Open}
            title={t("Vô hiệu hóa tài khoản")}
            className="w-full text-ascent-3 bg-bgStandard flex items-center border-1 border-borderNewFeed justify-center py-3 rounded-xl "
          />
          <Button
            title={t("Xóa tài khoản")}
            className="border-1 border-borderNewFeed py-3 rounded-xl text-white bg-red-600 w-full flex items-center justify-center hover:bg-red-700"
            onClick={handleDialogOption2Open}
          />
          <Button
            title={t("Hủy")}
            className="w-full text-ascent-1 border-1 border-borderNewFeed bg-transparent flex items-center justify-center py-3 rounded-xl hover:bg-gray-50"
            onClick={handleMainDialogClose}
          />
        </div>
      </CustomModal>
      {/* 0 */}
      <CustomModal
        isOpen={openDialogOption0}
        onClose={handleDialogOption0Close}
        className={`bg-primary ${
          isMobile ? "w-full max-w-sm px-4" : "w-[450px]"
        } rounded-2xl p-10 gap-3 flex items-center flex-col`}
      >
        <span className="font-semibold text-lg text-left w-full">
          {t("Vô hiệu hóa tài khoản")}
        </span>
        <span className={`text-ascent-2 ${isMobile ? "text-sm" : ""}`}>
          {t(
            "Việc vô hiệu hóa tài khoản của bạn chỉ là tạm thời. Nếu bạn đăng nhập lại vào tài khoản trong vòng 30 ngày, tài khoản sẽ tự động được kích hoạt lại."
          )}
        </span>
        <div className="flex flex-col gap-2 w-full">
          <span className="text-ascent-2 text-sm">
            {t("Để xác nhận, hãy nhập mật khẩu của bạn")}
          </span>
          <div
            className={`w-full flex ${
              isMobile ? "flex-col" : "flex-row"
            } gap-2 items-center`}
          >
            <TextInput
              name="password"
              placeholder={t("Mật khẩu")}
              type={hide === "hide" ? "password" : "text"}
              styles={`w-full text-black h-10 ${
                errors.password ? "border-red-600" : ""
              }`}
              iconRight={
                errors.password ? (
                  <FaCircleExclamation color="red" />
                ) : hide === "hide" ? (
                  <IoMdEyeOff
                    className="cursor-pointer text-black"
                    onClick={() => setHide("show")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer text-black"
                    onClick={() => setHide("hide")}
                  />
                )
              }
              stylesContainer="mt-0"
              toolTip={errors.password ? errors.password.message : ""}
              {...register("password", {
                required: t("Mật khẩu là bắt buộc!"),
              })}
            />
            <Button
              disable={!isValid}
              onClick={handleDialogOption1Open}
              title={t("Vô hiệu hóa")}
              className={`inline-flex justify-center rounded-md bg-red-600 ${
                isMobile ? "w-full" : "w-full"
              } h-10 text-sm font-medium text-white outline-none`}
            />
          </div>
        </div>
      </CustomModal>
      {/* 1 */}
      <CustomModal
        isOpen={openDialogOption2}
        onClose={handleDialogOption2Close}
        className={`bg-primary ${
          isMobile ? "w-full max-w-sm px-4" : "w-[500px]"
        } rounded-2xl p-10 gap-3 flex items-center flex-col`}
      >
        <span className="font-semibold text-lg text-left w-full">
          Deleting account
        </span>
        <span className={`font-extralight ${isMobile ? "text-sm" : ""}`}>
          Deleting your account will remove all of your information from our
          database. This cannot be undone.
        </span>
        <div className="flex flex-col gap-2 w-full">
          <span className="text-ascent-2 text-sm">
            To confirm this, type your password
          </span>
          <div
            className={`w-full flex ${
              isMobile ? "flex-col" : "flex-row"
            } gap-2 items-center`}
          >
            <TextInput
              name="password"
              placeholder="Password"
              type={hide === "hide" ? "password" : "text"}
              styles={`w-full text-black h-10 ${
                errors.password ? "border-red-600" : ""
              }`}
              iconRight={
                errors.password ? (
                  <FaCircleExclamation color="red" />
                ) : hide === "hide" ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => setHide("show")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => setHide("hide")}
                  />
                )
              }
              stylesContainer="mt-0"
              toolTip={errors.password ? errors.password.message : ""}
              {...register("password", {
                required: "This field is required!",
              })}
            />
            <Button
              disable={!isValid}
              onClick={handleDialogOption3Open}
              title="Delete account"
              className={`inline-flex font-semibold justify-center rounded-md bg-red-600 ${
                isMobile ? "w-full" : "w-full"
              } h-10 text-sm text-white outline-none`}
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

export default DeleteAccount;
