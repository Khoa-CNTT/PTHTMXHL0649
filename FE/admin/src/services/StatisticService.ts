import instance from "./instance"

export const getUsers = async () => {
    return await instance.get(`/statistics/statistic/users`)
}