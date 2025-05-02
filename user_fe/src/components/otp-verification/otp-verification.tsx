import { Button } from '@components/button';
import Modal from '@components/modal/modal';
import { Typography } from '@components/typography';
import { useMutationHook } from '@hooks/use-mutation';
import { Input, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '@services/auth-service';
import { jwtDecode } from 'jwt-decode';
import { updateUser } from '@redux/Slices/userSlice';

type OtpProps = {
  open: boolean;
  handleClose: () => void;
  userData: object;
};

const OtpVerification = ({ open, handleClose, userData }: OtpProps) => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleChange = (index, event) => {
    const { value } = event.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const mutation = useMutationHook((newData) => AuthService.login(newData));
  const { data, isPending, isSuccess, isError } = mutation;
  const mutationResend = useMutationHook((data) => AuthService.login(data));
  const {
    data: dataResend,
    isPending: isPendingResend,
    isSuccess: isSuccessResend,
    isError: isErrorResend,
  } = mutationResend;

  useEffect(() => {
    if (isPendingResend) {
      message.open({
        type: 'loading',
        content: 'Gửi OTP tới email của bạn...',
      });
    } else if (isSuccessResend) {
      message.open({
        type: 'success',
        content: 'Gửi OTP thành công',
      });

      setCountdown(180);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isPendingResend, isSuccessResend]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
      localStorage.setItem('token', data?.result?.token);
      if (data?.result?.token) {
        const decoded = jwtDecode(data?.result?.token);
        if (decoded?.userId) {
          handleGetDetailUser({
            id: decoded?.userId,
            token: data?.data?.result?.token,
          });
        }
      }
    }
  }, [isSuccess]);

  const handleGetDetailUser = async ({ id, token }) => {
    const res = await AuthService.getDetailUserByUserId({ id });
    dispatch(updateUser({ ...res?.result, token }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      message.destroy();
      message.open({
        type: 'warning',
        content: 'Vui lòng nhập đầy đủ 6 chữ số OTP',
      });
      return;
    }

    if (userData) {
      const test = { ...userData, otp: Number(enteredOtp) };
      mutation.mutate(test);
    }
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    mutationResend.mutate(userData);
  };

  return (
    <Modal onClose={handleClose} isOpen={open}>
      <div className="relative bg-auth border-1 border-borderNewFeed p-8 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="w-full items-end flex justify-end ">
          <div
            className="w-8 h-8 mb-5 active:scale-90 rounded-lg bg-blue flex items-center justify-center hover:scale-110 cursor-pointer transition-transform"
            onClick={() => handleClose()}
          >
            <IoMdClose color="#fff" size={20} />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p className="text-primary">Xác minh email của bạn</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-secondary">
              <p>Chúng tôi đã gửi mã OTP đến email của bạn</p>
            </div>
          </div>

          <div className="w-full flex gap-y-3 flex-col">
            <form onSubmit={handleSubmit}>
              <div className="w-full flex flex-col space-y-16">
                <div className="flex items-center justify-center mx-auto gap-x-2 w-full">
                  {otp.map((digit, index) => (
                    <div key={index} className="w-16 h-16">
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="w-full h-full flex flex-col items-center text-ascent-1 justify-center bg-primary text-center px-5 outline-none rounded-xl border border-borderNewFeed text-lg font-bold  focus:bg-primary focus:ring-1 ring-blue-700"
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-5">
                  <div className="relative w-full flex items-center justify-center">
                    <Button
                      type="submit"
                      disabled={isPending}
                      isLoading={isPending}
                      className="w-full base px-[2rem] py-[0.875rem] text-secondary text-sm font-semibold opacity-100"
                      child={<Typography level="base2sm">Xác minh</Typography>}
                    />
                  </div>
                </div>
              </div>
            </form>
            <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
              <p>Không nhận được mã?</p>
              {countdown > 0 ? (
                <span className="text-blue cursor-default">
                  Thử lại sau {formatCountdown()}
                </span>
              ) : (
                <button
                  onClick={() => handleResendOtp()}
                  disabled={isPendingResend || countdown > 0}
                  className="flex flex-row text-blue cursor-pointer items-center text-blue-600 hover:opacity-90"
                >
                  Gửi lại mã
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OtpVerification;
