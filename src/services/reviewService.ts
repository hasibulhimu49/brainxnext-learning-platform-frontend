import { api } from "@/api/client";
import type { ReviewValues } from "@/schemas/review";
import type { MyReviewState } from "@/types/course";

/** Course reviews (F-006, provisional endpoints). Public reviews come with GET /courses/:id. */
export const reviewService = {
  mine: (courseId: string) => api.get<MyReviewState>(`/me/reviews/${encodeURIComponent(courseId)}`),
  save: (courseId: string, values: ReviewValues) => api.put<MyReviewState>(`/me/reviews/${encodeURIComponent(courseId)}`, values),
};
