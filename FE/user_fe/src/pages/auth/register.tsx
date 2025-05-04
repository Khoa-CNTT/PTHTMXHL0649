import { AvatarGroup } from '@components/avatar';
import { Button, CircleButton } from '@components/button';
import { Typography } from '@components/typography';
import style from '@styles/auth.module.css';
import React from 'react';
import { Input } from './components';
import PageMeta from '@components/pagemeta/pagemeta';
import { APP_NAME } from '@utils/index';
import { useForm } from 'react-hook-form';

const avatars = [
  {
    id: '1',
    src: 'https://i.pinimg.com/originals/4a/7e/74/4a7e7438c14c2807c81cba4a99e4cec2.jpg',
    alt: 'Avatar 1',
  },
  {
    id: '2',
    src: 'https://i.pinimg.com/originals/4a/7e/74/4a7e7438c14c2807c81cba4a99e4cec2.jpg',
    alt: 'Avatar 2',
  },
  {
    id: '3',
    src: 'https://i.pinimg.com/originals/4a/7e/74/4a7e7438c14c2807c81cba4a99e4cec2.jpg',
    alt: 'Avatar 2',
  },
];

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onChange' });

  return (
    <>
      <PageMeta
        title={`Đăng ký ${APP_NAME} - Bắt đầu kết nối ngay hôm nay`}
        desc="Tham gia LinkVerse để kết nối với bạn bè, khám phá thế giới và chia sẻ những khoảnh khắc ý nghĩa. Đăng ký ngay để trở thành một phần của cộng đồng năng động!"
      />
      <div className="bg-auth w-full h-svh flex flex-col justify-around items-center px-[2.5rem]">
        <div id="stars" className={style.stars}></div>
        <div className="w-full mx-auto md:mt-0 md:w-[30rem] md:max-h-[50rem] md:p-[40px] md:bg-neutral1-5 md:rounded-[32px] md:shadow-auth-card md:backdrop-blur-[50px]">
          <div
            className="flex flex-col mb-[40px] items-center gap-6"
            id="top-bar-container "
          >
            <CircleButton className="size-[60px] p-[18px]">
              <img src="/svg/circle_logo.svg" alt="Bento Logo" />
            </CircleButton>
            <Typography level="h4" className="text-primary">
              LinkVerse Social
            </Typography>
          </div>
          <form>
            <div className="flex flex-col gap-[0.875rem] mb-[1.5rem]">
              <div className="w-full flex items-center justify-center gap-x-2">
                <Input type="text" name="firstName" placeholder="First Name" />
                <Input type="text" name="lastName" placeholder="Last Name" />
              </div>

              <div className="w-full flex items-center justify-center gap-x-2">
                <Input type="text" name="userName" placeholder="User Name" />
                <Input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of birth"
                />
              </div>

              <div className="w-full flex flex-col">
                <div className="w-full flex flex-col lg:flex-row gap-1 md:gap-2">
                  <div
                    className={`w-full flex items-center justify-between bg-neutral2-5 placeholder:text-tertiary base text-primary text-sm px-5 py-4 rounded-xl transition border-[1.5px] border-transparent focus:border-neutral2-10  ${
                      errors.gender ? 'border-red-600' : ''
                    }`}
                  >
                    <label className="text-ascent-1" htmlFor="male">
                      Nam
                    </label>
                    <input
                      type="radio"
                      id="male"
                      value="male"
                      {...register('gender', {
                        required: 'Giới tính là bắt buộc',
                      })}
                    />
                  </div>

                  <div
                    className={`w-full flex items-center justify-between bg-neutral2-5 placeholder:text-tertiary base text-primary text-sm px-5 py-4 rounded-xl transition border-[1.5px] border-transparent focus:border-neutral2-10 ${
                      errors.gender ? 'border-red-600' : ''
                    }`}
                  >
                    <label className="text-ascent-1" htmlFor="female">
                      Nữ
                    </label>
                    <input
                      type="radio"
                      id="female"
                      value="female"
                      {...register('gender', {
                        required: 'Gender is required',
                      })}
                    />
                  </div>

                  <div
                    className={`w-full flex items-center justify-between bg-neutral2-5 placeholder:text-tertiary base text-primary text-sm px-5 py-4 rounded-xl transition border-[1.5px] border-transparent focus:border-neutral2-10 ${
                      errors.gender ? 'border-red-600' : ''
                    }`}
                  >
                    <label className="text-ascent-1" htmlFor="other">
                      Khác
                    </label>
                    <input
                      type="radio"
                      id="other"
                      value="other"
                      {...register('gender', {
                        required: 'Gender is required',
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-center gap-x-2">
                <Input type="email" name="email" placeholder="Email" />
                <Input
                  type="number"
                  name="phoneNumber"
                  placeholder="Phone Number"
                />
              </div>

              <Input
                type="password"
                name="password"
                placeholder="Password"
                icon={
                  <object
                    type="image/svg+xml"
                    data="/svg/ic_reset_password.svg"
                    className="absolute right-[8px] top-[8px] cursor-pointer"
                  />
                }
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full base px-[2rem] py-[0.875rem] text-secondary text-sm font-semibold opacity-100"
                child={<Typography level="base2sm">Sign Up</Typography>}
              />

              <Typography
                level="captionr"
                className="opacity-80 flex items-center gap-2 text-secondary justify-center"
              >
                You have an account?
                <a href="/login" className="opacity-100 font-semibold">
                  <Typography level="captionsm" className="opacity-100">
                    Sign in, here!
                  </Typography>
                </a>
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
