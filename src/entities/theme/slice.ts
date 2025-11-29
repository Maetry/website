import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  blackTheme: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    themeToggle: (state) => {
      state.blackTheme = !state.blackTheme;
    },
    setTheme: (state, action) => {
      state.blackTheme = action.payload;
    },
  },
});

export const { themeToggle, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
