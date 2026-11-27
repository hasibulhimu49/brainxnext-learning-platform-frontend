# F-002 — Review

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
| 1 | High | `.sr-only` text inside horizontal scrollers stretched admin pages to ~1,150px on phones | Integration: scrollers are `relative` |
| 2 | Medium | Tall dialogs could not scroll on short screens | Dialogs capped at `100dvh - 32px` |
| 3 | Low | Course-complete card linked to certificates before one existed | Shows "Preparing your certificate…" |
| 4 | High | After session expiry or a new login, the previous user's `me`/`admin` data could show for up to 60 s | F-009: `watchSessionChanges` |
| 5 | High | Pro members could pay for a course Pro already includes | F-009: `409 ALREADY_SUBSCRIBED` + "Included in your Pro plan" |
| 6 | Medium | Every course showed the Java Generics curriculum | F-009: per-course curricula (`mock/db/curricula.ts`) |
| 7 | Medium | Wallet timer could expire while approving; promo lost after a failed payment | F-009: fixed in `useWalletCheckout` / `<CheckoutFlow>` |

## Known limitations

- All endpoints are provisional mock placeholders. Handbooks download one sample PDF. The Discussion tab doesn't save posts (no endpoint). Legal pages are draft copy awaiting review.
