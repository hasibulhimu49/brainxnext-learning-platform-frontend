# F-009 — Final audit

**Status:** Done — 2026-11-27
**Owner:** Mohammad Hasibul Hasan
**Design:** existing Figma exports (no new screens)
**Backend API docs:** not available; every endpoint stays a provisional mock placeholder (CLAUDE.md §3)

## Summary

A final pass over the whole app before handing it to the backend: five read-only audits (architecture, code quality, UX flows, accessibility / responsive / performance, docs / hygiene) merged into one plan (`implementation-plan.md`), then fixed.

## What changed

- **Structure:** kept the layer-based layout, fixed mis-grouping — pages by area (`checkout/`, `shop/`, `billing/`, `paths/`, `certificates/`, `support/`, `account/`, `errors/`), `common/FormFeedback`, `admin/AdminSidebar`, `admin/course-editor/*`, `components/shop`, `hooks/useWalletCheckout`, `lib/csv`, `lib/admin`, merged date helpers in `lib/dates`. Tests renamed by feature.
- **Bugs and logic:** session expiry / a new login clears cached `me` + `admin` queries (`watchSessionChanges`); Pro members can't buy courses or carts (`409 ALREADY_SUBSCRIBED`, "Included in your Pro plan"); each course has its own curriculum and quizzes (`mock/db/curricula.ts`); guests can watch free preview lessons (player route public, the player gates the rest); wallet timer and promo fixes; `<CheckoutFlow>` shared by the three checkout pages; pending bKash orders can be resumed or cancelled; every mock error code is in `API_ERROR_CODES`; `/notes/highlights` and `useNoteHighlights` removed — Home, `/notes` and Admin → Notes share the handbooks; `Icon` `filled` prop.
- **Copy:** real catalog counts (`useCatalogStats`), one pricing source (`constants/plans.ts` + `planCards`), "Log in" / "Sign up" / "Enroll", "Career roadmaps" (navbar "Roadmaps" replaces "About" for guests).
- **Accessibility:** contrast-safe text tokens per theme, `text-brand-solid`, one `<h1>` per page, skip links on the player and course editor, `useFocusTrap` for the mobile menu and Next AI panel.
- **Performance:** Material Symbols subset (`icon_names` in `index.html`), mock adapter loaded with a dynamic `import()` (own chunk, dropped when the mock is off), WebP hero photos, compressed icons (numbers in `docs/project/performance.md`).
- **Docs and hygiene:** every stale doc fixed, all feature folders complete, `engines.node >=20.19`, Tailwind packages moved to devDependencies, README rewritten ("All rights reserved", no licence file).

## Out of scope

- Moving to `src/features/*` (≈250 files for little gain; revisit when the backend lands).
- Renaming storage keys (`bx-` / `bxn-`), which would wipe users' saved session, theme and cart.

## Open questions (need the owner)

- Real backend API docs; real per-course content (curricula, handbooks, quizzes); legal text review; the certificate's second signatory.
