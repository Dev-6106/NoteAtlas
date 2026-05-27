import { env } from "@/config/env";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Centralized HTTP request utility.
 * Automatically prepends the API URL and handles JSON.
 */
export async function makeHttpReq<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers: customHeaders = {},
    timeout = 30000,
  } = options;

  const url = `${env.apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    ...customHeaders,
  };

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      signal: controller.signal,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.error?.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return { data: data as T, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}
