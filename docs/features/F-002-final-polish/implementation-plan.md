# F-002 — Implementation plan

> **Note (F-009):** files were reorganised by area in F-009 (e.g. `pages/marketing/Checkout` → `pages/checkout/`, `dashboard/*` → `learner/`). Paths below are as they were when this plan was written; see `CLAUDE.md` §9 for the current layout.

**Status:** Done — approved by Mohammad Hasibul Hasan 2026-11-24; phases 1–4 implemented 2026-11-25

> Do not start coding until this plan is approved. Each phase ends green (`typecheck`, `lint`, `test`, `test:e2e`) and can be approved separately.

## 1. Requirement

Close the gaps listed in `feature.md`, in four phases ordered by risk. New screens reuse the existing layouts, components and tokens so they look like the Figma screens: `HeroBand`, `.card`, `AuthCard`, `QueryStatus`, the admin `DataTable` / `KpiStrip`, `PricingCard`, `Toggle`, and the shadcn primitives.

## 2. Phases

### Phase 1 — Foundation (A1–A8, B1–B2, C1, D10, E6)
Makes every later screen possible and fixes the security holes.
- **Guards:** `src/routes/guards.tsx` with `RequireAuth` (redirects to `/login?next=`), `RequireRole("admin")` (shows the 403 page) and `GuestOnly` (keeps signed-in users off `/login` and `/register`).
- **Login:** honour `next`, send admins to `/admin`, and show a "session expired" notice when `/login?reason=expired`.
- **Session-aware Navbar and Sidebar;** remove the real-name fallbacks; logout clears all queries.
- **Course-scoped routes:**
  - `/learn/:courseId/:lessonId?`; `/learn` redirects to the last course
  - `/checkout/:courseId`
  - CourseDetail, Dashboard and Checkout pass the id
- **Enrolment and progress in the mock** (`POST /courses/:id/enroll`, `GET|PUT /me/progress/:courseId`), owned by TanStack Query.
- **Mock security fixes:** reset token, verified-only login, OTP bound to the pending email, role checks on admin endpoints.
- **Errors:** an error boundary with a 500 page, and a 403 page.
- **Shared UI primitives:** `ConfirmDialog` and `Toast` (shadcn `dialog` + `sonner`; both are new dependencies, justified by D9).

### Phase 2 — Learner and money screens (B3–B10, C2–C10, E9)
- Player: locked lessons + paywall card, prev/next, course-complete screen, real resource downloads.
- Certificates list `/certificates`, certificate `/certificates/:id`, public `/verify/:id`.
- Project submission `/learn/:courseId/project` + "My reviews" `/dashboard/reviews` with mentor feedback.
- Notifications dropdown (bell) with unread state.
- Checkout: plan checkout `/checkout/plan/:plan`, wallet-pending + failed/retry states, already-owned state, receipt `/orders/:orderId`.
- Billing tab:
  - real order history and invoice detail
  - manage subscription (change plan or cycle, cancel → "active until…")
  - refund request dialog
- Support: donation step (method + processing) → thank-you with validated amount → real file download.
- Dashboard empty states; `/dashboard/courses` list.
- Settings: delete-account dialog, email change with OTP, saved notification prefs, confirm-password field.

### Phase 3 — Admin operations (D1–D9)
- Add `id` to every admin row type; tables get row actions, pagination, sorting and filters.
- `/admin/courses/:id` (stats, lessons, unpublish/delete) and `/admin/courses/:id/edit` (reuses the `AdminNewCourse` form in edit mode, with an unsaved-changes guard).
- `/admin/students/:id`, `/admin/payments/:id` (refund + CSV export).
- `/admin/submissions` + `/admin/submissions/:id` (review, feedback, approve / request changes); sidebar badge from real count.
- `/admin/promos` (create, edit, expire); checkout validates against it.
- `/admin/inbox` + `/admin/inbox/:id` for contact tickets.
- Review reply/hide dialog; handbook create / upload-version dialog.

### Phase 4 — Public site and polish (E1–E8)
- `/privacy`, `/terms`, `/refunds`, `/help` on a shared `LegalLayout` (HeroBand + prose card).
- `/contact?topic=` preselect; footer, navbar and register links fixed; stable nav set.
- `usePageTitle` hook for per-route titles; meta description / OG tags in `index.html`.
- Accessibility: `:focus-visible` ring, `prefers-reduced-motion`, skip link, mobile menu Escape and focus trap.
- Local handbook logos; real social URLs once provided.

## 3. Backend API dependencies

No backend docs exist. Every new endpoint is added to `src/api/mock` as a **provisional placeholder** with types in `src/types`, and listed in `docs/project/api-guidelines.md`, ready to be replaced when the real docs arrive.

## 4. State ownership

| State | Owner |
| --- | --- |
| Enrolments, progress, orders, subscription, certificates, submissions, notifications, admin data | TanStack Query (new keys in `queries/keys.ts`) |
| Session + `next` redirect | `authStore` (unchanged owner) / URL query param |
| Toasts | `sonner` (its own store) |
| Dialog open/close, filters, pagination | component state |

## 5. Routing (new)

`/learn/:courseId/:lessonId?`, `/learn/:courseId/project`, `/checkout/:courseId`, `/checkout/plan/:plan`, `/orders/:orderId`, `/certificates`, `/certificates/:id`, `/verify/:id`, `/dashboard/courses`, `/dashboard/reviews`, `/admin/courses/:id`, `/admin/courses/:id/edit`, `/admin/students/:id`, `/admin/payments/:id`, `/admin/submissions(/:id)`, `/admin/promos`, `/admin/inbox(/:id)`, `/privacy`, `/terms`, `/refunds`, `/help`, `/403`. The old `/learn`, `/checkout` and `/certificate` redirect to the new ones.

## 6. Validation

New Zod schemas: project submission, review feedback, refund request, promo code, delete-account confirmation, email change, donation amount.

## 7. Testing

See `testing.md`. Every phase adds unit tests for its schemas and pages and extends e2e. Guards, enrol → learn → complete → certificate, plan checkout and refund, and an admin refund all get new e2e specs. `smoke.spec.ts` covers every new route.

## 8. Size estimate

| Phase | New screens / dialogs | Rough size |
| --- | --- | --- |
| 1 | 3 (403, 500, guard redirects) + routing rework | M |
| 2 | ~14 | L |
| 3 | ~10 | L |
| 4 | ~5 + polish | S |

Recommended order: 1 → 2 → 3 → 4. Phase 1 is a prerequisite for the rest.
