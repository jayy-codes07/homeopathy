"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppSelector } from "@/store/hooks";
import { selectAuthHydrated, selectToken } from "@/store/authSlice";

// Wraps every page under (protected). Waits for the persisted session to be
// read, then either renders the page or sends the visitor to /login.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAppSelector(selectAuthHydrated);
  const token = useAppSelector(selectToken);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return <Loading />;
  return <>{children}</>;
}
