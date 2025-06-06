import instance from "./instance"

export const searchUser = async ({ keyword }) => {
    return await instance.get(`/profile/search?page=0&size=10&search=${keyword}`)
}

export const searchPost = async ({ keyword }) => {
    return await instance.get(`/post/search?page=1&size=10&content=${keyword}`)
}

export const searchPostByKeyword = async ({ keyword }) => {
    return await instance.get(`/post/searchPostKeyword?keyword=${keyword}`)
}

export const searchPostByHashTag = async ({ keyword }) => {
    return await instance.get(`/post/hashtags/${keyword}/posts`)
}