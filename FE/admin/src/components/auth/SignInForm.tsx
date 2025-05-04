import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useForm } from "react-hook-form";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as AdminService from "../../services/AdminService";
import * as AuthService from "../../services/AuthService";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/Slices/userSlice";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface FormValues {
  username: string;
  password: string;
}

interface DataLogin {
  username: string;
  password: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const mutation = useMutationHook((data: DataLogin) =>
    AuthService.login(data)
  );
  const { data, isPending, isSuccess } = mutation;

  const handleGetDetailUser = async ({
    id,
    token,
  }: {
    id: string;
    token: string;
  }) => {
    const res = await AdminService.getDetailUserByUserId({ id });
    dispatch(updateUser({ ...res?.result, token }));
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 1000 && data?.result?.token) {
        navigate("/");
        const token = data?.result?.token;
        if (token) {
          localStorage.setItem("token", token);
          const decoded = jwtDecode(token);
          if (decoded?.userId) {
            handleGetDetailUser({ id: decoded?.userId, token });
          }
        }
      } else if (data?.code === 1030 || data?.code === 1035) {
        toast("Only login with account admin");
      }
    }
  }, [isSuccess, navigate]);

  const onSubmit = async (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        ></Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("Đăng nhập")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("Nhập email và mật khẩu để đăng nhập")}
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  {t("Chào mừng quay trở lại")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    {t("Tên tài khoản")}{" "}
                    <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder={t("Tên tài khoản")}
                    disabled={isPending}
                    register={register("username", {
                      required: t("Tên tài khoản là bắt buộc"),
                      minLength: {
                        value: 3,
                        message: t("Tên tài khoản ít nhất 3 ký tự"),
                      },
                    })}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    {t("Mật khẩu")} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Nhập mật khẩu của bạn")}
                      disabled={isPending}
                      register={register("password", {
                        required: t("Mật khẩu là bắt buộc"),
                      })}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>{t("Đăng nhập")}...</span>
                      </div>
                    ) : (
                      t("Đăng nhập")
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
