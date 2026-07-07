import { authenticationStore } from "../store/authentication-store";

class FetchResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;

  constructor() {
    this.success = false;
    this.data = null;
    this.error = null;
  }
}

export default async function fetchWithToken<T>(url: string, options: RequestInit = {}): Promise<FetchResult<T>> {
  const token = authenticationStore.getState().authenticationToken;

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const result = new FetchResult<T>();

  try {
    const res = await fetch(url, { ...options, headers });
    if(res.status === 401) {
      throw new Error("Unauthorized: Invalid or expired token");
    }
    const json = await res.json();
    result.data = json as T;
    result.success = true;
    return result;
  } catch (error) {
    authenticationStore.getState().logout();
    result.error = error as string;
    result.success = false;
    return result
  }
}