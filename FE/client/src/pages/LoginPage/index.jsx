import {
  Button,
  Button as CustomButton,
  PageMeta,
  TextInput,
} from "~/components";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as UserService from "~/services/UserService";
import { FaCircleExclamation } from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";
import { updateUser } from "~/redux/Slices/userSlice";
import { useDispatch } from "react-redux";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { APP_NAME } from "~/utils";
import OtpVerification from "~/components/OtpVerification";
import Logo from "~/components/Logo";
import Illustration from "~/components/Illustration";
import { message } from "antd";

const LoginPage = () => {
  const { t } = useTranslation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [hide, setHide] = useState("hide");
  const { state } = useLocation();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: state?.dataUser?.username || "",
    },
  });

  const mutation = useMutationHook((newData) => UserService.login(newData));
  const { data: dataLogin, isPending, isSuccess, isError } = mutation;

  const handleGetDetailUser = useCallback(
    async ({ id, token }) => {
      const res = await UserService.getDetailUserByUserId({ id });
      dispatch(updateUser({ ...res?.result, token }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (isSuccess) {
      if (dataLogin?.code === 1000 && dataLogin?.result?.token) {
        window.open(
          `http://localhost:3001?tk=${dataLogin?.result?.token}`,
          "_blank"
        );
      } else if (dataLogin?.code === 1030) {
        setOpen(true);
      }
    }
  }, [isSuccess, isError]);

  const onSubmit = async (data) => {
    const newData = { ...data, otp: 0 };
    setUserData(newData);
    mutation.mutate(newData);
  };

  const handleSuccessLoginGoogle = useCallback(
    async (credential) => {
      try {
        setIsGoogleLoading(true);
        message.loading({
          content: t("Login to Google..."),
          key: "googleLogin",
        });

        const res = await UserService.loginGoogle({
          access_token: credential?.access_token,
        });

        const token = res?.access_token;
        if (token) {
          localStorage.setItem("token", token);
          const decoded = jwtDecode(token);
          if (decoded?.userId) {
            await handleGetDetailUser({ id: decoded.userId, token });
          }
          message.destroy();
          message.success({
            content: t("Đăng nhập thành công!"),
            key: "googleLogin",
          });
          navigate("/");
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [navigate, handleGetDetailUser, t]
  );

  const handleLoginGoogle = useGoogleLogin({
    flow: "implicit",
    onSuccess: handleSuccessLoginGoogle,
  });

  return (
    <div>
      <OtpVerification
        open={open}
        handleClose={handleClose}
        userData={userData}
      />
      <PageMeta
        title={t(`Đăng nhập vào ${APP_NAME}`)}
        description=" Truy cập LinkVerse ngay hôm nay! Kết nối với bạn bè, khám phá nội dung thú vị và chia sẻ khoảnh khắc đáng nhớ. Đăng nhập để bắt đầu hành trình của bạn!"
      />
      <div className="bg-bgColor w-full h-[100vh] flex items-center justify-center p-6 ">
        <div className="w-full md:w-2/3 h-fit lg:h-full 2xl:h-5/6 py-8 lg:py-0 flex bg-primary rounded-xl overflow-hidden shadow-newFeed border-borderNewFeed border-solid border-x-[0.8px] border-y-[0.8px]">
          <div className="w-full lg:w-1/2 h-full p-10 2xl:px-20 flex flex-col justify-center ">
            <Logo />

            <p className="text-ascent-1 text-base font-semibold">
              {t("Đăng nhập vào tài khoản của bạn")}
            </p>
            <span className="text-sm mt-2 text-ascent-2">
              {t("Chào mừng bạn quay trở lại")}!
            </span>

            <form
              className="py-4 flex flex-col gap-5="
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="w-full flex flex-col gap-2">
                <TextInput
                  name="username"
                  placeholder={t("Tên người dùng hoặc email")}
                  label={t("Tên người dùng hoặc email")}
                  type="username"
                  register={register("username", {
                    required: t("Tên người dùng là bắt buộc"),
                    validate: {
                      noSpaces: (value) =>
                        !/\s/.test(value) ||
                        "User name must not contain spaces.",
                    },
                  })}
                  styles={`w-full bg-primary rounded-lg ${
                    errors.username ? "border-red-600" : ""
                  }`}
                  iconRight={
                    errors.username ? <FaCircleExclamation color="red" /> : ""
                  }
                  iconRightStyles="right-5"
                  toolTip={errors.username ? errors.username?.message : ""}
                  labelStyles="ml-2"
                />

                <TextInput
                  name="password"
                  label={t("Password")}
                  placeholder={t("Mật khẩu")}
                  type={hide === "hide" ? "password" : "text"}
                  styles={`w-full bg-primary rounded-lg  ${
                    errors.password ? "border-red-600" : ""
                  }`}
                  labelStyles="ml-2"
                  iconRight={
                    errors.password ? (
                      <FaCircleExclamation color="red" />
                    ) : hide === "hide" ? (
                      <IoMdEyeOff
                        className="cursor-pointer text-ascent-1"
                        onClick={() => setHide("show")}
                      />
                    ) : (
                      <IoMdEye
                        className="cursor-pointer text-ascent-1"
                        onClick={() => setHide("hide")}
                      />
                    )
                  }
                  toolTip={errors.password ? errors.password?.message : ""}
                  iconRightStyles="right-5"
                  register={register("password", {
                    required: t("Mật khẩu là bắt buộc"),
                    validate: {
                      noSpaces: (value) =>
                        !/\s/.test(value) ||
                        t("Mật khẩu không được chứa khoảng trắng"),
                    },
                  })}
                />
              </div>

              <div className="flex justify-between items-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-right text-blue font-medium my-1 py-1 ml-auto hover:opacity-90"
                >
                  {t("Quên mật khẩu")} ?
                </Link>
              </div>

              <div className=" w-full flex flex-col gap-y-2">
                <div className="relative">
                  <CustomButton
                    disable={isPending}
                    isLoading={isPending}
                    type="submit"
                    title={t("Đăng nhập")}
                    className="w-full inline-flex py-3 justify-center rounded-md bg-blue border-1 border-borderNewFeed px-8 text-sm font-medium text-white outline-none hover:opacity-90"
                  />
                </div>
                <Button
                  onClick={() => handleLoginGoogle()}
                  title={t("Đăng nhập với Google")}
                  titleStyles="w-full text-center"
                  iconLeft={<FcGoogle size={25} />}
                  iconLeftStyles="translate-x-6"
                  className="w-full flex items-center py-2 hover:opacity-90  text-sm text-ascent-1 bg-primary border-1 border-borderNewFeed rounded-md font-medium outline-none"
                />
                <p className="text-ascent-2 text-sm text-center">
                  {t("Không có tài khoản")} ?
                  <Link
                    to="/register"
                    className="text-blue font-medium ml-2 cursor-pointer hover:opacity-80"
                  >
                    {t("Tạo tài khoản")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
          <Illustration />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
