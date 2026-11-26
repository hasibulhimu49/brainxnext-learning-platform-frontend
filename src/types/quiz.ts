/**
 * Module quizzes (F-007). Provisional shapes for the mock endpoints — replace with the backend contract.
 * Questions come without answers; the server grades a submission and returns the explanations.
 */

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** optional code snippet shown under the prompt */
  code?: string;
  options: string[];
}

export interface Quiz {
  courseId: string;
  /** 0-based module index */
  module: number;
  moduleTitle: string;
  questions: QuizQuestion[];
  /** % correct needed to pass */
  passPct: number;
}

export interface QuizAnswerResult {
  questionId: string;
  chosen: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  module: number;
  score: number;
  total: number;
  passed: boolean;
  passPct: number;
  results: QuizAnswerResult[];
  /** best score so far, including this attempt */
  best: number;
}

/** GET /me/quizzes/:courseId — the learner's best attempt per module (modules never tried are absent). */
export interface QuizScore {
  module: number;
  best: number;
  total: number;
  passed: boolean;
  attempts: number;
  lastAt: string;
}
