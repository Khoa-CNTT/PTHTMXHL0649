import axios from 'axios';
import { baseURL } from '../utils';
import { toast } from "sonner"

let auth = axios.create({
    baseURL: baseURL
});

auth.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

auth.interceptors.response.use(
    async (response) => {
        return response.data;
    },
    async (error) => {

        if (error.response?.status !== 410) {
            if (error.response?.data?.message === "Unauthenticated") {
                toast("Tên tài khoản hoặc mật khẩu không đúng")
            } else if(error.response?.data?.code === 1035) {
                toast("Login with admin account only")
            }
            else  {
                toast(error.response?.data?.message || "Something went wrong!")
            }
        }

        return Promise.reject(error);
    }
);


export default auth;