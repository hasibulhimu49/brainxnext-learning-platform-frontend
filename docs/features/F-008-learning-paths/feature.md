# F-008 — Learning paths

**Status:** Done — 2026-11-26

Guided sequences of catalog courses (Backend Developer, Data Analyst, AI Engineer, Product Designer).
`/paths` lists them; `/paths/:pathId` shows ordered steps with the learner's progress per course, a
"Start / Continue" button for the next step, and "Add N paid courses to cart".

## Decisions (approved)

- Normal prices, no bundle discount; promo codes still apply at checkout. Pro members see "included in Pro".
- Paths only reference course ids; prices, hours and progress come from the catalog and enrolment queries (`hooks/usePathSteps.ts`).

## Pieces

Mock `db/paths.ts`, `routes/paths.ts` (`GET /paths`, `GET /paths/:id`, provisional); `types/path.ts`, `services/pathService.ts`,
`queries/paths.ts`, pages `Paths.tsx` and `PathDetail.tsx`. Linked from the navbar ("Roadmaps"), catalog banner, footer (LEARN) and dashboard. Shown as **"Career roadmaps"** since F-009.
