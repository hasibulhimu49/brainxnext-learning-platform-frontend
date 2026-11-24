import { api } from "@/api/client";
import type { ProjectSubmissionValues } from "@/schemas/learner";
import type { Submission } from "@/types/commerce";
import type { CourseProgress, Enrollment, ProgressUpdate } from "@/types/learning";

const enc = encodeURIComponent;

/** Enrolment, lesson progress and project submissions. PROVISIONAL endpoints (mock only until the backend docs arrive). */
export const learningService = {
  enroll: (courseId: string) => api.post<Enrollment>(`/courses/${enc(courseId)}/enroll`),
  enrollments: () => api.get<Enrollment[]>("/me/enrollments"),
  progress: (courseId: string) => api.get<CourseProgress>(`/me/progress/${enc(courseId)}`),
  updateProgress: (courseId: string, update: ProgressUpdate) => api.put<CourseProgress>(`/me/progress/${enc(courseId)}`, update),
  submissions: () => api.get<Submission[]>("/me/submissions"),
  submitProject: (courseId: string, values: ProjectSubmissionValues) => api.post<Submission>("/me/submissions", { courseId, ...values }),
};
