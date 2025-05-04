import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: JSON.parse(window?.localStorage.getItem("theme")) ?? "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme(state, action) {
            state.theme = action.payload;
            localStorage.setItem("theme", JSON.stringify(action.payload));
        },
    },
});

export const { setTheme } = themeSlice.actions

export default themeSlice.reducer;

