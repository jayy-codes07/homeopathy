"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { hydrateFromStorage, logout } from "./authSlice";
import { configureApi } from "@/utils/api";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialiser: one store per mounted provider.
  const [store] = useState(makeStore);

  useEffect(() => {
    // Bind Axios to this store first. In development React Strict Mode runs
    // the useState initialiser twice and keeps only one store; binding here
    // guarantees the getter reads the store that is actually rendered. The
    // dependency graph stays one-directional: provider -> api, never api -> store.
    configureApi({
      getToken: () => store.getState().auth.token,
      onUnauthorized: () => store.dispatch(logout()),
    });
    // Then read the persisted session. Doing it after mount keeps the
    // server-rendered HTML identical to the first client render, and AuthGate
    // holds every protected page until this has run, so no request can go
    // out before the token getter is in place.
    store.dispatch(hydrateFromStorage());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
