/**
 * Auth API service — all calls use services/apiClient and config.
 * Aligned with FRONTEND_IMPLEMENTATION_PLAN.md endpoints.
 */

import { apiBaseUrl } from '@/config/api';
import apiClient, { type ApiSuccessResponse } from '@/services/apiClient';
import { setAccessToken } from '@/services/authToken';

import type {
  AuthSuccessData,
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResendOtpBody,
  ResetPasswordBody,
  SetPasswordBody,
  User,
  VerifyOtpBody,
} from '@/types/auth.types';

const AUTH = '/auth';
const USERS = '/users';

export async function login(body: LoginBody): Promise<AuthSuccessData> {
  const res = await apiClient.post<ApiSuccessResponse<AuthSuccessData>>(`${AUTH}/login`, body);
  const data = res.data?.data;
  if (!data?.accessToken) throw new Error('Invalid login response');
  setAccessToken(data.accessToken);
  return data;
}

export async function register(body: RegisterBody): Promise<void> {
  await apiClient.post<ApiSuccessResponse>(`${AUTH}/register`, body);
}

export async function verifyOtp(body: VerifyOtpBody): Promise<AuthSuccessData> {
  const res = await apiClient.post<ApiSuccessResponse<AuthSuccessData>>(`${AUTH}/verify-otp`, body);
  const data = res.data?.data;
  if (!data?.accessToken) throw new Error('Invalid verify-otp response');
  setAccessToken(data.accessToken);
  return data;
}

export async function resendOtp(body: ResendOtpBody): Promise<void> {
  await apiClient.post<ApiSuccessResponse>(`${AUTH}/resend-otp`, body);
}

export async function forgotPassword(body: ForgotPasswordBody): Promise<void> {
  await apiClient.post<ApiSuccessResponse>(`${AUTH}/forgot-password`, body);
}

export async function resetPassword(body: ResetPasswordBody): Promise<void> {
  await apiClient.post<ApiSuccessResponse>(`${AUTH}/reset-password`, body);
}

export async function refreshSession(): Promise<AuthSuccessData> {
  const url = `${apiBaseUrl}${AUTH}/refresh`;

  // Debug log: track refreshSession calls
  // eslint-disable-next-line no-console
  console.log('[auth.refreshSession] Calling', url);

  const res = await fetch(url, {
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
    console.error('[auth.refreshSession] Non-JSON response', text);
    throw new Error(`Unexpected non-JSON response from /auth/refresh: ${text}`);
  }

  if (!res.ok) {
    const err = body as { message?: string };
    // eslint-disable-next-line no-console
    console.error('[auth.refreshSession] Failed', res.status, err);
    throw new Error(err?.message || 'Refresh failed');
  }

  const parsed = body as ApiSuccessResponse<AuthSuccessData>;
  const data = parsed.data;
  if (!data?.accessToken || !data.user) throw new Error('Invalid refresh response');
  // eslint-disable-next-line no-console
  console.log('[auth.refreshSession] Success, user id', data.user.id);
  setAccessToken(data.accessToken);
  return data;
}

export async function setPassword(body: SetPasswordBody): Promise<void> {
  await apiClient.post<ApiSuccessResponse>(`${AUTH}/set-password`, body);
}

export async function getUserById(id: number): Promise<User> {
  const res = await apiClient.get<ApiSuccessResponse<User>>(`${USERS}/${id}`);
  const data = res.data?.data;
  if (!data) throw new Error('User not found');
  return data;
}

/** Returns the full URL to start Google OAuth login (same-origin or backend base). */
export function getGoogleLoginUrl(): string {
  return `${apiBaseUrl}${AUTH}/google`;
}

/** Returns the full URL to start Google account linking (requires auth). */
export function getLinkGoogleUrl(): string {
  return `${apiBaseUrl}${AUTH}/link/google`;
}
