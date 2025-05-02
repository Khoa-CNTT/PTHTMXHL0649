import axios from 'axios'
import instance from './instance'
import { baseURL, notificationURL } from '@utils/index'
import auth from './auth-instance'
import { Login, Register } from '@_types/auth'

export const register = async (data: Register) => {
    return await auth.post(`/identity/users/registration`, data)
}

export const login = async (newData: Login) => {
    return await auth.post(`/identity/auth/token`, newData)
}

export const loginGoogle = async (data: object) => {
    return await instance.post(`/identity/auth/google`, data)
}

export const logout = async (token: string) => {
    return await instance.post(
        `/identity/auth/logout`, { token });
};

export const update = async (data: object) => {
    return await instance.patch(`/identity/users/my-profile`, data)
}

export const getLoginHistory = async () => {
    return await instance.get(`/identity/login-history/me`)
}

export const block = async (id: string) => {
    return await instance.post(`/profile/block?targetUserId=${id}`, {})
}

export const changePassword = async ({ data }:{data: object}) => {
    return await instance.post(`/identity/auth/change-password`, data)
}

export const unBlock = async ({ id }: {id: string}) => {
    return await instance.post(`/profile/unblock?targetUserId=${id}`, {})
}

export const blockList = async ({ page, size }: {page: number, size: number}) => {
    return await instance.get(`/profile/block-list?page=${page}&size=${size}`)
}

export const getDetailUser = async ({ id }: {id: string}) => {
    return await instance.get(`/profile/users/${id}`)
}

export const getDetailUserByUserId = async ({ id }: {id: string}) => {
    return await instance.get(`/identity/users/${id}`)

}

export const updateStatus = async ({ status }:{ status: string}) => {
    return await instance.patch(`/identity/users/my-profile/status?status=${status}`, {})
}

export const handleRefreshToken = async (token: string) => {
    return await instance.post(
        `${baseURL}/identity/auth/refresh`,
        { token },
    );
};

export const forgotPassword = async (data: object) => {
    return await auth.post(
        `${notificationURL}/notification/email/send-forget-pass?email=${data.email}`);
}

export const resetPassword = async ({ token, password }:{ token: string, password: string}) => {
    return await auth.post(`${notificationURL}/notification/email/reset-password?token=${token}&newPassword=${password}`);
}

export const verifyEmail = async (data: object) => {
    return await axios.post(`${notificationURL}/notification/email/send-verification?email=${data}`);
}

export const verify = async ({ data }:{data: object}) => {
    return await axios.get(`${notificationURL}/notification/email/verify?token=${data}`);
}

export const setAvatar = async ({ data }: {data: object}) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data?.request));
    formData.append("avatar", data?.file);
    return await instance.post(`/post/set-avatar`, formData)
}

export const disableAccount = async ({ password }: {password: string}) => {
    return await instance.delete(`/identity/users/delete?password=${password}`)
}

export const deleteAccount = async ({ password }: {password: string}) => {
    return await instance.delete(`/identity/users/delete-permanently?password=${password}`)
}



