import { api } from "@/api/client";
import type { LearningPath } from "@/types/path";

/** Learning paths (F-008, provisional endpoints). */
export const pathService = {
  list: () => api.get<LearningPath[]>("/paths"),
  detail: (id: string) => api.get<LearningPath>(`/paths/${id}`),
};
