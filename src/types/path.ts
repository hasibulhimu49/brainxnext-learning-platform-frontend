/** Learning paths (F-008). Provisional shapes for the mock endpoints GET /paths and GET /paths/:id. */

export interface PathStep {
  courseId: string;
  /** one line on why this course comes at this point */
  why: string;
}

export interface LearningPath {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  grad: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  outcomes: string[];
  steps: PathStep[];
}
