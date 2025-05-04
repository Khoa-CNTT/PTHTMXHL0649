import instance from "."

export const createDonation = async ({ data }) => {
    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append('files', new Blob([]));
    }
    return await instance.post(`/donation/donations/create`, formData);
}

export const getDonationById = async (id) => {
    return await instance.get(`/donation/donations/${id}/donations`);
}

export const getDonationForCampaign = async (id) => {
    return await instance.get(`/donation/donations/${id}/donations`);
}


