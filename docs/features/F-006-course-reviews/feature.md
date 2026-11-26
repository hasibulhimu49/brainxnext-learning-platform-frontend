# F-006 — Course reviews

**Status:** Done — 2026-11-26

Enrolled learners who finished at least 30% of a course rate it (1–5 stars) and write a review, one per course, editable.
It shows on the course page at once; the admin can reply or hide it from **Admin → Reviews**.

## Decisions (approved)

- Show right away, admin moderates afterwards (no approval queue).
- One source of truth: the admin reviews collection (`bxn-mock-admin-reviews`) feeds the course page, the learner's own review and admin moderation.
- Editing a review re-publishes it and clears the old reply (it answered a different text).

## Pieces

Mock `routes/reviews.ts` (`GET|PUT /me/reviews/:courseId`, provisional), `GET /courses/:id` returns visible reviews;
`schemas/review.ts`, `services/reviewService.ts`, `queries/reviews.ts`, `components/course/CourseReviews.tsx`.
New error code `REVIEW_TOO_EARLY`. The course-complete card links to `#reviews`.
