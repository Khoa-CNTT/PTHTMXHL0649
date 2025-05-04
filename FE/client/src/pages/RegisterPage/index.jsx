import {
  TextInput,
  Button as CustomButton,
  PageMeta,
  Loading,
} from "~/components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BsShare } from "react-icons/bs";
import { ImConnection } from "react-icons/im";
import { AiOutlineInteraction } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as UserService from "~/services/UserService";
import { FaCircleExclamation } from "react-icons/fa6";
import { notification } from "antd";
import { APP_NAME } from "~/utils";
import { useSelector } from "react-redux";

const RegisterPage = () => {
  const { t } = useTranslation();
  const [hide, setHide] = useState("hide");
  const [hideConfirm, setHideConfirm] = useState("hide");
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state?.theme);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const mutation = useMutationHook((data) => UserService.register(data));
  const { data: dataRegister, isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      navigate("/login", {
        state: {
          dataUser: dataRegister?.result,
        },
      });
    } else if (isError) {
      notification.error({
        placement: "bottomRight",
        message: t("Người dùng đã tồn tại"),
      });
    }
  }, [isSuccess, isError]);

  const onSubmit = async (data) => {
    const { dateOfBirth } = data;
    const [year, month, day] = dateOfBirth.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    const newData = { ...data, dateOfBirth: formattedDate };
    mutation.mutate(newData);
  };

  return (
    <div>
      <PageMeta
        title={t(`Đăng ký ${APP_NAME}`)}
        description="Tham gia LinkVerse để kết nối với bạn bè, khám phá thế giới và chia sẻ những khoảnh khắc ý nghĩa. Đăng ký ngay để trở thành một phần của cộng đồng năng động!"
      />
      <div className="bg-bgColor w-full min-h-screen flex items-center justify-center p-3 sm:p-6">
        <div className="w-full md:w-2/3 h-auto lg:h-[600px] 2xl:h-[650px] py-6 sm:py-8 lg:py-0 flex flex-row-reverse bg-primary rounded-xl overflow-hidden shadow-2xl border-1 border-borderNewFeed">
          {/* Right side - Form */}
          <div className="w-full lg:w-1/2 h-full p-4 sm:p-10 2xl:px-20 flex flex-col justify-center">
            {/* Header */}
            <div className="w-full flex flex-col gap-y-2">
              <div className="w-full flex items-center gap-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 534 250"
                  className="hover:scale-110 transition-transform sm:w-50 sm:h-50"
                >
                  <g
                    transform="translate(0,250) scale(0.1,-0.1)"
                    fill={theme === "dark" ? "#fff" : "#000"}
                  >
                    <path d="M2304 2404 c-101 -36 -184 -155 -184 -264 0 -61 24 -121 69 -179 15-20 230-315 476-656 506-702 549-758 659-873 77-80 208-177 305-227 162-82 354-120 564-112 290 10 526 113 733 321 400 400 456 1030 134 1507 -55 81 -206 233 -285 286 -136 91 -303 159 -457 183 -117 19 -320 8 -439 -23 -184 -48 -360 -150 -496 -286 -69 -69 -173 -203 -173 -223 0 -4 77 -113 170-241 94-127 177-241 184-252 13-19 14-17 26 25 21 78 82 182 145 246 135 137 333 198 515 160 273 -57 463 -288 464 -561 0 -357 -318 -625 -671 -566 -103 18 -183 60 -265 138 -71 69 -442 554 -907 1187 -133 182 -255 344 -270 360 -42 46 -96 66 -181 65 -41 0 -94 -7 -116 -15z" />
                    <path d="M1005 2379 c-163 -21 -374 -108 -506 -208 -148 -113 -294 -296 -365-460 -66 -153 -86 -247 -91 -438 -3 -108 -1 -197 6 -240 62 -360 288 -675 602-837 430 -224 942 -139 1281 212 97 100 163 194 155 216 -7 18 -321 451 -347 479 -16 17 -17 16 -29 -25 -55 -187 -219 -343 -411 -393 -85 -22 -241 -17 -321 11 -181 64 -327 219 -374 400 -19 75 -19 213 0 288 39 149 149 289 282 359 92 48 169 67 273 67 154 0 257 -39 362 -138 68 -64 407 -508 906-1186 134-182 256 -344 270-359 49 -52 98 -71 187-71 61 -1 91 4 126 21 118 54 199 202 170 309 -16 58 -39 92 -505 736 -521 719 -588 808 -693 919 -246 258 -611 384 -978 338z" />
                  </g>
                </svg>
                <span className="text-xl sm:text-2xl text-ascent-1 font-semibold">
                  LinkVerse
                </span>
              </div>
              <p className="text-blue text-sm sm:text-base font-semibold">
                {t("Tạo tài khoản")}
              </p>
            </div>

            <form
              className="flex flex-col pb-2 mt-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="w-full flex flex-col gap-2">
                {/* Name fields */}
                <div className="w-full flex flex-col sm:flex-row gap-1 md:gap-2">
                  <TextInput
                    name="firstName"
                    label={t("Họ")}
                    placeholder={t("Họ")}
                    type="text"
                    styles={`w-full rounded-lg bg-primary h-10 ${
                      errors.firstName ? "border-red-600" : ""
                    }`}
                    iconRight={
                      errors.firstName ? (
                        <FaCircleExclamation color="red" />
                      ) : (
                        ""
                      )
                    }
                    toolTip={errors.firstName ? errors.firstName.message : ""}
                    register={register("firstName", {
                      required: t("Họ là bắt buộc"),
                      minLength: {
                        value: 1,
                        message: t("Họ phải có ít nhất 1 ký tự"),
                      },
                      maxLength: {
                        value: 50,
                        message: t("Họ không được vượt quá 50 ký tự"),
                      },
                    })}
                  />

                  <TextInput
                    name="lastName"
                    label={t("Tên")}
                    placeholder={t("Tên")}
                    type="text"
                    styles={`w-full rounded-lg bg-primary h-10 mt-2 sm:mt-0 ${
                      errors.lastName ? "border-red-600" : ""
                    }`}
                    iconRight={
                      errors.lastName ? <FaCircleExclamation color="red" /> : ""
                    }
                    toolTip={errors.lastName ? errors.lastName?.message : ""}
                    register={register("lastName", {
                      required: t("Tên là bắt buộc"),
                      minLength: {
                        value: 1,
                        message: t("Tên phải có ít nhất 1 ký tự"),
                      },
                      maxLength: {
                        value: 50,
                        message: t("Tên không được vượt quá 50 ký tự"),
                      },
                    })}
                  />
                </div>

                {/* Username and DOB */}
                <div className="w-full flex flex-col sm:flex-row gap-1 md:gap-2">
                  <TextInput
                    name="username"
                    label={t("Tên người dùng")}
                    placeholder={t("Tên người dùng")}
                    type="text"
                    styles={`w-full rounded-lg bg-primary h-10 ${
                      errors.username ? "border-red-600" : ""
                    }`}
                    iconRight={
                      errors.username ? <FaCircleExclamation color="red" /> : ""
                    }
                    toolTip={errors.username ? errors.username.message : ""}
                    register={register("username", {
                      required: t("Tên người dùng là bắt buộc"),
                      minLength: {
                        value: 1,
                        message: t("Tên người dùng phải có ít nhất 1 ký tự"),
                      },
                      maxLength: {
                        value: 50,
                        message: t(
                          "Tên người dùng không được vượt quá 50 ký tự"
                        ),
                      },
                      validate: {
                        noSpaces: (value) =>
                          !/\s/.test(value) ||
                          t("Tên người dùng không được chứa khoảng trắng"),
                      },
                    })}
                  />

                  <TextInput
                    name="dateOfBirth"
                    type="date"
                    label={t("Ngày sinh")}
                    styles={`w-full rounded-lg text-ascent-2 bg-primary h-10 mt-2 sm:mt-0 ${
                      errors.dateOfBirth ? "border-red-600" : ""
                    }`}
                    register={register("dateOfBirth", {
                      required: t("Ngày sinh là bắt buộc"),
                    })}
                    toolTipInput={
                      errors.dateOfBirth ? errors.dateOfBirth?.message : ""
                    }
                  />
                </div>

                {/* Gender */}
                <div className="w-full flex flex-col mt-2">
                  <p className="text-ascent-1 text-sm mb-2">{t("Giới tính")}</p>

                  <div className="w-full grid grid-cols-1 sm:flex sm:flex-row gap-2">
                    <div
                      className={`flex w-full items-center rounded-lg justify-between bg-primary border-1 text-ascent-1 border-borderNewFeed outline-none text-sm px-4 py-2.5 ${
                        errors.gender ? "border-red-600" : ""
                      }`}
                    >
                      <label className="text-ascent-2" htmlFor="male">
                        {t("Nam")}
                      </label>
                      <input
                        type="radio"
                        id="male"
                        value="male"
                        {...register("gender", {
                          required: t("Giới tính là bắt buộc"),
                        })}
                      />
                    </div>

                    <div
                      className={`flex w-full items-center justify-between bg-primary rounded-lg border-1 border-borderNewFeed outline-none text-sm text-ascent-1 px-4 py-2.5 mt-2 sm:mt-0 ${
                        errors.gender ? "border-red-600" : ""
                      }`}
                    >
                      <label className="text-ascent-2" htmlFor="female">
                        {t("Nữ")}
                      </label>
                      <input
                        type="radio"
                        id="female"
                        value="female"
                        {...register("gender", {
                          required: "Gender is required",
                        })}
                      />
                    </div>

                    <div
                      className={`flex w-full items-center justify-between  bg-primary rounded-lg border-1 border-borderNewFeed outline-none text-sm text-ascent-1 px-4 py-2.5 mt-2 sm:mt-0 ${
                        errors.gender ? "border-red-600" : ""
                      }`}
                    >
                      <label className="text-ascent-2" htmlFor="other">
                        {t("Khác")}
                      </label>
                      <input
                        type="radio"
                        id="other"
                        value="other"
                        {...register("gender", {
                          required: "Gender is required",
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="w-full flex flex-col sm:flex-row gap-1 md:gap-2 mt-2">
                  <TextInput
                    name="email"
                    placeholder="email@ex.com"
                    label={t("Địa chỉ email")}
                    type="email"
                    register={register("email", {
                      required: t("Địa chỉ email là bắt buộc"),
                      validate: {
                        noSpaces: (value) =>
                          !/\s/.test(value) ||
                          t("Email không được chứa khoảng trắng"),
                      },
                    })}
                    styles={`w-full rounded-lg bg-primary h-10 ${
                      errors.email ? "border-red-600" : ""
                    }`}
                    iconRight={
                      errors.email ? <FaCircleExclamation color="red" /> : ""
                    }
                    toolTip={errors.email ? errors.email?.message : ""}
                  />
                  <TextInput
                    name="phoneNumber"
                    label={t("Số điện thoại")}
                    placeholder={t("Số điện thoại")}
                    type="text"
                    styles={`w-full rounded-lg bg-primary h-10 mt-2 sm:mt-0 ${
                      errors.phoneNumber ? "border-red-600" : ""
                    }`}
                    iconRight={
                      errors.phoneNumber ? (
                        <FaCircleExclamation color="red" />
                      ) : (
                        ""
                      )
                    }
                    toolTip={
                      errors.phoneNumber ? errors.phoneNumber.message : ""
                    }
                    register={register("phoneNumber", {
                      required: t("Số điện thoại là bắt buộc"),
                      pattern: {
                        value: /^[0-9]{10,11}$/,
                        message: t("Số điện thoại không hợp lệ"),
                      },
                    })}
                  />
                </div>

                {/* Password fields */}
                <div className="w-full flex flex-col sm:flex-row gap-1 md:gap-2">
                  <TextInput
                    name="password"
                    label={t("Mật khẩu")}
                    placeholder={t("Mật khẩu")}
                    type={hide === "hide" ? "password" : "text"}
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
                    iconRightStyles="right-4"
                    styles={`w-full rounded-lg bg-primary h-10 ${
                      errors.password ? "border-red-600" : ""
                    }`}
                    toolTip={errors.password ? errors.password?.message : ""}
                    register={register("password", {
                      required: t("Mật khẩu là bắt buộc"),
                      minLength: {
                        value: 8,
                        message: t("Mật khẩu phải có ít nhất 8 ký tự"),
                      },
                      maxLength: {
                        value: 64,
                        message: t("Mật khẩu không được vượt quá 64 ký tự"),
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
                        message: t(
                          "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt."
                        ),
                      },
                      validate: {
                        noSpaces: (value) =>
                          !/\s/.test(value) ||
                          t("Mật khẩu không được chứa khoảng trắng"),
                      },
                    })}
                  />

                  <TextInput
                    name="confirmPassword"
                    label={t("Xác nhận mật khẩu")}
                    placeholder={t("Xác nhận mật khẩu")}
                    type={hideConfirm === "hide" ? "password" : "text"}
                    iconRight={
                      errors.confirmPassword ? (
                        <FaCircleExclamation color="red" />
                      ) : hideConfirm === "hide" ? (
                        <IoMdEyeOff
                          className="cursor-pointer text-ascent-1 "
                          onClick={() => setHideConfirm("show")}
                        />
                      ) : (
                        <IoMdEye
                          className="cursor-pointer text-ascent-1"
                          onClick={() => setHideConfirm("hide")}
                        />
                      )
                    }
                    iconRightStyles="right-4"
                    styles={`w-full bg-primary rounded-lg h-10 mt-2 sm:mt-0 ${
                      errors.confirmPassword ? "border-red-600" : ""
                    }`}
                    toolTip={
                      errors.confirmPassword
                        ? errors.confirmPassword?.message
                        : ""
                    }
                    register={register("confirmPassword", {
                      required: t("Vui lòng nhập lại mật khẩu"),
                      validate: (value) =>
                        value === watch("password") || t("Mật khẩu không khớp"),
                    })}
                  />
                </div>
              </div>

              <div className="relative">
                <CustomButton
                  disable={isPending}
                  isLoading={isPending}
                  type="submit"
                  className="w-full mt-3 inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-non hover:opacity-90"
                  title={t("Đăng ký")}
                />
              </div>
            </form>

            <p className="text-ascent-2 text-sm text-center mt-2">
              {t("Đã có tài khoản")} ?{" "}
              <Link
                to="/login"
                className="text-blue ml-2 cursor-pointer hover:opacity-90"
              >
                {t("Đăng nhập")}
              </Link>
            </p>
          </div>

          {/* Left side - Image section (hidden on mobile) */}
          <div className="hidden w-1/2 h-full lg:flex flex-col items-center justify-center bg-blue shadow-xl">
            <div className="relative w-full flex items-center justify-center">
              <img
                src="/register.jpeg"
                alt="bg"
                className="w-48 2xl:w-64 h-48 2xl:h-64 rounded-full object-cover shadow-xl"
              />

              <div className="absolute flex items-center gap-1 bg-primary right-10 top-10 py-2 px-5 rounded-full shadow-xl">
                <BsShare size={14} className="text-ascent-1" />
                <span className="text-ascent-1 text-xs font-medium">
                  {t("Chia sẻ")}
                </span>
              </div>

              <div className="absolute flex items-center gap-1 bg-primary left-10 top-6 py-2 px-5 rounded-full shadow-xl">
                <ImConnection className="text-ascent-1" />
                <span className="text-ascent-1 text-xs font-medium">
                  {t("Kết nối")}
                </span>
              </div>

              <div className="absolute flex items-center gap-1 bg-primary left-12 bottom-6 py-2 px-5 rounded-full shadow-xl">
                <AiOutlineInteraction className="text-ascent-1" />
                <span className="text-ascent-1 text-xs font-medium">
                  {t("Tương tác")}
                </span>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-white text-base">
                {t("Kết nối với bạn bè và chia sẻ những điều thú vị")}
              </p>
              <span className="text-sm text-white/80">
                {t("Kết nối với bạn bè và chia sẻ những điều thú vị")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
