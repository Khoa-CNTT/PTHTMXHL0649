import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, PageMeta, TextInput } from "~/components";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as UserService from "~/services/UserService";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { FaCircleExclamation } from "react-icons/fa6";
import { APP_NAME } from "~/utils";
import { useMutationHook } from "~/hooks/useMutationHook";
import { message } from "antd";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const mutation = useMutationHook((data) => UserService.forgotPassword(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (data?.code === 500) {
      message.open({
        type: "warning",
        content: data?.message || "User not found",
      });
    } else if (data?.code === 1000) {
      setSuccess(true);
    }
  }, [isSuccess]);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <PageMeta title={t(`Quên mật khẩu - Bảo vệ tài khoản ${APP_NAME}`)} />
      <div className="w-full h-[100vh] flex bg-bgColor items-center justify-center p-6 ">
        <div className="bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 pb-8 pt-6 shadow-newFeed rounded-xl border-x-[0.8px] border-y-[0.8px] border-solid border-borderNewFeed">
          <div
            className="w-8 h-8 mb-5 active:scale-90 rounded-lg bg-blue flex items-center justify-center hover:scale-110 cursor-pointer transition-transform"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft color="#fff" />
          </div>

          <p className="text-ascent-1 text-lg font-semibold">
            {t("Địa chỉ email")}
          </p>
          <span className="text-sm text-ascent-2">
            {t("Nhập địa chỉ email đã sử dụng để đăng ký")}
          </span>

          {success ? (
            <div className="w-full h-auto flex flex-col items-center justify-center gap-y-2 mt-4">
              <div className="w-full flex items-center justify-center">
                <IoCheckmarkCircleSharp size={40} color="#0DBC3D" />
              </div>
              <span className="text-ascent-1 text-sm">
                {t("Kiểm tra email của bạn để đặt lại mật khẩu")}
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="py-1 flex flex-col gap-5"
            >
              <TextInput
                name="email"
                placeholder="email@example.com"
                label={t("Địa chỉ email")}
                type="email"
                register={register("email", {
                  required: t("Địa chỉ email là bắt buộc"),
                  validate: {
                    noSpaces: (value) =>
                      !/\s/.test(value) || "Email must not contain spaces.",
                  },
                })}
                toolTip={errors.email ? errors.email?.message : ""}
                styles={`w-full bg-primary rounded-lg  ${
                  errors.email ? "border-red-600" : ""
                }`}
                labelStyles="ml-2"
                iconRight={
                  errors.email ? <FaCircleExclamation color="red" /> : ""
                }
                iconRightStyles="right-5"
              />

              <div className="relative">
                <Button
                  disable={isPending}
                  type="submit"
                  isLoading={isPending}
                  className={`inline-flex hover:opacity-90 w-full justify-center rounded-md bg-blue px-8 py-3 text-sm text-white font-medium outline-none`}
                  title={t("Xác nhận")}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
