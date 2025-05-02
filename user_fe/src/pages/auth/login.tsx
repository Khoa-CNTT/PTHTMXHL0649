import { _avatarData as fakeAvatar } from '@_mocks/_avatar';
import { AvatarGroup } from '@components/avatar';
import { Button, CircleButton } from '@components/button';
import { Typography } from '@components/typography';
import styled from '@styles/auth.module.css';
import { useNavigate } from 'react-router-dom';
import { Input } from './components';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { FaCircleExclamation } from 'react-icons/fa6';
import { useGoogleLogin } from '@react-oauth/google';
import { useMutationHook } from '@hooks/use-mutation';
import * as AuthService from '@services/auth-service';
import { Login as LoginType } from '@_types/auth';
import { useDispatch } from 'react-redux';
import { updateUser } from '@redux/Slices/userSlice';
import OtpVerification from '@components/otp-verification/otp-verification';
import PageMeta from '@components/pagemeta/pagemeta';
import { APP_NAME } from '@utils/index';

export default function Login() {
  const [userData, setUserData] = useState<LoginType | null>(null);
  const [hide, setHide] = useState('hide');
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  const handleGetDetailUser = async ({
    id,
    token,
  }: {
    id: string;
    token: string;
  }) => {
    const res = await AuthService.getDetailUserByUserId({ id });
    dispatch(updateUser({ ...res?.result, token }));
  };

  const mutation = useMutationHook((newData) => AuthService.login(newData));
  const { data: dataLogin, isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (dataLogin?.code === 1000 && dataLogin?.result?.token) {
        window.open(
          `http://localhost:3001?tk=${dataLogin?.result?.token}`,
          '_self',
        );
      } else if (dataLogin?.code === 1030) {
        setOpen(true);
      }
    }
  }, [isSuccess, isError]);

  const onSubmit = (data: LoginType) => {
    const newData = { ...data, otp: 0 };
    setUserData(newData);
    mutation.mutate(newData);
  };

  const handleLoginGoogle = useGoogleLogin({
    flow: 'implicit',
  });

  return (
    <>
      <OtpVerification
        open={open}
        handleClose={handleClose}
        userData={userData}
      />
      <PageMeta
        title={`Đăng nhập vào ${APP_NAME} - Kết nối bạn bè và chia sẻ kỉ niệm`}
        desc=" Truy cập LinkVerse ngay hôm nay! Kết nối với bạn bè, khám phá nội dung thú vị và chia sẻ khoảnh khắc đáng nhớ. Đăng nhập để bắt đầu hành trình của bạn!"
      />
      <div className="bg-auth w-full h-svh flex flex-col justify-around items-center px-[2.5rem]">
        <div id="stars" className={styled.stars}></div>
        <div className="w-full mx-auto md:mt-0 md:w-[25.5rem] md:h-[35rem] md:p-[2.5rem] md:bg-neutral1-5 md:rounded-[2rem] md:shadow-auth-card md:backdrop-blur-[3.125rem]">
          <div className="flex flex-col mb-[2.5rem] items-center gap-6">
            <CircleButton className="size-[3.75rem] p-[1.125rem]">
              <img src="/svg/circle_logo.svg" alt="Bento Logo" />
            </CircleButton>
            <Typography level="h4" className="text-primary">
              Sign in to LinkVerse
            </Typography>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-[0.875rem] mb-[1.5rem]">
              <Input
                type="text"
                name="username"
                placeholder="Username"
                className={`w-full rounded-xl ${
                  errors.username ? 'border-red-600' : ''
                }`}
                register={register('username', {
                  required: 'Tên người dùng là bắt buộc',
                  validate: {
                    noSpaces: (value) =>
                      !/\s/.test(value) || 'User name must not contain spaces.',
                  },
                })}
                iconRight={
                  errors.username ? <FaCircleExclamation color="red" /> : ''
                }
                toolTip={errors.username ? errors.username?.message : ''}
              />
              <Input
                name="password"
                placeholder="Password"
                type={hide === 'hide' ? 'password' : 'text'}
                register={register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  validate: {
                    noSpaces: (value) =>
                      !/\s/.test(value) ||
                      'Mật khẩu không được chứa khoảng trắng',
                  },
                })}
                iconRight={
                  errors.password ? (
                    <FaCircleExclamation color="red" />
                  ) : hide === 'hide' ? (
                    <IoMdEyeOff
                      className="cursor-pointer text-white"
                      onClick={() => setHide('show')}
                    />
                  ) : (
                    <IoMdEye
                      className="cursor-pointer text-white"
                      onClick={() => setHide('hide')}
                    />
                  )
                }
                toolTip={errors.password ? errors.password?.message : ''}
                icon={
                  <object
                    type="image/svg+xml"
                    data="/svg/ic_reset_password.svg"
                    className="absolute right-2 top-2 cursor-pointer"
                  />
                }
              />
              <Typography className="opacity-80 flex items-center text-secondary justify-end">
                <span
                  onClick={() => navigate('/forgot-password')}
                  className="opacity-100 cursor-pointer font-semibold"
                >
                  <Typography level="captionsm" className="opacity-100">
                    Forgot password?
                  </Typography>
                </span>
              </Typography>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full base px-[2rem] py-[0.875rem] text-secondary text-sm font-semibold opacity-100"
                child={<Typography level="base2sm">Sign In</Typography>}
                disabled={isPending || !isValid}
                loading={isPending}
              />

              <Button
                onClick={() => handleLoginGoogle()}
                className="w-full px-[2rem] py-[0.875rem]"
                child={
                  <div className="flex items-center gap-3 justify-center">
                    <img
                      src="/svg/ic_google.svg"
                      alt="Google Logo"
                      className="w-5 h-5"
                    />
                    <Typography level="base2sm" className="text-secondary">
                      Sign in with Google
                    </Typography>
                  </div>
                }
              />

              <Typography
                level="captionr"
                className="opacity-80 flex items-center gap-2 text-secondary justify-center"
              >
                Don't have an account?
                <a href="/register" className="opacity-100 font-semibold">
                  <Typography level="captionsm" className="opacity-100">
                    Sign up, it's free!
                  </Typography>
                </a>
              </Typography>
            </div>
          </form>
        </div>
        <div className="hidden md:flex md:flex-col md:gap-6 md:justify-center md:items-center">
          <Typography className="text-tertiary opacity-80 ">
            Join our global social media users
            {/* <Typography className="font-bold text-primary mx-1">2M</Typography> */}
          </Typography>

          <AvatarGroup
            className="size-[2.625rem] min-w-[2.625rem]"
            avatars={fakeAvatar}
          />
        </div>
      </div>
    </>
  );
}
