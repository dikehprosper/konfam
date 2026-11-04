import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import clientReducer from "../features/client";
import { authApi } from "../services/auth";
import { userApi } from "../services/queries";
import toastReducer from "../features/toast";

const persistConfig = {
  key: 'client',
  storage,
  whitelist: ['userData', 'isAuthChecked'],
};

const persistedClientReducer = persistReducer(persistConfig, clientReducer);

const clientStore = configureStore({
  reducer: {
    client: persistedClientReducer,
    toast: toastReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authApi.middleware, userApi.middleware),
});

setupListeners(clientStore.dispatch);

export const persistor = persistStore(clientStore);
export default clientStore;