import instance from "."

export const createCampaign = async (data) => {

    const formData = new FormData
    formData.append("request", JSON.stringify(data.request));
    if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
            formData.append("files", file);
        });
    } else {
        formData.append("files", new Blob([]));
    }

    return await instance.post('/donation/campaigns/create', formData);
};

export const getCampaignById = async (campaignId) => {
    return await instance.get(`/donation/campaigns/${campaignId}`);
}

export const closeCampaign = async (campaignId) => {
    return await instance.put(`/donation/campaigns/close/${campaignId}`);
}

export const getAllCampaign = async () => {
    return await instance.get(`/donation/campaigns`);
}

export const getTopCampaign = async () => {
    return await instance.get(`/donation/campaigns/topCampaigns`);
}

export const getTopCampaigns = async () => {
    return await instance.get(`/donation/donations/topCampaigns`);
}

export const getAverageCompletionTimeInDays = async ({ startDate, endDate }) => {
    return await instance.get(`/donation/campaigns/average-completion-time?startDate=${startDate}&endDate=${endDate}`);
}

export const getDonationCountByCampaignId = async ({ campaignId }) => {
    return await instance.get(`/donation/campaigns/${campaignId}/donation-count`);
}

export const getCampaignReceiver = async ({ id }) => {
    return await instance.get(`/donation/campaigns/${id}/receiver`);
}

export const getRecommendedCampaignsForUser = async () => {
    return await instance.get(`/donation/campaigns/recommended`);
}

export const getCampaignStatus = async (campaignId) => {
    return await instance.get(`/donation/campaigns/${campaignId}/status`);
}


