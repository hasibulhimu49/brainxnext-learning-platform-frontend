export const COURSE_CATEGORIES = ["Engineering", "Data", "Design", "AI", "Business"] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

/** Material Symbols icon name, e.g. "code" */
export type IconName = string;

/** Anything with a cover: a photo URL, or a CSS gradient fallback */
export interface CoverSource {
  img?: string;
  grad: string;
}

export interface Course extends CoverSource {
  id: string;
  cat: CourseCategory;
  icon: IconName;
  title: string;
  blurb: string;
  level: CourseLevel;
  lessons: number;
  hours: string;
  mentor: string;
  free: boolean;
  /** BDT, whole taka (VAT included); 0 for free courses */
  price: number;
  oldPrice?: number;
  featured?: boolean;
  lang?: string;
}

export interface Lesson {
  title: string;
  dur: string;
  preview?: boolean;
}

export interface CourseModule {
  title: string;
  meta: string;
  lessons: Lesson[];
}

export interface CourseReview {
  stars: number;
  name: string;
  text: string;
  /** F-006: student reviews carry an id, a date and the team's reply */
  id?: string;
  at?: string;
  reply?: string | null;
}

/** GET /me/reviews/:courseId (F-006, provisional) — can the learner review this course, and their review if any. */
export interface MyReviewState {
  review: CourseReview | null;
  canReview: boolean;
  /** why not, when `canReview` is false */
  reason: "not_enrolled" | "too_early" | null;
  /** 0–100 */
  progressPct: number;
  /** % of lessons needed before reviewing */
  minPct: number;
}

export interface CourseDetail extends Course {
  description: string;
  outcomes: string[];
  /** what learners should know / have before starting */
  requirements: string[];
  /** slug of the free handbook that goes with the course (/support?handbook=<slug>), or null */
  handbook: string | null;
  curriculum: CourseModule[];
  totalLessons: number;
  reviews: CourseReview[];
}

export interface Handbook {
  name: string;
  /** simpleicons.org slug */
  logo: string;
  grad: string;
  glow: string;
  meta: string;
}
