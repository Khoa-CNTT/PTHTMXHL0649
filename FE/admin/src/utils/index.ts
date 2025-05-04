import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function convertToVietnamTime(utcString: string): string {
  return dayjs.utc(utcString).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
}

export const baseURL = import.meta.env.VITE_API_URL_BACKEND

export const APP_NAME = import.meta.env.VITE_APP_NAME

export const notificationURL = import.meta.env.VITE_API_URL_BACKEND_NOTI


export const getToken = () => {
    const token = localStorage.getItem("token");
    return token;
};




