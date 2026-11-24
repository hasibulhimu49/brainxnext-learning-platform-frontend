import { COURSE_LANGUAGES, type CourseDraftValues } from "@/schemas/course";
import type {
  AdminCounts,
  AdminCourseDetail,
  AdminCourseRow,
  AdminCourseStatus,
  AdminNote,
  AdminOverview,
  AdminPaymentDetail,
  AdminPaymentEvent,
  AdminPromo,
  AdminReview,
  AdminStudentDetail,
  AdminStudentEnrollment,
  AdminStudentRow,
  AdminStudentStatus,
  StudentPlan,
} from "@/types/admin";
import type { OrderRecord, Promo } from "@/types/commerce";
import { orders, submissions, tickets } from "./commerce";
import { COURSES, CURRICULUM } from "./courses";
import { listEnrollments } from "./learning";
import { createCollection } from "./store";

const g = (a: string, b: string) => `linear-gradient(135deg,${a},${b})`;

export const OVERVIEW: AdminOverview = {
  kpis: [
    { label: "Total students", value: "8,430", icon: "group", color: "#1B6FD0", delta: "+12.4%", up: true },
    { label: "Revenue (Aug)", value: "৳4.2L", icon: "payments", color: "#3FA457", delta: "+8.1%", up: true },
    { label: "Pro subscribers", value: "1,240", icon: "workspace_premium", color: "#E9A21B", delta: "+21%", up: true },
    { label: "Avg. completion", value: "64%", icon: "task_alt", color: "#0E97B0", delta: "-2.3%", up: false },
  ],
  revenue: [34, 41, 38, 52, 47, 58, 63, 71],
  topCourses: [
    { name: "Generics in Java", count: "8,430 enrolled", pct: 100 },
    { name: "Python for Data Analysis", count: "5,240", pct: 62 },
    { name: "Code Smells", count: "3,180", pct: 38 },
    { name: "Modern JavaScript", count: "1,870", pct: 22, gold: true },
  ],
  activity: [
    { who: "Rifat Hossain", what: "upgraded to Pro (yearly)", when: "8 min ago", icon: "workspace_premium", bg: g("#E9A21B", "#F2BC4B") },
    {
      who: "Sumaiya Akter",
      what: "submitted the module 3 project in Generics in Java",
      when: "24 min ago",
      icon: "assignment_turned_in",
      bg: g("#1B6FD0", "#3E92E8"),
    },
    {
      who: "Mahin Khan",
      what: "bought Modern JavaScript, Properly (৳4,900 via bKash)",
      when: "1 h ago",
      icon: "payments",
      bg: g("#3FA457", "#5DBE74"),
    },
    {
      who: "Tania Rahman",
      what: "earned a certificate — SQL From Query to Model",
      when: "3 h ago",
      icon: "verified",
      bg: g("#0E97B0", "#2FB8CF"),
    },
    { who: "412 students", what: "downloaded the Java Handbook this week", when: "today", icon: "download", bg: g("#7A4FD0", "#9B6FE8") },
  ],
};

/* ================================================================== */
/* Courses                                                             */
/* ================================================================== */

interface StoredCourse {
  id: string;
  draft: CourseDraftValues;
  status: AdminCourseStatus;
  updatedAt: string;
  students: number;
  rating: number;
  completion: number;
}

const SEED_STATS: [number, number, number][] = [
  [8430, 4.9, 72],
  [3180, 4.8, 64],
  [5240, 4.8, 58],
  [1870, 4.7, 61],
  [1420, 4.8, 55],
  [2210, 4.9, 69],
  [980, 4.6, 41],
  [1310, 4.7, 52],
  [760, 4.6, 47],
  [640, 4.5, 44],
  [1990, 4.8, 50],
  [530, 4.5, 39],
  [2650, 4.9, 77],
  [410, 4.4, 36],
  [0, 0, 0],
  [0, 0, 0],
];

const DRAFT_IDS = new Set(["prompt-engineering", "motion-design"]);

const toLang = (lang?: string): CourseDraftValues["lang"] => COURSE_LANGUAGES.find((l) => l === lang) ?? "English";

const seedCourses = (): StoredCourse[] =>
  COURSES.map((c, i) => {
    const [students, rating, completion] = SEED_STATS[i] ?? [0, 0, 0];
    const draft = DRAFT_IDS.has(c.id);
    const discount = c.oldPrice && c.oldPrice > c.price ? Math.min(99, Math.round((1 - c.price / c.oldPrice) * 100)) : 0;
    return {
      id: c.id,
      status: draft ? "draft" : "published",
      updatedAt: new Date(Date.UTC(2026, 10, 24 - i, 9)).toISOString(),
      students: draft ? 0 : students,
      rating: draft ? 0 : rating,
      completion: draft ? 0 : completion,
      draft: {
        title: c.title,
        blurb: c.blurb,
        track: c.cat,
        level: c.level,
        lang: toLang(c.lang),
        pricing: c.free ? "free" : "paid",
        price: c.free ? "" : String(c.price),
        discount: discount ? String(discount) : "",
        modules: CURRICULUM.map((m) => ({ title: m.title, lessons: m.lessons.map((l) => ({ title: l.title, dur: l.dur })) })),
      },
    };
  });

export const adminCourses = createCollection<StoredCourse>("bxn-mock-admin-courses", seedCourses);

export const findCourse = (id: string) => adminCourses.all().find((c) => c.id === id);

export const courseRow = (c: StoredCourse): AdminCourseRow => ({
  id: c.id,
  title: c.draft.title.trim() || "Untitled course",
  track: c.draft.track,
  modules: c.draft.modules.length,
  students: c.students,
  rating: c.rating,
  completion: c.completion,
  status: c.status,
  updatedAt: c.updatedAt,
});

/** Paid course orders count as revenue; refunded ones do not. */
const courseRevenue = (id: string) =>
  orders
    .all()
    .filter((o) => o.kind === "course" && o.itemId === id && (o.status === "paid" || o.status === "refund_requested"))
    .reduce((sum, o) => sum + o.total, 0);

export const courseDetail = (c: StoredCourse): AdminCourseDetail => ({
  ...courseRow(c),
  revenue: courseRevenue(c.id),
  draft: c.draft,
  recentEnrollments: adminStudents
    .all()
    .flatMap((s) =>
      studentEnrollments(s)
        .filter((e) => e.courseId === c.id)
        .map((e) => ({ studentId: s.id, name: s.name, email: s.email, enrolledAt: e.enrolledAt, pct: e.pct }))
    )
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt))
    .slice(0, 5),
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export const createCourse = (draft: CourseDraftValues, status: AdminCourseStatus): StoredCourse => {
  const base = slugify(draft.title) || "untitled-course";
  let id = base;
  for (let n = 2; findCourse(id); n++) id = `${base}-${n}`;
  const course: StoredCourse = { id, draft, status, updatedAt: new Date().toISOString(), students: 0, rating: 0, completion: 0 };
  adminCourses.add(course);
  return course;
};

export const courseTitle = (id: string) => findCourse(id)?.draft.title ?? COURSES.find((c) => c.id === id)?.title ?? id;

/* ================================================================== */
/* Students                                                            */
/* ================================================================== */

interface SeedEnrollment {
  courseId: string;
  pct: number;
  enrolledAt: string;
  completedAt: string | null;
}

interface StoredStudent {
  id: string;
  name: string;
  email: string;
  plan: StudentPlan;
  status: AdminStudentStatus;
  lastActiveAt: string;
  joinedAt: string;
  /** courses an admin granted (provisional — the real enrolment would be created by the backend) */
  grants: { courseId: string; at: string }[];
  /** used when the learning store has nothing for this learner (only the demo student has real progress) */
  seedEnrollments: SeedEnrollment[];
}

const se = (courseId: string, pct: number, enrolledAt: string): SeedEnrollment => ({
  courseId,
  pct,
  enrolledAt,
  completedAt: pct === 100 ? enrolledAt : null,
});

const student = (
  n: number,
  name: string,
  email: string,
  plan: StudentPlan,
  status: AdminStudentStatus,
  lastActiveAt: string,
  joinedAt: string,
  seedEnrollments: SeedEnrollment[] = []
): StoredStudent => ({ id: `STU-${1000 + n}`, name, email, plan, status, lastActiveAt, joinedAt, grants: [], seedEnrollments });

const seedStudents = (): StoredStudent[] => [
  student(1, "Mohammad Hasibul Hasan", "hasibulx26@gmail.com", "pro", "active", "2026-11-25T08:58:00.000Z", "2026-03-02T09:00:00.000Z"),
  student(2, "Nusrat Jahan", "nusrat.j@yahoo.com", "teams", "active", "2026-11-25T07:40:00.000Z", "2026-08-19T10:00:00.000Z", [
    se("sql-query-to-model", 74, "2026-08-20T10:00:00.000Z"),
    se("python-data-analysis", 100, "2026-08-21T10:00:00.000Z"),
  ]),
  student(3, "Rahim Hasan", "rahim@email.com", "free", "inactive", "2026-11-22T12:00:00.000Z", "2026-08-14T10:00:00.000Z", [
    se("modern-javascript", 41, "2026-08-15T10:00:00.000Z"),
  ]),
  student(4, "Sadia Islam", "sadia@email.com", "pro", "active", "2026-11-25T08:48:00.000Z", "2026-08-10T10:00:00.000Z", [
    se("java-generics", 93, "2026-08-11T10:00:00.000Z"),
    se("code-smells", 100, "2026-09-01T10:00:00.000Z"),
    se("react-architecture", 35, "2026-10-12T10:00:00.000Z"),
  ]),
  student(5, "Mahin Khan", "mahin.k@outlook.com", "free", "active", "2026-11-24T19:20:00.000Z", "2026-09-03T10:00:00.000Z", [
    se("modern-javascript", 12, "2026-11-20T08:20:00.000Z"),
  ]),
  student(6, "Sabbir Islam", "sabbir.i@gmail.com", "free", "active", "2026-11-23T14:05:00.000Z", "2026-10-01T10:00:00.000Z", [
    se("ux-research", 8, "2026-11-18T14:05:00.000Z"),
  ]),
  student(7, "Sumaiya Akter", "sumaiya.a@gmail.com", "pro", "active", "2026-11-24T09:36:00.000Z", "2026-07-11T10:00:00.000Z", [
    se("java-generics", 48, "2026-10-02T10:00:00.000Z"),
  ]),
  student(8, "Rifat Hossain", "rifat.h@gmail.com", "pro", "active", "2026-11-25T08:52:00.000Z", "2026-05-22T10:00:00.000Z", [
    se("java-generics", 100, "2026-06-01T10:00:00.000Z"),
    se("building-with-llms", 22, "2026-11-01T10:00:00.000Z"),
  ]),
  student(9, "Tania Rahman", "tania.r@gmail.com", "pro", "active", "2026-11-25T06:00:00.000Z", "2026-04-18T10:00:00.000Z", [
    se("sql-query-to-model", 100, "2026-05-01T10:00:00.000Z"),
  ]),
  student(10, "Farhan Ahmed", "farhan.a@gmail.com", "free", "inactive", "2026-10-30T10:00:00.000Z", "2026-02-09T10:00:00.000Z", [
    se("git-collaboration", 20, "2026-02-10T10:00:00.000Z"),
  ]),
  student(11, "Ayesha Siddiqua", "ayesha.s@gmail.com", "free", "active", "2026-11-24T21:10:00.000Z", "2026-11-02T10:00:00.000Z", [
    se("data-visualization", 15, "2026-11-03T10:00:00.000Z"),
  ]),
  student(12, "Tanvir Chowdhury", "tanvir.c@gmail.com", "teams", "active", "2026-11-25T05:30:00.000Z", "2026-06-15T10:00:00.000Z", [
    se("applied-ml", 63, "2026-06-16T10:00:00.000Z"),
    se("python-data-analysis", 88, "2026-06-16T10:00:00.000Z"),
  ]),
];

export const adminStudents = createCollection<StoredStudent>("bxn-mock-admin-students", seedStudents);

export const findStudent = (id: string) => adminStudents.all().find((s) => s.id === id);

const studentEnrollments = (s: StoredStudent): AdminStudentEnrollment[] => {
  const real = listEnrollments(s.email);
  const list: AdminStudentEnrollment[] = real.length
    ? real.map((e) => ({
        courseId: e.courseId,
        title: courseTitle(e.courseId),
        pct: e.pct,
        enrolledAt: e.enrolledAt,
        source: e.source,
        completedAt: e.completedAt,
      }))
    : s.seedEnrollments.map((e) => ({ ...e, title: courseTitle(e.courseId), source: "free" as const }));
  for (const grant of s.grants) {
    if (!list.some((e) => e.courseId === grant.courseId)) {
      list.push({
        courseId: grant.courseId,
        title: courseTitle(grant.courseId),
        pct: 0,
        enrolledAt: grant.at,
        source: "granted",
        completedAt: null,
      });
    }
  }
  return list;
};

export const studentRow = (s: StoredStudent): AdminStudentRow => {
  const enrollments = studentEnrollments(s);
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    plan: s.plan,
    courses: enrollments.length,
    progress: enrollments.length ? Math.round(enrollments.reduce((n, e) => n + e.pct, 0) / enrollments.length) : 0,
    status: s.status,
    lastActiveAt: s.lastActiveAt,
    joinedAt: s.joinedAt,
  };
};

const same = (a: string | null, b: string) => !!a && a.trim().toLowerCase() === b.trim().toLowerCase();

export const studentDetail = (s: StoredStudent): AdminStudentDetail => {
  const enrollments = studentEnrollments(s);
  return {
    ...studentRow(s),
    enrollments,
    orders: orders.all().filter((o) => same(o.userEmail, s.email)),
    certificates: enrollments.flatMap((e) => (e.completedAt ? [{ courseId: e.courseId, title: e.title, completedAt: e.completedAt }] : [])),
  };
};

export const studentHasCourse = (s: StoredStudent, courseId: string) => studentEnrollments(s).some((e) => e.courseId === courseId);

export const findStudentByEmail = (email: string) => adminStudents.all().find((s) => same(s.email, email));

export const addStudent = (name: string, email: string, plan: StudentPlan): StoredStudent => {
  const max = adminStudents.all().reduce((n, s) => Math.max(n, Number(s.id.slice(4)) || 0), 1000);
  const now = new Date().toISOString();
  const created: StoredStudent = {
    id: `STU-${max + 1}`,
    name,
    email: email.trim().toLowerCase(),
    plan,
    status: "active",
    lastActiveAt: now,
    joinedAt: now,
    grants: [],
    seedEnrollments: [],
  };
  adminStudents.add(created);
  return created;
};

/* ================================================================== */
/* Reviews                                                             */
/* ================================================================== */

const review = (
  n: number,
  who: string,
  courseId: string,
  at: string,
  stars: number,
  text: string,
  reply: string | null = null
): AdminReview => ({
  id: `REV-${300 + n}`,
  who,
  courseId,
  course: COURSES.find((c) => c.id === courseId)?.title ?? courseId,
  at,
  stars,
  text,
  reply,
  hidden: false,
});

const seedReviews = (): AdminReview[] => [
  review(
    1,
    "Mohammad Hasibul Hasan",
    "java-generics",
    "2026-11-25T07:00:00.000Z",
    5,
    "Excellent course. The explanations are clear and practical examples helped me understand Java much faster."
  ),
  review(
    2,
    "Nusrat Jahan",
    "sql-query-to-model",
    "2026-11-24T10:00:00.000Z",
    5,
    "Very useful course. The project-based lessons are my favorite part."
  ),
  review(
    3,
    "Rahim Hasan",
    "modern-javascript",
    "2026-11-22T10:00:00.000Z",
    4,
    "Good content overall. I would love to see more exercises at the end of each module."
  ),
  review(
    4,
    "Sadia Islam",
    "code-smells",
    "2026-11-20T10:00:00.000Z",
    5,
    "Finally understood why long methods hurt. The refactoring demos are gold.",
    "Thank you, Sadia! More refactoring demos are coming in module 3."
  ),
  review(5, "Rifat Hossain", "java-generics", "2026-11-18T10:00:00.000Z", 5, "Wildcards finally make sense. PECS explained perfectly."),
  review(
    6,
    "Tanvir Chowdhury",
    "applied-ml",
    "2026-11-15T10:00:00.000Z",
    4,
    "Solid intro. The evaluation chapter could use one more worked example."
  ),
  review(7, "Farhan Ahmed", "git-collaboration", "2026-11-02T10:00:00.000Z", 3, "Useful, but the rebase lesson went too fast for me."),
];

export const adminReviews = createCollection<AdminReview>("bxn-mock-admin-reviews", seedReviews);

/* ================================================================== */
/* Notes / handbooks                                                   */
/* ================================================================== */

const note = (
  n: number,
  type: AdminNote["type"],
  name: string,
  category: string,
  pages: number,
  updatedAt: string,
  status: AdminNote["status"]
): AdminNote => ({
  id: `NOTE-${100 + n}`,
  type,
  name,
  category,
  pages,
  version: 1,
  updatedAt,
  status,
  fileName: null,
  fileSize: null,
});

const seedNotes = (): AdminNote[] => [
  note(1, "PDF", "Java OOP Complete Notes", "Java", 42, "2026-11-25T06:00:00.000Z", "published"),
  note(2, "PDF", "Spring Security Guide", "Spring Boot", 31, "2026-11-22T06:00:00.000Z", "published"),
  note(3, "DOC", "PostgreSQL Query Cheatsheet", "Database", 18, "2026-11-20T06:00:00.000Z", "draft"),
  note(4, "PDF", "JavaScript ES2026 Notes", "JavaScript", 55, "2026-11-18T06:00:00.000Z", "published"),
  note(5, "PDF", "Docker for Developers", "DevOps", 27, "2026-11-10T06:00:00.000Z", "published"),
];

export const adminNotes = createCollection<AdminNote>("bxn-mock-admin-notes", seedNotes);

/* ================================================================== */
/* Payments                                                            */
/* ================================================================== */

interface PaymentEvent {
  orderId: string;
  at: string;
  label: string;
  detail?: string;
  tone: AdminPaymentEvent["tone"];
}

/** Admin decisions on orders (refunds) — kept here so the shared order shape stays unchanged. */
export const paymentEvents = createCollection<PaymentEvent>("bxn-mock-admin-payment-events", () => []);

export const paymentDetail = (order: OrderRecord): AdminPaymentDetail => {
  const timeline: AdminPaymentEvent[] = [
    { at: order.createdAt, label: "Order placed", detail: `${order.itemTitle} · ${order.method}`, tone: "info" },
  ];
  if (order.status === "failed") timeline.push({ at: order.createdAt, label: "Payment failed", tone: "danger" });
  else if (order.status !== "pending") timeline.push({ at: order.createdAt, label: "Payment confirmed", tone: "success" });
  if (order.refundReason) timeline.push({ at: null, label: "Refund requested by learner", detail: order.refundReason, tone: "warn" });
  for (const e of paymentEvents
    .all()
    .filter((x) => x.orderId === order.id)
    .reverse()) {
    timeline.push({ at: e.at, label: e.label, detail: e.detail, tone: e.tone });
  }
  return { order, timeline };
};

/* ================================================================== */
/* Promos, counts                                                      */
/* ================================================================== */

export const promoRow = (p: Promo, today = new Date()): AdminPromo => ({
  ...p,
  id: p.code,
  status: !p.active
    ? "inactive"
    : p.expiresAt && new Date(`${p.expiresAt}T23:59:59`) < today
      ? "expired"
      : p.usageLimit !== null && p.used >= p.usageLimit
        ? "used_up"
        : "active",
});

export const adminCounts = (): AdminCounts => ({
  pendingSubmissions: submissions.all().filter((s) => s.status === "pending").length,
  openTickets: tickets.all().filter((t) => t.status === "open").length,
  unansweredReviews: adminReviews.all().filter((r) => !r.reply && !r.hidden).length,
});

/** Test helper: back to the admin seed data. */
export const resetMockAdmin = () => {
  adminCourses.reset();
  adminStudents.reset();
  adminReviews.reset();
  adminNotes.reset();
  paymentEvents.reset();
};
