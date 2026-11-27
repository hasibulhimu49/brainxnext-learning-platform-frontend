# Testing

## Unit and component tests — Vitest + React Testing Library

- Files: `*.test.ts(x)` next to the code, named after the thing or feature they cover. Run `npm test` (or `npm run test:watch`).
- Environment: jsdom; `src/test/setup.ts` clears local/session storage, resets every mock collection (users, learning, commerce, billing, admin, quizzes), the auth store and the shop store before each test.
- Render pages with `renderWithProviders(<Page />, { route, path })` from `src/test/render.tsx` (fresh QueryClient without retries + MemoryRouter). `src/test/Stub.tsx` is a placeholder route target.
- Tests run against the mock API through the real Axios client (0 ms latency), so the envelope handling is exercised too.
- Query by role/label/text the user sees; use `userEvent` for interaction.

Current suites (50 files):

| Area | Files |
| --- | --- |
| API layer | `api/envelope.test.ts`, `api/client.test.ts` |
| Mock API | `api/mock/db/curricula.test.ts`; `api/mock/routes/{auth,learner,account,achievements,billing,orders,cart,admin,assistant,reviews,quizzes,paths}.test.ts` |
| Schemas | `schemas/{auth,checkout,course,learner,admin}.test.ts` |
| Stores, queries, routes, lib | `stores/shopStore.test.ts`, `queries/auth.test.ts` (`watchSessionChanges`), `queries/checkout.test.ts` (`invalidateAfterOrder`), `routes/guards.test.tsx`, `lib/utils.test.ts`, `hooks/usePageTitle.test.tsx` |
| Components | `admin/DataTable`, `assistant/AssistantWidget`, `billing/OrderHistory`, `checkout/WalletPending`, `course/CourseReviews`, `learner/NotificationsMenu` |
| Pages | `Home`, `auth/{Login,ResetPassword}`, `courses/{Catalog,Player,ModuleQuiz}`, `checkout/{Checkout,PlanCheckout}`, `shop/Cart`, `billing/OrderReceipt`, `certificates/Certificates`, `paths/Paths`, `support/ThankYou`, `marketing/{Contact,Help,Pricing}`, `admin/{AdminPages,AdminNewCourse}` |

## End-to-end — Playwright

- Specs in `e2e/`, shared helpers in `e2e/helpers.ts` (`STUDENT`, `ADMIN`, `login`, `submitLogin`, `payByCard`). Run `npm run test:e2e` (builds and serves the app on port 4173). First time: `npx playwright install chromium`.
- Projects: `chromium` (Desktop Chrome) and `mobile` (Pixel 7).

| Spec | Covers |
| --- | --- |
| `auth.spec.ts` | log in → dashboard (and back to `?next=`), wrong password, admin log in / out, demo open admin, sign up → OTP → dashboard, forgot / reset password |
| `enroll-checkout.spec.ts` | catalog search → course, free enrolment + progress survives reload, paid course locked in the player, checkout with `LEARN20` + bKash → receipt |
| `billing.spec.ts` | Pro checkout → cancel (Pro until period end), declined wallet, certificate + public verify, project submission, notifications, donation |
| `cart.spec.ts` | heart → wishlist; guest fills the cart, logs in at checkout, pays once |
| `reviews-quizzes-paths.spec.ts` | course review at 35%, module quiz from the player, guest follows a roadmap → cart |
| `admin.spec.ts` | course edit, refund, submission review, promo create, inbox reply |
| `responsive.spec.ts` | key guest / student / admin routes fit a 360px screen |
| `smoke.spec.ts` | opens every route and fails on runtime or console errors |

Add an e2e test whenever a new critical flow ships (payments, enrolment, auth).
