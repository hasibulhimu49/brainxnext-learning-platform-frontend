import { api } from "@/api/client";
import type { Course, CourseDetail, Handbook } from "@/types/course";

export const courseService = {
  list: () => api.get<Course[]>("/courses"),
  detail: (id: string) => api.get<CourseDetail>(`/courses/${encodeURIComponent(id)}`),
  handbooks: () => api.get<Handbook[]>("/handbooks"),
};
