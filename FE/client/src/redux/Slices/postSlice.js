import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as  PostService from "~/services/PostService"

const initialState = {
    sentiment: localStorage.getItem("sentiment") ?? "For you",
    posts: []
};


export const getPostsById = createAsyncThunk("user/posts", async ({ id, page, size }) => {
    const res = await PostService.getPostsById({ id, page, size })
    return res
})

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        setSentiment(state, action) {
            state.sentiment = action.payload
            localStorage.setItem("sentiment", action.payload)
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPostsById.fulfilled, (state, action) => {
                state.posts = action.payload
            })
    }
});

export const { setSentiment } = postSlice.actions

export default postSlice.reducer;

