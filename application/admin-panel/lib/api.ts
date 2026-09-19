import { ACCESS_TOKEN_KEY, API_URL } from "./config";
import type { ApiError } from "@/types/api";

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function parseError(res: Response): Promise<ApiRequestError> {
  try {
    const body = (await res.json()) as ApiError;
    const message = body.error?.message || res.statusText || "Request failed";
    return new ApiRequestError(res.status, message, body.error?.code);
  } catch {
    return new ApiRequestError(res.status, res.statusText || "Request failed");
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    setAccessToken(null);
    return null;
  }
  const data = (await res.json()) as { access_token: string };
  setAccessToken(data.access_token);
  return data.access_token;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean; retry?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  if (res.status === 401 && opts.auth && opts.retry !== false) {
    const next = await refreshAccessToken();
    if (next) {
      return apiFetch<T>(path, init, { ...opts, retry: false });
    }
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: "GET" }, { auth });
}

export async function apiSend<T>(path: string, method: string, body?: unknown, auth = true): Promise<T> {
  return apiFetch<T>(
    path,
    { method, body: body === undefined ? undefined : JSON.stringify(body) },
    { auth },
  );
}
