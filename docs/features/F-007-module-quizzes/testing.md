# F-007 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/api/mock/routes/quizzes.test.ts` | questions sent without answers; grading, explanations, best score kept; enrolment and a full answer set required |
| Unit (Vitest) | `src/api/mock/db/curricula.test.ts` | the quiz knows how many modules its course has |
| Component (RTL) | `src/pages/courses/ModuleQuiz.test.tsx` | take a quiz → score with explanations; next-module link uses the real module count; no request for an invalid module |
| End-to-end (Playwright) | `e2e/reviews-quizzes-paths.spec.ts` | a student takes a module quiz from the player |

## Results

| Date | Command | Result |
| ---- | ------ | ------ |
| 2026-11-27 | `npm test` (F-009 final run) | 50 files, 246 tests pass |
