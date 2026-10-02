"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { hydrateFromStorage } from "./authSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialiser: one store per mounted provider, created exactly once.
  const [store] = useState(makeStore);

  // Read the persisted session after mount. Doing it here instead of inside
  // makeStore keeps the server-rendered HTML identical to the first client
  // render, since the server has no localStorage.
  useEffect(() => {
    store.dispatch(hydrateFromStorage());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
