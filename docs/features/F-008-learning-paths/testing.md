# F-008 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/api/mock/routes/paths.test.ts` | every step is a real catalog course; one path; unknown → `404` |
| Component (RTL) | `src/pages/paths/Paths.test.tsx` | list shows "Career roadmaps"; a roadmap adds its paid courses to the cart |
| End-to-end (Playwright) | `e2e/reviews-quizzes-paths.spec.ts` | a guest follows a roadmap and adds its paid courses to the cart |

## Results

| Date | Command | Result |
| ---- | ------ | ------ |
| 2026-11-27 | `npm test` (F-009 final run) | 50 files, 246 tests pass |
