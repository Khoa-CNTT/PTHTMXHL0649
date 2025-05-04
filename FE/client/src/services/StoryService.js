import instance from "."

export const createStory = async (data) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.post(`/post/stories`, formData)
}

export const getAllStory = async ({ page }) => {
    return await instance.get(`/post/stories?page=${page}&size=10`)
}

export const getStoryById = async ({ id }) => {
    return await instance.get(`/post/stories/user/${id}`)
}
