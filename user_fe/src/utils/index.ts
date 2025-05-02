export const baseURL = import.meta.env.VITE_API_URL_BACKEND

export const notificationURL = import.meta.env.VITE_API_URL_BACKEND_NOTI

export const APP_NAME = import.meta.env.VITE_APP_NAME

// export const APP_PORT = import.meta.env.VITE_APP_PORT

export const ENV = import.meta.env.VITE_APP_MODE

export const getToken = () => {
    const token = localStorage.getItem("token");
    return token;
};