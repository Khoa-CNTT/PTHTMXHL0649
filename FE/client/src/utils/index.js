export const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = function (error) {
            reject(error);
        };
    });
}

export const isJsonString = (data) => {
    try {
        JSON.parse(data)
    } catch (error) {
        return false
    }
    return true
}

export const getToken = () => {
    const token = localStorage.getItem("token");
    return token;
};

export const baseURL = import.meta.env.VITE_API_URL_BACKEND

export const notificationURL = import.meta.env.VITE_API_URL_BACKEND_NOTI

export const APP_NAME = import.meta.env.VITE_APP_NAME

export const ENV = import.meta.env.VITE_APP_MODE











