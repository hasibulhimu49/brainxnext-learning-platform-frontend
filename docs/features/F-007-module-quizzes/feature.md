# F-007 — Module quizzes

**Status:** Done — 2026-11-26

A 4-question multiple-choice quiz after each module: instant feedback with explanations, 70% to pass, retry any time,
best score kept. Linked from the player's curriculum sidebar ("Module quiz · Best 3/4 · Passed").

## Decisions (approved)

- Optional practice: certificates still only need every lesson complete.
- Questions are sent without answers; the server grades and returns explanations.
- Each course has its own quizzes, one per module of its own curriculum (F-009). Generics in Java has hand-written questions; the others are generated placeholders until real content exists.

## Pieces

Mock `db/quizzes.ts` (question bank / generated quizzes per course + `bxn-mock-quiz-scores`), `routes/quizzes.ts` (`GET /courses/:id/quizzes/:module`,
`POST /me/quizzes/:courseId/:module`, `GET /me/quizzes/:courseId`, provisional); `types/quiz.ts`, `services/quizService.ts`,
`queries/quizzes.ts`, page `pages/courses/ModuleQuiz.tsx` at `/learn/:courseId/quiz/:module` (1-based).
