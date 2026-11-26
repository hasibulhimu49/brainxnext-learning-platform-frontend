import { formatTaka } from "@/lib/utils";
import { projectSubmissionSchema } from "@/schemas/learner";
import type { NotificationItem } from "@/types/account";
import type { OrderRecord, Submission } from "@/types/commerce";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { orders, submissions } from "../db/commerce";
import { hasCourseExtras, syncCertificates } from "../db/entitlement";
import { findEnrollment, toPublicCertificate } from "../db/learning";
import { readNotificationsOf, updateUser } from "../db/users";
import { bodyOf, fail, ok, str, type MockRoute } from "../http";
import { findCourse } from "../db/courses";
import { invalid, requireUser, unauthorized } from "./shared";

/** Certificates, project submissions and notifications of the signed-in learner. PROVISIONAL. */

const submissionsOf = (email: string) =>
  submissions
    .all()
    .filter((s) => s.userEmail === email)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

const ORDER_NOTICE: Partial<Record<OrderRecord["status"], string>> = {
  paid: "Payment received",
  refund_requested: "Refund requested",
  refunded: "Refund processed",
};

const SUBMISSION_NOTICE: Record<Exclude<Submission["status"], "pending">, string> = {
  approved: "Project approved",
  changes_requested: "Changes requested on your project",
};

/** Derived from the user's records; `read` comes from the ids they marked as read. */
const notificationsFor = (user: { email: string; name: string }): NotificationItem[] => {
  const read = readNotificationsOf(user.email);
  const items: Omit<NotificationItem, "read">[] = [
    ...submissionsOf(user.email).flatMap((s) =>
      s.status === "pending"
        ? []
        : [
            {
              id: `sub-${s.id}-${s.status}`,
              kind: "submission" as const,
              title: SUBMISSION_NOTICE[s.status],
              body: `${s.title} · ${s.courseTitle}`,
              at: s.reviewedAt ?? s.submittedAt,
              to: "/dashboard/reviews",
            },
          ]
    ),
    ...syncCertificates(user).map((c) => ({
      id: `cert-${c.id}`,
      kind: "certificate" as const,
      title: "Certificate earned",
      body: c.course,
      at: c.issuedAt,
      to: `/certificates/${c.id}`,
    })),
    ...orders
      .all()
      .filter((o) => o.userEmail === user.email && ORDER_NOTICE[o.status])
      .map((o) => ({
        id: `ord-${o.id}-${o.status}`,
        kind: "order" as const,
        title: ORDER_NOTICE[o.status] ?? "",
        body: `${o.itemTitle} · ${formatTaka(o.total)}`,
        at: o.createdAt,
        to: `/orders/${o.id}`,
      })),
  ];
  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 20)
    .map((n) => ({ ...n, read: read.has(n.id) }));
};

export const achievementRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/me/certificates",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(syncCertificates(user).map(toPublicCertificate)) : unauthorized();
    },
  },
  {
    method: "GET",
    path: "/me/certificates/:id",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const cert = syncCertificates(user).find((c) => c.id === req.params.id?.toUpperCase());
      return cert ? ok(toPublicCertificate(cert)) : fail(404, CODES.notFound, "We couldn't find that certificate in your account.");
    },
  },
  {
    method: "GET",
    path: "/me/submissions",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(submissionsOf(user.email)) : unauthorized();
    },
  },
  {
    method: "POST",
    path: "/me/submissions",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const b = bodyOf(req);
      const course = findCourse(str(b.courseId));
      if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
      if (!findEnrollment(user.email, course.id)) return fail(403, CODES.notEnrolled, "Enrol in this course to submit a project.");
      if (!hasCourseExtras(user.email, course.id)) {
        return fail(402, CODES.upgradeRequired, "Mentor review is part of Pro (or included when you buy the course).");
      }
      const parsed = projectSubmissionSchema.safeParse(b);
      if (!parsed.success) return invalid(parsed.error.issues);
      const submission: Submission = {
        id: `SUB-${Date.now().toString().slice(-6)}`,
        userEmail: user.email,
        userName: user.name,
        courseId: course.id,
        courseTitle: course.title,
        moduleTitle: "Final project",
        ...parsed.data,
        submittedAt: new Date().toISOString(),
        status: "pending",
        feedback: null,
        reviewer: null,
        reviewedAt: null,
      };
      submissions.add(submission);
      return ok(submission, 201);
    },
  },
  {
    method: "GET",
    path: "/me/notifications",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(notificationsFor(user)) : unauthorized();
    },
  },
  {
    method: "POST",
    path: "/me/notifications/read",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const ids = bodyOf(req).ids;
      const marking = Array.isArray(ids)
        ? ids.filter((id): id is string => typeof id === "string")
        : notificationsFor(user).map((n) => n.id);
      updateUser(user.email, { readNotifications: [...new Set([...(user.readNotifications ?? []), ...marking])] });
      return ok(notificationsFor(user));
    },
  },
];
