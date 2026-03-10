/**
 * Environment detection and validated env vars.
 * All client-visible config must use NEXT_PUBLIC_*.
 */

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_PATH ?? '';

export const env = {
  NODE_ENV: NODE_ENV as 'development' | 'production' | 'test',
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',
  /** Base URL of the backend (e.g. https://api.trustxplore.com). No trailing slash. */
  apiBase: NEXT_PUBLIC_API_BASE.replace(/\/$/, ''),
} as const;

export default env;
