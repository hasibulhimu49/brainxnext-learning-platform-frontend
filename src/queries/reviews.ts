import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReviewValues } from "@/schemas/review";
import { reviewService } from "@/services/reviewService";
import { useIsSignedIn } from "@/stores/authStore";
import { queryKeys } from "./keys";

/** Can the signed-in learner review this course, and their review if any (F-006). */
export const useMyReview = (courseId: string) =>
  useQuery({ queryKey: queryKeys.me.review(courseId), queryFn: () => reviewService.mine(courseId), enabled: useIsSignedIn() });

/** Post or edit the learner's review; the course page and the admin reviews list refresh. */
export const useSaveReview = (courseId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ReviewValues) => reviewService.save(courseId, values),
    onSuccess: (state) => {
      qc.setQueryData(queryKeys.me.review(courseId), state);
      return Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) }),
        qc.invalidateQueries({ queryKey: queryKeys.admin.all }),
      ]);
    },
  });
};
