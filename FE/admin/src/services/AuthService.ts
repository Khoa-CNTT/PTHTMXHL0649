import auth from "./auth";

export const login = async (data) => {
    return await auth.post(`/identity/auth/token`, data)
}

export const logout = async (token) => {
    return await auth.post(
        `/identity/auth/logout`, { token });
};

export const update = async (data) => {
    return await auth.patch(`/identity/users/my-profile`, data)
}