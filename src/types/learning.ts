/*
 * Enrolment and lesson progress. PROVISIONAL: these shapes come from the mock API
 * (src/api/mock/routes/learner.ts) until the backend docs arrive — see docs/project/api-guidelines.md.
 * Lesson ids follow src/lib/lessons.ts ("<module>-<lesson>", 1-based).
 */

/** free course · bought outright · unlocked by an active Pro plan */
export type EnrollmentSource = "free" | "purchase" | "pro";

/** GET /me/enrollments item, POST /courses/:id/enroll response */
export interface Enrollment {
  courseId: string;
  source: EnrollmentSource;
  /** ISO timestamp */
  enrolledAt: string;
  /** ISO timestamp of the last progress update (the list is sorted by it, newest first) */
  lastActivityAt: string;
  completedLessons: number;
  totalLessons: number;
  /** 0–100 */
  pct: number;
  lastLessonId: string | null;
  /** ISO timestamp, set when every lesson is complete */
  completedAt: string | null;
}

/** GET|PUT /me/progress/:courseId */
export interface CourseProgress {
  courseId: string;
  enrolled: boolean;
  /** completed lesson ids */
  completed: string[];
  lastLessonId: string | null;
}

/** PUT /me/progress/:courseId body: makes `lessonId` the last lesson, and sets its completion when given */
export interface ProgressUpdate {
  lessonId: string;
  completed?: boolean;
}
