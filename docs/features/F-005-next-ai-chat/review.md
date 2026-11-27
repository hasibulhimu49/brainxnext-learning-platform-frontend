# F-005 — Review

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
| 1 | Medium | Panel had no focus trap / `aria-modal` | F-009: `useFocusTrap`, `role="dialog"` + `aria-modal` |
| 2 | Medium | The ping animation widened the page at 360px; the circle covered the last footer link and player text | F-009 |

## Known limitations

- Demo answers only (no AI model). The conversation is lost on reload. The backend must validate input, rate-limit and keep the AI key server-side.
