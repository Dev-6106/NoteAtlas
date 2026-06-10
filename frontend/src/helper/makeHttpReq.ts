import { apiUrl } from "@/config/get-env"
import { auth } from "@/config/firebase"

export type HttpVerbType = 'GET' | 'POST' | 'PUT' | 'DELETE'

export async function makeHttpReq<T>(verb: HttpVerbType, endpoint: string, input?: T) {
  try {
    const url = endpoint.startsWith('/') 
      ? `${apiUrl}${endpoint}` 
      : `${apiUrl}/api/v1/${endpoint}`;

    const headers: HeadersInit = {
      accept: "application/json",
      "Content-Type": "application/json",
    };

    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
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
