import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as ChatService from "~/services/ChatService"

const initialState = {
    chats: [],
    loadingGetUserChat: false,
    createdGroup: null,
    createdChat: null,
    searchSticker: null,
    loadingStickers: false,
    loadingDeleteChat: false,
};

export const searchSticker = createAsyncThunk("chat/searchSticker", async (keyword) => {
    const res = await ChatService.searchSticker({ keyword })
    return res
})

export const createChat = createAsyncThunk("chat/createChat", async ({ data }) => {
    const res = await ChatService.createChat(data)
    return res
})

export const deleteChat = createAsyncThunk("chat/deleteChat", async ({ chatId }) => {
    const res = await ChatService.deleteChat({ chatId })
    return res
})

export const createGroupChat = createAsyncThunk("chat/createGroupChat", async (data) => {
    const res = await ChatService.createGroupChat(data)
    return res
})

export const renameGroupChat = createAsyncThunk("chat/renameGroupChat", async ({ groupId, groupName }) => {
    const res = await ChatService.renameGroupChat({ groupId, groupName })
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
                state.loadingGetUserChat = false;
                state.chats = action.payload
            })
            .addCase(getUsersChat.pending, (state, action) => {
                state.loadingGetUserChat = true;
            })
            .addCase(getUsersChat.rejected, (state, action) => {
                state.loadingGetUserChat = false;
            })
            .addCase(searchSticker.pending, (state) => {
                state.loadingStickers = true;
            })
            .addCase(searchSticker.fulfilled, (state, action) => {
                state.loadingStickers = false;
                state.searchSticker = action.payload || [];
            })
            .addCase(searchSticker.rejected, (state, action) => {
                state.loadingStickers = false;
                state.searchSticker = null;
            })
            .addCase(deleteChat.pending, (state, action) => {
                state.loadingDeleteChat = true;
            })
            .addCase(deleteChat.fulfilled, (state, action) => {
                state.loadingDeleteChat = false;
                if (action.payload && action.payload.chatId) {
                    state.chats = state.chats.filter(chat => chat.id !== action.payload.chatId);
                } else if (action.meta && action.meta.arg && action.meta.arg.chatId) {
                    state.chats = state.chats.filter(chat => chat.id !== action.meta.arg.chatId);
                }
            })
            .addCase(deleteChat.rejected, (state, action) => {
                state.loadingDeleteChat = false;
            })
            .addCase(renameGroupChat.fulfilled, (state, action) => {
                if (action.payload && action.payload?.result?.id && action.payload?.result?.chatName) {
                    const { id, chatName } = action.payload?.result;
                    const chatToUpdate = state.chats.find(chat => chat.id === id);
                    if (chatToUpdate) {
                        chatToUpdate.chatName = chatName;
                    }
                }
            })
    }
});


export default chatSlice.reducer;

