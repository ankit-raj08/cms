/**
 * API configuration: base URL, version, and request defaults.
 * Uses config/env for environment-aware base URL.
 */

import { env } from '@/config/env';

const API_VERSION = 'v1';

/** Base URL for the API (e.g. https://api.trustxplore.com/api/v1) */
export const apiBaseUrl = env.apiBase ? `${env.apiBase}/api/${API_VERSION}` : '';

export const apiConfig = {
  baseURL: apiBaseUrl,
  version: API_VERSION,
  timeout: 30_000,
  withCredentials: true,
} as const;

export default apiConfig;
