import { configureStore } from '@reduxjs/toolkit'
import userReducer from "../redux/Slices/userSlice"
import languageReducer from "../redux/Slices/languageSlice"


export const store = configureStore({
    reducer: {
        user: userReducer,
        language: languageReducer
    }
})


