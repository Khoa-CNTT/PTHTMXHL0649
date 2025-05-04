import { useEffect, useState } from "react";
import { Button, TextInput } from "~/components";
import { useTranslation } from "react-i18next";
import { IoIosArrowForward, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useForm } from "react-hook-form";
import { FaArrowLeft } from "react-icons/fa";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as UserService from "~/services/UserService";
import { FaCircleExclamation } from "react-icons/fa6";
import { GoLock } from "react-icons/go";
import { message } from "antd";
import CustomModal from "~/components/CustomModal";
import ConfirmDialog from "~/components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetUser } from "~/redux/Slices/userSlice";

const ChangePassword = ({ setting }) => {
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleCloseConfirm = () => setOpenConfirm(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [newData, setNewData] = useState({});
  const handleClose = () => {
    setOpen(false);
    resetField("oldPassword", "newPassword", "confirmPassword");
  };
  const { t } = useTranslation();
  const handleOpen = () => setOpen(true);
  const [hideCurrent, setHideCurrent] = useState("hide");
  const [hideNew, setHideNew] = useState("hide");
  const [hideConfirm, setHideConfirm] = useState("hide");
  const {
    register,
    handleSubmit,
    getValues,
    resetField,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const mutation = useMutationHook((data) => UserService.changePassword(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 1044) {
        handleCloseConfirm();
        message.open({
          type: "error",
          content: t(data?.message) || t("Mật khẩu không đúng"),
        });
      } else {
        dispatch(resetUser());
        navigate("/login");
        message.open({
          type: "success",
          content:
            t(data?.message) ||
            t("Đã thay đổi mật khẩu thành công. Vui lòng đăng nhập lại"),
        });
      }
    }
  }, [isSuccess]);

  const onSubmit = (data) => {
    setOpenConfirm(true);
    handleClose();
    setNewData(data);
  };

  const handleSubmitConfirm = () => {
    mutation.mutate({ data: newData });
  };

  return (
    <div>
      {setting && (
        <IoIosArrowForward
          onClick={handleOpen}
          size={20}
          className="cursor-pointer text-bgStandard"
        />
      )}

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleSubmitConfirm}
        loading={isPending}
        title={t("Bạn có chắc không")}
        description={t(
          "Bạn có chắc chắn muốn đổi mật khẩu? Sau khi đổi mật khẩu thành công, bạn sẽ bị đăng xuất khỏi tất cả thiết bị để bảo mật tài khoản. Vui lòng đăng nhập lại bằng mật khẩu mới."
        )}
        confirmText={t("Xác nhận")}
        variant="danger"
        className="w-[300px]"
      />

      <CustomModal
        className="bg-primary w-full md:w-[500px] max-w-[95vw] p-4 md:p-6 shadow-newFeed rounded-2xl border-1 border-borderNewFeed"
        isOpen={open}
        onClose={handleClose}
      >
        <div
          className="w-8 h-8 mb-4 rounded-lg active:scale-90 bg-bgStandard flex items-center justify-center hover:scale-110 cursor-pointer transition-transform"
          onClick={() => handleClose()}
        >
          <FaArrowLeft className="text-primary" />
        </div>
        <p className="text-ascent-1 text-base md:text-lg font-semibold">
          {t("Thay đổi mật khẩu")}
        </p>
        <span className="text-xs md:text-sm leading-normal text-ascent-2">
          {t(
            "Để thay đổi mật khẩu, vui lòng điền vào các trường bên dưới. Mật khẩu của bạn phải chứa ít nhất 8 ký tự, mật khẩu cũng phải bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt."
          )}
        </span>

        <form onSubmit={handleSubmit(onSubmit)} className="py-2 flex flex-col">
          <div className="w-full flex flex-col gap-2">
            <TextInput
              name="oldPassword"
              placeholder={t("Mật khẩu hiện tại")}
              label={t("Mật khẩu hiện tại")}
              type={hideCurrent === "hide" ? "password" : "text"}
              register={register("oldPassword", {
                required: t("Mật khẩu là bắt buộc"),
                validate: {
                  noSpaces: (value) =>
                    !/\s/.test(value) ||
                    t("Mật khẩu không được chứa khoảng trắng"),
                },
                minLength: {
                  value: 8,
                  message: t("Mật khẩu phải chứa ít nhất 8 ký tự"),
                },
                maxLength: {
                  value: 64,
                  message: t("Mật khẩu không được quá 64 ký tự"),
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
                  message: t(
                    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
                  ),
                },
              })}
              iconRight={
                errors.oldPassword ? (
                  <FaCircleExclamation color="red" />
                ) : hideCurrent === "hide" ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => setHideCurrent("show")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => setHideCurrent("hide")}
                  />
                )
              }
              iconLeft={<GoLock className="text-ascent-1" />}
              iconRightStyles="right-3 md:right-5"
              styles={`w-full border-1 border-borderNewFeed bg-primary text-ascent-1 rounded-xl text-sm md:text-base ${
                errors.oldPassword ? "border-red-600" : ""
              }`}
              toolTip={errors.oldPassword ? errors.oldPassword?.message : ""}
              labelStyles="ml-2 text-sm md:text-base"
            />

            <TextInput
              name="newPassword"
              placeholder={t("Mật khẩu mới")}
              label={t("Mật khẩu mới")}
              type={hideNew === "hide" ? "password" : "text"}
              register={register("newPassword", {
                required: t("Mật khẩu là bắt buộc"),
                validate: {
                  noSpaces: (value) =>
                    !/\s/.test(value) ||
                    t("Mật khẩu không được chứa khoảng trắng"),
                  notSameAsOld: (value) =>
                    value !== getValues("oldPassword") ||
                    t("Mật khẩu mới không được trùng với mật khẩu cũ"),
                },
                minLength: {
                  value: 8,
                  message: t("Mật khẩu phải chứa ít nhất 8 ký tự"),
                },
                maxLength: {
                  value: 64,
                  message: t("Mật khẩu không được quá 64 ký tự"),
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
                  message: t(
                    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
                  ),
                },
              })}
              iconRight={
                errors.newPassword ? (
                  <FaCircleExclamation color="red" />
                ) : hideNew === "hide" ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => setHideNew("show")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => setHideNew("hide")}
                  />
                )
              }
              iconLeft={<GoLock className="text-ascent-1" />}
              iconRightStyles="right-3 md:right-5"
              styles={`w-full border-1 border-borderNewFeed bg-primary text-ascent-1 rounded-xl text-sm md:text-base ${
                errors.newPassword ? "border-red-600" : ""
              }`}
              toolTip={errors.newPassword ? errors.newPassword?.message : ""}
              labelStyles="ml-2 text-sm md:text-base"
            />

            <TextInput
              name="confirmPassword"
              placeholder={t("Xác nhận mật khẩu mới")}
              label={t("Xác nhận mật khẩu mới")}
              type={hideConfirm === "hide" ? "password" : "text"}
              register={register("confirmPassword", {
                validate: (value) => {
                  const { newPassword } = getValues();

                  if (newPassword != value) {
                    return t("Mật khẩu không khớp");
                  }
                },
              })}
              iconRight={
                errors.confirmPassword ? (
                  <FaCircleExclamation color="red" />
                ) : hideConfirm === "hide" ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => setHideConfirm("show")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => setHideConfirm("hide")}
                  />
                )
              }
              iconLeft={<GoLock className="text-ascent-1" />}
              iconRightStyles="right-3 md:right-5"
              styles={`w-full border-1 border-borderNewFeed text-ascent-1 bg-primary rounded-xl text-sm md:text-base ${
                errors.confirmPassword ? "border-red-600" : ""
              }`}
              toolTip={
                errors.confirmPassword ? errors.confirmPassword?.message : ""
              }
              labelStyles="ml-2 text-sm md:text-base"
            />
          </div>

          <div className="relative">
            <Button
              type="submit"
              className={`inline-flex hover:opacity-90 w-full justify-center rounded-md bg-bgStandard px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm text-primary font-medium outline-none mt-3`}
              title={t("Xác nhận")}
            />
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default ChangePassword;
