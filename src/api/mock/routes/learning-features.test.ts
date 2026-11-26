import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { pathService } from "@/services/pathService";
import { quizService } from "@/services/quizService";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/stores/authStore";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
const asAdmin = async () => useAuthStore.getState().setSession(await authService.login("admin@brainxnext.com", "admin12345"));
const TEXT = "Clear explanations and the practice projects really helped.";

describe("course reviews (F-006)", () => {
  beforeEach(asStudent);

  it("lets a learner past 30% post a review that shows on the course page", async () => {
    // seeded: python-data-analysis is 35% done, with no review yet
    const before = await reviewService.mine("python-data-analysis");
    expect(before).toMatchObject({ canReview: true, review: null, minPct: 30 });
    const after = await reviewService.save("python-data-analysis", { stars: 4, text: TEXT });
    expect(after.review).toMatchObject({ stars: 4, text: TEXT, name: "Mohammad Hasibul Hasan" });
    const course = await courseService.detail("python-data-analysis");
    expect(course.reviews[0]).toMatchObject({ stars: 4, text: TEXT });
  });

  it("asks for 30% first, and only enrolled learners can review", async () => {
    // code-smells is 6% done
    expect(await reviewService.mine("code-smells")).toMatchObject({ canReview: false, reason: "too_early", progressPct: 6 });
    await expect(reviewService.save("code-smells", { stars: 5, text: TEXT })).rejects.toMatchObject({
      code: API_ERROR_CODES.reviewTooEarly,
    });
    expect(await reviewService.mine("applied-ml")).toMatchObject({ canReview: false, reason: "not_enrolled" });
    await expect(reviewService.save("applied-ml", { stars: 5, text: TEXT })).rejects.toMatchObject({ code: API_ERROR_CODES.notEnrolled });
  });

  it("edits the existing review instead of adding a second one", async () => {
    const mine = await reviewService.mine("java-generics");
    expect(mine.review?.stars).toBe(5);
    await reviewService.save("java-generics", { stars: 3, text: TEXT });
    const course = await courseService.detail("java-generics");
    expect(course.reviews.filter((r) => r.name === "Mohammad Hasibul Hasan")).toEqual([expect.objectContaining({ stars: 3, text: TEXT })]);
  });

  it("hides a review from the course page when the admin hides it", async () => {
    const saved = await reviewService.save("python-data-analysis", { stars: 2, text: TEXT });
    await asAdmin();
    await adminService.updateReview(saved.review?.id ?? "", { hidden: true });
    const course = await courseService.detail("python-data-analysis");
    expect(course.reviews.some((r) => r.id === saved.review?.id)).toBe(false);
  });

  it("validates the rating and the text", async () => {
    await expect(reviewService.save("python-data-analysis", { stars: 0, text: "short" })).rejects.toMatchObject({
      code: API_ERROR_CODES.validation,
    });
  });
});

describe("module quizzes (F-007)", () => {
  beforeEach(asStudent);

  it("sends questions without the answers", async () => {
    const quiz = await quizService.quiz("java-generics", 1);
    expect(quiz).toMatchObject({ module: 1, moduleTitle: "Bounded Types", passPct: 70 });
    expect(quiz.questions).toHaveLength(4);
    expect(JSON.stringify(quiz)).not.toContain("answer");
    expect(JSON.stringify(quiz)).not.toContain("explanation");
  });

  it("grades a submission, explains every answer and keeps the best score", async () => {
    const fail = await quizService.submit("java-generics", 1, [0, 0, 0, 0]);
    expect(fail).toMatchObject({ score: 0, total: 4, passed: false });
    expect(fail.results[0]).toMatchObject({ correct: false, correctIndex: 1 });
    expect(fail.results[0]?.explanation).toBeTruthy();

    const pass = await quizService.submit("java-generics", 1, [1, 1, 1, 1]);
    expect(pass).toMatchObject({ score: 4, passed: true, best: 4 });
    await quizService.submit("java-generics", 1, [0, 0, 0, 0]);

    const scores = await quizService.scores("java-generics");
    expect(scores.find((s) => s.module === 1)).toMatchObject({ best: 4, passed: true, attempts: 3 });
    // seeded: module 1 already passed
    expect(scores.find((s) => s.module === 0)).toMatchObject({ passed: true });
  });

  it("needs an enrolment and a full set of answers", async () => {
    await expect(quizService.quiz("applied-ml", 0)).rejects.toMatchObject({ code: API_ERROR_CODES.notEnrolled });
    await expect(quizService.submit("java-generics", 0, [1])).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
    await expect(quizService.quiz("java-generics", 9)).rejects.toMatchObject({ code: API_ERROR_CODES.notFound });
  });
});

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
