# Frontend Implementation Plan — TrustXplore Backend APIs

This document lists every API the frontend must integrate with, recommended routes/flows, edge cases, and account-linking behavior. **No API is left out.**

---

## Table of contents

1. [API base & response shape](#1-api-base--response-shape)
2. [API checklist (all endpoints)](#2-api-checklist-all-endpoints)
3. [Auth flows & routes](#3-auth-flows--routes)
4. [Edge cases & error handling](#4-edge-cases--error-handling)
5. [Account linking](#5-account-linking)
6. [Token & session handling](#6-token--session-handling)
7. [Recommended frontend routes](#7-recommended-frontend-routes)
8. [Backend gaps (optional future APIs)](#8-backend-gaps-optional-future-apis)

---

## 1. API base & response shape

- **Base URL**: `{API_BASE}/api/v1` (e.g. `https://api.trustxplore.com/api/v1`).
- **Standard JSON response**:
  ```ts
  {
    status: number,   // HTTP status
    message: string, // Human-readable message (may be i18n key or resolved text)
    results?: number,
    data?: T,        // Present when showData is true or GET
    ...extraFields   // e.g. error, existingProviders
  }
  ```
- **Auth success responses** that return session data include:
  - `data.user`: `{ id, email, firstName, lastName, createdAt, updatedAt }` (and possibly `emailVerified`, `roleId` depending on backend DTO).
  - `data.accessToken`: JWT string. **Frontend must store and send this** (e.g. in memory or localStorage; prefer memory for XSS safety).
- **Refresh token**: Set by server in **httpOnly cookie** (`refreshToken`, path `/api/v1/auth`). Frontend does **not** read it; it is sent automatically with same-origin requests to `/api/v1/auth/*`. There is **no refresh-token endpoint** in the current backend; see [§6](#6-token--session-handling) and [§8](#8-backend-gaps-optional-future-apis).

---

## 2. API checklist (all endpoints)

Every API the frontend may call is listed below. Use this as an integration checklist.

| # | Method | Path | Auth | Body/params | Purpose |
|---|--------|------|------|-------------|--------|
| 1 | GET | `/` | No | — | App root health (optional). |
| 2 | GET | `/api/v1/` | No | — | API handshake. |
| 3 | GET | `/api/v1/health` | No | — | Health check (e.g. user count). |
| 4 | GET | `/api/v1/auth/google` | No | — | **Redirect** to Google OAuth (login/signup). |
| 5 | GET | `/api/v1/auth/google/callback` | No | Query: `code`, `state`, `error` | Backend OAuth callback; **redirects** to frontend with `?code=...` or `?error=...`. |
| 6 | POST | `/api/v1/auth/register` | No | `RegisterBody` | Email/password signup; sends OTP email. |
| 7 | POST | `/api/v1/auth/verify-otp` | No | `VerifyOtpBody` | Verify email OTP; returns `user` + `accessToken` + sets refresh cookie. |
| 8 | POST | `/api/v1/auth/resend-otp` | No | `ResendOtpBody` | Resend verification OTP. |
| 9 | POST | `/api/v1/auth/login` | No | `LoginBody` | Email/password login; returns `user` + `accessToken` + sets refresh cookie. |
| 10 | POST | `/api/v1/auth/forgot-password` | No | `ForgotPasswordBody` | Request password-reset OTP email. |
| 11 | POST | `/api/v1/auth/reset-password` | No | `ResetPasswordBody` | Reset password with OTP. |
| 12 | POST | `/api/v1/auth/set-password` | **Yes** (Bearer) | `SetPasswordBody` | Set password for OAuth-only user (e.g. after “add password”). |
| 13 | GET | `/api/v1/auth/link/google` | **Yes** (Bearer) | — | **Redirect** to Google OAuth for **account linking**. |
| 14 | GET | `/api/v1/auth/link/google/callback` | No | Query: `code`, `state`, `error` | Backend callback for link flow; **redirects** to frontend with `?linked=google` or `?error=...`. |
| 15 | POST | `/api/v1/auth/exchange` | No | `OauthExchangeBody` | Exchange one-time OAuth `code` for `user` + `accessToken` + refresh cookie (after Google redirect). |
| 16 | GET | `/api/v1/users/:id` | Depends on middleware | Params: `id` (number) | Get user profile by id. |

**Body/query types (match backend validation):**

```ts
// Auth
RegisterBody       = { name: string; email: string; password: string }  // password min 8
VerifyOtpBody      = { email: string; otp: string }                       // otp 6 digits
ResendOtpBody      = { email: string }
LoginBody          = { email: string; password: string }                 // password min 8
ForgotPasswordBody = { email: string }
ResetPasswordBody  = { email: string; otp: string; newPassword: string }  // otp 6 digits, newPassword min 8
SetPasswordBody    = { password: string; confirmPassword: string }        // both min 8, must match
OauthExchangeBody  = { code: string }                                     // non-empty

// User
GetUserParams      = { id: number }  // path param, positive integer
```

**Redirect URLs (backend uses env):**

- After Google **login** success: `GOOGLE_LOGIN_REDIRECT_URL` or `FRONTEND_URL` with `?code=<one-time-code>`.
- After Google **login** error: `GOOGLE_LOGIN_ERROR_REDIRECT_URL` or `FRONTEND_URL` with `?error=<code>`.
- After **link** success: `GOOGLE_LINK_REDIRECT_URL` or fallback with `?linked=google`.
- After **link** error: `GOOGLE_LOGIN_ERROR_REDIRECT_URL` or `FRONTEND_URL` with `?error=...` (and optional `message`).

Frontend must **integrate all 16** (or 15 if you skip root `/`): handle redirects for 4, 5, 13, 14 and call the rest explicitly.

---

## 3. Auth flows & routes

### 3.1 Email/password signup (account creation)

1. **Register**  
   - **API**: `POST /api/v1/auth/register`  
   - **Body**: `{ name, email, password }`  
   - **Success**: 201, no `data`; backend sends verification OTP email.  
   - **Frontend**: Redirect to “Verify email” screen; show “Check your email for OTP”.

2. **Verify OTP**  
   - **API**: `POST /api/v1/auth/verify-otp`  
   - **Body**: `{ email, otp }`  
   - **Success**: 200, `data: { user, accessToken }`; refresh token set in cookie.  
   - **Frontend**: Store `accessToken`, store or use `user`, redirect to app home/dashboard.

3. **Resend OTP (optional)**  
   - **API**: `POST /api/v1/auth/resend-otp`  
   - **Body**: `{ email }`  
   - **Success**: 200.  
   - **Frontend**: Disable resend for cooldown (backend allows limited resends); handle `TOO_MANY_OTP_RESENDS`.

### 3.2 Email/password login

1. **Login**  
   - **API**: `POST /api/v1/auth/login`  
   - **Body**: `{ email, password }`  
   - **Success**: 200, `data: { user, accessToken }`; refresh token set in cookie.  
   - **Frontend**: Store `accessToken` and `user`; redirect to app.

### 3.3 Forgot / reset password

1. **Request reset**  
   - **API**: `POST /api/v1/auth/forgot-password`  
   - **Body**: `{ email }`  
   - **Success**: 200 (backend does not reveal whether email exists).  
   - **Frontend**: Show “If an account exists, we sent an email.”

2. **Reset with OTP**  
   - **API**: `POST /api/v1/auth/reset-password`  
   - **Body**: `{ email, otp, newPassword }`  
   - **Success**: 200.  
   - **Frontend**: Redirect to login; optionally auto-fill email.

### 3.4 Google login (OAuth)

1. **Start flow**  
   - **Frontend**: Navigate user to `GET /api/v1/auth/google` (same origin) or open in same tab. Backend sets `oauth_state` cookie and **redirects** to Google.

2. **Callback**  
   - Backend handles `GET /api/v1/auth/google/callback?code=...&state=...`.  
   - On success: redirect to frontend with `?code=<one-time-code>`.  
   - On error: redirect with `?error=...` (e.g. `OAUTH_STATE_MISMATCH`, `MISSING_CODE`, or Google’s `error`).

3. **Exchange code**  
   - **API**: `POST /api/v1/auth/exchange`  
   - **Body**: `{ code }` (the `code` from redirect URL).  
   - **Success**: 200, `data: { user, accessToken }`; refresh token set in cookie.  
   - **Frontend**: Remove `code` from URL (replaceState), store `accessToken` and `user`, redirect to app.  
   - **Edge**: Code is one-time and short-lived (~5 min); if user lands on page with expired `code`, show “Session expired, please sign in again” and redirect to login.

### 3.5 Set password (OAuth-only users)

- **When**: User signed up with Google (no password). “Add password” in settings.  
- **API**: `POST /api/v1/auth/set-password`  
- **Headers**: `Authorization: Bearer <accessToken>`  
- **Body**: `{ password, confirmPassword }` (must match, min 8).  
- **Success**: 200.  
- **Frontend**: Show form with password + confirm; only enable if user has no password (e.g. from `/me` or profile flags).

### 3.6 Account linking — Link Google (while logged in)

1. **Start link**  
   - **API**: `GET /api/v1/auth/link/google`  
   - **Headers**: `Authorization: Bearer <accessToken>`  
   - Backend sets CSRF cookie and **redirects** to Google with state containing user id and intent.

2. **Callback**  
   - Backend handles `GET /api/v1/auth/link/google/callback?code=...&state=...`.  
   - On success: redirect to frontend with `?linked=google`.  
   - On error: redirect with `?error=...` (e.g. `LINK_FAILED`, `OAUTH_STATE_MISMATCH`, `MISSING_CODE`) and optional `?message=...`.

3. **Frontend**  
   - On load, if `linked=google` in URL: show “Google account linked”, clear query, refresh user/settings.  
   - If `error=LINK_FAILED` (and optionally `message`): show error (e.g. “This Google account is already linked to another user” or “Email must match”).

### 3.7 Get user profile

- **API**: `GET /api/v1/users/:id`  
- **Params**: `id` — positive integer.  
- **Auth**: Depends on backend (if `requireAuth` or similar is applied, send `Authorization: Bearer <accessToken>`).  
- **Success**: 200, `data` = user object (id, email, firstName, lastName, createdAt, updatedAt).  
- **Frontend**: Use for profile page or “current user” when you have `user.id`.

---

## 4. Edge cases & error handling

### 4.1 Backend error shape

- **status**: HTTP status code.  
- **message**: Resolved or key; may be i18n.  
- **data.extraFields** or top-level **extraFields**: can include:
  - `error`: string (auth error code, see below).
  - `existingProviders`: string[] (e.g. `['google']`) when account exists with another sign-in method.

### 4.2 Auth error codes (handle these explicitly)

| Code | When | Frontend action |
|------|------|------------------|
| `EMAIL_TAKEN` | Register with email that already has password | Show “Email already registered”, offer login or forgot password. |
| `ACCOUNT_EXISTS_DIFFERENT_PROVIDER` | Register with email that exists via OAuth only | Show “Sign in with Google (or other)” using `existingProviders`; offer “Link email/password” or “Set password” after OAuth login. |
| `NO_PASSWORD_SET` | Login with email/password but account is OAuth-only | Show “Sign in with Google” (or providers from `existingProviders`); offer “Set password” after OAuth login. |
| `INVALID_CREDENTIALS` | Wrong email or password | Generic “Invalid email or password”. |
| `EMAIL_NOT_VERIFIED` | Login before verifying email | Redirect to verify-OTP screen; pre-fill email; offer resend OTP. |
| `INVALID_OTP` | Wrong or already-used OTP | “Invalid code”; allow retry; show attempt limit message if needed. |
| `OTP_EXPIRED` | OTP expired or already used | “Code expired”; offer resend OTP. |
| `TOO_MANY_ATTEMPTS` | Too many wrong OTP attempts | “Too many attempts. Request a new code.” (resend). |
| `TOO_MANY_OTP_RESENDS` | Resend limit hit | “Too many emails. Try again later.” (show cooldown). |
| `USER_ALREADY_VERIFIED` | Resend OTP for already verified user | Redirect to login. |
| `TOKEN_INVALID` / `TOKEN_EXPIRED` | Exchange with invalid/expired code | “Session expired. Please sign in again.” Redirect to login. |
| `PROVIDER_ALREADY_LINKED` | Link Google when already linked | “Google is already linked to this account.” |
| `VALIDATION_ERROR` | e.g. set password when password already set, or link email mismatch | Show server `message` or generic “Invalid request”. |
| `SAME_PASSWORD` | Set password when user already has a password | “You already have a password.” Hide or disable “Add password”. |

### 4.3 OAuth redirect query params (frontend must read on load)

- **Success (login)**: `?code=...` → call `POST /api/v1/auth/exchange` with `{ code }`.  
- **Error (login)**: `?error=...` — map to message (e.g. `OAUTH_STATE_MISMATCH`, `MISSING_CODE`, or Google’s `access_denied`).  
- **Success (link)**: `?linked=google` → show success, refresh user.  
- **Error (link)**: `?error=LINK_FAILED` and optional `?message=...`.

### 4.4 Network and 401/403

- **401 Unauthorized**: Access token missing or invalid; redirect to login and clear stored token.  
- **403 Forbidden**: No permission; show “Access denied”.  
- **CORS**: Use same-origin or configured origin; auth cookies are same-site.  
- **Credentials**: For endpoints that set/use cookies (`/api/v1/auth/*`), use `credentials: 'include'` (fetch) or equivalent in your HTTP client.

---

## 5. Account linking

### 5.1 What the backend supports

- **Link Google** to an existing account (user must be logged in):  
  - `GET /api/v1/auth/link/google` (with Bearer token) → redirect → `GET /api/v1/auth/link/google/callback` → redirect to frontend with `?linked=google` or `?error=...`.  
- **Backend rules**:  
  - Google email must match the logged-in user’s email.  
  - Google account must not already be linked to another user.  
  - Same Google account cannot be linked twice to the same user.

### 5.2 Frontend responsibilities

- **Settings / Security**:  
  - Show “Linked accounts” (e.g. Email+password, Google).  
  - “Link Google” button → navigate to `GET /api/v1/auth/link/google` (with auth).  
  - On return: read `linked=google` or `error` + `message`; show success or error; refresh user.  
- **After OAuth-only login**:  
  - If backend exposes “no password” (e.g. from `/me` or profile): show “Add password” and use `POST /api/v1/auth/set-password`.  
- **Register with existing OAuth email**:  
  - On `ACCOUNT_EXISTS_DIFFERENT_PROVIDER`: offer “Sign in with Google” and optionally “Set password” after login.

### 5.3 Unlinking

- **Current backend**: No “unlink” API found. Unlinking (e.g. “Remove Google”) would require a new backend endpoint and rules (e.g. cannot unlink last auth method — backend has `CANNOT_UNLINK_LAST_METHOD`).  
- **Frontend**: Do not show “Unlink Google” until backend provides an unlink API and you handle `CANNOT_UNLINK_LAST_METHOD`.

---

## 6. Token & session handling

- **Access token**:  
  - Returned in JSON for login, verify-otp, exchange.  
  - Store in memory (preferred) or localStorage.  
  - Send as `Authorization: Bearer <accessToken>` for protected routes (`/api/v1/auth/set-password`, `/api/v1/auth/link/google`, and any route that uses `requireAuth`).  
- **Refresh token**:  
  - Stored in httpOnly cookie by backend; not readable by JS.  
  - **There is no refresh endpoint** in the current backend. When the access token expires, the frontend must treat the user as logged out (redirect to login) unless the backend adds e.g. `POST /api/v1/auth/refresh` that returns a new access token using the cookie.  
- **Logout**:  
  - **No backend logout/revoke** in the current API. Frontend “logout” = clear access token and redirect to login. Optionally call a future “revoke refresh token” endpoint if added.

---

## 7. Recommended frontend routes

Map backend APIs to these UI routes so nothing is missed:

| Frontend route | APIs / behavior |
|----------------|------------------|
| `/` or `/home` | Optional: `GET /api/v1/` or `/health`. |
| `/login` | `POST /api/v1/auth/login`; link “Forgot password”, “Sign up”, “Sign in with Google” → `/api/v1/auth/google`. |
| `/register` | `POST /api/v1/auth/register` → redirect to verify. |
| `/verify-email` | `POST /api/v1/auth/verify-otp`, `POST /api/v1/auth/resend-otp`; read `email` from state or query. |
| `/forgot-password` | `POST /api/v1/auth/forgot-password`. |
| `/reset-password` | Read `email` from state/query; `POST /api/v1/auth/reset-password`. |
| `/oauth/callback` or same as login | On load: if `?code=...` → `POST /api/v1/auth/exchange`; if `?error=...` → show error. |
| `/settings` or `/account` | `GET /api/v1/users/:id` (current user); “Add password” → set-password form → `POST /api/v1/auth/set-password`. |
| `/settings/linked-accounts` or same | “Link Google” → `GET /api/v1/auth/link/google`. Return URL: if `?linked=google` show success; if `?error=...` show error. |
| `/profile/:id` | `GET /api/v1/users/:id`. |

---

## 8. Backend gaps (optional future APIs)

These are **not** required for the current integration but would improve UX if added:

- **POST /api/v1/auth/refresh**  
  - Uses refresh token cookie; returns new `accessToken` (and optionally new refresh token).  
  - Frontend would call this when access token expires or before it expires (e.g. 401), then retry the request.

- **POST /api/v1/auth/logout** (or **/revoke**)  
  - Revokes current refresh token so it cannot be reused.  
  - Frontend would call on “Log out” then clear token and redirect.

- **GET /api/v1/auth/me** (or **/session**)  
  - Returns current user from JWT or refresh token.  
  - Frontend could use this on app load instead of relying only on stored user.

- **Unlink provider**  
  - e.g. `DELETE /api/v1/auth/link/google` with rule “cannot unlink last method”.  
  - Frontend would then show “Remove Google” when safe.

---

## Summary

- **Integrate all 16 endpoints** (or 15 excluding root `/`): health, auth (Google redirect + callback, register, verify-otp, resend-otp, login, forgot-password, reset-password, set-password, link/google, link/google/callback, exchange), and GET user by id.  
- **Handle every listed edge case**: all auth error codes, OAuth redirect params, resend/attempt limits, and account-linking success/error.  
- **Account linking**: Implement “Link Google” via `GET /api/v1/auth/link/google` and handle return URL (`linked=google` / `error`).  
- **No API left out**: This plan explicitly lists every route the backend exposes for frontend use.  
- **Tokens**: Access token in memory/localStorage and sent as Bearer; refresh token in cookie only; no refresh or logout API yet — logout is client-side only.
