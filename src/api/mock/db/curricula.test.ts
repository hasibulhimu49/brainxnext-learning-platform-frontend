import { describe, expect, it } from "vitest";
import { durationSeconds } from "@/lib/lessons";
import { accountService } from "@/services/accountService";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { learningService } from "@/services/learningService";
import { quizService } from "@/services/quizService";
import { useAuthStore } from "@/stores/authStore";
import { COURSES, CURRICULUM } from "./courses";
import { courseContentOf, curriculumOf, lessonIdsOf } from "./curricula";
import { quizFor } from "./quizzes";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));

describe("per-course curricula (mock)", () => {
  it("keeps Generics in Java exactly as designed", () => {
    expect(curriculumOf("java-generics")).toBe(CURRICULUM);
  });

  it.each(COURSES.map((c) => [c.id, c] as const))("%s has its own outline matching its size", (id, course) => {
    const curriculum = curriculumOf(id);
    const lessons = curriculum.flatMap((m) => m.lessons);
    expect(lessons).toHaveLength(course.lessons);
    expect(new Set(lessons.map((l) => l.title)).size).toBe(lessons.length);
    // within 10% of the advertised hours
    const hours = lessons.reduce((sum, l) => sum + durationSeconds(l.dur), 0) / 3600;
    expect(Math.abs(hours - Number.parseFloat(course.hours)) / Number.parseFloat(course.hours)).toBeLessThan(0.1);
    expect(lessons[0]?.preview).toBe(true);
    const content = courseContentOf(id, course.blurb);
    expect(content.outcomes.length).toBeGreaterThan(0);
    expect(content.requirements.length).toBeGreaterThan(0);
    // a quiz with distinct options for every module
    curriculum.forEach((_, m) => {
      const bank = quizFor(id, m);
      expect(bank?.length).toBe(4);
      for (const q of bank ?? []) expect(new Set(q.options).size).toBe(q.options.length);
    });
    expect(quizFor(id, curriculum.length)).toBeUndefined();
  });

  it("serves the course's own curriculum and content", async () => {
    const detail = await courseService.detail("code-smells");
    expect(detail.totalLessons).toBe(12);
    expect(detail.curriculum[0]?.title).toBe("What Smells Mean");
    expect(detail.outcomes).not.toEqual((await courseService.detail("java-generics")).outcomes);
    expect(detail.handbook).toBe("java");
  });

  it("re-maps the seeded progress per course and builds the dashboard from it", async () => {
    await asStudent();
    const enrollments = await learningService.enrollments();
    expect(enrollments.find((e) => e.courseId === "code-smells")).toMatchObject({ completedLessons: 1, totalLessons: 12, pct: 8 });
    expect(enrollments.find((e) => e.courseId === "sql-query-to-model")).toMatchObject({ totalLessons: 34, pct: 100 });
    const dashboard = await accountService.dashboard();
    expect(dashboard.myCourses.find((c) => c.courseId === "code-smells")?.meta).toMatch(/^Class 2 of 12 · /);
  });

  it("rejects lesson ids the course doesn't have", async () => {
    await asStudent();
    const last = lessonIdsOf("code-smells").at(-1) ?? "";
    await expect(learningService.updateProgress("code-smells", { lessonId: last, completed: true })).resolves.toBeTruthy();
    await expect(learningService.updateProgress("code-smells", { lessonId: "6-1", completed: true })).rejects.toMatchObject({
      status: 422,
    });
  });

  it("a fresh enrolment is not started yet", async () => {
    await asStudent();
    await learningService.enroll("product-analytics");
    const dashboard = await accountService.dashboard();
    expect(dashboard.myCourses.find((c) => c.courseId === "product-analytics")).toMatchObject({ started: false, pct: 0 });
    expect(dashboard.myCourses.find((c) => c.courseId === "code-smells")).toMatchObject({ started: true });
  });

  it("tells the quiz how many modules the course has", async () => {
    await asStudent();
    await expect(quizService.quiz("python-data-analysis", 5)).resolves.toMatchObject({ moduleCount: 6, moduleTitle: "Capstone Analysis" });
    await expect(quizService.quiz("python-data-analysis", 6)).rejects.toMatchObject({ status: 404 });
  });
});
