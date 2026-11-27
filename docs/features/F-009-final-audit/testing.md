# F-009 — Testing

## Automated (new or changed in F-009)

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/queries/auth.test.ts` | `watchSessionChanges` drops `me` / `admin` data (keeps public data) on a 401 expiry and on a new sign-in, keeps the cache within a session |
| Unit (Vitest) | `src/queries/checkout.test.ts` | `invalidateAfterOrder` going Pro refreshes subscription, certificates, dashboard and enrolments; a course order refreshes that course |
| Unit (Vitest) | `src/api/mock/db/curricula.test.ts` | Generics in Java unchanged, per-course curriculum and content, seeded progress re-mapped, unknown lesson ids rejected, fresh enrolment not started, quiz module count |
| Unit (Vitest) | `src/api/mock/routes/{orders,admin}.test.ts` | a Pro member can't pay for a course Pro includes; cart orders count in course revenue (promo split by price) |
| Component (RTL) | `src/pages/courses/Player.test.tsx` | guest plays a free preview with a log-in prompt; other lessons locked; course's own curriculum, notes link, discussion notice |
| Component (RTL) | `src/pages/checkout/Checkout.test.tsx` | "Included in Pro", close link, typed promo applied on Pay, invalid promo blocks Pay, promo kept after a failed wallet payment |
| Component (RTL) | `src/components/checkout/WalletPending.test.tsx` | expires once; doesn't expire while approving |
| Component (RTL) | `src/pages/Home.test.tsx`, `src/pages/marketing/Pricing.test.tsx` | catalog counts instead of hard-coded numbers, same handbooks as `/notes`, "Get started" → sign-up, real yearly saving, Teams per-seat price, CTA by sign-in state |
| Component (RTL) | `src/components/assistant/AssistantWidget.test.tsx`, `src/pages/courses/ModuleQuiz.test.tsx`, `src/pages/paths/Paths.test.tsx`, `src/components/billing/OrderHistory.test.tsx` | focus trap + `aria-modal`; real module count; "Career roadmaps"; pending wallet orders resume / cancel |
| End-to-end (Playwright) | `e2e/smoke.spec.ts`, `e2e/billing.spec.ts` (+ all specs, renamed by flow; shared `e2e/helpers.ts`) | every route, money flows |

## Scenarios

- [x] Guest preview lesson, locked lessons
- [x] Pro member at course / cart checkout
- [x] Session expiry and switching accounts
- [x] Light and dark theme (contrast-safe text tokens)
- [x] 360px, 768px, desktop

## Results

| Date | Command | Result |
| ---- | ------- | ------ |
| 2026-11-27 | `npm test` | 50 files, 246 tests pass |
| 2026-11-27 | `npm run build` | pass (after the `package.json` changes) |
| 2026-11-27 | `npm run format:check` | pass |
