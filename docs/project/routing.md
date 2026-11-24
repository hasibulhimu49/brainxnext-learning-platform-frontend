# Routing

React Router v7 in declarative mode; the whole tree is in `src/routes/AppRoutes.tsx`.

- `Home` is in the main bundle; every other page is `React.lazy` with a shared `<Suspense>` fallback.
- Layouts: `PublicLayout` (navbar + footer: `footer="full" | "simple" | false`, `nav="public" | "app"`), `AuthLayout` (single-card screens), `AdminLayout` (sidebar + `<Outlet />`).
- `AppErrorBoundary` (in `App.tsx`) wraps every route and shows the 500 page on a render crash; it resets when the path changes.
- `ScrollToTop` resets scroll on navigation and scrolls to `#hash` targets.
- Unknown paths render `NotFound`; unknown course ids (detail, player, checkout) redirect to `/404`.

## Guards (`src/routes/guards.tsx`)

| Guard | Routes | Behaviour |
| --- | --- | --- |
| `RequireAuth` | `/dashboard`, `/settings/*`, `/learn/*`, `/certificate`, `/checkout/:courseId`, `/checkout/plan/:plan` | no session → `/login?next=<path+search>` (plus `&reason=expired` after a 401) |
| `RequireRole role="admin"` | `/admin`, `/admin/:section`, `/admin/courses/new` | guest → login; signed-in non-admin → 403 page |
| `GuestOnly` | `/login`, `/register`, `/verify-otp`, `/forgot-password` | signed-in → `?next=` or `/admin` / `/dashboard` by role. Checked when the screen opens, so login/OTP can show their own success state |

Open: marketing pages, catalog, course detail, `/reset-password` (token-based), `/support`, `/thank-you`, `/403`.

Helpers in `src/routes/redirects.ts`: `safeNext()` (only internal paths starting with `/`, never `//`), `homeFor(role)`, `loginPath(next, expired)`.

## Dynamic routes

- `/courses/:courseId`, `/settings/:tab`, `/admin/:section` (unknown values redirect).
- `/learn/:courseId/:lessonId?` — the player. **Lesson ids** are 1-based `"<module>-<lesson>"` positions (`"3-3"` = module 3, class 3 = "Class 11"), defined in `src/lib/lessons.ts`. Without a lesson id (or with an unknown one) the player redirects to the last lesson from progress, else the first.
- `/learn` → the most recently active enrolment (`/learn/:courseId/:lastLessonId`), or `/courses` when there is none.
- `/checkout/:courseId` — single-course checkout. `/checkout` → `/pricing`. Free courses redirect to their detail page.
- `/checkout/plan/:plan?cycle=monthly|yearly` — Pro checkout (the cycle toggle keeps `?cycle` in the URL); `teams` → a "talk to us" card linking `/contact?topic=teams`; anything else → `/pricing`; already Pro → "You're already on Pro".
- `/orders/:orderId` — receipt (signed in; someone else's or unknown → "Order not found"). Every successful course or plan checkout lands here.
- `/certificates` (list) and `/certificates/:certId` (yours; `?print=1` opens the print dialog; not yours → "Certificate not found"). `/certificate` → `/certificates`.
- `/verify/:certId?` — public certificate verification (PublicLayout, no auth). Share / LinkedIn links point to `<origin>/verify/<id>`.
- `/learn/:courseId/project` — project submission (enrolled + Pro or bought the course; otherwise an upgrade card).
- `/dashboard/courses` (tabs In progress / Completed / All) and `/dashboard/reviews` (my submissions + mentor feedback).
- `/support?handbook=<slug>` → `/thank-you?amount=&handbook=` carries the handbook through the donation so the thank-you page can download it.
- `/403` — the Forbidden page.

The public navbar has one stable link set (Home · Courses · Notes · Pricing · About · Help · Contact) on every page and in the mobile menu (Escape closes it and returns focus to the toggle); the signed-in set is in `Navbar.tsx`. The public navbar shows Login / Sign up only when signed out; signed-in users get "Dashboard" (admins: "Admin") and their avatar.
