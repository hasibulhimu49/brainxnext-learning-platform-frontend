# F-007 — Review

**Reviewer:** Mohammad Hasibul Hasan (owner), re-checked in the F-009 final audit
**Date:** 2026-11-26 (re-checked 2026-11-27)

## Checklist

- [x] Matches `feature.md` and the approved decisions
- [x] Uses only the provisional mock endpoints (no backend docs yet — CLAUDE.md §3)
- [x] API calls go through `src/services` + TanStack Query (no axios/fetch in components)
- [x] Response types are explicit; `success` is checked via the envelope; errors use `ApiError` / `errorMessage`
- [x] Server state is not copied into Zustand; any new global state has a documented owner
- [x] No `any`; typecheck, lint and Prettier clean
- [x] Tests from `testing.md` added and passing
- [x] Light and dark mode, desktop and mobile
- [x] No new dependency

## Findings

| # | Severity | Finding | Resolution |
| - | -------- | ------- | ---------- |
| 1 | Medium | Every course served the Java Generics quizzes | F-009: per-course quizzes from each course's curriculum |
| 2 | Low | "Start module N" assumed a fixed module count | F-009: uses `moduleCount` from the quiz |
| 3 | Low | An invalid module in the URL still sent a request | F-009: `useQuiz` is disabled for invalid modules |

## Known limitations

- Only Generics in Java has hand-written questions; the other courses get generated placeholder quizzes until real content comes from the backend.
