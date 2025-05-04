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

export const createCampaign = async (data) => {

    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files) {
        formData.append("files", data.files);
    } else {
        formData.append("files", new Blob([]));
    }

    return await instance.post('/donation/campaigns/create', formData);
};

export const getCampaignById = async (id) => {
    return await instance.get(`/donation/campaigns/${id}`);
}

export const getTopCampaign = async () => {
    return await instance.get(`/donation/campaigns/topCampaigns`);
}

export const getAverageCompletionTimeInDays = async ({ startDate, endDate }) => {
    return await instance.get(`/donation/campaigns/average-completion-time`);
}

export const getDonationCountByCampaignId = async ({ id }) => {
    return await instance.get(`/donation/campaigns/${id}/donation-count`);
}

export const getCampaignReceiver = async ({ id }) => {
    return await instance.get(`/donation/campaigns/${id}/receiver`);
}

export const getRecommendedCampaignsForUser = async () => {
    return await instance.get(`/donation/campaigns/recommended`);
}

export const getCampaignStatus = async (id) => {
    return await instance.get(`/donation/campaigns/${id}/status`);
}

export const closeCampaign = async (id) => {
    return await instance.put(`/donation/campaigns/close/${id}`);
}

export const getAllCampaign = async () => {
    return await instance.get(`/donation/campaigns`);
}

export const createDonate = async (data) => {
    return await instance.post(`/donation/donations`, data);
}

