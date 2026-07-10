const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  data?: T;
  [key: string]: any;
}

/**
 * Perform a fetch-based API call with default cookie forwarding credentials
 * and content-type headers pre-configured.
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Essential to pass cookies (JWT tokens)
  };

  try {
    const response = await fetch(url, config);
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch (e) {
      data = {
        success: response.ok,
        message: response.statusText || "Unable to parse server response.",
      };
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`API Call failed to: ${endpoint}`, error);
    throw error;
  }
}
