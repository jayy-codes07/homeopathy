import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { Patient } from "@/types";
import { logout } from "./authSlice";

export const PATIENTS_PAGE_SIZE = 10;

export interface PatientsState {
  items: Patient[];
  page: number;
  totalPages: number;
  totalPatients: number;
  search: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loadedOnce: boolean;
  // Only the most recent request may write results; see fulfilled/rejected.
  currentRequestId: string | undefined;
}

const initialState: PatientsState = {
  items: [],
  page: 1,
  totalPages: 1,
  totalPatients: 0,
  search: "",
  status: "idle",
  error: null,
  loadedOnce: false,
  currentRequestId: undefined,
};

interface PatientListPage {
  items: Patient[];
  totalPages: number;
  totalPatients: number;
}

// The API answers with a bare [] when nothing matches and with an object
// otherwise; both are normalised here so the reducer sees one shape.
export const fetchPatients = createAsyncThunk<
  PatientListPage,
  { page: number; search: string },
  { rejectValue: string }
>("patients/fetch", async ({ page, search }, { rejectWithValue }) => {
  try {
    const response = await api.get("/patient/all-patient", {
      params: { page, limit: PATIENTS_PAGE_SIZE, search },
    });
    const data = response.data.data;
    if (Array.isArray(data)) {
      return { items: [], totalPages: 1, totalPatients: 0 };
    }
    return {
      items: data.patient as Patient[],
      totalPages: data.totalPages as number,
      totalPatients: data.totalPatients as number,
    };
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
      "Failed to fetch patients";
    return rejectWithValue(message);
  }
});

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      if (state.search === action.payload) return;
      state.search = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return; // stale
        state.status = "succeeded";
        state.items = action.payload.items;
        state.totalPages = action.payload.totalPages;
        state.totalPatients = action.payload.totalPatients;
        state.loadedOnce = true;
        state.currentRequestId = undefined;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return; // stale
        if (action.meta.aborted) {
          // Cancelled by an unmount or a newer request: not an error to show.
          state.status = state.loadedOnce ? "succeeded" : "idle";
          state.currentRequestId = undefined;
          return;
        }
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Failed to fetch patients";
        state.currentRequestId = undefined;
      })
      .addCase(logout, () => initialState);
  },
});

export const { setSearch, setPage } = patientsSlice.actions;
export default patientsSlice.reducer;
