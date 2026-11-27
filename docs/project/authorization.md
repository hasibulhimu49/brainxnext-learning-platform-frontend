# Authorization

**The backend is the authority.** The frontend only hides or redirects for a better experience; it never decides what a user may do. Every protected endpoint must check the token and role on the server.

## Roles

From `src/types/auth.ts`:

| Role | Can use |
| --- | --- |
| guest (no session) | marketing pages, catalog, course details, notes, career roadmaps, wishlist, cart, certificate verification, free preview lessons in the player, auth screens, `/reset-password`, `/support` |
| `student` | everything above + `/dashboard/*`, `/learn/*`, `/settings/*`, `/certificates/*`, `/orders/:id`, `/checkout/*` |
| `admin` | everything above + `/admin/*`, `/admin/courses/new`, `/admin/courses/:id/edit` |

The role comes from the session user in `authStore` (`useSessionUser()?.role`). Do not read it from anywhere else and do not trust it for security.

## Route guards (implemented)

`src/routes/guards.tsx`, used in `AppRoutes.tsx` (route list in `routing.md`):

- `RequireAuth` — no session → `/login?next=<path+search>` (plus `reason=expired` after a 401).
- `RequireRole role="admin"` — guest → login; signed-in user without the role → the **403 page** ("This area is for admins").
- `GuestOnly` — signed-in users skip `/login`, `/register`, `/verify-otp`, `/forgot-password` and go to `?next=` or their home.

After login the user returns to `next` if it is an internal path (`safeNext`), otherwise `/admin` (admins) or `/dashboard` (students). Admin-only UI ("Admin" link in the navbar) uses the same role check.

**Demo mode:** while the mock API is on, `OPEN_ADMIN` (`src/api/config.ts`) lets everyone open `/admin`, and the mock's `requireAdmin` lets every admin request through. It is always off when `VITE_USE_MOCK_API=false`; `VITE_OPEN_ADMIN=false` turns it off earlier.

## Mock API checks

- `/me/*`, `POST /courses/:id/enroll`, `POST /checkout/orders` (except donations) → `401 UNAUTHORIZED` without a token.
- `/admin/*` → `401` without a token, `403 FORBIDDEN` for non-admins (`requireAdmin` in `src/api/mock/routes/shared.ts`), unless `OPEN_ADMIN` is on.
- `PUT /me/progress/:courseId`, quizzes, reviews, submissions → `403 NOT_ENROLLED` when the user isn't enrolled.

## Course access (entitlements)

- A user owns a course when an **enrolment** exists: free courses via `POST /courses/:id/enroll`, paid courses after a paid `POST /checkout/orders` (paid enrol without Pro → `402 PAYMENT_REQUIRED`).
- In the player, guests see only the `preview` lessons (sign-in card on the rest). Signed-in non-owners of a paid course also see only the previews; the rest are behind a paywall card linking to `/checkout/:courseId`. Free courses are watchable before enrolling; enrolling saves progress.
- **Pro** unlocks every course (enrolment `source: "pro"`), mentor review and certificates. Pro members can't buy single courses or carts (`409 ALREADY_SUBSCRIBED`; checkout shows "Included in your Pro plan"). Free accounts get free courses; buying a course includes its certificate and review.

Wait for the backend documentation on roles, entitlements and error codes before adding new ones.
