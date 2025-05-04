import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SearchService from "~/services/SearchService"
import * as UserService from "~/services/UserService"

const initialState = {
    id: "",
    profileId: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    city: "",
    emailVerified: false,
    createdAt: "",
    token: "",
    phoneNumber: "",
    dob: "",
    gender: "",
    status: "",
    roles: [],
    searchUser: null,
    user: null,
    loadingGetDetailUserById: false
};

export const searchUser = createAsyncThunk("user/searchUser", async (keyword) => {
    const res = await SearchService.searchUser({ keyword })
    return res?.result?.items
})

export const getDetailUserById = createAsyncThunk("user/getDetailUserById", async ({ id, token }) => {
    const res = await UserService.getDetailUserByUserId({ id })
    return { ...res?.result, token }
})

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser(state, action) {
            const {
                id = "",
                firstName = "",
                profileId = "",
                lastName = "",
                email = "",
                username = "",
                phoneNumber = "",
                createdAt = "",
                bio = "",
                gender = "",
                city = "",
                token = "",
                dob = "",
                emailVerified = false,
                status = "",
                roles = [],
                imageUrl = "",
            } = action.payload

            state.lastName = lastName
            state.firstName = firstName
            state.profileId = profileId
            state.avatar = imageUrl
            state.id = id
            state.bio = bio
            state.gender = gender
            state.email = email
            state.createdAt = createdAt
            state.dob = dob
            state.username = username
            state.phoneNumber = phoneNumber
            state.city = city
            state.emailVerified = emailVerified
            state.token = token
            state.status = status
            state.roles = roles
        },
        updateStatus(state, action) {
            state.status = action.payload
        },
        resetUser(state) {
            localStorage.removeItem("token")
            state.id = ""
            state.profileId = ""
            state.firstName = ""
            state.lastName = ""
            state.username = ""
            state.email = ""
            state.bio = ""
            state.city = ""
            state.emailVerified = false
            state.createdAt = ""
            state.token = ""
            state.phoneNumber = ""
            state.dob = ""
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchUser.fulfilled, (state, action) => {
                state.searchUser = action.payload
            })
            .addCase(getDetailUserById.pending, (state, action) => {
                state.loadingGetDetailUserById = true
            })
            .addCase(getDetailUserById.fulfilled, (state, action) => {
                state.loadingGetDetailUserById = false
                state.user = action.payload
            })
            .addCase(getDetailUserById.rejected, (state, action) => {
                state.loadingGetDetailUserById = false
                state.user = null
            })
    }
});

export const { updateUser, resetUser, updateStatus } = userSlice.actions

export default userSlice.reducer;
