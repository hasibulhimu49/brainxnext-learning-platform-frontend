import { api } from "@/api/client";
import type { Quiz, QuizResult, QuizScore } from "@/types/quiz";

const enc = encodeURIComponent;

/** Module quizzes (F-007, provisional endpoints). `module` is the 0-based module index. */
export const quizService = {
  quiz: (courseId: string, module: number) => api.get<Quiz>(`/courses/${enc(courseId)}/quizzes/${module}`),
  submit: (courseId: string, module: number, answers: number[]) =>
    api.post<QuizResult>(`/me/quizzes/${enc(courseId)}/${module}`, { answers }),
  scores: (courseId: string) => api.get<QuizScore[]>(`/me/quizzes/${enc(courseId)}`),
};
