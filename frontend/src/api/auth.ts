import { env } from "@/config/env";
import { makeHttpReq } from "@/helper/makeHttpReq";

/** Fetch the authenticated user profile from the session */
export const getAuthUserData = async () => {
  const { data } = await makeHttpReq<any>("/auth/me");
  return data;
};

/** Logout — clear session and redirect */
export const logoutUser = async () => {
  try {
    await makeHttpReq("/auth/logout");
  } catch {
    // Continue with local cleanup even if server logout fails
  }
  localStorage.removeItem("userData");
  window.location.href = "/auth/login";
};