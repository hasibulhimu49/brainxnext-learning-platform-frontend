import { reviewSchema } from "@/schemas/review";
import type { AdminReview } from "@/types/admin";
import type { CourseReview, MyReviewState } from "@/types/course";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { adminReviews } from "../db/admin";
import { progressOf, TOTAL_LESSONS } from "../db/learning";
import { newId } from "../db/store";
import { bodyOf, fail, ok, type MockRequest, type MockRoute } from "../http";
import { findCourse } from "../db/courses";
import { invalid, requireUser, unauthorized } from "./shared";

/*
 * Course reviews (F-006, PROVISIONAL). One collection — the admin reviews list — is the source for
 * the course page, the learner's own review and the admin's reply / hide, so they always agree.
 * Enrolled learners who finished at least REVIEW_MIN_PCT of the lessons can post one review per
 * course; it shows at once and the admin can hide it.
 */

export const REVIEW_MIN_PCT = 30;

const toPublic = (r: AdminReview): CourseReview => ({ id: r.id, stars: r.stars, name: r.who, text: r.text, at: r.at, reply: r.reply });

/** Visible reviews for the course page, newest first. */
export const publicReviews = (courseId: string): CourseReview[] =>
  adminReviews
    .all()
    .filter((r) => r.courseId === courseId && !r.hidden)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map(toPublic);

const findMine = (email: string, name: string, courseId: string) =>
  adminReviews.all().find((r) => r.courseId === courseId && (r.userEmail ? r.userEmail === email : r.who === name));

const stateFor = (email: string, name: string, courseId: string): MyReviewState => {
  const p = progressOf(email, courseId);
  const progressPct = Math.round((p.completed.length / TOTAL_LESSONS) * 100);
  const mine = findMine(email, name, courseId);
  const reason = !p.enrolled ? "not_enrolled" : progressPct < REVIEW_MIN_PCT && !mine ? "too_early" : null;
  return { review: mine ? toPublic(mine) : null, canReview: reason === null, reason, progressPct, minPct: REVIEW_MIN_PCT };
};

const getMine = (req: MockRequest) => {
  const user = requireUser(req);
  if (!user) return unauthorized();
  if (!findCourse(req.params.courseId)) return fail(404, CODES.notFound, "That course doesn't exist.");
  return ok(stateFor(user.email, user.name, req.params.courseId ?? ""));
};

const saveMine = (req: MockRequest) => {
  const user = requireUser(req);
  if (!user) return unauthorized();
  const course = findCourse(req.params.courseId);
  if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
  const parsed = reviewSchema.safeParse(bodyOf(req));
  if (!parsed.success) return invalid(parsed.error.issues);

  const state = stateFor(user.email, user.name, course.id);
  if (state.reason === "not_enrolled") return fail(403, CODES.notEnrolled, "Enrol in this course to review it.");
  if (state.reason === "too_early")
    return fail(
      403,
      CODES.reviewTooEarly,
      `Finish at least ${REVIEW_MIN_PCT}% of the course to review it — you're at ${state.progressPct}%.`
    );

  const now = new Date().toISOString();
  const mine = findMine(user.email, user.name, course.id);
  if (mine) {
    // an edited review is a new opinion: it shows again and the old reply no longer fits
    adminReviews.update(
      (r) => r.id === mine.id,
      (r) => ({ ...r, ...parsed.data, at: now, hidden: false, reply: null, userEmail: user.email })
    );
  } else {
    adminReviews.add({
      id: newId("REV"),
      who: user.name,
      userEmail: user.email,
      courseId: course.id,
      course: course.title,
      at: now,
      stars: parsed.data.stars,
      text: parsed.data.text,
      reply: null,
      hidden: false,
    });
  }
  return ok(stateFor(user.email, user.name, course.id));
};

export const reviewRoutes: MockRoute[] = [
  { method: "GET", path: "/me/reviews/:courseId", handler: getMine },
  { method: "PUT", path: "/me/reviews/:courseId", handler: saveMine },
];
