import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { learningService } from "@/services/learningService";
import { useIsSignedIn } from "@/stores/authStore";
import type { ProjectSubmissionValues } from "@/schemas/learner";
import type { CourseProgress, ProgressUpdate } from "@/types/learning";
import { queryKeys } from "./keys";

/** After enrolling, buying or saving progress, everything derived from enrolments is stale. */
export const invalidateLearning = (qc: QueryClient, courseId: string) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.me.enrollments }),
    qc.invalidateQueries({ queryKey: queryKeys.me.dashboard }),
    qc.invalidateQueries({ queryKey: queryKeys.me.progress(courseId) }),
  ]);

/** The signed-in user's enrolments, newest activity first (disabled for guests). */
export const useEnrollments = () =>
  useQuery({ queryKey: queryKeys.me.enrollments, queryFn: learningService.enrollments, enabled: useIsSignedIn() });

/** Is the signed-in user enrolled in this course? undefined while unknown (loading / guest). */
export const useIsEnrolled = (courseId: string) => {
  const { data } = useEnrollments();
  return data ? data.some((e) => e.courseId === courseId) : undefined;
};

export const useProgress = (courseId: string) =>
  useQuery({ queryKey: queryKeys.me.progress(courseId), queryFn: () => learningService.progress(courseId), enabled: useIsSignedIn() });

export const useEnroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: learningService.enroll,
    onSuccess: (_enrollment, courseId) => invalidateLearning(qc, courseId),
  });
};

/** Save the current lesson / toggle completion, updating the player optimistically. */
export const useUpdateProgress = (courseId: string) => {
  const qc = useQueryClient();
  const key = queryKeys.me.progress(courseId);
  return useMutation({
    mutationFn: (update: ProgressUpdate) => learningService.updateProgress(courseId, update),
    onMutate: async ({ lessonId, completed }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<CourseProgress>(key);
      if (previous) {
        const done = new Set(previous.completed);
        if (completed === true) done.add(lessonId);
        if (completed === false) done.delete(lessonId);
        qc.setQueryData<CourseProgress>(key, { ...previous, completed: [...done], lastLessonId: lessonId });
      }
      return { previous };
    },
    onError: (_error, _update, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSuccess: (progress) => qc.setQueryData(key, progress),
    // finishing the last lesson can issue a certificate (and its notification)
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.me.enrollments }),
        qc.invalidateQueries({ queryKey: queryKeys.me.dashboard }),
        qc.invalidateQueries({ queryKey: queryKeys.me.certificates }),
        qc.invalidateQueries({ queryKey: queryKeys.me.notifications }),
      ]),
  });
};

/** My project submissions, newest first. */
export const useSubmissions = () =>
  useQuery({ queryKey: queryKeys.me.submissions, queryFn: learningService.submissions, enabled: useIsSignedIn() });

export const useSubmitProject = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ProjectSubmissionValues) => learningService.submitProject(courseId, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me.submissions }),
  });
};
