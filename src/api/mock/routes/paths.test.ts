import { describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { courseService } from "@/services/courseService";
import { pathService } from "@/services/pathService";

describe("learning paths (F-008)", () => {
  it("lists paths whose steps are real catalog courses", async () => {
    const [paths, courses] = await Promise.all([pathService.list(), courseService.list()]);
    expect(paths.map((p) => p.id)).toEqual(["backend-developer", "data-analyst", "ai-engineer", "product-designer"]);
    const ids = new Set(courses.map((c) => c.id));
    expect(paths.flatMap((p) => p.steps).every((s) => ids.has(s.courseId))).toBe(true);
  });

  it("serves one path and 404s an unknown one", async () => {
    await expect(pathService.detail("data-analyst")).resolves.toMatchObject({ title: "Data Analyst" });
    await expect(pathService.detail("nope")).rejects.toMatchObject({ code: API_ERROR_CODES.notFound });
  });
});
