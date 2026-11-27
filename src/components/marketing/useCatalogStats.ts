import { useMemo } from "react";
import { useCourses } from "@/queries/courses";
import type { Course } from "@/types/course";

export interface CatalogStats {
  total: number;
  free: number;
  tracks: number;
  mentors: number;
  /** courses per mentor name */
  byMentor: Record<string, number>;
}

export const catalogStats = (courses: Course[]): CatalogStats => {
  const byMentor: Record<string, number> = {};
  for (const c of courses) byMentor[c.mentor] = (byMentor[c.mentor] ?? 0) + 1;
  return {
    total: courses.length,
    free: courses.filter((c) => c.free).length,
    tracks: new Set(courses.map((c) => c.cat)).size,
    mentors: Object.keys(byMentor).length,
    byMentor,
  };
};

/**
 * Marketing numbers (course / free / track counts) computed from the catalog query, so copy never
 * disagrees with /courses. `null` until the catalog loads — callers then phrase copy without a number.
 */
const useCatalogStats = (): CatalogStats | null => {
  const { data } = useCourses();
  return useMemo(() => (data ? catalogStats(data) : null), [data]);
};

export default useCatalogStats;
