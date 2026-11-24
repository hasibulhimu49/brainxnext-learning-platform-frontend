import type { CourseModule, Lesson } from "@/types/course";

/**
 * Lesson ids are 1-based "<module>-<lesson>" positions in the curriculum, e.g. "3-3" is the third
 * class of module 3. They appear in player URLs (/learn/:courseId/:lessonId) and in progress
 * payloads. Provisional — the backend docs may replace them with real lesson ids.
 */
export const lessonId = (moduleIndex: number, lessonIndex: number) => `${moduleIndex + 1}-${lessonIndex + 1}`;

export interface FlatLesson {
  id: string;
  /** 1-based position in the whole course ("Class 11") */
  number: number;
  moduleIndex: number;
  lessonIndex: number;
  module: CourseModule;
  lesson: Lesson;
}

/** Every lesson of a curriculum in order, with its id. */
export const flattenLessons = (curriculum: CourseModule[]): FlatLesson[] =>
  curriculum
    .flatMap((module, moduleIndex) =>
      module.lessons.map((lesson, lessonIndex) => ({
        id: lessonId(moduleIndex, lessonIndex),
        moduleIndex,
        lessonIndex,
        module,
        lesson,
        number: 0,
      }))
    )
    .map((l, i) => ({ ...l, number: i + 1 }));

/** "21:44" → seconds */
export const durationSeconds = (dur: string) => dur.split(":").reduce((total, part) => total * 60 + (Number.parseInt(part, 10) || 0), 0);

/** 8400 → "2h 20m", 1500 → "25m" */
export const formatDuration = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};
