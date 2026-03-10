/**
 * Auth-related types aligned with FRONTEND_IMPLEMENTATION_PLAN.md
 */

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSuccessData {
  user: User;
  accessToken: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpBody {
  email: string;
  otp: string;
}

export interface ResendOtpBody {
  email: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

export interface SetPasswordBody {
  password: string;
  confirmPassword: string;
}

// Note: Legacy Google OAuth code exchange flow has been removed in favor of
// backend-driven redirect + refresh token flow. No dedicated OauthExchangeBody is needed.
