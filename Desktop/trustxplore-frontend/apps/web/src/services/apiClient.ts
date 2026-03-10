/**
 * Centralized HTTP client for backend API.
 * - Base URL and version from config
 * - Request: injects Bearer token, credentials, Accept-Language
 * - Response: 401 → clear token and redirect to login; error toasts
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

import { apiConfig } from '@/config/api';
import paths from '@/constants/paths';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/services/authToken';
import { isServer } from '@/utils';

export interface ApiSuccessResponse<T = unknown> {
  status: number;
  message: string;
  results?: number;
  data?: T;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  error?: string;
  existingProviders?: string[];
  [key: string]: unknown;
}

const client = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!apiConfig.baseURL) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      // Debug log: track interceptor-based token refresh calls
      // eslint-disable-next-line no-console
      console.log('[apiClient.refreshAccessToken] Calling', `${apiConfig.baseURL}/auth/refresh`);

      const res = await fetch(`${apiConfig.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type') ?? '';
      let body: unknown = null;

      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        const text = await res.text();
        // eslint-disable-next-line no-console
        console.error('[apiClient.refreshAccessToken] Non-JSON response', text);
        throw new Error(`Unexpected non-JSON response from /auth/refresh: ${text}`);
      }

      if (!res.ok) {
        const err = body as { message?: string };
        // eslint-disable-next-line no-console
        console.error(
          '[apiClient.refreshAccessToken] Failed',
          res.status,
          err || body,
        );
        throw new Error(err?.message || 'Refresh failed');
      }

      const parsed = body as ApiSuccessResponse<{ accessToken: string }>;
      const token = parsed.data?.accessToken;
      if (!token) return null;
      // eslint-disable-next-line no-console
      console.log('[apiClient.refreshAccessToken] Success, token received');
      setAccessToken(token);
      return token;
    })()
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!isServer) {
      const lang = config.headers?.['Accept-Language'];
      if (!lang) (config.headers as Record<string, string>)['Accept-Language'] = 'en';
    }

    const token = getAccessToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (!isServer) {
      if (error.code === 'ERR_NETWORK') {
        toast.error(error.message ?? 'Network error');
        return Promise.reject(error);
      }

      const status = error.response?.status;
      if (status === 403) {
        toast.error('Access denied');
      }

      const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';
      if (status && status >= 400) toast.error(message);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      !isServer &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith('/auth/refresh')
    ) {
      originalRequest._retry = true;

      return refreshAccessToken().then((newToken) => {
        if (!newToken) {
          clearAccessToken();
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith(paths.LOGIN)) {
            window.location.href = paths.LOGIN;
          }
          return Promise.reject(error);
        }

        (originalRequest.headers as Record<string, string>) = {
          ...(originalRequest.headers as Record<string, string>),
          Authorization: `Bearer ${newToken}`,
        };
        return client(originalRequest);
      });
    }

    return Promise.reject(error);
  },
);

export default client;
