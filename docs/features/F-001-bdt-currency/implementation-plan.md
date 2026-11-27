# F-001 — Implementation plan

> **Note (F-009):** files were reorganised by area in F-009 (e.g. `pages/marketing/Checkout` → `pages/checkout/`, `dashboard/*` → `learner/`). Paths below are as they were when this plan was written; see `CLAUDE.md` §9 for the current layout.

**Status:** Approved (by Mohammad Hasibul Hasan, 2026-11-24) — implemented 2026-11-25

> Do not start coding until this plan is approved.

## 1. Requirement

Replace every $ price with Taka (see `feature.md`). Proposed conversion: **×100, rounded to a friendly price**, which matches the existing admin mock (`Modern JavaScript, Properly` bought for ৳4,900 = $49 × 100).

| Item | Now | Proposed |
| --- | --- | --- |
| Courses | $39 / $45 / $49 / $55 / $59 / $69 / $79 / $89 | ৳3,900 / ৳4,500 / ৳4,900 / ৳5,500 / ৳5,900 / ৳6,900 / ৳7,900 / ৳8,900 |
| Old (struck-through) prices | $79 … $149 | ×100 (৳7,900 … ৳14,900) |
| Pro monthly / yearly-per-month | $19 / $14 | ৳1,900 / ৳1,400 |
| Pro yearly total, saving | $168, save $60 | ৳16,800, save ৳6,000 |
| Teams per seat (monthly / yearly) | $14 / $10 | ৳1,400 / ৳1,000 |
| FAQ single-course range | $39–$89 | ৳3,900–৳8,900 |
| Settings billing history / plan | $12.00 | ৳1,900 (matches Pro monthly) |

## 2. Existing architecture and patterns to reuse

- Prices come from the mock API (`src/api/mock/db/courses.ts`) through `courseService` and the query hooks. Plan prices are UI copy in pages.
- `src/lib/utils.ts` holds shared helpers, so the new formatter goes there.

## 3. Backend API dependencies

None documented yet. The mock keeps `price` / `oldPrice` as numbers, now meaning whole Taka. The comment on `src/types/course.ts` changes from "USD" to "BDT, whole taka".

## 4. Affected frontend features

Home pricing section, Pricing, Catalog/CourseCard, CourseDetail, Checkout, Dashboard, Settings (billing), AdminNewCourse, the admin mock data, and the e2e checkout test.

## 5. State ownership

No change. Prices remain server data (TanStack Query) or page constants. No new state.

## 6. Routing

No change.

## 7. Validation

- `src/schemas/course.ts`: the admin price field becomes `^\d{0,6}$` (allows ৳999,999), with the default `"4900"` and a minimum of 1 for paid courses.
- Checkout: totals are computed and shown as integers; the promo discount is `Math.round(price × 0.2)`.

## 8. Files

| File | Change |
| --- | --- |
| `src/lib/utils.ts` | add `formatTaka(amount: number): string` → `"৳4,900"` (lakh grouping via `en-IN`) and `discountFor(price, percentOff)` shared with the mock |
| `src/types/course.ts` | doc comment: BDT whole taka |
| `src/api/mock/db/courses.ts` | prices ×100 |
| `src/api/mock/db/dashboard.ts` | recommended line `৳8,900` |
| `src/api/mock/db/admin.ts` | `$` amounts (`$168.00`, `$112.00`, `$39.00`) → ৳; course rows via `formatTaka` |
| `src/api/mock/routes/checkout.ts` | promo total in whole taka (`price − discountFor(price, %)`) |
| `src/components/course/CourseCard.tsx` | use `formatTaka` |
| `src/pages/courses/CourseDetail.tsx`, `src/components/course/BuyCard.tsx` | use `formatTaka` (buy card + related list) |
| `src/pages/marketing/Checkout.tsx` | `formatTaka` for price, discount, total; "VAT included" replaces the tax line; no `.toFixed(2)` |
| `src/pages/Home.tsx`, `src/pages/marketing/Pricing.tsx` | plan prices, yearly note, FAQ range |
| `src/pages/dashboard/Settings.tsx` | plan price + invoices |
| `src/pages/admin/AdminNewCourse.tsx` | label "Price (BDT)", preview with `formatTaka` |
| `src/schemas/course.ts` (+ `schemas.test.ts`) | price regex and default |
| `src/lib/utils.test.ts` (new) | `formatTaka` cases |
| `e2e/learning.spec.ts` | expect "Pay ৳3,920" (৳4,900 − 20%) |
| `docs/project/ui-guidelines.md` | price formatting rule |

## 9. Testing

See `testing.md`. Run `npm run typecheck && npm run lint && npm test`, plus `npm run test:e2e`, because checkout is a critical flow.

## 10. Risks

- **Width:** "৳14,900" is longer than "$149", so check that price badges and the admin table don't wrap at 360 px.
- **Font:** ৳ is not in Sora's Latin subset, so it falls back to another font. Check that it looks acceptable next to Sora digits.
