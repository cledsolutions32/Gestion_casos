/**
 * Headers para JSON (Content-Type + Authorization).
 */
export function getAuthHeaders(accessToken: string | undefined): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * Solo Authorization. Usar en peticiones con FormData (no enviar Content-Type).
 */
export function getAuthHeaderOnly(accessToken: string | undefined): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
