import type { UserData } from "@/types/auth-types";

/**
 * Retrieve user data from localStorage.
 * Returns null if not found or invalid.
 */
export const getUserData = (): UserData | null => {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed._id) return null;
    return parsed as UserData;
  } catch {
    return null;
  }
};