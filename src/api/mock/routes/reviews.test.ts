import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/stores/authStore";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
const asAdmin = async () => useAuthStore.getState().setSession(await authService.login("admin@brainxnext.com", "admin12345"));
const TEXT = "Clear explanations and the practice projects really helped.";

describe("course reviews (F-006)", () => {
  beforeEach(asStudent);

  it("lets a learner past 30% post a review that shows on the course page", async () => {
    // seeded: python-data-analysis is 15 of 42 classes (36%) done, with no review yet
    const before = await reviewService.mine("python-data-analysis");
    expect(before).toMatchObject({ canReview: true, review: null, minPct: 30 });
    const after = await reviewService.save("python-data-analysis", { stars: 4, text: TEXT });
    expect(after.review).toMatchObject({ stars: 4, text: TEXT, name: "Mohammad Hasibul Hasan" });
    const course = await courseService.detail("python-data-analysis");
    expect(course.reviews[0]).toMatchObject({ stars: 4, text: TEXT });
  });

  it("asks for 30% first, and only enrolled learners can review", async () => {
    // code-smells is 1 of 12 classes (8%) done
    expect(await reviewService.mine("code-smells")).toMatchObject({ canReview: false, reason: "too_early", progressPct: 8 });
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
