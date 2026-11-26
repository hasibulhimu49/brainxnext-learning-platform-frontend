# F-009 — Final audit: implementation plan

**Status:** Planned — awaiting approval (2026-11-26)

Five read-only audits (architecture, code quality, UX flows, accessibility/responsive/performance, docs/hygiene) were merged
into the workstreams below. Order matters: the folder moves land first (alone), then the other workstreams run in parallel
with strict file ownership, then docs and a full test run.

## Step 0 — Checkpoint

Commit + push the current work on `main` so the reorganization can be undone in one step.

## Step 1 — Structure (one agent, alone; mostly import-path changes)

Decision: **keep the layer-based structure** (pages → queries → services → api), fix mis-grouping. A move to `src/features/*`
would touch ~250 files for little gain; revisit when the real backend lands (admin is the first candidate).

- Pages: `marketing/{Checkout,CartCheckout,PlanCheckout}` → `pages/checkout/`; `marketing/{Cart,Wishlist}` → `pages/shop/`;
  `marketing/OrderReceipt` → `pages/billing/`; `marketing/{Paths,PathDetail}` → `pages/paths/`;
  `marketing/VerifyCertificate` + `dashboard/{Certificate,Certificates}` → `pages/certificates/`;
  `marketing/{Support,ThankYou}` → `pages/support/`; `dashboard/Settings` → `pages/account/`;
  `{Forbidden,NotFound,ServerError}` → `pages/errors/`.
- Components: shared form feedback (`Alert`, `FieldError`, `SubmitButton`, `SuccessState`) out of `auth/AuthCard` →
  `common/FormFeedback.tsx`; `layout/Sidebar` → `admin/AdminSidebar`; `dashboard/*` → `learner/`; `CartButton` → `shop/`;
  `checkout/useWalletCheckout` → `hooks/`; `admin/{format,csv}` → `lib/` (merge duplicate `formatDate`/`timeAgo` into `lib/dates.ts`).
- One pricing source: `Home` and `Pricing` read `constants/plans.ts` (no hard-coded ৳1,900 arrays).
- Split `AdminNewCourse.tsx` (569 lines) into `components/admin/course-editor/*`.
- Mock: move `findCourse` into `db/courses.ts` (breaks the `catalog ↔ reviews` import cycle).
- Tests renamed by feature: `phase2.test.ts`, `routes.test.ts`, `learning-features.test.ts`, `learnerPhase2.test.tsx`,
  `learningFeatures.test.tsx`, `schemas.test.ts`, e2e `learner/learning/learning-features` specs; shared `payByCard` +
  `STUDENT` in `e2e/helpers.ts`.
- `AppRoutes.tsx`: lazy imports grouped like the routes; `AdminLayout` lazy.

## Step 2 — parallel workstreams (after Step 1)

### A. Bugs and logic
1. Session expiry / new login clears cached `me` + `admin` queries (another user's data could show for up to 60 s).
2. Pro users can't pay for a course Pro already includes (mock + `Checkout` "Included in Pro" state; wait for subscription).
3. Admin course revenue counts cart orders (promo split proportionally).
4. Going Pro refreshes certificates, dashboard, enrolments.
5. Quiz "next module" uses the real module count; `useQuiz` disabled for invalid module.
6. Wallet timer can't expire while approving; checkout keeps promo after a failed payment; a typed-but-not-applied promo is applied on Pay.
7. **Each course gets its own curriculum** (mock) — today every course shows the Java Generics modules/lessons, and the dashboard/player say "Class 2 of 17" for a 12-lesson course.
8. Guests can watch free preview lessons; preview rows in the curriculum are clickable.
9. Home "Get started" form actually submits (contact/newsletter) with a success message.
10. One notes source: Home "Notes" cards, `/notes` and Admin → Notes show the same handbooks.
11. Player "Notes" button opens the course handbook; Discussion box says posts aren't saved yet (no backend).
12. Dashboard: not-started course shows "Start", not "IN PROGRESS / Resume"; wishlist marks owned courses "Owned".
13. Billing: a pending bKash order can be resumed or cancelled.
14. Error codes used by the mock all live in `API_ERROR_CODES`; refund rule from `lib/billing.ts` reused; dead code removed (`COURSE_REVIEWS`, `CYCLE_LABEL`, `useVerifyCertificate`); `<CheckoutFlow>` extracted from the 3 checkout pages; `Icon filled` prop.

### B. Copy and consistency
- Real numbers everywhere from the catalog (16 courses, 8 free, 5 tracks) instead of hard-coded 48/12; course hero ratings from real reviews; admin overview figures consistent with Students/Payments.
- Plan promises match behaviour (certificates / mentor review / paths wording on Pricing).
- One spelling and wording: "Log in", "Sign up", "Enroll/Enrollments", "Notes", "+ New course"; Cancel-Pro dialog "Keep Pro"; wrong-password hint; yearly "−26%"; donation skip link "No thanks, just download".
- Signed-in users don't see "Create a free account" CTAs; course checkout gets a close/back link; `/admin/<unknown>` shows not-found.
- "Learning paths" → **"Career roadmaps"**, in the main navbar (replaces "About", which stays in the footer).

### C. Accessibility and visual
- Contrast tokens: light `--soft` darkened to ≥4.5:1; dark-mode brand text uses brand-light; text greens/ambers darkened; footer muted text.
- One `<h1>` on certificate and course-editor pages; skip link on player and course editor.
- Focus trap + `aria-modal` for the mobile menu and Next AI panel; unread dot announced.
- Next AI bubble: no sideways scroll at 360px (ping clipped), doesn't cover the last footer link or player text.

### D. Performance
- Material Symbols font subset (`icon_names=`, fixed axes): ~3 MB → tens of KB; layout-shift fix (Suspense min-height).
- Mock adapter loaded with dynamic `import()` only when the mock is on (removes the demo DB from the main bundle).
- Compress icons (icon-512 600 KB) and convert hero/notes/about photos to WebP with `srcset`; smaller logo.

## Step 3 — Docs and hygiene
- Fix every stale doc statement found (CLAUDE.md, README, architecture, routing, api-guidelines, caching, data-fetching,
  deployment, state-management, testing); folder layout section updated after Step 1.
- Fill missing/template feature docs (F-001…F-008 review/testing/plan files; F-002 status).
- `package.json`: `engines.node >=20.19`, Tailwind packages → devDependencies; README features, scripts, env, licence line.
- Not changed: storage key prefixes (`bx-`/`bxn-`) — renaming would wipe every user's saved cart/theme/session.

## Step 4 — Verify
typecheck, lint, format, all unit tests, full e2e (desktop + mobile), visual spot-check of key pages in both themes; commit.

## Needs the owner (not code)
Real backend API docs; real per-course content (curricula, handbooks); legal text review; whether the certificate's second
signatory should be someone else (today it is the founder name, which matches the demo student's name).
