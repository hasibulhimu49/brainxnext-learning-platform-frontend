import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { authService } from "@/services/authService";
import { quizService } from "@/services/quizService";
import { useAuthStore } from "@/stores/authStore";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));

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
