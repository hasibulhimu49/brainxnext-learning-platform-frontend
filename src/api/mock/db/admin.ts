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
import { COURSES, HANDBOOKS } from "./courses";
import { curriculumOf } from "./curricula";
import { formatTaka } from "@/lib/utils";
import { timeAgoGB } from "@/lib/dates";
import { listEnrollments } from "./learning";
import { createCollection } from "./store";

const g = (a: string, b: string) => `linear-gradient(135deg,${a},${b})`;

/* Overview — derived from the same students and orders the Students and Payments sections show. */

const counted = (o: OrderRecord) => o.status === "paid" || o.status === "refund_requested";

/** "+12%" / "-3%"; a rise from nothing is "+100%". */
const change = (current: number, previous: number) => {
  const pct = previous ? Math.round(((current - previous) / previous) * 100) : current ? 100 : 0;
  return { delta: `${pct >= 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
};

const monthKey = (d: Date) => d.toISOString().slice(0, 7);

/** ৳1,25,000 → "৳1.3L", ৳42,500 → "৳42.5K" */
const shortTaka = (n: number) =>
  n >= 100_000 ? `৳${(n / 100_000).toFixed(1)}L` : n >= 1000 ? `৳${(n / 1000).toFixed(1)}K` : `৳${n.toLocaleString("en-IN")}`;

export const buildOverview = (now = new Date()): AdminOverview => {
  const thisMonth = monthKey(now);
  const lastMonth = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)));
  const monthName = now.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

  const students = adminStudents.all();
  const rows = students.map(studentRow);
  const joinedBefore = (month: string) => students.filter((s) => s.joinedAt.slice(0, 7) < month).length;
  const pro = students.filter((s) => s.plan === "pro");
  const proBefore = pro.filter((s) => s.joinedAt.slice(0, 7) < thisMonth).length;
  const learning = rows.filter((r) => r.courses > 0);
  const avgCompletion = learning.length ? Math.round(learning.reduce((sum, r) => sum + r.progress, 0) / learning.length) : 0;

  const paid = orders.all().filter(counted);
  const revenueIn = (month: string) => paid.filter((o) => o.createdAt.startsWith(month)).reduce((sum, o) => sum + o.total, 0);
  const revenueNow = revenueIn(thisMonth);

  // last 8 weeks, oldest first, in ৳ thousand
  const weekMs = 7 * 86_400_000;
  const revenue = Array.from({ length: 8 }, (_, i) => {
    const to = now.getTime() - (7 - i) * weekMs;
    const from = to - weekMs;
    const sum = paid.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t > from && t <= to;
    });
    return Math.round(sum.reduce((s, o) => s + o.total, 0) / 100) / 10;
  });

  // enrollments per course across the student list
  const enrolledCount = new Map<string, number>();
  for (const s of students) for (const e of studentEnrollments(s)) enrolledCount.set(e.courseId, (enrolledCount.get(e.courseId) ?? 0) + 1);
  const ranked = [...enrolledCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const top = ranked[0]?.[1] ?? 1;

  const activity = [
    ...paid.map((o) => ({
      at: o.createdAt,
      who: o.userName,
      what:
        o.kind === "plan"
          ? `upgraded to Pro (${o.cycle ?? "monthly"})`
          : o.kind === "donation"
            ? `supported BrainXNext (${formatTaka(o.total)})`
            : `bought ${o.itemTitle} (${formatTaka(o.total)} via ${o.method})`,
      icon: o.kind === "plan" ? "workspace_premium" : "payments",
      bg: o.kind === "plan" ? g("#E9A21B", "#F2BC4B") : g("#3FA457", "#5DBE74"),
    })),
    ...submissions.all().map((s) => ({
      at: s.submittedAt,
      who: s.userName,
      what: `submitted “${s.title}” in ${s.courseTitle}`,
      icon: "assignment_turned_in",
      bg: g("#1B6FD0", "#3E92E8"),
    })),
    ...adminReviews.all().map((r) => ({
      at: r.at,
      who: r.who,
      what: `reviewed ${r.course} (${r.stars}★)`,
      icon: "star",
      bg: g("#0E97B0", "#2FB8CF"),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5)
    .map(({ at, ...item }) => ({ ...item, when: timeAgoGB(at, now.getTime()) }));

  return {
    kpis: [
      {
        label: "Total students",
        value: students.length.toLocaleString("en-IN"),
        icon: "group",
        color: "#1B6FD0",
        ...change(students.length, joinedBefore(thisMonth)),
      },
      {
        label: `Revenue (${monthName})`,
        value: shortTaka(revenueNow),
        icon: "payments",
        color: "#3FA457",
        ...change(revenueNow, revenueIn(lastMonth)),
      },
      {
        label: "Pro subscribers",
        value: pro.length.toLocaleString("en-IN"),
        icon: "workspace_premium",
        color: "#E9A21B",
        ...change(pro.length, proBefore),
      },
      {
        label: "Avg. completion",
        value: `${avgCompletion}%`,
        icon: "task_alt",
        color: "#0E97B0",
        delta: String(learning.length),
        up: true,
        note: learning.length === 1 ? "learner with a course" : "learners with a course",
      },
    ],
    revenue,
    topCourses: ranked.map(([id, count], i) => ({
      name: courseTitle(id),
      count: i === 0 ? `${count} enrolled` : String(count),
      pct: Math.round((count / top) * 100),
      ...(COURSES.find((c) => c.id === id)?.free === false ? { gold: true } : {}),
    })),
    activity,
  };
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
        modules: curriculumOf(c.id).map((m) => ({ title: m.title, lessons: m.lessons.map((l) => ({ title: l.title, dur: l.dur })) })),
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

/** What one order earned for course `id`: a course order's total, or a cart line's share of the cart total. */
const revenueFor = (o: OrderRecord, id: string) => {
  if (o.kind === "course") return o.itemId === id ? o.total : 0;
  if (o.kind !== "cart") return 0;
  const item = o.items?.find((i) => i.courseId === id);
  if (!item) return 0;
  // the order-level promo is split over the lines in proportion to their price
  return o.subtotal > 0 ? Math.round((item.price / o.subtotal) * o.total) : 0;
};

/** Paid course and cart orders count as revenue; refunded ones do not. */
export const courseRevenue = (id: string) =>
  orders
    .all()
    .filter(counted)
    .reduce((sum, o) => sum + revenueFor(o, id), 0);

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
  /** courses an admin granted (provisional — the real enrollment would be created by the backend) */
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
  {
    ...review(
      1,
      "Mohammad Hasibul Hasan",
      "java-generics",
      "2026-11-25T07:00:00.000Z",
      5,
      "Excellent course. The explanations are clear and practical examples helped me understand Java much faster."
    ),
    userEmail: "hasibulx26@gmail.com",
  },
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** One note per public handbook (the /notes page), so both lists show the same files. "62 pages · updated Aug 2026" → 62, 2026-08-01. */
const seedNotes = (): AdminNote[] =>
  HANDBOOKS.map((h, i) => {
    const pages = Number(/(\d+) pages/.exec(h.meta)?.[1] ?? 0);
    const [, month = "Jan", year = "2026"] = /updated (\w+) (\d{4})/.exec(h.meta) ?? [];
    const at = new Date(Date.UTC(Number(year), Math.max(0, MONTHS.indexOf(month)), 1, 6)).toISOString();
    return note(i + 1, "PDF", `${h.name} Handbook`, h.name, pages, at, "published");
  });

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
