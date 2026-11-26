import { useCourses } from "@/queries/courses";
import { useEnrollments } from "@/queries/learning";
import type { Course } from "@/types/course";
import type { LearningPath } from "@/types/path";

export type StepStatus = "completed" | "in_progress" | "owned" | "not_started";

export interface PathStepView {
  course: Course;
  why: string;
  status: StepStatus;
  /** 0–100 when enrolled */
  pct: number;
}

/** "6h" → 6 */
const hoursOf = (c: Course) => Number.parseInt(c.hours, 10) || 0;

/**
 * A path's steps joined with the catalog and (when signed in) the learner's enrolments (F-008).
 * Server data stays in TanStack Query; this only combines it.
 */
export const usePathSteps = (path: LearningPath | undefined) => {
  const courses = useCourses();
  const enrollments = useEnrollments();
  const byId = new Map((courses.data ?? []).map((c) => [c.id, c]));
  const enrolled = new Map((enrollments.data ?? []).map((e) => [e.courseId, e]));

  const steps: PathStepView[] = (path?.steps ?? []).flatMap((s) => {
    const course = byId.get(s.courseId);
    if (!course) return [];
    const e = enrolled.get(course.id);
    const status: StepStatus = !e ? "not_started" : e.completedAt ? "completed" : e.pct > 0 ? "in_progress" : "owned";
    return [{ course, why: s.why, status, pct: e?.pct ?? 0 }];
  });

  const done = steps.filter((s) => s.status === "completed").length;
  const next = steps.find((s) => s.status !== "completed");
  // paid courses the learner doesn't have yet — what "add to cart" would buy
  const toBuy = steps.filter((s) => !s.course.free && s.status === "not_started").map((s) => s.course);

  return {
    courses,
    steps,
    done,
    next,
    toBuy,
    totalHours: steps.reduce((sum, s) => sum + hoursOf(s.course), 0),
    freeCount: steps.filter((s) => s.course.free).length,
  };
};
