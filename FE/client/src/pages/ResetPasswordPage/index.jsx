import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, PageMeta, TextInput } from "~/components";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as UserService from "~/services/UserService";
import { FaCircleExclamation } from "react-icons/fa6";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { APP_NAME } from "~/utils";
import { message } from "antd";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [errMsg, setErrMsg] = useState("");
  const [searchParams] = useSearchParams();
  const [hidePass, setHidePass] = useState("hide");
  const [hideConfirm, setHideConfirm] = useState("hide");
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const mutation = useMutationHook(({ password, token }) =>
    UserService.resetPassword({ password, token })
  );
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      message.open({
        type: "success",
        content: t(data?.message) || t("Đặt lại mật khẩu thành công"),
      });
      navigate("/login");
    }
  }, [isSuccess]);

  const onSubmit = async (data) => {
    mutation.mutate({ password: data.password, token });
  };

  return (
    <div>
      <PageMeta
        title={t(`Thay đổi mật khẩu - Bảo vệ tài khoản ${APP_NAME}`)}
        description="Cập nhật mật khẩu mới để bảo vệ tài khoản LinkVerse của bạn. Hãy chọn một mật khẩu mạnh và dễ nhớ để đảm bảo an toàn cho thông tin cá nhân!"
      />
      <div className="w-full h-[100vh] flex bg-bgColor items-center justify-center p-6 ">
        <div className="bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 pb-8 pt-6 shadow-newFeed rounded-xl border-x-[0.8px] border-y-[0.8px] border-solid border-borderNewFeed">
          <div
            className="w-8 h-8 mb-4 rounded-lg active:scale-90 bg-blue flex items-center justify-center hover:scale-110 cursor-pointer transition-transform"
            onClick={() => navigate("/forgot-password")}
          >
            <FaArrowLeft color="#fff" />
          </div>
          <p className="text-ascent-1 text-lg font-semibold">
            {t("Thay đổi mật khẩu")}
          </p>
          <span className="text-sm text-ascent-2">
            {t("Nhập mật khẩu mới")}
          </span>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="py-2  flex flex-col"
          >
            <div className="w-full flex flex-col gap-2">
              <TextInput
                name="password"
                placeholder={t("Mật khẩu mới")}
                label={t("Mật khẩu mới")}
                type={hidePass === "hide" ? "password" : "text"}
                register={register("password", {
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
                  errors.password ? (
                    <FaCircleExclamation color="red" />
                  ) : hidePass === "hide" ? (
                    <IoMdEyeOff
                      className="cursor-pointer"
                      onClick={() => setHidePass("show")}
                    />
                  ) : (
                    <IoMdEye
                      className="cursor-pointer"
                      onClick={() => setHidePass("hide")}
                    />
                  )
                }
                iconRightStyles="right-5"
                styles={`w-full rounded-lg bg-primary ${
                  errors.password ? "border-red-600" : ""
                }`}
                toolTip={errors.password ? errors.password?.message : ""}
                labelStyles="ml-2"
              />

              <TextInput
                name="cPassword"
                placeholder={t("Xác nhận mật khẩu mới")}
                label={t("Xác nhận mật khẩu mới")}
                type={hideConfirm === "hide" ? "password" : "text"}
                register={register("cPassword", {
                  validate: (value) => {
                    const { password } = getValues();

                    if (password != value) {
                      return t("Mật khẩu không khớp");
                    }
                  },
                })}
                iconRight={
                  errors.cPassword ? (
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
                iconRightStyles="right-5"
                styles={`w-full rounded-lg bg-primary  ${
                  errors.cPassword ? "border-red-600" : ""
                }`}
                toolTip={errors.cPassword ? errors.cPassword?.message : ""}
                labelStyles="ml-2"
              />
            </div>

            {errMsg && (
              <span className={`text-sm mt-0.5 text-red-600`}>{errMsg}</span>
            )}

            <div className="relative">
              <Button
                disable={isPending}
                isLoading={isPending}
                type="submit"
                className={`inline-flex hover:opacity-90 w-full justify-center rounded-md bg-blue px-8 py-3 text-sm text-white font-medium outline-none mt-3`}
                title={t("Xác nhận")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
