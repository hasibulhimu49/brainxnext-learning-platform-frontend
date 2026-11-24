# Authorization

**The backend is the authority.** The frontend only hides or redirects for a better experience; it never decides what a user may do. Every protected endpoint must check the token and role on the server.

## Roles

From `src/types/auth.ts`:

| Role | Can use |
| --- | --- |
| guest (no session) | marketing pages, catalog, course details, notes, auth screens, `/reset-password`, `/support` |
| `student` | everything above + `/dashboard`, `/learn/*`, `/settings/*`, `/certificate`, `/checkout/*` |
| `admin` | everything above + `/admin/*`, `/admin/courses/new` |

The role comes from the session user in `authStore` (`useSessionUser()?.role`). Do not read it from anywhere else and do not trust it for security.

## Route guards (implemented)

`src/routes/guards.tsx`, used in `AppRoutes.tsx`:

- `RequireAuth` — no session → `/login?next=<path+search>` (plus `reason=expired` after a 401).
- `RequireRole role="admin"` — guest → login; signed-in user without the role → the **403 page** ("This area is for admins").
- `GuestOnly` — signed-in users skip `/login`, `/register`, `/verify-otp`, `/forgot-password` and go to `?next=` or their home.

After login the user returns to `next` if it is an internal path (`safeNext`), otherwise `/admin` (admins) or `/dashboard` (students). Admin-only UI ("Admin" button in the public navbar) uses the same role check.

## Mock API checks

- `/me/*`, `POST /courses/:id/enroll`, `POST /checkout/orders` → `401 UNAUTHORIZED` without a token.
- `/admin/*` → `401` without a token, `403 FORBIDDEN` for non-admins (`requireAdmin` in `src/api/mock/routes/shared.ts`).
- `PUT /me/progress/:courseId` → `403 NOT_ENROLLED` when the user isn't enrolled.

## Course access (entitlements)

- A user owns a course when an **enrolment** exists: free courses via `POST /courses/:id/enroll`, paid courses after a successful `POST /checkout/orders` (paid enrol → `402 PAYMENT_REQUIRED`).
- In the player, non-owners of a paid course see only the `preview` lessons; the rest are locked behind a paywall card linking to `/checkout/:courseId`. Free courses are watchable before enrolling; enrolling saves progress.
- **Pro rule (decided; enforced from F-002 Phase 2):** Pro unlocks all courses, mentor review and certificates. Free accounts get free courses only.

Wait for the backend documentation on roles, entitlements and error codes before adding new ones.
