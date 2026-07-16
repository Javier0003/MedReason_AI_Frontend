import { authenticationStore } from "../store/authentication-store";
import { redirect } from '@tanstack/react-router'

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
  const {authenticationToken: token, logout} = authenticationStore.getState();

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
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if(json.message === "Token inválido o expirado") {
        await logout();
        throw redirect({ to: '/auth/login' })
      }
      result.error = json.message || `HTTP ${res.status}`;
      result.data = json as T;
      result.success = false;
      return result;
    }
    result.data = json as T;
    result.success = true;
    return result;
  } catch (error) {
    result.error = (error as Error).message || 'Network error';
    result.success = false;
    return result
  }
}