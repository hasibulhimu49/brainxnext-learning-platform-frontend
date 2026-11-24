# F-001 — Testing

## Automated

| Level | File | What it covers |
| --- | --- | --- |
| Unit (Vitest) | `src/lib/utils.test.ts` | `formatTaka`: 0, 999, 4900, 124000, rounding |
| Unit (Vitest) | `src/schemas/schemas.test.ts` | admin price accepts up to 6 digits, rejects empty for paid courses |
| Component (RTL) | `src/pages/courses/Catalog.test.tsx` | cards show `৳4,900` and "Free" |
| Unit (Vitest) | `src/api/mock/routes/routes.test.ts` | order total with `LEARN20` is `3920` |
| End-to-end (Playwright) | `e2e/learning.spec.ts` | checkout with `LEARN20` + bKash shows and pays `৳3,920` |
| End-to-end (Playwright) | `e2e/smoke.spec.ts` | every route still renders without errors |

## Scenarios

- [ ] Free course shows "Free", not ৳0
- [ ] Paid course shows the ৳ price and the struck-through old price
- [ ] Promo applied → discount and total in whole Taka
- [ ] Pricing monthly/yearly toggle shows the ৳ amounts
- [ ] No `$` left anywhere in the UI (`grep` for `\$[0-9]` in `src`)
- [ ] Light and dark theme
- [ ] Mobile (≤640px) and desktop layouts: no wrapping in price badges or admin tables

## Manual checks

- The ৳ glyph renders cleanly next to Sora digits.

## Results

| Date | Command | Result |
| --- | --- | --- |
| 2026-11-25 | `npm run typecheck && npm run lint && npm test` | pass (12 files, 70 tests) |
| 2026-11-25 | `npm run test:e2e` | pass (chromium + mobile) |
