# Routing

React Router v7 in declarative mode (`<BrowserRouter>`); the whole tree is in `src/routes/AppRoutes.tsx`.

- `Home` and `PublicLayout` are in the main bundle; every other page (and `AdminLayout`) is `React.lazy` behind one `<Suspense>` fallback (`min-h-screen`, so the footer doesn't jump). Lazy imports are grouped in the same order as the routes.
- Layouts: `PublicLayout` (navbar + footer, `footer="full" | "simple" | false`; the navbar follows the sign-in state), `AuthLayout` (single-card screens), `AdminLayout` (sidebar + `<Outlet />`).
- `AppErrorBoundary` (in `App.tsx`) wraps every route and shows the 500 page on a render crash; it resets when the path changes.
- `ScrollToTop` resets scroll on navigation and scrolls to `#hash` targets.
- Unknown paths render `NotFound`; unknown course ids (detail, player, checkout, quiz, project) redirect to `/404`; an unknown path id goes to `/paths`; `/admin/<unknown>` shows a not-found panel inside the admin shell.

## Guards (`src/routes/guards.tsx`)

| Guard | Routes | Behaviour |
| --- | --- | --- |
| `RequireAuth` | `/dashboard`, `/dashboard/courses`, `/dashboard/reviews`, `/certificates`, `/certificates/:certId`, `/settings/:tab?`, `/learn`, `/learn/:courseId/project`, `/learn/:courseId/quiz/:module`, `/orders/:orderId`, `/checkout/:courseId`, `/checkout/cart`, `/checkout/plan/:plan` | no session → `/login?next=<path+search>` (plus `&reason=expired` after a 401) |
| `RequireRole role="admin"` | `/admin`, `/admin/*`, `/admin/courses/new`, `/admin/courses/:courseId/edit` | guest → login; signed-in non-admin → 403 page. Skipped while `OPEN_ADMIN` is on (mock API demo mode) |
| `GuestOnly` | `/login`, `/register`, `/verify-otp`, `/forgot-password` | signed-in → `?next=` or `/admin` / `/dashboard` by role. Checked when the screen opens, so login/OTP can show their own success state |

Open to everyone: marketing pages, catalog, course detail, `/notes`, `/paths`, `/wishlist`, `/cart`, `/verify/:certId?`, legal pages, the player `/learn/:courseId/:lessonId?` (guests can watch free preview lessons; the player gates every other lesson itself), `/reset-password` (token-based), `/support`, `/thank-you`, `/403`.

Helpers in `src/routes/redirects.ts`: `safeNext()` (only internal paths starting with `/`, never `//`), `homeFor(role)`, `loginPath(next, expired)`.

## Dynamic routes

- `/courses/:courseId`, `/settings/:tab` (unknown tab → `/settings`), `/admin/:section`.
- `/learn/:courseId/:lessonId?` — the player. **Lesson ids** are 1-based `"<module>-<lesson>"` positions (`"3-3"` = third class of module 3), defined in `src/lib/lessons.ts`; each course has its own curriculum. Without a lesson id (or with an unknown one) the player opens the last lesson from progress, else the first (guests: the first preview lesson). Locked lessons show a paywall / sign-in card.
- `/learn` → the most recently active enrolment, or `/courses` when there is none.
- `/learn/:courseId/quiz/:module` — module quiz (1-based module, enrolled only).
- `/learn/:courseId/project` — project submission (enrolled + Pro or bought the course; otherwise an upgrade card).
- `/checkout/:courseId` — single-course checkout. Free courses redirect to their detail page; Pro members see "Included in your Pro plan". `/checkout/cart` — cart checkout (declared before `:courseId`). `/checkout` → `/pricing`.
- `/checkout/plan/:plan?cycle=monthly|yearly` — Pro checkout (the cycle toggle keeps `?cycle` in the URL); `teams` → a "talk to us" card linking `/contact?topic=teams`; anything else → `/pricing`; already Pro → "You're already on Pro".
- `/orders/:orderId` — receipt (someone else's or unknown → "Order not found"). Every successful checkout lands here.
- `/certificates` (list) and `/certificates/:certId` (yours; `?print=1` opens the print dialog). `/certificate` → `/certificates`.
- `/verify/:certId?` — public certificate verification. Share / LinkedIn links point to `<origin>/verify/<id>`.
- `/paths/:pathId` — one career roadmap.
- `/dashboard/courses` (tabs In progress / Completed / All) and `/dashboard/reviews` (my submissions + mentor feedback).
- `/support?handbook=<slug>` → `/thank-you?amount=&handbook=` carries the handbook through the donation so the thank-you page can download it.

## Navbar

One stable link set on every public page and in the mobile menu: signed out — Home · Courses · Roadmaps · Notes · Pricing · Help · Contact, then Log in / Sign up (About is in the footer); signed in — Dashboard (admins: Admin) replaces Home, plus notifications, avatar and log out. The mobile menu traps focus; Escape closes it and returns focus to the toggle. See `src/components/common/Navbar.tsx`.
