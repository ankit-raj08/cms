/**
 * In-memory access token store (no localStorage for XSS safety).
 * Cleared on full page reload; logout = clear token and redirect.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function hasAccessToken(): boolean {
  return accessToken != null && accessToken.length > 0;
}
