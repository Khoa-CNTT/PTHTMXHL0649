import instance from './instance'
import { baseURL } from '@utils/index'

export const createChat = async (data: object) => {
    return await instance.post(`${baseURL}/identity/chats/single`, data)
}

export const createGroupChat = async (data: object) => {
    return await instance.post(`${baseURL}/identity/chats/group`, data)
}

export const getUsersChat = async ({ userId }: {userId: string}) => {
    return await instance.get(`${baseURL}/identity/chats/user?userId=${userId}`)
}

export const createMessage = async ({ data }: {data: object}) => {
    return await instance.post(`${baseURL}/identity/messages/create`, data)
}

export const getAllMessages = async ({ chatId }: {chatId: string}) => {
    return await instance.get(`${baseURL}/identity/messages/${chatId}`)
}