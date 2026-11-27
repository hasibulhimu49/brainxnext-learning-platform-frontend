# F-006 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/api/mock/routes/reviews.test.ts` | post past 30% → shows on the course page; 30% rule and enrolment; edit instead of a second review; admin hide; validation |
| Component (RTL) | `src/components/course/CourseReviews.test.tsx` | rating form validation then posting; guests are asked to log in |
| End-to-end (Playwright) | `e2e/reviews-quizzes-paths.spec.ts` | a student 35% through a course reviews it |

## Results

| Date | Command | Result |
| ---- | ------ | ------ |
| 2026-11-27 | `npm test` (F-009 final run) | 50 files, 246 tests pass |
