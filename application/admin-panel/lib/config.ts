export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

export const ACCESS_TOKEN_KEY = "oio_admin_access_token";
