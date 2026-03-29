import { configureStore } from "@reduxjs/toolkit";

import { themeReducer } from "@/entities/theme";

const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export default store;
export { default as StoreProvider } from "./StoreProvider";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
