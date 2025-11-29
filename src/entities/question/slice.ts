import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  question: "",
  show: false,
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    toggleShowQuestion: (state) => {
      state.show = !state.show;
    },
    setQuestion: (state, action) => {
      state.question = action.payload;
    },
  },
});

export const { toggleShowQuestion } = questionSlice.actions;
export const { setQuestion } = questionSlice.actions;

export default questionSlice.reducer;
