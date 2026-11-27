import type { CourseDetail } from "@/types/course";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { COURSES, findCourse } from "../db/courses";
import { courseContentOf, curriculumOf, totalLessonsOf } from "../db/curricula";
import { fail, ok, type MockRoute } from "../http";
import { publicReviews } from "./reviews";

export const catalogRoutes: MockRoute[] = [
  { method: "GET", path: "/courses", handler: () => ok(COURSES) },
  {
    method: "GET",
    path: "/courses/:id",
    handler: (req) => {
      const course = findCourse(req.params.id);
      if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
      const detail: CourseDetail = {
        ...course,
        ...courseContentOf(course.id, course.blurb),
        curriculum: curriculumOf(course.id),
        totalLessons: totalLessonsOf(course.id),
        reviews: publicReviews(course.id),
      };
      return ok(detail);
    },
  },
];
