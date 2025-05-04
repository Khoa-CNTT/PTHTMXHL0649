import instance from ".";

export const sendFriendRequestViaToken = async (data) => {
    return await instance.post(`/profile/fr`, data)
}

export const uploadQrImage = async (file) => {
    const formData = new FormData();

    if (file) {
        formData.append("file", file); // ✨ file là 1 object File, không phải array
    }

    return await instance.post(`/profile/fr/qr/image`, formData);
};


