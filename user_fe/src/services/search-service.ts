import instance from "./instance"

type SearchUser = {
    keyword: string }

export const searchUser = async ({ keyword }: SearchUser) => {
    return await instance.get(`/profile/search?page=0&size=10&search=${keyword}`)
}

export const searchPost = async ({ keyword }: SearchUser) => {
    return await instance.get(`/post/search?page=1&size=10&content=${keyword}`)
}

export const searchPostByKeyword = async ({ keyword }: SearchUser) => {
    return await instance.get(`/post/searchPostKeyword?keyword=${keyword}`)
}

export const searchPostByHashTag = async ({ keyword }: SearchUser) => {
    return await instance.get(`/post/hashtags/${keyword}/posts`)
}