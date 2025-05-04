import chat from '~/services/chat'
import instance from '.'
import { baseURL } from '~/utils'

export const searchSticker = async ({ keyword }) => {
    return await instance.get(`${baseURL}/identity/stickers/search?keyword=${keyword}&limit=5`)
}

export const createChat = async (data) => {
    return await instance.post(`${baseURL}/identity/chats/single`, data)
}

export const deleteChat = async ({ chatId }) => {
    return await instance.delete(`${baseURL}/identity/chats/${chatId}`)
}

export const deleteMessage = async ({ messageId }) => {
    return await instance.delete(`${baseURL}/identity/messages/${messageId}`)
}

export const createGroupChat = async (data) => {
    return await instance.post(`${baseURL}/identity/chats/group`, data)
}

export const renameGroupChat = async ({ groupId, groupName }) => {
    return await instance.put(`${baseURL}/identity/chats/${groupId}/rename?groupName=${groupName}`)
}

export const getUsersChat = async ({ userId }) => {
    return await instance.get(`${baseURL}/identity/chats/user?userId=${userId}`)
}

export const createMessage = async (data) => {
    return await chat.post(`${baseURL}/identity/messages/create`, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const getAllMessages = async ({ chatId }) => {
    return await instance.get(`${baseURL}/identity/messages/${chatId}`)
}