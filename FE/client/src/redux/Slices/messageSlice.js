import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as ChatService from "~/services/ChatService"

const initialState = {
    messages: null,
    loadingCreateMessage: false,
    loadingDeleteMessage: false,
    newMessage: null
};

export const createMessage = createAsyncThunk(
    "message/createMessage",
    async ({ data }) => {
        const formData = new FormData();

        formData.append("chatId", data.chatId);
        formData.append("content", data.content || "");

        formData.append("type", data.type);

        if (data.images && data.images.length > 0) {
            data.images.forEach(image => {
                formData.append("images", image);
            });
        }

        const res = await ChatService.createMessage(formData);
        return res;
    }
);

export const getAllMessages = createAsyncThunk("message/getAllMessages", async ({ chatId }) => {
    const res = await ChatService.getAllMessages({ chatId })
    return res
})

export const deleteMessage = createAsyncThunk("message/delete", async ({ messageId }) => {
    const res = await ChatService.deleteMessage({ messageId })
    return res
})

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createMessage.pending, (state, action) => {
                state.loadingCreateMessage = true
            })
            .addCase(createMessage.fulfilled, (state, action) => {
                state.loadingCreateMessage = false
                state.newMessage = action.payload
            })
            .addCase(createMessage.rejected, (state, action) => {
                state.loadingCreateMessage = false
                state.newMessage = null
            })
            .addCase(deleteMessage.pending, (state, action) => {
                state.loadingDeleteMessage = true
            })
            .addCase(deleteMessage.fulfilled, (state, action) => {
                state.loadingDeleteMessage = false
            })
            .addCase(deleteMessage.rejected, (state, action) => {
                state.loadingDeleteMessage = false
            })
            .addCase(getAllMessages.fulfilled, (state, action) => {
                state.messages = action.payload
            })
    }
});


export default messageSlice.reducer;

