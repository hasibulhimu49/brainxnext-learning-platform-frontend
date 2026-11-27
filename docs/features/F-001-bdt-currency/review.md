# F-001 — Review

**Reviewer:** Mohammad Hasibul Hasan (owner), re-checked in the F-009 final audit
**Date:** 2026-11-25 (re-checked 2026-11-27)

## Checklist

- [x] Matches `feature.md` and the approved plan
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
| 1 | Low | Pricing cards and Home hard-coded the Pro price (৳1,900) | F-009: one source, `src/constants/plans.ts` via `planCards()` |
| 2 | Low | Yearly saving badge did not match the real prices | F-009: badge computed ("−26%") |

## Known limitations

- Prices come from the mock API; the backend decides real prices and VAT. No currency switch (Taka only, by decision).
