import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/types/course";

/** Filter chips on the home page and catalog */
export const CATEGORY_FILTERS = ["All", ...COURSE_CATEGORIES] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export const LEVEL_FILTERS = ["All levels", ...COURSE_LEVELS] as const;
export type LevelFilter = (typeof LEVEL_FILTERS)[number];

/** Courses shown in the home page grid */
export const HOME_COURSE_LIMIT = 11;
