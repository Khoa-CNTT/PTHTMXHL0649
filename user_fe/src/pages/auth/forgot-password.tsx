import { _avatarData as fakeAvatar } from '@_mocks/_avatar';
import { AvatarGroup } from '@components/avatar';
import { Button, CircleButton } from '@components/button';
import { Typography } from '@components/typography';
import styled from '@styles/auth.module.css';
import { useNavigate } from 'react-router-dom';
import { Input } from './components';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import PageMeta from '@components/pagemeta/pagemeta';
import { APP_NAME } from '@utils/index';
import * as AuthService from '@services/auth-service';
import { useMutationHook } from '@hooks/use-mutation';
import { message } from 'antd';
import { FaCircleExclamation } from 'react-icons/fa6';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  const mutation = useMutationHook((data) => AuthService.forgotPassword(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (data?.code === 500) {
      message.open({
        type: 'warning',
        content: data?.message || 'User not found',
      });
    } else if (data?.code === 1000) {
      setSuccess(true);
    } else if (isPending) {
      message.open({
        type: 'loading',
        content: 'Sending email...',
      });
    }
  }, [isSuccess, isPending]);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      <PageMeta
        title={`Quên mật khẩu - Bảo vệ tài khoản ${APP_NAME}`}
        desc="Đừng lo lắng nếu bạn quên mật khẩu! Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu và truy cập lại tài khoản LinkVerse một cách an toàn."
      />
      <div className="bg-auth w-full h-svh flex flex-col justify-around items-center px-[2.5rem]">
        <div id="stars" className={styled.stars}></div>
        <div className="w-full mx-auto md:mt-0 md:w-[25.5rem] md:h-[30rem] md:p-[2.5rem] md:bg-neutral1-5 md:rounded-[2rem] md:shadow-auth-card md:backdrop-blur-[3.125rem]">
          <div className="flex flex-col mb-[2.5rem] items-center gap-6">
            <CircleButton className="size-[3.75rem] p-[1.125rem]">
              <img src="/svg/circle_logo.svg" alt="Bento Logo" />
            </CircleButton>
            <Typography level="h4" className="text-primary">
              Forgot Password
            </Typography>
          </div>
          {success ? (
            <div className="w-full h-auto flex flex-col items-center justify-center gap-y-2 mt-4">
              <div className="w-full flex items-center justify-center">
                <IoCheckmarkCircleSharp size={40} color="#0DBC3D" />
              </div>
              <Typography className="text-tertiary opacity-80 ">
                Check your email to reset password!
              </Typography>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-[0.875rem] mb-[1.5rem]">
                <Input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  register={register('email', {
                    required: 'Địa chỉ email là bắt buộc',
                    validate: {
                      noSpaces: (value) =>
                        !/\s/.test(value) || 'Email must not contain spaces.',
                    },
                  })}
                  toolTip={errors.email ? errors.email?.message : ''}
                  iconRight={
                    errors.email ? <FaCircleExclamation color="red" /> : ''
                  }
                />
                <Typography
                  level="captionr"
                  className="opacity-80 flex items-center gap-2 text-secondary justify-end"
                >
                  Have an account?
                  <a href="/login" className="opacity-100 font-semibold">
                    <Typography level="captionsm" className="opacity-100">
                      Sign In
                    </Typography>
                  </a>
                </Typography>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full base px-[2rem] py-[0.875rem] text-secondary text-sm font-semibold opacity-100"
                  child={<Typography level="base2sm">Xác nhận</Typography>}
                  disabled={!isValid}
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
          )}
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
