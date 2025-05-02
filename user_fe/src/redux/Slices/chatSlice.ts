import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as ChatService from "@services/chat-service"

const initialState = {
    chats: [],
    createdGroup: null,
    createdChat: null
};

export const createChat = createAsyncThunk("chat/createChat", async ({ data }) => {
    const res = await ChatService.createChat(data)
    return res
})

export const createGroupChat = createAsyncThunk("chat/createGroupChat", async (data) => {
    const res = await ChatService.createGroupChat(data)
    return res
})

export const getUsersChat = createAsyncThunk("chat/getUsersChat", async ({ userId }) => {
    const res = await ChatService.getUsersChat({ userId })
    return res?.result
})

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createChat.fulfilled, (state, action) => {
                state.createdChat = action.payload
            })
            .addCase(createGroupChat.fulfilled, (state, action) => {
                state.createdGroup = action.payload
            })
            .addCase(getUsersChat.fulfilled, (state, action) => {
                state.chats = action.payload
            })
    }
});


export default chatSlice.reducer;

