# F-002 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/schemas/learner.test.ts` | Phase 2 schemas: project submission, refund reason, preference patch, confirm-password refine, DELETE confirmation, email change, profile without email |
| Unit (Vitest) | `src/api/mock/routes/{orders,billing,achievements,account}.test.ts` | Phase 2 mock: orders (card paid + promo usage, expired promo, wallet decline / cancel, receipts), refund window, donations, Pro subscribe / cancel / resume / cycle, Pro enrolment, certificate issuing + public verify, submissions, notification read state, preferences, email change, account deletion |
| Component (RTL) | `src/pages/billing/OrderReceipt.test.tsx`, `src/pages/certificates/Certificates.test.tsx`, `src/components/learner/NotificationsMenu.test.tsx`, `src/pages/checkout/PlanCheckout.test.tsx`, `src/components/billing/OrderHistory.test.tsx` | receipt page, certificates list + empty state, notifications dropdown (unread, mark all read, Escape), plan checkout (cycle, card → receipt, already Pro, Teams), refund dialog |
| End-to-end (Playwright) | `e2e/billing.spec.ts` | Pro checkout → billing Pro → cancel / resume; declined wallet → failed → retry; complete course → certificate → public verify; submit project → My reviews; notifications; donation → handbook download |
| End-to-end (Playwright) | `e2e/enroll-checkout.spec.ts`, `e2e/smoke.spec.ts` | bKash → pending → approve → receipt → player; smoke covers every new learner / public route incl. `/privacy`, `/terms`, `/refunds`, `/help`, `/verify` |
| Unit (Vitest) | `src/schemas/….test.ts` | |
| Component (RTL) | `src/pages/….test.tsx` | |
| End-to-end (Playwright) | `e2e/….spec.ts` | |
| Unit (Vitest) | `src/schemas/admin.test.ts` | Admin schemas: promo (A–Z0–9 4–16, uppercased, 1–90 %, optional expiry/limit), feedback (≥ 20 chars), refund reason, add student, PDF upload |
| Unit (Vitest) | `src/api/mock/routes/admin.test.ts` | 401 guest / 403 student on refund, submission review, promos, counts; full refund + 409 re-refund; approve / reject refund requests; approve / request changes with reviewer + timestamp; promo create → `findValidPromo` → deactivate; course create / edit / unpublish / delete; ticket reply + close |
| Component (RTL) | `src/components/admin/DataTable.test.tsx` | 10 per page, Previous / Next, "Showing x–y of z", header sort asc/desc (`aria-sort`), row actions, empty state; CSV escaping + header preview |
| Component (RTL) | `src/pages/admin/AdminNewCourse.test.tsx` | Edit mode loads the course into the form, Save changes → detail page, unsaved-changes dialog on the back link, unknown course error |
| Component (RTL) | `src/pages/admin/AdminPages.test.tsx` | Every admin page renders with seed data; course pagination + row actions; payments Filter menu; sidebar live badges + nested active state; promo dialog validation |
| End-to-end (Playwright) | `e2e/admin.spec.ts` | Admin: courses → detail → edit → save; payments → refund; submissions → approve (badge 2 → 1); promos → create; inbox → reply |

## Scenarios

- [ ] Happy path
- [ ] Validation errors
- [ ] Each backend error code the UI handles
- [ ] Loading and empty states
- [ ] Light and dark theme
- [ ] Mobile (≤640px) and desktop layouts

## Manual checks

- Matches the Figma design (spacing, breakpoints).

## Results

| Date | Command | Result |
| ---- | ------- | ------ |
| 2026-11-25 | Phase 3: `npm run typecheck && npm run lint && npm run format && npm test` | typecheck + lint clean; admin suites (`schemas/admin`, `routes/admin`, `DataTable`, `AdminNewCourse`, `AdminPages`) green |
| | `npm run typecheck && npm run lint && npm test` | |
| | `npm run test:e2e` | |
| 2026-11-25 | Phase 2: `npm run typecheck && npm run lint && npm run format:check && npm test` | green — 21 files, 159 tests (e2e left to the coordinator) |
