import type { CoverSource, IconName } from "./course";

export interface DashboardStat {
  icon: IconName;
  grad: string;
  value: string;
  label: string;
}

export interface EnrolledCourse extends CoverSource {
  courseId: string;
  title: string;
  icon: IconName;
  pct: number;
  meta: string;
}

export interface WeekDay {
  label: string;
  min: number;
  today?: boolean;
}

export interface EarnedCertificate {
  /** certificate id, for /certificates/:id */
  id: string;
  title: string;
  earned: string;
}

export interface Recommendation extends CoverSource {
  to: string;
  title: string;
  icon: IconName;
  sub: string;
}

export interface ContinueLearning extends CoverSource {
  courseId: string;
  title: string;
  /** player lesson id to resume (see src/lib/lessons.ts) */
  lessonId: string;
  lesson: string;
  lessonNumber: number;
  pct: number;
}

/** Built from the signed-in user's enrolments; a new user gets empty lists and `continueLearning: null`. */
export interface DashboardData {
  streakDays: number;
  stats: DashboardStat[];
  continueLearning: ContinueLearning | null;
  myCourses: EnrolledCourse[];
  week: WeekDay[];
  weekTotal: string;
  certificates: EarnedCertificate[];
  recommended: Recommendation[];
}
