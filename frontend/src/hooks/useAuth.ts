import { useMemo, useSyncExternalStore } from "react";
import type { UserData } from "@/types/auth-types";

/**
 * Subscribes to localStorage changes so auth state stays fresh
 * across tabs and after login/logout.
 */
function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStorageSnapshot(): string | null {
  return localStorage.getItem("userData");
}

/**
 * Hook to access the current user's data from localStorage.
 * Reactive to cross-tab storage changes.
 */
export function useAuth() {
  const raw = useSyncExternalStore(subscribeToStorage, getStorageSnapshot);

  const userData = useMemo<UserData | null>(() => {
    try {
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed._id) return null;
      return parsed as UserData;
    } catch {
      return null;
    }
  }, [raw]);

  const isAuthenticated = userData !== null;

  const logout = () => {
    localStorage.removeItem("userData");
    window.location.href = "/auth/login";
  };

  return { user: userData, isAuthenticated, logout };
}
