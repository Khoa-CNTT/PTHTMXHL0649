import {  createSlice } from "@reduxjs/toolkit";

const initialState = {
    userId: "",
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
    imageUrl: "",
    phoneNumber: "",
    dob: "",
    gender: "",
    status: "",
    roles: [],
    searchUser: null,
};


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser(state, action) {
            console.log(action.payload, "action.payload")
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
            state.imageUrl = imageUrl
            state.userId = id
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
            state.userId = ""
            state.profileId = ""
            state.firstName = ""
            state.lastName = ""
            state.username = ""
            state.email = ""
            state.bio = ""
            state.city = ""
            state.imageUrl = ""
            state.emailVerified = false
            state.createdAt = ""
            state.token = ""
            state.phoneNumber = ""
            state.dob = ""
        }
    }
});

export const { updateUser, resetUser, updateStatus } = userSlice.actions

export default userSlice.reducer;
