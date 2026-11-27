# F-003 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| End-to-end (Playwright) | `e2e/responsive.spec.ts` | 21 routes (12 guest, 5 student, 4 admin) must not be wider than a 360px screen |
| End-to-end (Playwright) | `e2e/smoke.spec.ts` | every route renders on Desktop Chrome and Pixel 7 without errors |

## Manual checks

- Navbar, course page sticky enrol bar, player controls and course-editor header at 360 / 390 / 768px in both themes.

## Results

| Date | Command | Result |
| ---- | ------- | ------ |
| 2026-11-25 | full suite | typecheck, lint, format clean · Vitest 159/159 · Playwright 152/152 + 6 responsive |
