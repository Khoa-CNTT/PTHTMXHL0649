import axios from 'axios';
import { baseURL, getToken } from '~/utils';

let chat = axios.create({
    baseURL: baseURL
});


chat.interceptors.request.use(
    async (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


chat.interceptors.response.use(
    async (response) => {
        return response.data;
    },
    async (error) => {

        return Promise.reject(error);
    }
);


export default chat;