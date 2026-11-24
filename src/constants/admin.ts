import type { AdminCounts, AdminSection } from "@/types/admin";

/** `badge` names the live count (GET /admin/counts) shown next to the item. */
export interface AdminNavItem {
  slug: string;
  label: string;
  icon: string;
  badge?: keyof AdminCounts;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { slug: "", label: "Overview", icon: "space_dashboard" },
  { slug: "courses", label: "Courses", icon: "auto_stories" },
  { slug: "students", label: "Students", icon: "group" },
  { slug: "submissions", label: "Submissions", icon: "assignment_turned_in", badge: "pendingSubmissions" },
  { slug: "reviews", label: "Reviews", icon: "rate_review", badge: "unansweredReviews" },
  { slug: "payments", label: "Payments", icon: "payments" },
  { slug: "promos", label: "Promos", icon: "sell" },
  { slug: "notes", label: "Notes", icon: "description" },
  { slug: "inbox", label: "Inbox", icon: "inbox", badge: "openTickets" },
];

export const OVERVIEW_META = { title: "Overview", sub: "What's happening across BrainXNext" };

export interface SectionMeta {
  crumb: string;
  eyebrow: string;
  title: string;
  desc: string;
  cardTitle: string;
  filter?: string;
  sideTitle?: string;
}

/** Copy and chrome for each admin page (BrainXNext_*_Proper designs). Data comes from the API. */
export const SECTION_META: Record<AdminSection | "submissions" | "promos" | "inbox", SectionMeta> = {
  courses: {
    crumb: "Courses",
    eyebrow: "Learning",
    title: "Courses",
    desc: "Manage courses, lessons, content and publishing.",
    cardTitle: "All courses",
    filter: "Search courses...",
  },
  students: {
    crumb: "Students",
    eyebrow: "Community",
    title: "Students",
    desc: "View learners, enrollment, progress and activity.",
    cardTitle: "Student directory",
    filter: "Search students...",
  },
  reviews: {
    crumb: "Reviews",
    eyebrow: "Feedback",
    title: "Reviews",
    desc: "Monitor learner feedback, ratings and responses.",
    cardTitle: "Recent reviews",
    sideTitle: "Rating breakdown",
  },
  payments: {
    crumb: "Payments",
    eyebrow: "Revenue",
    title: "Payments",
    desc: "Track transactions, revenue, refunds and payment activity.",
    cardTitle: "Transactions",
    filter: "Search transaction...",
  },
  notes: {
    crumb: "Notes",
    eyebrow: "Resources",
    title: "Notes",
    desc: "Manage notes, study resources and downloadable materials.",
    cardTitle: "Recent notes",
    filter: "Search notes...",
    sideTitle: "Popular categories",
  },
  submissions: {
    crumb: "Submissions",
    eyebrow: "Mentoring",
    title: "Project submissions",
    desc: "Review learner projects within 48 hours: approve them or request changes.",
    cardTitle: "Review queue",
    filter: "Search submissions...",
  },
  promos: {
    crumb: "Promos",
    eyebrow: "Revenue",
    title: "Promo codes",
    desc: "Create discount codes for checkout, set limits and expiry dates.",
    cardTitle: "All codes",
    filter: "Search codes...",
  },
  inbox: {
    crumb: "Inbox",
    eyebrow: "Support",
    title: "Inbox",
    desc: "Messages from the contact form. Reply, then close them when they are resolved.",
    cardTitle: "Tickets",
    filter: "Search messages...",
  },
};

export type PillTone = "success" | "info" | "warn" | "danger" | "neutral";

/** Status pill colours (green = done, blue = draft / info, amber = waiting, red = problem). */
export const PILL_TONE: Record<PillTone, string> = {
  success: "bg-[#E9F8EE] text-[#3B9952] dark:bg-success/15 dark:text-success",
  info: "bg-chip text-brand dark:text-brand-light",
  warn: "bg-[#FFF5DB] text-[#A16C00] dark:bg-amber/15 dark:text-amber",
  danger: "bg-[#FDECEA] text-[#C4321A] dark:bg-danger/15 dark:text-danger",
  neutral: "bg-surface2 text-soft",
};

/** Label + tone for every status value the admin screens show. */
export const STATUS_META: Record<string, { label: string; tone: PillTone }> = {
  published: { label: "Published", tone: "success" },
  draft: { label: "Draft", tone: "info" },
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "warn" },
  suspended: { label: "Suspended", tone: "danger" },
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "warn" },
  failed: { label: "Failed", tone: "danger" },
  refund_requested: { label: "Refund requested", tone: "warn" },
  refunded: { label: "Refunded", tone: "neutral" },
  approved: { label: "Approved", tone: "success" },
  changes_requested: { label: "Changes requested", tone: "danger" },
  open: { label: "Open", tone: "warn" },
  replied: { label: "Replied", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
  used_up: { label: "Used up", tone: "neutral" },
  hidden: { label: "Hidden", tone: "neutral" },
  answered: { label: "Answered", tone: "success" },
  needs_reply: { label: "Needs reply", tone: "warn" },
};

/** Review SLA for project submissions. */
export const SUBMISSION_SLA_HOURS = 48;

export const PAGE_SIZE = 10;

export const PLAN_LABEL = { free: "Free", pro: "Pro", teams: "Teams" } as const;
