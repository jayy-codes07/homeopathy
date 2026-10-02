import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearAuth, readAuth, StoredAuth, writeAuth } from "./authStorage";

export interface AuthState {
  token: string | null;
  doctorName: string;
  // False until StoreProvider has read localStorage on the client. Pages wait
  // for this before deciding between "logged in" and "redirect to /login", so
  // the server-rendered markup and the first client render match.
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  doctorName: "",
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<StoredAuth | null>) {
      state.token = action.payload?.token ?? null;
      state.doctorName = action.payload?.doctorName ?? "";
      state.hydrated = true;
    },
    setCredentials(state, action: PayloadAction<StoredAuth>) {
      state.token = action.payload.token;
      state.doctorName = action.payload.doctorName;
      state.hydrated = true;
      writeAuth(action.payload);
    },
    logout(state) {
      state.token = null;
      state.doctorName = "";
      state.hydrated = true;
      clearAuth();
    },
  },
});

export const { hydrate, setCredentials, logout } = authSlice.actions;
export const hydrateFromStorage = () => hydrate(readAuth());

export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectDoctorName = (state: { auth: AuthState }) => state.auth.doctorName;
export const selectAuthHydrated = (state: { auth: AuthState }) => state.auth.hydrated;

export default authSlice.reducer;
