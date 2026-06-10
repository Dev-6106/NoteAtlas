import { apiUrl } from "@/config/get-env"
import { auth } from "@/config/firebase"
import { onAuthStateChanged } from "firebase/auth"

export type HttpVerbType = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * Wait for Firebase to finish restoring auth state after page load.
 * Returns the current user (or null if not logged in).
 */
let authReadyPromise: Promise<import("firebase/auth").User | null> | null = null;

function waitForAuth() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
  return authReadyPromise;
}

export async function makeHttpReq<T>(verb: HttpVerbType, endpoint: string, input?: T) {
  try {
    const url = endpoint.startsWith('/') 
      ? `${apiUrl}${endpoint}` 
      : `${apiUrl}/api/v1/${endpoint}`;

    const headers: HeadersInit = {
      accept: "application/json",
      "Content-Type": "application/json",
    };

    // Wait for Firebase auth state to be ready before getting token
    const user = await waitForAuth();
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: verb,
      credentials: "omit", // since we are using Bearer tokens
      headers,
      body: input ? JSON.stringify(input) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("userData");
        window.location.href = "/auth/login";
      }
      return Promise.reject(data);
    }

    return data;
  } catch (error: any) {
    return Promise.reject({
      message: error.message || "Network error",
      stack: error.stack,
    });
  }
}
