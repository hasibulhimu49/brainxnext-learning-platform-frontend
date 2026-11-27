# F-003 — Implementation plan

**Status:** Done — 2026-11-25 (plan recorded after the fact in F-009; the audit and changes are in `feature.md`)

## 1. Requirement

Every screen works at 360px without sideways scrolling, with tappable controls (see `feature.md`).

## 2. Approach

1. Measure all routes at 360px and 390px as guest, student and admin (page `scrollWidth`).
2. Fix each overflow at its source with the existing breakpoints and tokens — no new components or dependencies.
3. Lock it in with `e2e/responsive.spec.ts`.

## 3. Backend API, state, routing, validation

None — layout only. The course page's sticky enrol bar is local state in `BuyCard` (IntersectionObserver).

## 4. Files

`Navbar`, `BuyCard`, `Home`, player controls (`PlayerNav`), course editor header (`AdminNewCourse`), `e2e/responsive.spec.ts`.

## 5. Risks

Desktop layouts must not change: every fix is scoped to small-screen breakpoints.
