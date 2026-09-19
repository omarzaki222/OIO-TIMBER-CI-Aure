import { apiGet, apiSend, setAccessToken } from "@/lib/api";
import type { TokenResponse, User } from "@/types/api";

export async function signup(body: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  const data = await apiSend<TokenResponse>("/api/v1/auth/signup", "POST", body);
  setAccessToken(data.access_token);
  return data;
}

export async function login(body: { email: string; password: string }) {
  const data = await apiSend<TokenResponse>("/api/v1/auth/login", "POST", body);
  setAccessToken(data.access_token);
  return data;
}

export async function logout() {
  try {
    await apiSend("/api/v1/auth/logout", "POST", undefined, true);
  } finally {
    setAccessToken(null);
  }
}

export function fetchMe() {
  return apiGet<User>("/api/v1/me", true);
}
