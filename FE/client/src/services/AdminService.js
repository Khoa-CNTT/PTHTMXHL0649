import instance from "."

export const deleteUser = async (id) => {
    return await instance.delete(`/identity/users/admin/delete/${id}`)
}

export const getAllUsers = async () => {
    return await instance.get(`/identity/users?page=0&size=10`)
}

export const getAllPosts = async () => {
    return await instance.get(`/post/all?page=1&size=10`)
}

export const getAllGroups = async ({ page, size }) => {
    return await instance.get(`/identity/groups/all?page${page}&size=${size}`)
}

export const getHistoryPosts = async ({ page, size }) => {
    return await instance.get(`/post/history?page=${page}&size=${size}`)
}