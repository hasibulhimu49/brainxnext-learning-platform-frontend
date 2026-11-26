import type { CourseDraftValues } from "@/schemas/course";
import type { OrderRecord, Promo } from "./commerce";
import type { IconName } from "./course";
import type { EnrollmentSource } from "./learning";

/*
 * Admin API contracts. PROVISIONAL: these shapes come from the mock API (src/api/mock/routes/admin.ts)
 * until the backend docs arrive — see docs/project/api-guidelines.md ("Admin (Phase 3)").
 * Every row type carries a stable `id`.
 */

export const ADMIN_SECTIONS = ["courses", "students", "reviews", "payments", "notes"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/* ---------------- overview ---------------- */

export interface OverviewKpi {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  delta: string;
  up: boolean;
}

export interface TopCourse {
  name: string;
  count: string;
  pct: number;
  gold?: boolean;
}

export interface ActivityItem {
  who: string;
  what: string;
  when: string;
  icon: IconName;
  bg: string;
}

export interface AdminOverview {
  kpis: OverviewKpi[];
  revenue: number[];
  topCourses: TopCourse[];
  activity: ActivityItem[];
}

/* ---------------- shared ---------------- */

export interface SectionStat {
  label: string;
  value: string;
  trend: string;
}

export interface LabelValue {
  label: string;
  value: string | number;
}

/** Every admin list endpoint returns its stat strip plus its rows (pagination is client-side). */
export interface AdminList<R> {
  stats: SectionStat[];
  rows: R[];
}

/** Sidebar badges. GET /admin/counts */
export interface AdminCounts {
  pendingSubmissions: number;
  openTickets: number;
  unansweredReviews: number;
}

/* ---------------- courses ---------------- */

export type AdminCourseStatus = "published" | "draft";

export interface AdminCourseRow {
  id: string;
  title: string;
  track: string;
  modules: number;
  students: number;
  rating: number;
  /** average completion, 0–100 */
  completion: number;
  status: AdminCourseStatus;
  /** ISO timestamp */
  updatedAt: string;
}

export interface AdminCourseEnrollment {
  studentId: string;
  name: string;
  email: string;
  enrolledAt: string;
  pct: number;
}

/** GET /admin/courses/:id */
export interface AdminCourseDetail extends AdminCourseRow {
  /** whole taka from paid course orders */
  revenue: number;
  /** the editor's form values, so /edit can load them as-is */
  draft: CourseDraftValues;
  recentEnrollments: AdminCourseEnrollment[];
}

/** PATCH /admin/courses/:id body — either field may be sent alone */
export interface AdminCoursePatch {
  course?: CourseDraftValues;
  status?: AdminCourseStatus;
}

/* ---------------- students ---------------- */

export type AdminStudentStatus = "active" | "inactive" | "suspended";
export type StudentPlan = "free" | "pro" | "teams";

export interface AdminStudentRow {
  id: string;
  name: string;
  email: string;
  plan: StudentPlan;
  courses: number;
  /** average progress over enrolments, 0–100 */
  progress: number;
  status: AdminStudentStatus;
  lastActiveAt: string;
  joinedAt: string;
}

export interface AdminStudentEnrollment {
  courseId: string;
  title: string;
  pct: number;
  enrolledAt: string;
  source: EnrollmentSource | "granted";
  completedAt: string | null;
}

/** GET /admin/students/:id */
export interface AdminStudentDetail extends AdminStudentRow {
  enrollments: AdminStudentEnrollment[];
  orders: OrderRecord[];
  certificates: { courseId: string; title: string; completedAt: string }[];
}

/* ---------------- reviews ---------------- */

export interface AdminReview {
  id: string;
  who: string;
  courseId: string;
  course: string;
  at: string;
  stars: number;
  text: string;
  reply: string | null;
  hidden: boolean;
  /** the reviewer's account (F-006); seed reviews from before may not have one */
  userEmail?: string;
}

export interface AdminReviewList extends AdminList<AdminReview> {
  breakdown: LabelValue[];
}

/* ---------------- notes / handbooks ---------------- */

export type AdminNoteStatus = "published" | "draft";

export interface AdminNote {
  id: string;
  type: "PDF" | "DOC";
  name: string;
  category: string;
  pages: number;
  version: number;
  updatedAt: string;
  status: AdminNoteStatus;
  fileName: string | null;
  /** bytes */
  fileSize: number | null;
}

export interface AdminNoteList extends AdminList<AdminNote> {
  categories: LabelValue[];
}

/* ---------------- payments ---------------- */

export interface AdminPaymentEvent {
  /** null when the time is unknown (e.g. a learner refund request) */
  at: string | null;
  label: string;
  detail?: string;
  tone: "success" | "info" | "warn" | "danger";
}

/** GET /admin/payments/:id */
export interface AdminPaymentDetail {
  order: OrderRecord;
  timeline: AdminPaymentEvent[];
}

/* ---------------- promos, submissions, tickets ---------------- */

export type PromoStatus = "active" | "inactive" | "expired" | "used_up";

export interface AdminPromo extends Promo {
  /** = code */
  id: string;
  status: PromoStatus;
}

export type SubmissionDecision = "approved" | "changes_requested";
