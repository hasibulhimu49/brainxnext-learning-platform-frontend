import { flattenLessons } from "@/lib/lessons";
import type { CertificateRecord } from "@/types/account";
import type { WeekDay } from "@/types/dashboard";
import type { CourseProgress, Enrollment, EnrollmentSource } from "@/types/learning";
import { CURRICULUM } from "./courses";
import { createCollection } from "./store";

/**
 * Server-side learner records for the mock API: enrolments and lesson progress per user,
 * persisted in localStorage (`bxn-mock-learning`) so a reload keeps them. Every course reuses the
 * Java Generics curriculum as placeholder content, so they all share the same lesson ids.
 */
interface StoredEnrollment {
  courseId: string;
  source: EnrollmentSource;
  enrolledAt: string;
  lastActivityAt: string;
  completed: string[];
  lastLessonId: string | null;
  completedAt: string | null;
}

interface LearnerState {
  enrollments: StoredEnrollment[];
  streakDays: number;
  week: WeekDay[];
}

const STORAGE_KEY = "bxn-mock-learning";

export const LESSONS = flattenLessons(CURRICULUM);
export const LESSON_IDS = LESSONS.map((l) => l.id);
export const TOTAL_LESSONS = LESSON_IDS.length;

const WEEK_LABELS = ["S", "S", "M", "T", "W", "T", "F"];
const emptyWeek = (): WeekDay[] => WEEK_LABELS.map((label, i) => ({ label, min: 0, ...(i === 6 ? { today: true } : {}) }));

const seedEnrollment = (
  courseId: string,
  completed: string[],
  lastLessonId: string,
  lastActivityAt: string,
  completedAt: string | null
) => ({
  courseId,
  source: "free" as const,
  enrolledAt: "2026-03-02T09:00:00.000Z",
  lastActivityAt,
  completed,
  lastLessonId,
  completedAt,
});

/** The demo student starts with the courses the dashboard designs show. */
const seed = (): Record<string, LearnerState> => ({
  "hasibulx26@gmail.com": {
    streakDays: 7,
    week: [
      { label: "S", min: 25 },
      { label: "S", min: 60 },
      { label: "M", min: 45 },
      { label: "T", min: 0 },
      { label: "W", min: 70 },
      { label: "T", min: 30 },
      { label: "F", min: 30, today: true },
    ],
    enrollments: [
      // classes 1–10 done, resuming class 11
      seedEnrollment("java-generics", LESSON_IDS.slice(0, 10), "3-3", "2026-11-23T18:30:00.000Z", null),
      seedEnrollment("python-data-analysis", LESSON_IDS.slice(0, 6), "2-3", "2026-11-20T15:00:00.000Z", null),
      seedEnrollment("code-smells", LESSON_IDS.slice(0, 1), "1-2", "2026-11-18T12:00:00.000Z", null),
      seedEnrollment("sql-query-to-model", [...LESSON_IDS], "4-4", "2026-06-14T10:00:00.000Z", "2026-06-14T10:00:00.000Z"),
      seedEnrollment("git-collaboration", [...LESSON_IDS], "4-4", "2026-04-20T10:00:00.000Z", "2026-04-20T10:00:00.000Z"),
    ],
  },
});

let memory: Record<string, LearnerState> | null = null;

const load = (): Record<string, LearnerState> => {
  if (memory) return memory;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    memory = parsed && typeof parsed === "object" ? (parsed as Record<string, LearnerState>) : seed();
  } catch {
    memory = seed();
  }
  return memory;
};

const save = (all: Record<string, LearnerState>) => {
  memory = all;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — keep in memory */
  }
};

const keyOf = (email: string) => email.trim().toLowerCase();

export const getLearner = (email: string): LearnerState => load()[keyOf(email)] ?? { enrollments: [], streakDays: 0, week: emptyWeek() };

const putLearner = (email: string, learner: LearnerState) => save({ ...load(), [keyOf(email)]: learner });

const toEnrollment = (e: StoredEnrollment): Enrollment => ({
  courseId: e.courseId,
  source: e.source,
  enrolledAt: e.enrolledAt,
  lastActivityAt: e.lastActivityAt,
  completedLessons: e.completed.length,
  totalLessons: TOTAL_LESSONS,
  pct: Math.round((e.completed.length / TOTAL_LESSONS) * 100),
  lastLessonId: e.lastLessonId,
  completedAt: e.completedAt,
});

/** Newest activity first. */
export const listEnrollments = (email: string): Enrollment[] =>
  [...getLearner(email).enrollments].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt)).map(toEnrollment);

export const findEnrollment = (email: string, courseId: string) => {
  const e = getLearner(email).enrollments.find((x) => x.courseId === courseId);
  return e ? toEnrollment(e) : undefined;
};

/** Idempotent: enrolling twice returns the existing enrolment. */
export const enroll = (email: string, courseId: string, source: EnrollmentSource): Enrollment => {
  const learner = getLearner(email);
  const existing = learner.enrollments.find((e) => e.courseId === courseId);
  if (existing) return toEnrollment(existing);
  const now = new Date().toISOString();
  const created: StoredEnrollment = {
    courseId,
    source,
    enrolledAt: now,
    lastActivityAt: now,
    completed: [],
    lastLessonId: null,
    completedAt: null,
  };
  putLearner(email, { ...learner, enrollments: [...learner.enrollments, created] });
  return toEnrollment(created);
};

export const progressOf = (email: string, courseId: string): CourseProgress => {
  const e = getLearner(email).enrollments.find((x) => x.courseId === courseId);
  return {
    courseId,
    enrolled: !!e,
    completed: e ? LESSON_IDS.filter((id) => e.completed.includes(id)) : [],
    lastLessonId: e?.lastLessonId ?? null,
  };
};

/** Make `lessonId` the last lesson and, when `completed` is given, mark it done / not done. */
export const updateProgress = (email: string, courseId: string, lessonId: string, completed?: boolean): CourseProgress => {
  const learner = getLearner(email);
  const now = new Date().toISOString();
  const enrollments = learner.enrollments.map((e) => {
    if (e.courseId !== courseId) return e;
    const set = new Set(e.completed);
    if (completed === true) set.add(lessonId);
    if (completed === false) set.delete(lessonId);
    const done = LESSON_IDS.filter((id) => set.has(id));
    const finished = done.length === TOTAL_LESSONS;
    return { ...e, completed: done, lastLessonId: lessonId, lastActivityAt: now, completedAt: finished ? (e.completedAt ?? now) : null };
  });
  putLearner(email, { ...learner, enrollments });
  return progressOf(email, courseId);
};

/* ---------------- certificates ---------------- */

/** Issued when an entitled learner (Pro, or bought the course) completes every lesson. */
export interface StoredCertificate extends CertificateRecord {
  userEmail: string;
}

export const certificates = createCollection<StoredCertificate>("bxn-mock-certificates", () => [
  {
    id: "BXN-2026-SQ-08412",
    userEmail: "hasibulx26@gmail.com",
    holder: "Mohammad Hasibul Hasan",
    courseId: "sql-query-to-model",
    course: "SQL From Query to Model",
    issuedAt: "2026-06-14T10:00:00.000Z",
    mentor: "Ayesha Rahman",
    lessons: 34,
  },
  {
    id: "BXN-2026-GI-04127",
    userEmail: "hasibulx26@gmail.com",
    holder: "Mohammad Hasibul Hasan",
    courseId: "git-collaboration",
    course: "Git & Collaboration Basics",
    issuedAt: "2026-04-20T10:00:00.000Z",
    mentor: "BrainXNext",
    lessons: 18,
  },
]);

export const toPublicCertificate = ({ userEmail: _email, ...cert }: StoredCertificate): CertificateRecord => cert;

/** Newest first. */
export const certificatesOf = (email: string) =>
  certificates
    .all()
    .filter((c) => keyOf(c.userEmail) === keyOf(email))
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

export const findCertificate = (id: string) => certificates.all().find((c) => c.id === id.trim().toUpperCase());

/** "BXN-2026-SQ-48213": year, the course id's first two letters, five random digits. */
const certificateId = (courseId: string, now: Date) =>
  `BXN-${now.getUTCFullYear()}-${courseId
    .replace(/[^a-z]/gi, "")
    .slice(0, 2)
    .toUpperCase()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/** Idempotent: one certificate per user and course. */
export const issueCertificate = (
  email: string,
  holder: string,
  course: { id: string; title: string; mentor: string; lessons: number },
  now = new Date()
) => {
  const existing = certificatesOf(email).find((c) => c.courseId === course.id);
  if (existing) return existing;
  const cert: StoredCertificate = {
    id: certificateId(course.id, now),
    userEmail: email,
    holder,
    courseId: course.id,
    course: course.title,
    issuedAt: now.toISOString(),
    mentor: course.mentor,
    lessons: course.lessons,
  };
  certificates.add(cert);
  return cert;
};

/** Move a learner's records to a new email (email change). */
export const renameLearner = (from: string, to: string) => {
  const all = load();
  const record = all[keyOf(from)];
  if (record) {
    const { [keyOf(from)]: _old, ...rest } = all;
    save({ ...rest, [keyOf(to)]: record });
  }
  certificates.update(
    (c) => keyOf(c.userEmail) === keyOf(from),
    (c) => ({ ...c, userEmail: to })
  );
};

/** Delete a learner's enrolments, progress and certificates (account deletion). */
export const removeLearner = (email: string) => {
  const { [keyOf(email)]: _gone, ...rest } = load();
  save(rest);
  certificates.remove((c) => keyOf(c.userEmail) === keyOf(email));
};

/** Test helper: forget every enrolment and go back to the seed. */
export const resetMockLearning = () => {
  certificates.reset();
  memory = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  save(seed());
};
