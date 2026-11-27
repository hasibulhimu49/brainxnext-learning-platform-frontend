# F-004 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/stores/shopStore.test.ts` | wishlist toggle (newest first), cart dedupe + bulk remove, persistence as `bx-shop` |
| Unit (Vitest) | `src/api/mock/routes/cart.test.ts` | one cart order: promo on the subtotal, enrols every course; wallet → enrols after approval; empty / free / owned rejected; needs a session |
| Component (RTL) | `src/pages/shop/Cart.test.tsx` | heart on a course card, wishlist "add paid ones to cart", cart total + remove, owned courses dropped, empty state |
| End-to-end (Playwright) | `e2e/cart.spec.ts` | heart → wishlist; guest fills the cart, logs in at checkout, pays once for both |
| End-to-end (Playwright) | `e2e/smoke.spec.ts`, `e2e/responsive.spec.ts` | `/wishlist` and `/cart` render without errors and fit 360px |

## Results

| Date | Command | Result |
| ---- | ------ | ------ |
| 2026-11-27 | `npm test` (F-009 final run) | 50 files, 246 tests pass |
