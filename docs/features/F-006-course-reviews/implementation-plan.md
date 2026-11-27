# F-006 — Implementation plan

**Status:** Done — 2026-11-26. The approved decisions are in `feature.md`; this plan was written down after the fact in F-009 from the shipped code.

## Approach

- Endpoints (provisional): `GET|PUT /me/reviews/:courseId`; `GET /courses/:id` returns visible reviews. One collection (`bxn-mock-admin-reviews`) feeds the course page, the learner's own review and Admin → Reviews.
- Rule: enrolled and ≥ 30% of the course's lessons complete, else `403 NOT_ENROLLED` / `403 REVIEW_TOO_EARLY`. One review per learner per course; editing re-publishes it and clears the admin reply.
- Form: React Hook Form + `schemas/review.ts` (1–5 stars, 20–1000 chars).
- State: server state under `["me", "reviews", courseId]`; saving invalidates the course detail.
- UI: `components/course/CourseReviews.tsx` on the course page (`#reviews`), linked from the course-complete card.

## Testing

See `testing.md`.
