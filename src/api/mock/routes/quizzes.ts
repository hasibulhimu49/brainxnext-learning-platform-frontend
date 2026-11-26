import type { Quiz, QuizResult, QuizScore } from "@/types/quiz";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { CURRICULUM } from "../db/courses";
import { findEnrollment } from "../db/learning";
import { QUIZ_BANK, QUIZ_PASS_PCT, quizScores } from "../db/quizzes";
import { bodyOf, fail, ok, type MockRequest, type MockRoute } from "../http";
import { findCourse } from "../db/courses";
import { invalid, requireUser, unauthorized } from "./shared";

/*
 * Module quizzes (F-007, PROVISIONAL). Questions go out without answers; the mock grades a
 * submission, keeps the best attempt per learner + module, and returns explanations.
 * Optional practice: certificates still only need every lesson complete.
 */

/** Signed-in, enrolled, valid module — or the error response. */
const guard = (req: MockRequest) => {
  const user = requireUser(req);
  if (!user) return { error: unauthorized() };
  const course = findCourse(req.params.courseId);
  const module = Number(req.params.module);
  if (!course || !Number.isInteger(module) || !QUIZ_BANK[module]) return { error: fail(404, CODES.notFound, "That quiz doesn't exist.") };
  if (!findEnrollment(user.email, course.id)) return { error: fail(403, CODES.notEnrolled, "Enrol in this course to take its quizzes.") };
  return { user, course, module, bank: QUIZ_BANK[module] };
};

const getQuiz = (req: MockRequest) => {
  const g = guard(req);
  if (g.error) return g.error;
  const quiz: Quiz = {
    courseId: g.course.id,
    module: g.module,
    moduleTitle: CURRICULUM[g.module]?.title ?? `Module ${g.module + 1}`,
    passPct: QUIZ_PASS_PCT,
    questions: g.bank.map(({ id, prompt, code, options }) => ({ id, prompt, code, options })),
  };
  return ok(quiz);
};

const submit = (req: MockRequest) => {
  const g = guard(req);
  if (g.error) return g.error;
  const answers = bodyOf(req).answers;
  if (!Array.isArray(answers) || answers.length !== g.bank.length || answers.some((a) => typeof a !== "number")) {
    return invalid([{ path: ["answers"], message: "Answer every question" }]);
  }
  const results = g.bank.map((q, i) => {
    const chosen = answers[i] as number;
    return { questionId: q.id, chosen, correctIndex: q.answer, correct: chosen === q.answer, explanation: q.explanation };
  });
  const score = results.filter((r) => r.correct).length;
  const total = g.bank.length;
  const passed = (score / total) * 100 >= QUIZ_PASS_PCT;

  const match = (s: { email: string; courseId: string; module: number }) =>
    s.email === g.user.email && s.courseId === g.course.id && s.module === g.module;
  const prev = quizScores.all().find(match);
  const lastAt = new Date().toISOString();
  if (prev) {
    quizScores.update(match, (s) => ({
      ...s,
      best: Math.max(s.best, score),
      passed: s.passed || passed,
      attempts: s.attempts + 1,
      lastAt,
    }));
  } else {
    quizScores.add({ email: g.user.email, courseId: g.course.id, module: g.module, best: score, total, passed, attempts: 1, lastAt });
  }
  const result: QuizResult = {
    module: g.module,
    score,
    total,
    passed,
    passPct: QUIZ_PASS_PCT,
    results,
    best: Math.max(prev?.best ?? 0, score),
  };
  return ok(result);
};

const myScores = (req: MockRequest) => {
  const user = requireUser(req);
  if (!user) return unauthorized();
  const scores: QuizScore[] = quizScores
    .all()
    .filter((s) => s.email === user.email && s.courseId === req.params.courseId)
    .map(({ module, best, total, passed, attempts, lastAt }) => ({ module, best, total, passed, attempts, lastAt }))
    .sort((a, b) => a.module - b.module);
  return ok(scores);
};

export const quizRoutes: MockRoute[] = [
  { method: "GET", path: "/courses/:courseId/quizzes/:module", handler: getQuiz },
  { method: "POST", path: "/me/quizzes/:courseId/:module", handler: submit },
  { method: "GET", path: "/me/quizzes/:courseId", handler: myScores },
];
