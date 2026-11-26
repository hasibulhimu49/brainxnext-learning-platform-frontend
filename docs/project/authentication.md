# Authentication

Flow (all through `src/queries/auth.ts` → `authService` → API):

1. **Register** `POST /auth/register` → stores `pendingEmail`.
2. **Verify OTP** `POST /auth/verify-otp` `{ email, code }` → `{ token, user }` → `setSession`. Only an email with a pending (unverified) sign-up can be verified (`NO_PENDING_SIGNUP` otherwise). `/verify-otp` without a `pendingEmail` redirects to `/register`.
3. **Log in** `POST /auth/login` → `{ token, user }` → `setSession(session, remember)`, then navigate immediately to `?next=` (internal paths only, see `safeNext`) or the role home: `/admin` for admins, `/dashboard` for students.
   - Unverified account → `403 EMAIL_NOT_VERIFIED`; `useLogin` stores the email as `pendingEmail` and the page links to `/verify-otp`.
   - `/login?next=…` shows why the user is there ("Log in to finish your purchase…"); `/login?reason=expired` shows "Your session expired — please log in again."
4. **Forgot / reset password** — token based:
   - `POST /auth/forgot-password` `{ email }` always succeeds (no email probing). For an existing account the mock stores a single-use reset token (30 min) and — **demo only** — returns `devResetLink` so "Check your inbox" can show "Open the reset link (demo)". A real backend emails the link instead.
   - `/reset-password?token=…` → `POST /auth/reset-password` `{ token, password }`. A missing, used or expired token shows "This reset link isn't valid" with "Request a new link".
5. **Log out** `useLogout()` navigates to `/`; once there, `useLogoutListener` (mounted in `App.tsx`) clears the session and `pendingEmail`, calls `queryClient.clear()` (user and admin data) and toasts "You've been logged out". Clearing happens after the navigation commits so the current page's guard doesn't bounce to `/login?next=`.

The token is attached as `Authorization: Bearer …` by the request interceptor. A `401` response calls `expireSession()`: the session is dropped and, if one existed, `sessionExpired` is set so `RequireAuth` redirects to `/login?…&reason=expired`.

**Remember me:** ticked (default) → the session is persisted in `localStorage`; unticked → `sessionStorage` (this tab only). See `state-management.md`.

Session state lives only in `authStore` (key `bxn-auth`). Profile details are fetched with `useProfile()`, not kept in the store.

Mock accounts: `hasibulx26@gmail.com` / `12345678` (student), `admin@brainxnext.com` / `admin12345` (admin). OTP `000000` is rejected; any other 6 digits verify.

Route guards are described in `routing.md` and `authorization.md`.
