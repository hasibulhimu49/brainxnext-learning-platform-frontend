# F-008 — Implementation plan

**Status:** Done — 2026-11-26. The approved decisions are in `feature.md`; this plan was written down after the fact in F-009 from the shipped code.

## Approach

- Endpoints (provisional, public): `GET /paths`, `GET /paths/:id` (`LearningPath`: ordered course ids + copy). Unknown id → `404` → the page redirects to `/paths`.
- Paths hold course ids only; prices, hours and progress are joined from the catalog and enrolment queries in `hooks/usePathSteps.ts`.
- State: `["paths"]` / `["paths", id]`; adding the paid steps to the cart uses `shopStore` (F-004).
- Routes `/paths` and `/paths/:pathId` (public, `PublicLayout`). Linked from the navbar ("Roadmaps"), footer, catalog banner and dashboard.

## Testing

See `testing.md`.
