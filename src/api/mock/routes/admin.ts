import {
  addStudentSchema,
  feedbackSchema,
  grantCourseSchema,
  noteFileSchema,
  noteSchema,
  promoSchema,
  refundSchema,
  replySchema,
} from "@/schemas/admin";
import { courseDraftSchema, coursePublishSchema } from "@/schemas/course";
import { formatTaka } from "@/lib/utils";
import type { AdminCourseStatus, AdminNote, AdminReviewList, AdminNoteList, AdminStudentStatus, SubmissionDecision } from "@/types/admin";
import type { OrderRecord } from "@/types/commerce";
import { API_ERROR_CODES as CODES } from "../../envelope";
import {
  OVERVIEW,
  addStudent,
  adminCounts,
  adminCourses,
  adminNotes,
  adminReviews,
  adminStudents,
  courseDetail,
  courseRow,
  createCourse,
  findCourse,
  findStudent,
  findStudentByEmail,
  paymentDetail,
  paymentEvents,
  promoRow,
  studentDetail,
  studentHasCourse,
  studentRow,
} from "../db/admin";
import { orders, promos, submissions, tickets } from "../db/commerce";
import { newId } from "../db/store";
import { bodyOf, fail, ok, str, type MockHandler, type MockRequest, type MockRoute } from "../http";
import { invalid, requireAdmin, requireUser } from "./shared";

/**
 * Admin endpoints — every one requires an admin token (401 without a session, 403 for students).
 * PROVISIONAL placeholders until the backend docs arrive (docs/project/api-guidelines.md, "Admin (Phase 3)").
 */

const notFound = (what: string) => fail(404, CODES.notFound, `${what} not found.`);
const conflict = (code: string, message: string) => fail(409, code, message);
const now = () => new Date().toISOString();
const n = (v: number) => v.toLocaleString("en-IN");

/** Wrap a handler so it only runs for admins. */
const admin =
  (handler: MockHandler): MockHandler =>
  (req) =>
    requireAdmin(req) ?? handler(req);

const route = (method: MockRoute["method"], path: string, handler: MockHandler): MockRoute => ({ method, path, handler: admin(handler) });

const adminName = (req: MockRequest) => requireUser(req)?.name ?? "Admin";

/* ---------------- courses ---------------- */

const courseRoutes: MockRoute[] = [
  route("GET", "/admin/courses", () => {
    const rows = adminCourses.all().map(courseRow);
    const published = rows.filter((r) => r.status === "published");
    const enrolled = rows.reduce((s, r) => s + r.students, 0);
    const avg = published.length ? Math.round(published.reduce((s, r) => s + r.completion, 0) / published.length) : 0;
    return ok({
      stats: [
        { label: "Total courses", value: String(rows.length), trend: `${rows.length - published.length} drafts` },
        {
          label: "Published",
          value: String(published.length),
          trend: `${rows.length ? Math.round((published.length / rows.length) * 100) : 0}% published`,
        },
        { label: "Enrollments", value: n(enrolled), trend: "All time" },
        { label: "Avg. completion", value: `${avg}%`, trend: "Published courses" },
      ],
      rows,
    });
  }),
  route("POST", "/admin/courses", (req) => {
    const b = bodyOf(req);
    const status: AdminCourseStatus = b.status === "published" ? "published" : "draft";
    const parsed = (status === "published" ? coursePublishSchema : courseDraftSchema).safeParse(b.course);
    if (!parsed.success) return invalid(parsed.error.issues);
    const created = createCourse(parsed.data, status);
    return ok({ id: created.id, status }, 201);
  }),
  route("GET", "/admin/courses/:id", (req) => {
    const c = findCourse(req.params.id ?? "");
    return c ? ok(courseDetail(c)) : notFound("Course");
  }),
  route("PATCH", "/admin/courses/:id", (req) => {
    const c = findCourse(req.params.id ?? "");
    if (!c) return notFound("Course");
    const b = bodyOf(req);
    const status: AdminCourseStatus = b.status === "published" || b.status === "draft" ? b.status : c.status;
    const course = b.course === undefined ? c.draft : b.course;
    const parsed = (status === "published" ? coursePublishSchema : courseDraftSchema).safeParse(course);
    if (!parsed.success) return invalid(parsed.error.issues);
    adminCourses.update(
      (x) => x.id === c.id,
      (x) => ({ ...x, draft: parsed.data, status, updatedAt: now() })
    );
    const updated = findCourse(c.id);
    return updated ? ok(courseDetail(updated)) : notFound("Course");
  }),
  route("DELETE", "/admin/courses/:id", (req) => {
    const id = req.params.id ?? "";
    if (!findCourse(id)) return notFound("Course");
    adminCourses.remove((x) => x.id === id);
    return ok({ id, deleted: true });
  }),
];

/* ---------------- students ---------------- */

const STUDENT_STATUSES: AdminStudentStatus[] = ["active", "inactive", "suspended"];

const studentRoutes: MockRoute[] = [
  route("GET", "/admin/students", () => {
    const rows = adminStudents.all().map(studentRow);
    const today = now().slice(0, 10);
    return ok({
      stats: [
        { label: "Total students", value: n(rows.length), trend: `${rows.filter((r) => r.plan !== "free").length} on paid plans` },
        {
          label: "Active today",
          value: n(rows.filter((r) => r.lastActiveAt.slice(0, 10) === today).length),
          trend: "Seen in the last 24 h",
        },
        { label: "Suspended", value: n(rows.filter((r) => r.status === "suspended").length), trend: "Access paused" },
        { label: "Enrolments", value: n(rows.reduce((s, r) => s + r.courses, 0)), trend: "Across all courses" },
      ],
      rows,
    });
  }),
  route("POST", "/admin/students", (req) => {
    const parsed = addStudentSchema.safeParse(bodyOf(req));
    if (!parsed.success) return invalid(parsed.error.issues);
    if (findStudentByEmail(parsed.data.email)) return conflict(CODES.emailTaken, "A student with this email already exists.");
    return ok(studentRow(addStudent(parsed.data.name, parsed.data.email, parsed.data.plan)), 201);
  }),
  route("GET", "/admin/students/:id", (req) => {
    const s = findStudent(req.params.id ?? "");
    return s ? ok(studentDetail(s)) : notFound("Student");
  }),
  route("PATCH", "/admin/students/:id", (req) => {
    const s = findStudent(req.params.id ?? "");
    if (!s) return notFound("Student");
    const status = str(bodyOf(req).status) as AdminStudentStatus;
    if (!STUDENT_STATUSES.includes(status)) return invalid([{ path: ["status"], message: "Unknown status" }]);
    adminStudents.update(
      (x) => x.id === s.id,
      (x) => ({ ...x, status })
    );
    const updated = findStudent(s.id);
    return updated ? ok(studentDetail(updated)) : notFound("Student");
  }),
  route("POST", "/admin/students/:id/grants", (req) => {
    const s = findStudent(req.params.id ?? "");
    if (!s) return notFound("Student");
    const parsed = grantCourseSchema.safeParse(bodyOf(req));
    if (!parsed.success) return invalid(parsed.error.issues);
    if (!findCourse(parsed.data.courseId)) return notFound("Course");
    if (studentHasCourse(s, parsed.data.courseId)) return conflict(CODES.alreadyEnrolled, "This student already has the course.");
    adminStudents.update(
      (x) => x.id === s.id,
      (x) => ({ ...x, grants: [...x.grants, { courseId: parsed.data.courseId, at: now() }] })
    );
    const updated = findStudent(s.id);
    return updated ? ok(studentDetail(updated), 201) : notFound("Student");
  }),
  route("POST", "/admin/students/:id/password-reset", (req) => {
    const s = findStudent(req.params.id ?? "");
    return s ? ok({ sentTo: s.email }) : notFound("Student");
  }),
];

/* ---------------- reviews & notes ---------------- */

const contentRoutes: MockRoute[] = [
  route("GET", "/admin/reviews", () => {
    const rows = adminReviews.all();
    const total = rows.length || 1;
    const avg = rows.length ? (rows.reduce((s, r) => s + r.stars, 0) / rows.length).toFixed(1) : "0";
    const data: AdminReviewList = {
      stats: [
        { label: "Average rating", value: `${avg} ★`, trend: `${rows.length} reviews` },
        { label: "Total reviews", value: n(rows.length), trend: `${rows.filter((r) => r.hidden).length} hidden` },
        {
          label: "5-star reviews",
          value: `${Math.round((rows.filter((r) => r.stars === 5).length / total) * 100)}%`,
          trend: "Of all reviews",
        },
        { label: "Needs response", value: String(adminCounts().unansweredReviews), trend: "Review queue" },
      ],
      rows,
      breakdown: [5, 4, 3, 2, 1].map((s) => ({
        label: s === 1 ? "1 star" : `${s} stars`,
        value: `${Math.round((rows.filter((r) => r.stars === s).length / total) * 100)}%`,
      })),
    };
    return ok(data);
  }),
  route("PATCH", "/admin/reviews/:id", (req) => {
    const r = adminReviews.all().find((x) => x.id === req.params.id);
    if (!r) return notFound("Review");
    const b = bodyOf(req);
    let reply = r.reply;
    if (b.reply !== undefined) {
      const parsed = replySchema.safeParse({ message: b.reply });
      if (!parsed.success) return invalid(parsed.error.issues);
      reply = parsed.data.message;
    }
    const hidden = typeof b.hidden === "boolean" ? b.hidden : r.hidden;
    const updated = { ...r, reply, hidden };
    adminReviews.update(
      (x) => x.id === r.id,
      () => updated
    );
    return ok(updated);
  }),
  route("GET", "/admin/notes", () => {
    const rows = adminNotes.all();
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    const data: AdminNoteList = {
      stats: [
        { label: "Total notes", value: String(rows.length), trend: `${rows.filter((r) => r.type === "PDF").length} PDFs` },
        { label: "Published", value: String(rows.filter((r) => r.status === "published").length), trend: "Visible on /notes" },
        { label: "Versions", value: String(rows.reduce((s, r) => s + r.version, 0)), trend: "Uploaded files" },
        { label: "Categories", value: String(counts.size), trend: "Topics covered" },
      ],
      rows,
      categories: [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
    };
    return ok(data);
  }),
  route("POST", "/admin/notes", (req) => {
    const parsed = noteSchema.safeParse(bodyOf(req));
    if (!parsed.success) return invalid(parsed.error.issues);
    const created: AdminNote = {
      id: newId("NOTE"),
      ...parsed.data,
      pages: Number(parsed.data.pages),
      version: 1,
      updatedAt: now(),
      fileName: null,
      fileSize: null,
    };
    adminNotes.add(created);
    return ok(created, 201);
  }),
  route("POST", "/admin/notes/:id/versions", (req) => {
    const note = adminNotes.all().find((x) => x.id === req.params.id);
    if (!note) return notFound("Note");
    const b = bodyOf(req);
    const parsed = noteFileSchema.safeParse({ name: b.fileName, size: b.fileSize });
    if (!parsed.success) return invalid(parsed.error.issues);
    const updated: AdminNote = {
      ...note,
      version: note.version + 1,
      updatedAt: now(),
      fileName: parsed.data.name,
      fileSize: parsed.data.size,
    };
    adminNotes.update(
      (x) => x.id === note.id,
      () => updated
    );
    return ok(updated);
  }),
];

/* ---------------- payments ---------------- */

const counted = (o: OrderRecord) => o.status === "paid" || o.status === "refund_requested";

const findOrder = (id: string) => orders.all().find((o) => o.id === id);

const paymentRoutes: MockRoute[] = [
  route("GET", "/admin/payments", () => {
    const rows = orders.all();
    const month = now().slice(0, 7);
    const paid = rows.filter(counted);
    const refunded = rows.filter((o) => o.status === "refunded");
    return ok({
      stats: [
        { label: "Total revenue", value: formatTaka(paid.reduce((s, o) => s + o.total, 0)), trend: `${paid.length} payments` },
        {
          label: "This month",
          value: formatTaka(paid.filter((o) => o.createdAt.startsWith(month)).reduce((s, o) => s + o.total, 0)),
          trend: "Paid orders",
        },
        {
          label: "Refund requests",
          value: String(rows.filter((o) => o.status === "refund_requested").length),
          trend: "Waiting for review",
        },
        { label: "Refunds", value: formatTaka(refunded.reduce((s, o) => s + o.total, 0)), trend: `${refunded.length} refunded` },
      ],
      rows,
    });
  }),
  route("GET", "/admin/payments/:id", (req) => {
    const o = findOrder(req.params.id ?? "");
    return o ? ok(paymentDetail(o)) : notFound("Payment");
  }),
  route("POST", "/admin/payments/:id/refund", (req) => {
    const o = findOrder(req.params.id ?? "");
    if (!o) return notFound("Payment");
    if (!counted(o)) return conflict("NOT_REFUNDABLE", "Only paid orders can be refunded.");
    const parsed = refundSchema.safeParse(bodyOf(req));
    if (!parsed.success) return invalid(parsed.error.issues);
    orders.update(
      (x) => x.id === o.id,
      (x) => ({ ...x, status: "refunded" })
    );
    paymentEvents.add({
      orderId: o.id,
      at: now(),
      label: `Refunded ${formatTaka(o.total)} by ${adminName(req)}`,
      detail: parsed.data.reason,
      tone: "warn",
    });
    const updated = findOrder(o.id);
    return updated ? ok(paymentDetail(updated)) : notFound("Payment");
  }),
  route("POST", "/admin/payments/:id/refund/reject", (req) => {
    const o = findOrder(req.params.id ?? "");
    if (!o) return notFound("Payment");
    if (o.status !== "refund_requested") return conflict("NO_REFUND_REQUEST", "There is no refund request on this order.");
    const parsed = refundSchema.safeParse(bodyOf(req));
    if (!parsed.success) return invalid(parsed.error.issues);
    orders.update(
      (x) => x.id === o.id,
      (x) => ({ ...x, status: "paid" })
    );
    paymentEvents.add({
      orderId: o.id,
      at: now(),
      label: `Refund request rejected by ${adminName(req)}`,
      detail: parsed.data.reason,
      tone: "danger",
    });
    const updated = findOrder(o.id);
    return updated ? ok(paymentDetail(updated)) : notFound("Payment");
  }),
];

/* ---------------- submissions ---------------- */

const submissionRoutes: MockRoute[] = [
  route("GET", "/admin/submissions", () => ok(submissions.all())),
  route("GET", "/admin/submissions/:id", (req) => {
    const s = submissions.all().find((x) => x.id === req.params.id);
    return s ? ok(s) : notFound("Submission");
  }),
  route("POST", "/admin/submissions/:id/review", (req) => {
    const s = submissions.all().find((x) => x.id === req.params.id);
    if (!s) return notFound("Submission");
    const b = bodyOf(req);
    const decision = str(b.decision) as SubmissionDecision;
    if (decision !== "approved" && decision !== "changes_requested") return invalid([{ path: ["decision"], message: "Unknown decision" }]);
    const parsed = feedbackSchema.safeParse(b);
    if (!parsed.success) return invalid(parsed.error.issues);
    const updated = { ...s, status: decision, feedback: parsed.data.feedback, reviewer: adminName(req), reviewedAt: now() };
    submissions.update(
      (x) => x.id === s.id,
      () => updated
    );
    return ok(updated);
  }),
];

/* ---------------- promos ---------------- */

const promoRoutes: MockRoute[] = [
  route("GET", "/admin/promos", () => ok(promos.all().map((p) => promoRow(p)))),
  route("POST", "/admin/promos", (req) => {
    const b = bodyOf(req);
    const parsed = promoSchema.safeParse({
      code: str(b.code),
      percentOff: String(b.percentOff ?? ""),
      expiresAt: b.expiresAt ? str(b.expiresAt) : "",
      usageLimit: b.usageLimit === null || b.usageLimit === undefined ? "" : String(b.usageLimit),
    });
    if (!parsed.success) return invalid(parsed.error.issues);
    if (promos.all().some((p) => p.code === parsed.data.code)) return conflict("PROMO_EXISTS", "A promo with this code already exists.");
    const created = {
      code: parsed.data.code,
      percentOff: Number(parsed.data.percentOff),
      expiresAt: parsed.data.expiresAt || null,
      usageLimit: parsed.data.usageLimit ? Number(parsed.data.usageLimit) : null,
      used: 0,
      active: true,
    };
    promos.add(created);
    return ok(promoRow(created), 201);
  }),
  route("PATCH", "/admin/promos/:code", (req) => {
    const p = promos.all().find((x) => x.code === req.params.code);
    if (!p) return notFound("Promo");
    const b = bodyOf(req);
    const parsed = promoSchema.safeParse({
      code: p.code,
      percentOff: String(b.percentOff ?? p.percentOff),
      expiresAt: b.expiresAt === undefined ? (p.expiresAt ?? "") : b.expiresAt === null ? "" : str(b.expiresAt),
      usageLimit:
        b.usageLimit === undefined
          ? p.usageLimit === null
            ? ""
            : String(p.usageLimit)
          : b.usageLimit === null
            ? ""
            : String(b.usageLimit),
    });
    if (!parsed.success) return invalid(parsed.error.issues);
    const updated = {
      ...p,
      percentOff: Number(parsed.data.percentOff),
      expiresAt: parsed.data.expiresAt || null,
      usageLimit: parsed.data.usageLimit ? Number(parsed.data.usageLimit) : null,
      active: typeof b.active === "boolean" ? b.active : p.active,
    };
    promos.update(
      (x) => x.code === p.code,
      () => updated
    );
    return ok(promoRow(updated));
  }),
  route("DELETE", "/admin/promos/:code", (req) => {
    const code = req.params.code ?? "";
    if (!promos.all().some((x) => x.code === code)) return notFound("Promo");
    promos.remove((x) => x.code === code);
    return ok({ code, deleted: true });
  }),
];

/* ---------------- inbox ---------------- */

const findTicket = (id: string) => tickets.all().find((t) => t.id === id);

const ticketRoutes: MockRoute[] = [
  route("GET", "/admin/tickets", () => ok(tickets.all())),
  route("GET", "/admin/tickets/:id", (req) => {
    const t = findTicket(req.params.id ?? "");
    return t ? ok(t) : notFound("Ticket");
  }),
  route("POST", "/admin/tickets/:id/replies", (req) => {
    const t = findTicket(req.params.id ?? "");
    if (!t) return notFound("Ticket");
    const parsed = replySchema.safeParse(bodyOf(req));
    if (!parsed.success) return invalid(parsed.error.issues);
    tickets.update(
      (x) => x.id === t.id,
      (x) => ({ ...x, status: "replied", replies: [...x.replies, { from: "admin", message: parsed.data.message, at: now() }] })
    );
    const updated = findTicket(t.id);
    return updated ? ok(updated, 201) : notFound("Ticket");
  }),
  route("PATCH", "/admin/tickets/:id", (req) => {
    const t = findTicket(req.params.id ?? "");
    if (!t) return notFound("Ticket");
    const status = str(bodyOf(req).status);
    if (status !== "open" && status !== "closed") return invalid([{ path: ["status"], message: "Use open or closed" }]);
    tickets.update(
      (x) => x.id === t.id,
      (x) => ({ ...x, status })
    );
    const updated = findTicket(t.id);
    return updated ? ok(updated) : notFound("Ticket");
  }),
];

export const adminRoutes: MockRoute[] = [
  route("GET", "/admin/overview", () => ok(OVERVIEW)),
  route("GET", "/admin/counts", () => ok(adminCounts())),
  ...courseRoutes,
  ...studentRoutes,
  ...contentRoutes,
  ...paymentRoutes,
  ...submissionRoutes,
  ...promoRoutes,
  ...ticketRoutes,
];
