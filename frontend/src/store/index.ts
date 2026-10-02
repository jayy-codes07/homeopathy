import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import patientsReducer from "./patientsSlice";

// Pure factory: no side effects, so React Strict Mode may call it twice in
// development without consequence. StoreProvider binds the Axios token getter
// to whichever store actually ends up rendered.
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      patients: patientsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
