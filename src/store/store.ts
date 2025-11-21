import { configureStore, combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: __DEV__,
});

export type AppDispatch = typeof store.dispatch;
export default store;
