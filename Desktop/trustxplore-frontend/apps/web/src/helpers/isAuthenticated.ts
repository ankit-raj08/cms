import { hasAccessToken } from '@/services/authToken';
import { isServer } from '@/utils';

/**
 * Client-only: returns true if an access token is in memory.
 * On server, always returns false (token is not available in SSR).
 */
export default function isAuthenticated(): Promise<boolean> {
  if (isServer) return Promise.resolve(false);
  return Promise.resolve(hasAccessToken());
}
