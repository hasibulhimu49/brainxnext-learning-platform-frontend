# F-007 — Implementation plan

**Status:** Done — 2026-11-26. The approved decisions are in `feature.md`; this plan was written down after the fact in F-009 from the shipped code.

## Approach

- Endpoints (provisional): `GET /courses/:courseId/quizzes/:module` (questions without answers), `POST /me/quizzes/:courseId/:module` (`{ answers }` → graded `QuizResult` with explanations), `GET /me/quizzes/:courseId` (best scores). The API module index is 0-based; the page URL `/learn/:courseId/quiz/:module` is 1-based.
- Enrolled learners only (`403 NOT_ENROLLED`); unknown course or module → `404`. Pass mark 70% (`QUIZ_PASS_PCT`); the best score is kept (`bxn-mock-quiz-scores`).
- State: `["quiz", courseId, module]` and `["me", "quizzes", courseId]`; answers being picked are page-local state.
- UI: `pages/courses/ModuleQuiz.tsx`; the player's curriculum sidebar shows "Module quiz · Best x/4 · Passed".
- Certificates do not depend on quizzes.

## Testing

See `testing.md`.
