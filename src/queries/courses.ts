import { useQuery } from "@tanstack/react-query";
import { handbookSlug } from "@/constants/downloads";
import { courseService } from "@/services/courseService";
import { queryKeys } from "./keys";

export const useCourses = () => useQuery({ queryKey: queryKeys.courses.all, queryFn: courseService.list });

export const useCourse = (id: string) => useQuery({ queryKey: queryKeys.courses.detail(id), queryFn: () => courseService.detail(id) });

export const useHandbooks = () => useQuery({ queryKey: queryKeys.handbooks, queryFn: courseService.handbooks });

/** Display name for a handbook slug ("javascript" → "JavaScript"); the slug itself until the list loads. */
export const useHandbookName = (slug: string | null) => {
  const { data } = useHandbooks();
  if (!slug) return null;
  return data?.find((h) => handbookSlug(h.name) === slug)?.name ?? slug;
};
