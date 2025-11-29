import { configureStore } from "@reduxjs/toolkit";

import { mobileHeaderReducer } from "@/entities/mobile-header";
import { questionReducer } from "@/entities/question";
import { themeReducer } from "@/entities/theme";

const store = configureStore({
  reducer: {
    mobileMenu: mobileHeaderReducer,
    theme: themeReducer,
    question: questionReducer,
  },
});

export default store;
export { default as StoreProvider } from "./StoreProvider";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
