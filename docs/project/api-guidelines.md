# API guidelines

## The response envelope

Every endpoint returns:

```json
{ "success": true, "data": { }, "message": "optional" }
{ "success": false, "error": { "code": "EMAIL_TAKEN", "message": "Human readable", "details": [] } }
```

The client always checks `success` before reading `data`. A failure, a non-envelope body, or a network error becomes an `ApiError` with `code`, `message` and `status`.

## Adding an endpoint

1. Add/extend the type in `src/types`.
2. Add a function to the right `src/services/*Service.ts`:
   ```ts
   export const courseService = {
     detail: (id: string) => api.get<CourseDetail>(`/courses/${encodeURIComponent(id)}`),
   };
   ```
   Pass a Zod schema as the last argument when the payload must be validated at runtime. `api` has `get`, `post`, `put`, `patch`, `delete`.
3. Wrap it in a hook in `src/queries` (query key in `keys.ts`; mutations invalidate the keys they make stale).
4. Add a mock handler in the matching module under `src/api/mock/routes/` that returns `ok(data)` or `fail(status, code, message)`.

## Mock layout

`src/api/mock/routes/` — one module per area so features can be worked on in parallel, combined in `index.ts`:

| Module | Endpoints |
| --- | --- |
| `auth.ts` | `/auth/*` |
| `catalog.ts` | `/courses`, `/courses/:id` |
| `learner.ts` | `/me/*`, `/courses/:id/enroll` |
| `checkout.ts` | `/checkout/*` |
| `content.ts` | `/handbooks`, `/notes/highlights`, `/certificates/:id`, `/contact` |
| `admin.ts` | `/admin/*` |
| `shared.ts` | `invalid`, `unauthorized`, `forbidden`, `requireUser`, `requireAdmin` |

Mock data lives in `src/api/mock/db/` (`users.ts` + reset tokens, `learning.ts` enrolments/progress in localStorage `bxn-mock-learning`, `dashboard.ts`, `courses.ts`, `admin.ts`). Tests reset them in `src/test/setup.ts`.

## Rules

- Never import `axios` or call `fetch` outside `src/api` / `src/services` (ESLint error).
- Branch on `error.code` (see `API_ERROR_CODES`), never on message text.
- Show `errorMessage(error)` to users; it falls back to a generic message for non-API errors.
- `401` clears the session automatically and marks it expired (interceptor in `client.ts`).

## Error codes

`NETWORK_ERROR`, `INVALID_ENVELOPE`, `INVALID_RESPONSE`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `USER_NOT_FOUND`, `WRONG_PASSWORD`, `EMAIL_TAKEN`, `INVALID_CODE`, `INVALID_PROMO`, `EMAIL_NOT_VERIFIED`, `NO_PENDING_SIGNUP`, `INVALID_RESET_TOKEN`, `PAYMENT_REQUIRED`, `ALREADY_ENROLLED`, `NOT_ENROLLED`.

## Current endpoints (mock)

`POST /auth/login|register|verify-otp|resend-otp|forgot-password|reset-password` · `GET /courses`, `GET /courses/:id`, `GET /handbooks`, `GET /notes/highlights` · `GET /me/dashboard`, `GET|PATCH /me/profile`, `POST /me/password` · `GET /certificates/:id` · `POST /checkout/promo`, `POST /checkout/orders` · `POST /contact` · `GET /admin/overview` + the admin endpoints listed under "Admin (Phase 3)".

### Provisional (added by F-002 Phase 1 — no backend docs yet)

| Endpoint | Auth | Request | Response / errors |
| --- | --- | --- | --- |
| `POST /courses/:id/enroll` | user | — | `Enrollment` (201 new, 200 existing); paid course → `402 PAYMENT_REQUIRED` |
| `GET /me/enrollments` | user | — | `Enrollment[]`, newest activity first |
| `GET /me/progress/:courseId` | user | — | `CourseProgress { courseId, enrolled, completed: lessonId[], lastLessonId }` |
| `PUT /me/progress/:courseId` | user, enrolled | `{ lessonId, completed? }` | `CourseProgress`; not enrolled → `403 NOT_ENROLLED`; unknown lesson → `422` |
| `GET /me/dashboard` | user (now required) | — | built from the user's enrolments; new users get empty lists and `continueLearning: null` |
| `POST /checkout/orders` | user (now required) | `{ courseId, payment, promoCode? }` | `Order { orderId, courseId, total }` (whole taka); enrols the buyer; owned → `409 ALREADY_ENROLLED` |
| `POST /auth/forgot-password` | — | `{ email }` | `{ sentTo, devResetLink? }` — `devResetLink` is **mock/demo only** |
| `POST /auth/reset-password` | — | `{ token, password }` (was `{ email, password }`) | `{ reset: true }`; bad token → `400 INVALID_RESET_TOKEN` |

Lesson ids are `"<module>-<lesson>"` (1-based, `src/lib/lessons.ts`). When the backend docs arrive they replace all of the above.

### Admin (Phase 3) — provisional, no backend docs yet

Every endpoint below requires an admin token: no session → `401 UNAUTHORIZED`, student → `403 FORBIDDEN` (`requireAdmin`). Lists return `{ stats, rows }` and are paged client-side. Types: `src/types/admin.ts` (+ `OrderRecord`, `Submission`, `Promo`, `Ticket` from `src/types/commerce.ts`). `GET /admin/sections/:section` was **removed** — each section has its own endpoint now.

| Endpoint | Request | Response / errors |
| --- | --- | --- |
| `GET /admin/counts` | — | `{ pendingSubmissions, openTickets, unansweredReviews }` (sidebar badges) |
| `GET /admin/courses` · `POST /admin/courses` | `{ course: CourseDraftValues, status }` | list · `201 { id, status }` (id = slug of the title); invalid → `422` |
| `GET` · `PATCH` · `DELETE /admin/courses/:id` | PATCH `{ course?, status? }` | `AdminCourseDetail` (KPIs, `draft` form values, `recentEnrollments`; revenue from `orders`) · `{ id, deleted }`; unknown → `404`; publishing an incomplete course → `422` |
| `GET /admin/students` · `POST /admin/students` | `{ name, email, plan }` | list · `201 AdminStudentRow`; duplicate → `409 EMAIL_TAKEN` |
| `GET` · `PATCH /admin/students/:id` | `{ status: active \| inactive \| suspended }` | `AdminStudentDetail` (enrolments read from the learning store, orders, certificates) |
| `POST /admin/students/:id/grants` | `{ courseId }` | `201 AdminStudentDetail`; owned → `409 ALREADY_ENROLLED` (stored on the admin record only — the backend would create the enrolment) |
| `POST /admin/students/:id/password-reset` | — | `{ sentTo }` (no email is sent by the mock) |
| `GET /admin/reviews` · `PATCH /admin/reviews/:id` | `{ reply?, hidden? }` | `{ stats, rows, breakdown }` · `AdminReview` |
| `GET /admin/notes` · `POST /admin/notes` | `{ name, category, type, pages, status }` | `{ stats, rows, categories }` · `201 AdminNote` (v1) |
| `POST /admin/notes/:id/versions` | `{ fileName, fileSize }` (PDF ≤ 50 MB; metadata only) | `AdminNote` with `version + 1` and a new `updatedAt` |
| `GET /admin/payments` · `GET /admin/payments/:id` | — | `{ stats, rows: OrderRecord[] }` · `{ order, timeline }` |
| `POST /admin/payments/:id/refund` | `{ reason }` | full refund → `status: refunded`; not paid → `409 NOT_REFUNDABLE`; short reason → `422` |
| `POST /admin/payments/:id/refund/reject` | `{ reason }` | `refund_requested` → `paid`; no request → `409 NO_REFUND_REQUEST` |
| `GET /admin/submissions` · `GET /admin/submissions/:id` | — | `Submission[]` · `Submission` |
| `POST /admin/submissions/:id/review` | `{ decision: approved \| changes_requested, feedback }` (≥ 20 chars) | `Submission` with `status`, `feedback`, `reviewer` (signed-in admin's name), `reviewedAt` |
| `GET /admin/promos` · `POST /admin/promos` | `{ code, percentOff, expiresAt, usageLimit }` | `AdminPromo[]` (with computed `status`) · `201`; duplicate → `409 PROMO_EXISTS` |
| `PATCH` · `DELETE /admin/promos/:code` | `{ percentOff?, expiresAt?, usageLimit?, active? }` | `AdminPromo` · `{ code, deleted }`. Checkout reads the same `promos` collection (`findValidPromo`) |
| `GET /admin/tickets` · `GET /admin/tickets/:id` | — | `Ticket[]` · `Ticket` |
| `POST /admin/tickets/:id/replies` · `PATCH /admin/tickets/:id` | `{ message }` · `{ status: open \| closed }` | `Ticket` (a reply appends to `replies` and sets `status: replied`) |

New error codes (admin only, not in `API_ERROR_CODES`): `NOT_REFUNDABLE`, `NO_REFUND_REQUEST`, `PROMO_EXISTS`. Admin mock data: `src/api/mock/db/admin.ts` (localStorage `bxn-mock-admin-*`; `resetMockAdmin()` for tests).

### Learner and money (Phase 2) — provisional, no backend docs yet

All `/me/*` endpoints need a user token (no session → `401`). Orders use the shared `OrderRecord` (`src/types/commerce.ts`, plus optional `account`, the masked payer account).

| Endpoint | Request | Response / errors |
| --- | --- | --- |
| `POST /checkout/promo` | `{ code }` | `PromoResult`; validated with `findValidPromo` (active, not expired, under limit) else `400 INVALID_PROMO` |
| `POST /checkout/orders` | `{ kind: "course", courseId, payment, promoCode? }` · `{ kind: "plan", plan: "pro", cycle, payment, promoCode? }` · `{ kind: "donation", amount, payment: { method } }` · `{ kind: "cart", courseIds, payment, promoCode? }` (F-004: one order with `items[]`, promo on the subtotal, paying enrols every course; empty/free → `400`, any owned → `409 ALREADY_ENROLLED`, Pro → `409 ALREADY_SUBSCRIBED`) | `201 OrderRecord` written to `orders`. Card → `paid` (fulfilled: enrol / start Pro, promo `used + 1`); bKash/Nagad → `pending`. Donations need no session and are paid at once. Owned course → `409 ALREADY_ENROLLED`; already Pro → `409 ALREADY_SUBSCRIBED`; Teams / free course → `400` |
| `POST /checkout/orders/:id/confirm` | `{ simulateFailure? }` (demo) | `paid` order (fulfilled); wallet ending `0000` or `simulateFailure` → status `failed` + `402 PAYMENT_DECLINED`; not pending → `409 ORDER_NOT_PENDING` |
| `POST /checkout/orders/:id/cancel` | — | order with status `failed` |
| `GET /me/orders` · `GET /me/orders/:id` | — | own orders, newest first · one order (others' → `404`) |
| `POST /me/orders/:id/refund` | `{ reason }` (10–500 chars) | `refund_requested`; not paid / donation / ≥ 30 days → `409 REFUND_NOT_ALLOWED` (admin approves it, Phase 3) |
| `GET /me/subscription` | — | `Subscription { plan: free\|pro, status: none\|active\|canceled, cycle, startedAt, currentPeriodEnd }` |
| `PATCH /me/subscription` | `{ cycle }` | changes the cycle from the next renewal; no plan → `404` |
| `POST /me/subscription/cancel` · `/resume` | — | `Subscription` (`canceled` = Pro until `currentPeriodEnd`) |
| `GET /me/certificates` · `GET /me/certificates/:id` | — | `CertificateRecord[]` · one (not yours → `404`). Certificates are issued automatically for every completed course the learner is entitled to (Pro, or bought the course) — on progress save and before listing |
| `GET /certificates/:id` | — (public) | `CertificateRecord` (never the email); unknown → `404` |
| `GET /me/submissions` · `POST /me/submissions` | `{ courseId, title, repoUrl, notes }` | `Submission[]` · `201 Submission` (`pending`); not enrolled → `403 NOT_ENROLLED`; not entitled → `402 UPGRADE_REQUIRED`; bad fields → `422` |
| `GET /me/notifications` | — | `NotificationItem[]` (max 20) derived from reviewed submissions, certificates and paid / refund orders |
| `POST /me/notifications/read` | `{ ids? }` (none = all) | updated list; read ids persist on the mock user |
| `GET` · `PATCH /me/preferences` | partial `{ courseUpdates, assignments, recommendations, community, digest, desktop }` | `NotificationPreferences` |
| `POST /me/email` | `{ newEmail, password }` | `{ sentTo }`; wrong password → `400 WRONG_PASSWORD`; taken → `409 EMAIL_TAKEN` |
| `POST /me/email/verify` | `{ code }` (`000000` = wrong) | new `AuthSession` (the token encodes the email); records move to the new email |
| `DELETE /me` | `{ confirm: "DELETE" }` | `{ deleted: true }`; admins → `403`; orders are kept |
| `POST /courses/:id/enroll` | — | now also enrols Pro members in paid courses (`source: "pro"`) |
| `PATCH /me/profile` | `{ name, bio, portfolio, goal }` | the email is no longer changed here; response is the full `Profile` (with `memberSince`) |

New error codes in `API_ERROR_CODES`: `PAYMENT_DECLINED`, `ORDER_NOT_PENDING`, `ALREADY_SUBSCRIBED`, `UPGRADE_REQUIRED`, `REFUND_NOT_ALLOWED`. Mock data: `src/api/mock/db/billing.ts` (`bxn-mock-subscriptions`; the demo student's Pro lapsed on 1 Sep 2026, so they start Free), certificates in `db/learning.ts` (`bxn-mock-certificates`), entitlement rules in `db/entitlement.ts`, preferences / read notifications / pending email on the mock user (`db/users.ts`). Route modules: `routes/billing.ts`, `routes/achievements.ts`, `routes/account.ts`, spread into `learnerRoutes`.


## Next AI (F-005, provisional)

| Endpoint | Body | Returns |
| --- | --- | --- |
| `POST /assistant/chat` | `{ message, context: { path, courseId?, lessonId? } }` | `AssistantReply { text, links?, courses? }`; empty / >1000 chars → `400 VALIDATION_ERROR`. Mock answers from site content; the backend will call an AI model with the key kept server-side. |

## Demo admin access

While the mock API is on, `OPEN_ADMIN` (`src/api/config.ts`, env `VITE_OPEN_ADMIN`) opens `/admin` and the mock admin endpoints to everyone. It is off whenever `VITE_USE_MOCK_API=false`, so the real backend's admin lock applies.

## Reviews, quizzes, paths (F-006 – F-008, provisional)

| Endpoint | Notes |
| --- | --- |
| `GET /me/reviews/:courseId` | `MyReviewState { review, canReview, reason, progressPct, minPct }` |
| `PUT /me/reviews/:courseId` | `{ stars 1–5, text 20–1000 }` → `MyReviewState`; not enrolled → `403 NOT_ENROLLED`, under 30% → `403 REVIEW_TOO_EARLY` |
| `GET /courses/:id/quizzes/:module` | `Quiz` without answers (enrolled only) |
| `POST /me/quizzes/:courseId/:module` | `{ answers: number[] }` → `QuizResult` with explanations; best score kept |
| `GET /me/quizzes/:courseId` | `QuizScore[]` |
| `GET /paths`, `GET /paths/:id` | `LearningPath` (public) |
