# Frontend Refactor Summary

This document summarizes the refactor performed to align the frontend with `FRONTEND_IMPLEMENTATION_PLAN.md`: remove legacy UI, add a clean foundation, and integrate the API in a secure, config-driven way while keeping dark mode.

---

## 1. Files Removed

### Components
- `apps/web/src/components/organisms/Navbar.tsx` — Replaced by `AppHeader.tsx`
- `apps/web/src/components/organisms/Login.tsx` — Replaced by inline form in `(auth)/login/page.tsx`
- `apps/web/src/components/organisms/Dashboard.tsx` — Removed; dashboard is a minimal page
- `apps/web/src/components/organisms/Users.tsx` — Removed (no “get all users” in plan)
- `apps/web/src/components/templates/Logout.tsx` — Logout is header button + `useLogout` hook

### Routes / pages
- `apps/web/src/app/app/logout/page.tsx` — Logout is client-side only (clear token + redirect)
- `apps/web/src/app/app/users/page.tsx` — Removed (no list-users API in plan)

### API layer (legacy)
- `apps/web/src/api/axios.ts` — Replaced by `services/apiClient.ts`
- `apps/web/src/api/endpoints.ts` — Replaced by `services/auth.service.ts` + config
- `apps/web/src/api/index.ts` — Removed
- `apps/web/src/api/catchAsync.ts` — Removed (unused)
- `apps/web/src/api/utils.ts` — Removed (unused)
- `apps/web/src/api/appError.ts` — Moved to `lib/appError.ts`
- `apps/web/src/api/@types/api.types.ts` — Removed (unused)

### Mock API routes
- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/app/api/(protected)/users/route.ts`
- `apps/web/src/app/api/(protected)/user/profile/me/route.ts`
- `apps/web/src/app/api/(protected)/user/profile/logout/route.ts`

### Features / helpers
- `apps/web/src/features/users/useUsers.ts` — Removed (no GET all users in plan)

### Layout
- `apps/web/src/app/(auth)/layout.ts` — Replaced by `layout.tsx` (no server redirect)
- `apps/web/src/app/app/layout.ts` — Replaced by client `layout.tsx` (client-side auth check)

---

## 2. Files Added

### Config
- `apps/web/src/config/env.ts` — Environment detection (`NODE_ENV`, `isDevelopment`, `isProduction`, `apiBase` from `NEXT_PUBLIC_API_BASE` or `NEXT_PUBLIC_API_PATH`)
- `apps/web/src/config/api.ts` — API config: `apiBaseUrl` (`{apiBase}/api/v1`), `apiConfig` (baseURL, version, timeout, withCredentials)

### Services
- `apps/web/src/services/authToken.ts` — In-memory access token store (`getAccessToken`, `setAccessToken`, `clearAccessToken`, `hasAccessToken`)
- `apps/web/src/services/apiClient.ts` — Central axios client: base URL from config, Bearer token injection, `credentials: 'include'`, 401 → clear token + redirect to login, error toasts
- `apps/web/src/services/auth.service.ts` — Auth API: `login`, `register`, `verifyOtp`, `resendOtp`, `forgotPassword`, `resetPassword`, `exchangeCode`, `setPassword`, `getUserById`, `getGoogleLoginUrl`, `getLinkGoogleUrl` (all use `apiClient` and plan endpoints)

### Types
- `apps/web/src/types/auth.types.ts` — `User`, `AuthSuccessData`, body types (`RegisterBody`, `LoginBody`, etc.) per plan

### UI
- `apps/web/src/components/organisms/AppHeader.tsx` — Minimal header: logo, Sign in / Dashboard, theme toggle, Sign out when authenticated

### Pages
- `apps/web/src/app/(auth)/login/page.tsx` — Full login UI: email/password form, validation, loading, errors, “Sign in with Google” link, OAuth `?code` exchange and `?error` handling
- `apps/web/src/app/(auth)/register/page.tsx` — Placeholder for registration
- `apps/web/src/app/(auth)/verify-email/page.tsx` — Placeholder for OTP verification
- `apps/web/src/app/(auth)/forgot-password/page.tsx` — Placeholder for forgot password
- `apps/web/src/app/(auth)/reset-password/page.tsx` — Placeholder for reset password

### Lib
- `apps/web/src/lib/appError.ts` — `AppError` and `isAppError` (moved from `api/appError.ts`)

---

## 3. Files Modified

- `apps/web/src/config/index.ts` — Export `env`, `apiConfig`, `apiBaseUrl`
- `apps/web/src/config/envs.ts` — Uses `config/env` (NODE_ENV, apiBase) for backward compatibility
- `apps/web/src/constants/index.ts` — `APP_NAME` set to `TrustXplore`
- `apps/web/src/constants/paths.ts` — Added `REGISTER`, `VERIFY_EMAIL`, `FORGOT_PASSWORD`, `RESET_PASSWORD`; removed `APP.LOGOUT`, `APP.USERS`
- `apps/web/src/app/layout.tsx` — Removed user prefetch and `getProfileApi`; only theme (mode/preferredMode) passed to `App`
- `apps/web/src/app/app.tsx` — Removed `Header`; added `AppHeader` and main with `min-h`
- `apps/web/src/app/page.tsx` — New minimal home: title, short copy, “Sign in” link
- `apps/web/src/app/app/page.tsx` — Minimal dashboard (no old Dashboard component)
- `apps/web/src/app/app/layout.tsx` — Client layout: redirect to login when `!hasAccessToken()`, else children
- `apps/web/src/app/(auth)/layout.tsx` — Simple wrapper + metadata (no server auth redirect)
- `apps/web/src/store/slices/auth/auth.types.ts` — Uses `User` from `@/types/auth.types` instead of `GetProfileOutput`
- `apps/web/src/store/slices/auth/auth.slice.ts` — Typed with `User`
- `apps/web/src/@types/zustandState.types.ts` — `RootLayoutAppProps` only theme (no user); `ZustandState` alias
- `apps/web/src/hooks/useZustandState.ts` — Returns only layout props (theme), no user hydration
- `apps/web/src/helpers/isAuthenticated.ts` — Client-only: returns `hasAccessToken()`; server returns `false`
- `apps/web/src/features/auth/useLogin.ts` — Uses `auth.service.login`, sets user in store, redirects to app
- `apps/web/src/features/profile/useLogout.ts` — Clears token, calls store `logout`, redirects to login
- `apps/web/src/features/profile/useProfile.ts` — Uses `getUserById`; `useProfile(userId)` for fetching and setting user
- `apps/web/src/hooks/useAppMutation.ts` — Import `AppError` from `@/lib/appError`
- `apps/web/src/styles/theme.css` — Added `--color-muted-foreground`; dark theme colors adjusted

---

## 4. Architectural Improvements

- **Config layer**  
  - `config/env.ts`: single place for env and flags.  
  - `config/api.ts`: API base and version (`/api/v1`).  
  - No hardcoded API URLs; backend base from `NEXT_PUBLIC_API_BASE` or `NEXT_PUBLIC_API_PATH`.

- **Centralized API**  
  - All backend calls go through `services/apiClient.ts` (single axios instance, interceptors).  
  - Auth flows live in `services/auth.service.ts` using plan endpoints and `apiClient`.

- **Token handling**  
  - Access token stored in memory only (`services/authToken.ts`).  
  - Sent as `Authorization: Bearer <token>` by `apiClient`.  
  - No refresh or logout API in plan; “logout” = clear token and redirect.

- **Route structure**  
  - Public: `/`, `/about`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.  
  - Protected: `/app` (client-side guard via `hasAccessToken()`).  
  - OAuth callback handled on login page (`?code` → exchange, `?error` → show message).

- **Auth state**  
  - No SSR user prefetch (token is in-memory).  
  - Store holds `user` and `isAuthenticated`; set on login/verify/exchange, cleared on logout.

---

## 5. API Integration Approach

- **Base URL**  
  - `apiBaseUrl = env.apiBase + '/api/v1'` (e.g. `https://api.trustxplore.com/api/v1`).

- **Auth**  
  - Login: `POST /auth/login` → store token + user, redirect.  
  - Google: link to `GET /auth/google`; return `?code` → `POST /auth/exchange`; `?error` shown on login page.  
  - Register/verify/resend/forgot/reset/set-password and `getUserById` implemented in `auth.service.ts` per plan.

- **Errors**  
  - 401: clear token, redirect to `/login`.  
  - 403: toast “Access denied”.  
  - Network and 4xx: toast with message.  
  - Auth error codes from plan can be mapped in UI (e.g. EMAIL_TAKEN, INVALID_CREDENTIALS) in a later pass.

- **Loading / UX**  
  - Login: `isPending` and `exchangePending` disable submit and show “Signing in…” / “Completing sign-in…”.  
  - Header: “Signing out…” while logout runs.  
  - App layout: loader while checking token and before redirect.

---

## 6. Security Improvements

- **No secrets in frontend**  
  - Only `NEXT_PUBLIC_*` used; no server secrets in client bundle.

- **Token in memory**  
  - Access token not in localStorage/cookies (XSS); cleared on 401 and logout.

- **Centralized auth**  
  - Single token module and single client; Bearer injection and 401 handling in one place.

- **Defensive API usage**  
  - `withCredentials: true` for cookie (e.g. refresh).  
  - Validated response shapes and error handling in service and interceptors.

---

## 7. Assumptions

- Backend base URL is set via `NEXT_PUBLIC_API_BASE` or `NEXT_PUBLIC_API_PATH` (no trailing slash).
- Backend returns `{ status, message, data? }`; auth success includes `data.user` and `data.accessToken`.
- No refresh or logout endpoint; session ends when token is cleared or expires.
- Protected route guard is client-only (`/app` layout checks `hasAccessToken()` after hydration).
- Register, verify-email, forgot-password, reset-password pages are placeholders; forms can be wired later using `auth.service.ts`.
- `APP_NAME` set to “TrustXplore”; theme (dark mode) and existing theme slice/cookie behavior kept.

---

## 8. Dark Mode

- **Preserved**  
  - `store/slices/theme`, `AppClient` (system preference listener), theme cookie, and `data-theme` on `<html>` unchanged.  
  - New header includes the same theme toggle (cycle light/dark/system) as before.

---

## 9. Project Structure (Current)

```
src/
├── config/          env.ts, api.ts, envs.ts, index.ts
├── services/        authToken.ts, apiClient.ts, auth.service.ts
├── types/           auth.types.ts
├── hooks/           useRouter, useStore, useZustandState, useAppMutation
├── features/       auth/useLogin, profile/useLogout, profile/useProfile
├── components/      atoms, molecules, organisms (AppHeader), templates
├── app/             layout, page, app/, (auth)/, (public)/, api/
├── utils/           (existing)
├── lib/             cn, queryClient, cookieStore, appError
├── store/           slices (auth, loading, theme)
├── constants/       paths, index, objects
└── helpers/         isAuthenticated
```

Build and typecheck pass; no dead routes or unused components left from the removed legacy UI.
