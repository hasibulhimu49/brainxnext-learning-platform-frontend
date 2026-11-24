import { durationSeconds, formatDuration } from "@/lib/lessons";
import { formatTaka } from "@/lib/utils";
import type { Course } from "@/types/course";
import type { DashboardData, EnrolledCourse, Recommendation } from "@/types/dashboard";
import type { Enrollment } from "@/types/learning";
import { COURSES } from "./courses";
import { LESSONS, certificatesOf, getLearner, listEnrollments, progressOf } from "./learning";

const monthYear = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

const secondsOf = (ids: Iterable<string>) => {
  const set = new Set(ids);
  return LESSONS.filter((l) => set.has(l.id)).reduce((sum, l) => sum + durationSeconds(l.lesson.dur), 0);
};

/** The lesson to resume: the last one opened unless it's done, then the first one not done yet. */
const resumeLesson = (email: string, courseId: string) => {
  const { completed, lastLessonId } = progressOf(email, courseId);
  const done = new Set(completed);
  return LESSONS.find((l) => l.id === lastLessonId && !done.has(l.id)) ?? LESSONS.find((l) => !done.has(l.id)) ?? LESSONS[0] ?? null;
};

const metaFor = (email: string, e: Enrollment) => {
  if (e.completedAt) return `Completed ${monthYear(e.completedAt)}`;
  if (e.completedLessons === 0) return "Not started yet";
  const done = new Set(progressOf(email, e.courseId).completed);
  const left = secondsOf(LESSONS.filter((l) => !done.has(l.id)).map((l) => l.id));
  const next = resumeLesson(email, e.courseId);
  return `Class ${next?.number ?? 1} of ${e.totalLessons} · ${formatDuration(left)} left`;
};

const recommendation = (c: Course): Recommendation => ({
  to: `/courses/${c.id}`,
  title: c.title,
  icon: c.icon,
  img: c.img,
  grad: c.grad,
  sub: `${c.lessons} lessons · ${c.free ? "Free" : formatTaka(c.price)}`,
});

/** GET /me/dashboard — everything comes from the user's own enrolments. */
export const buildDashboard = (email: string): DashboardData => {
  const learner = getLearner(email);
  const enrollments = listEnrollments(email).filter((e) => COURSES.some((c) => c.id === e.courseId));
  const courseOf = (id: string) => COURSES.find((c) => c.id === id) as Course;
  const inProgress = enrollments.filter((e) => !e.completedAt);
  const completed = enrollments.filter((e) => e.completedAt);
  const certificates = certificatesOf(email);
  const learnedSeconds = enrollments.reduce((sum, e) => sum + secondsOf(progressOf(email, e.courseId).completed), 0);

  const current = inProgress[0];
  const currentLesson = current ? resumeLesson(email, current.courseId) : null;
  const currentCourse = current ? courseOf(current.courseId) : null;

  const myCourses: EnrolledCourse[] = enrollments.map((e) => {
    const c = courseOf(e.courseId);
    return { courseId: c.id, title: c.title, icon: c.icon, img: c.img, grad: c.grad, pct: e.pct, meta: metaFor(email, e) };
  });

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const notEnrolled = COURSES.filter((c) => !enrolledIds.has(c.id));
  const picks = [notEnrolled.find((c) => c.free), notEnrolled.find((c) => !c.free && c.featured) ?? notEnrolled.find((c) => !c.free)];

  return {
    streakDays: learner.streakDays,
    stats: [
      {
        icon: "auto_stories",
        grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
        value: String(inProgress.length),
        label: "Courses in progress",
      },
      { icon: "task_alt", grad: "linear-gradient(135deg,#3FA457,#5DBE74)", value: String(completed.length), label: "Courses completed" },
      {
        icon: "schedule",
        grad: "linear-gradient(135deg,#0E97B0,#2FB8CF)",
        value: `${Math.round(learnedSeconds / 3600)}h`,
        label: "Learning time",
      },
      {
        icon: "workspace_premium",
        grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
        value: String(certificates.length),
        label: "Certificates earned",
      },
    ],
    continueLearning:
      current && currentLesson && currentCourse
        ? {
            courseId: currentCourse.id,
            title: currentCourse.title,
            img: currentCourse.img,
            grad: currentCourse.grad,
            lessonId: currentLesson.id,
            lesson: `${currentLesson.lesson.title.replace(" — ", " · ")} · ${currentLesson.lesson.dur}`,
            lessonNumber: currentLesson.number,
            pct: current.pct,
          }
        : null,
    myCourses,
    week: learner.week,
    weekTotal: `${formatDuration(learner.week.reduce((sum, d) => sum + d.min, 0) * 60)} total`,
    certificates: certificates.map((c) => ({ id: c.id, title: c.course, earned: `Earned ${monthYear(c.issuedAt)}` })),
    recommended: [
      ...picks.filter((c): c is Course => !!c).map(recommendation),
      {
        to: "/notes",
        title: "Java Handbook",
        icon: "description",
        grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
        sub: "70 pages · Free download",
      },
    ],
  };
};
