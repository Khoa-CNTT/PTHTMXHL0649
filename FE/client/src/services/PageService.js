import instance from ".";

export const registerVolunteer = async () => {
    return await instance.post(`/page/volunteers/apply`);
};

export const getVolunteers = async () => {
    return await instance.get(`/page/volunteers/campaign/7d2145ed-16e9-4530-bb8d-abdece72b068/paged?page=0&size=10`);
};

export const getVolunteerByCampaign = async () => {
    return await instance.get(`/page/volunteers/campaign/7d2145ed-16e9-4530-bb8d-abdece72b068`);
};

export const update = async () => {
    return await instance.patch(`/page/volunteers/campaign/7d2145ed-16e9-4530-bb8d-abdece72b068`);
};


export const deleteVolunteer = async () => {
    return await instance.delete(`/page/volunteers/e9f69efb-8344-4e6c-9b09-0b452f60c9ec`);
};

export const createFreeTime = async () => {
    return await instance.post(`/page/volunteers/availability`);
};

export const getFreeTime = async () => {
    return await instance.get(`/page/volunteers/availability`);
};





