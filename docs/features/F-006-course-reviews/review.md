# F-006 — Review

**Reviewer:** Mohammad Hasibul Hasan (owner), re-checked in the F-009 final audit
**Date:** 2026-11-26 (re-checked 2026-11-27)

## Checklist

- [x] Matches `feature.md` and the approved decisions
- [x] Uses only the provisional mock endpoints (no backend docs yet — CLAUDE.md §3)
- [x] API calls go through `src/services` + TanStack Query (no axios/fetch in components)
- [x] Response types are explicit; `success` is checked via the envelope; errors use `ApiError` / `errorMessage`
- [x] Server state is not copied into Zustand; any new global state has a documented owner
- [x] Forms use React Hook Form + Zod
- [x] No `any`; typecheck, lint and Prettier clean
- [x] Tests from `testing.md` added and passing
- [x] Light and dark mode, desktop and mobile
- [x] No new dependency

## Findings

| # | Severity | Finding | Resolution |
| - | -------- | ------- | ---------- |
| 1 | Low | Course hero rating was a seeded number, not the reviews' average | F-009: computed from real reviews |
| 2 | Low | 30% threshold used the shared 17-lesson curriculum | F-009: uses each course's own lesson count (`totalLessonsOf`) |

## Known limitations

- Reviews show immediately (no approval queue); moderation is after the fact.
