import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    language: JSON.parse(window.localStorage.getItem("language")) ?? "vie",
};

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage(state, action) {
            state.language = action.payload;
            localStorage.setItem("language", JSON.stringify(action.payload));
        }
    },
});

export const { setLanguage } = languageSlice.actions

export default languageSlice.reducer;

