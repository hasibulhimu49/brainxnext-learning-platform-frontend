import type { AdminSection } from "@/types/admin";

/** Every TanStack Query key in the app — keep them here so invalidation stays consistent. */
export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", id] as const,
  },
  handbooks: ["handbooks"] as const,
  /** everything under "me" belongs to the signed-in user */
  me: {
    all: ["me"] as const,
    dashboard: ["me", "dashboard"] as const,
    profile: ["me", "profile"] as const,
    enrollments: ["me", "enrollments"] as const,
    progress: (courseId: string) => ["me", "progress", courseId] as const,
    // F-002 Phase 2
    subscription: ["me", "subscription"] as const,
    orders: ["me", "orders"] as const,
    order: (id: string) => ["me", "orders", id] as const,
    certificates: ["me", "certificates"] as const,
    myCertificate: (id: string) => ["me", "certificates", id] as const,
    submissions: ["me", "submissions"] as const,
    notifications: ["me", "notifications"] as const,
    preferences: ["me", "preferences"] as const,
    // F-006 / F-007
    review: (courseId: string) => ["me", "reviews", courseId] as const,
    quizzes: (courseId: string) => ["me", "quizzes", courseId] as const,
  },
  certificate: (id: string) => ["certificates", id] as const,
  /** F-007: questions for one module quiz (no answers) */
  quiz: (courseId: string, module: number) => ["quiz", courseId, module] as const,
  /** F-008 */
  paths: {
    all: ["paths"] as const,
    detail: (id: string) => ["paths", id] as const,
  },
  admin: {
    all: ["admin"] as const,
    overview: ["admin", "overview"] as const,
    counts: ["admin", "counts"] as const,
    /** list + detail share a prefix, so invalidating `section(...)` refreshes both */
    section: (section: AdminSection | "submissions" | "promos" | "tickets") => ["admin", section] as const,
    detail: (section: AdminSection | "submissions" | "tickets", id: string) => ["admin", section, id] as const,
  },
};
