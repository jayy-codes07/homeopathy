import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./authSlice";
import patientsReducer from "./patientsSlice";
import { configureApi } from "@/utils/api";

// One store per browser tab, created inside StoreProvider. The Axios instance
// is given a getter here rather than importing the store itself, which keeps
// the dependency graph one-directional: store -> api, slices -> api, never back.
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      patients: patientsReducer,
    },
  });
  configureApi({
    getToken: () => store.getState().auth.token,
    onUnauthorized: () => store.dispatch(logout()),
  });
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
