import type { CourseDetail } from "@/types/course";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { COURSES, COURSE_OUTCOMES, CURRICULUM, findCourse, JAVA_GENERICS_DESCRIPTION } from "../db/courses";
import { TOTAL_LESSONS } from "../db/learning";
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
        description: course.id === "java-generics" ? JAVA_GENERICS_DESCRIPTION : course.blurb,
        outcomes: COURSE_OUTCOMES,
        curriculum: CURRICULUM,
        totalLessons: TOTAL_LESSONS,
        reviews: publicReviews(course.id),
      };
      return ok(detail);
    },
  },
];
