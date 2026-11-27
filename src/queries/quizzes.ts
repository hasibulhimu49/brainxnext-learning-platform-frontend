import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/services/quizService";
import { useIsSignedIn } from "@/stores/authStore";
import { queryKeys } from "./keys";

/** One module quiz; pass `enabled: false` for an invalid module index so nothing is requested. */
export const useQuiz = (courseId: string, module: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.quiz(courseId, module),
    queryFn: () => quizService.quiz(courseId, module),
    enabled: enabled && !!courseId && Number.isInteger(module) && module >= 0,
    retry: false,
  });

/** Best score per module for the curriculum sidebar. */
export const useQuizScores = (courseId: string) =>
  useQuery({ queryKey: queryKeys.me.quizzes(courseId), queryFn: () => quizService.scores(courseId), enabled: useIsSignedIn() });

export const useSubmitQuiz = (courseId: string, module: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: number[]) => quizService.submit(courseId, module, answers),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me.quizzes(courseId) }),
  });
};
