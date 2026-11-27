# F-009 — Review

**Reviewer:** Mohammad Hasibul Hasan (owner)
**Date:** 2026-11-27

## Checklist

- [x] Matches the approved `implementation-plan.md` (Steps 1–3)
- [x] Uses only the provisional mock endpoints; one removed (`/notes/highlights`), none invented beyond the plan
- [x] API calls go through `src/services` + TanStack Query (no axios/fetch in components)
- [x] Every error code the mock returns is in `API_ERROR_CODES`
- [x] Server state is not copied into Zustand; session changes clear user-scoped cache
- [x] No `any`; typecheck, lint and Prettier clean
- [x] Unit / component tests pass (50 files, 246 tests)
- [x] Light and dark mode, desktop and mobile
- [x] No new runtime dependency (Tailwind packages moved to devDependencies)

## Findings fixed

| # | Severity | Finding | Resolution |
| - | -------- | ------- | ---------- |
| 1 | High | Another user's `me` / `admin` data could show for up to 60 s after expiry or a new login | `watchSessionChanges` |
| 2 | High | Pro members could pay for courses / carts Pro includes | `409 ALREADY_SUBSCRIBED` + "Included in your Pro plan" |
| 3 | Medium | Every course showed the Java Generics curriculum ("Class 2 of 17" for a 12-lesson course) | per-course curricula and quizzes |
| 4 | Medium | Guests couldn't watch free preview lessons | player route public, gated per lesson |
| 5 | Medium | Wallet timer could expire while approving; promo lost after a failed payment; typed promo ignored on Pay | `useWalletCheckout` / `<CheckoutFlow>` |
| 6 | Medium | Text contrast below 4.5:1 (light `soft`, dark brand / danger, green / amber text) | contrast-safe text tokens |
| 7 | Medium | ~3 MB icon font, mock DB in the main bundle | icon subset, lazy mock chunk |
| 8 | Low | Hard-coded counts and prices disagreed with the catalog | `useCatalogStats`, `constants/plans.ts` |

## Known limitations

- Not run in this docs pass: `npm run test:e2e` (owner to run before committing).
- One `npm test` run under heavy machine load had 6 timeouts; a re-run passed 246/246.
- `icon_names` in `index.html` must be kept in sync by hand when icons are added.
- Content is placeholder: generated curricula and quizzes, one sample handbook PDF, draft legal text.
