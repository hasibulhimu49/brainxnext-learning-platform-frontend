# F-004 — Review

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
| 1 | Medium | `sm:grid-cols-2` overrode `min-[1001px]:` columns in 8 grids (Tailwind emits named breakpoints later) | Those grids use `min-[640px]:`; don't mix named and custom breakpoints on one property |
| 2 | Low | Owned courses still looked buyable on the wishlist | F-009: marked "Owned" |
| 3 | Medium | Pro members could pay for a cart | F-009: `409 ALREADY_SUBSCRIBED` |

## Known limitations

- Wishlist and cart live in this browser only (`bx-shop`), no sync across devices until the backend has a cart API. Plans and donations keep their own checkout.
