import auth from "@/services/auth"
import instance from "./instance"

export const getDetailUserByUserId = async ({ id }: {id: string}) => {
    return await instance.get(`/identity/users/${id}`)
}

export const createUser = async (data) => {
    return await auth.post(`/identity/users/registration`, data)
}

export const updateUserInformation = async (data) => {
    return await instance.patch(`/identity/users/my-profile`, data)
}

export const setAvatar = async ({ data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data?.request));
    formData.append("avatar", data?.file);
    return await instance.post(`/post/set-avatar`, formData)
}

export const deleteUser = async (id: string) => {
    return await instance.delete(`/identity/users/admin/delete/${id}`)
}

export const lockUser = async (id: string) => {
    return await instance.post(`/identity/users/admin/${id}/lock`)
}

export const unlockUser = async (id: string) => {
    return await instance.delete(`/identity/users/admin/${id}/unlock`)
}

export const changePasswordForUser = async () => {
    return await instance.post(`/identity/users/admin/change-password`)
}

export const getAllUsers = async ({page, size}: {page: number, size:number}) => {
    return await instance.get(`/identity/users?page=${page}&size=${size}`)
}

export const getAllCampaign = async () => {
    return await instance.get(`/donation/campaigns`)
}

export const getAllPosts = async ({page, size}: {page: number, size:number}) => {
    return await instance.get(`/post/all?page=${page}&size=${size}`)
}

export const deletePost = async (id: string) => {
    return await instance.delete(`/post/${id}`)
}

export const getAllStories = async ({page, size}: {page: number, size:number}) => {
    return await instance.get(`/post/stories?page=${page}&size=${size}`)
}

export const getAllRoles = async () => {
    return await instance.get(`/identity/roles`)
}

export const createRole = async () => {
    return await instance.post(`/identity/roles`)
}

export const deleteRole = async () => {
    return await instance.delete(`/identity/roles`)
}

export const getAllPermissions = async () => {
    return await instance.get(`/identity/permissions`)
}

export const deletePermission = async () => {
    return await instance.delete(`/identity/permissions`)
}

export const createPermission = async () => {
    return await instance.post(`/identity/permissions`)
}

export const getAllGroups = async ({ page, size }: {page: number, size:number}) => {
    return await instance.get(`/identity/groups/all?page=${page}&size=${size}`)
}

export const getHistoryPosts = async ({ page, size }: {page: number, size:number}) => {
    return await instance.get(`/post/history?page=${page}&size=${size}`)
}

