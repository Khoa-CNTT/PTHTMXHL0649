import access from "~/services/access"
import instance from "."

export const ask = async (data) => {
    console.log(data)
    return await access.post(`/Ai/api/v1/gemini/ask`, data)
}

export const suggestContent = async ({ content }) => {
    return await instance.post(`/post/suggest-content`, { content })
}

export const createPost = async ({ data }) => {

    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.post(`/post/with-ai-suggestion?useAiSuggestion=true`, formData);
}
