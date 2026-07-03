import { authenticationStore } from "../store/authentication-store";

export default function fetchWithToken(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authenticationStore.getState().authenticationToken;

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  try {
    return fetch(url, { ...options, headers });
  } catch (error) {
    if(error )

    console.error("Error during fetchWithToken:", error);
    throw error;
  }
}