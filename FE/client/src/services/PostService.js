import instance from ".";

export const createPost = async ({ data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        const emptyFile = new File([""], "empty.txt", { type: "text/plain" });
        formData.append('files', emptyFile);
    }
    return await instance.post(`/post/post-file`, formData);
};

export const getMyPosts = async () => {
    return await instance.get(`/post/my-posts`)
}

export const translatePost = async ({ id, language }) => {
    return await instance.post(`/post/${id}/translate?targetLanguage=${language}`, {})
}

export const getPostsBySentiment = async ({ page, sentiment, size = 10 }) => {
    return await instance.get(`/post/by-sentiment?page=${page}&size=${size}&sentiment=${sentiment}`)
}

export const getPostsById = async ({ id, page, size }) => {
    return await instance.get(`/post/user-posts?page=${page}&size=${size}&userId=${id}`)
}

export const getAllPosts = async (pageParam) => {
    return await instance.get(`/post/all?page=${pageParam}`)
}

export const deletePost = async (data) => {
    return await instance.delete(`/post/${data}`)
}

export const comment = async ({ id, data }) => {
    const formData = new FormData();
    formData.append("request", JSON.stringify(data.request));

    if (data.files && data.files.length > 0 && data.files[0]) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        const emptyFile = new File([""], "empty.txt", { type: "text/plain" });
        formData.append('files', emptyFile);
    }

    return await instance.post(`/post/${id}/comment-file`, formData);
};

export const likeComment = async ({ postId, commentId }) => {
    return await instance.post(`/post/${postId}/comments/${commentId}/like`, {})
}

export const deleteComment = async ({ postId, commentId }) => {
    return await instance.delete(`/post/${postId}/comments/${commentId}`)
}

export const editComment = async ({ postId, commentId, data }) => {
    const formData = new FormData();
    formData.append("request", JSON.stringify(data.request));

    if (data.files && data.files.length > 0 && data.files[0] !== undefined) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.put(`/post/${postId}/comments/${commentId}`, formData)
}

export const like = async (data) => {
    return await instance.post(`/post/${data}/like?emoji=1`, {})
}

export const dislike = async (data) => {
    return await instance.post(`/post/${data}/unlikes`, {})
}

export const share = async (data) => {
    return await instance.post(`/post/${data}/share`, {})
}

export const getListShare = async ({ userId, page, size }) => {
    return await instance.get(`/post/users/${userId}/shared-posts?page=${page}&size=${size}`)
}

export const save = async (id) => {
    return await instance.post(`/post/${id}/save`)
}

export const unsave = async (data) => {
    return await instance.post(`/post/${data}/unsave`, {})
}

export const getSaveds = async ({ page, size }) => {
    return await instance.get(`/post/saved-posts?page=${page}&size=${size}`)
}

export const getPostById = async ({ id }) => {
    return await instance.get(`/post/${id}`)
}

export const changeVisibility = async ({ id, visibility }) => {
    return await instance.post(`/post/${id}/change-visibility?postId=${id}&visibility=${visibility}`, {})
}

