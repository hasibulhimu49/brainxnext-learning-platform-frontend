import { changePasswordSchema, profileSchema } from "@/schemas/account";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { isPro } from "../db/billing";
import { buildDashboard } from "../db/dashboard";
import { syncCertificates } from "../db/entitlement";
import { LESSON_IDS, enroll, findEnrollment, listEnrollments, progressOf, updateProgress } from "../db/learning";
import { findUser, toProfile, updateUser } from "../db/users";
import { bodyOf, fail, ok, str, type MockRoute } from "../http";
import { findCourse } from "./catalog";
import { accountRoutes } from "./account";
import { achievementRoutes } from "./achievements";
import { billingRoutes } from "./billing";
import { invalid, requireUser, unauthorized } from "./shared";

/**
 * Signed-in learner endpoints. Enrolment, progress and everything spread in at the end (billing,
 * certificates, submissions, notifications, account settings) are PROVISIONAL — no backend docs yet.
 */
export const learnerRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/me/dashboard",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      syncCertificates(user);
      return ok(buildDashboard(user.email));
    },
  },
  {
    method: "GET",
    path: "/me/profile",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(toProfile(user)) : unauthorized();
    },
  },
  {
    method: "PATCH",
    path: "/me/profile",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const parsed = profileSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      // the email only changes through the OTP-verified POST /me/email flow
      updateUser(user.email, parsed.data);
      const saved = findUser(user.email);
      return saved ? ok(toProfile(saved), 200, "Profile saved") : unauthorized();
    },
  },
  {
    method: "POST",
    path: "/me/password",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      if (parsed.data.current !== user.password) return fail(400, CODES.wrongPassword, "Your current password is incorrect.");
      updateUser(user.email, { password: parsed.data.next });
      return ok({ changed: true });
    },
  },

  /* ---------------- enrolment & progress (provisional) ---------------- */
  {
    method: "POST",
    path: "/courses/:id/enroll",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const course = findCourse(req.params.id);
      if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
      const existing = findEnrollment(user.email, course.id);
      if (existing) return ok(existing);
      if (course.free) return ok(enroll(user.email, course.id, "free"), 201);
      // an active Pro plan unlocks every paid course
      if (isPro(user.email)) return ok(enroll(user.email, course.id, "pro"), 201);
      return fail(402, CODES.paymentRequired, "This is a paid course. Buy it or go Pro to enrol.");
    },
  },
  {
    method: "GET",
    path: "/me/enrollments",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(listEnrollments(user.email)) : unauthorized();
    },
  },
  {
    method: "GET",
    path: "/me/progress/:courseId",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const course = findCourse(req.params.courseId);
      if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
      return ok(progressOf(user.email, course.id));
    },
  },
  {
    method: "PUT",
    path: "/me/progress/:courseId",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const course = findCourse(req.params.courseId);
      if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
      if (!findEnrollment(user.email, course.id)) return fail(403, CODES.notEnrolled, "Enrol in this course to save your progress.");
      const b = bodyOf(req);
      const lessonId = str(b.lessonId);
      if (!LESSON_IDS.includes(lessonId)) return invalid([{ path: ["lessonId"], message: "Unknown lesson" }]);
      if (b.completed !== undefined && typeof b.completed !== "boolean") {
        return invalid([{ path: ["completed"], message: "Expected true or false" }]);
      }
      const progress = updateProgress(user.email, course.id, lessonId, b.completed);
      // finishing the last lesson issues the certificate (when the learner is entitled to one)
      syncCertificates(user);
      return ok(progress);
    },
  },
  ...billingRoutes,
  ...achievementRoutes,
  ...accountRoutes,
];
