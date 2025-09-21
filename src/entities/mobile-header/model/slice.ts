import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  showLinks: false
}

const mobileHeaderSlice = createSlice({
  name: "mobileHeader",
  initialState,
  reducers: {
    toggleHeader: (state) => {
      state.showLinks = !state.showLinks
    },
    closeHeader: (state) => {
      state.showLinks = false
    }
  }
})

export const { toggleHeader, closeHeader } = mobileHeaderSlice.actions

export default mobileHeaderSlice.reducer
