import instance from "."

export const friendSuggesstion = async () => {
    return await instance.get(`/profile/users`)
}

export const accept = async (id) => {
    return await instance.post(`/profile/friends/${id}/accept`)
}

export const request = async (id) => {
    return await instance.post(`/profile/friends/request/${id}`)
}

export const cancel = async (id) => {
    return await instance.delete(`/profile/friends/cancel/${id}`)
}

export const reject = async (id) => {
    return await instance.post(`/profile/friends/${id}/reject`)
}

export const unfriend = async (id) => {
    return await instance.delete(`/profile/friends/${id}/unfriend`)
}

export const getFriendOfUser = async ({ id }) => {
    return await instance.get(`/profile/friends/user/${id}`)
}

export const getFriendRequests = async () => {
    return await instance.get(`/profile/friends/my/requests/received`)
}

export const getRequestSend = async () => {
    return await instance.get(`/profile/friends/my/requests/sent`)
}

export const getMyFriends = async () => {
    return await instance.get(`/profile/friends/my`)
}

