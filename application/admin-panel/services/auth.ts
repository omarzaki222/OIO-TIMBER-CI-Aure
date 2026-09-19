import { apiGet, apiSend, setAccessToken } from "@/lib/api";
import type { TokenResponse, User } from "@/types/api";

export async function login(body: { email: string; password: string }) {
  const data = await apiSend<TokenResponse>("/api/v1/auth/login", "POST", body, false);
  setAccessToken(data.access_token);
  return data;
}

export async function logout() {
  try {
    await apiSend("/api/v1/auth/logout", "POST");
  } finally {
    setAccessToken(null);
  }
}

export function fetchMe() {
  return apiGet<User>("/api/v1/me");
}
