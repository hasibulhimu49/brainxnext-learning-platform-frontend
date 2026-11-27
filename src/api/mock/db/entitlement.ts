import { isPro } from "./billing";
import { COURSES } from "./courses";
import { totalLessonsOf } from "./curricula";
import { certificatesOf, findEnrollment, issueCertificate, listEnrollments } from "./learning";

/**
 * Who gets the certificate and mentor review for a course (user decision, F-002):
 * an active Pro plan, or having bought that course. Free courses alone don't include them.
 */
export const hasCourseExtras = (email: string, courseId: string) => isPro(email) || findEnrollment(email, courseId)?.source === "purchase";

/**
 * Issue any certificate the learner has earned but not received yet: every completed course they
 * are entitled to. Called after progress is saved and before certificates are listed, so finishing
 * a course (or upgrading after finishing one) issues it automatically.
 */
export const syncCertificates = (user: { email: string; name: string }) => {
  for (const e of listEnrollments(user.email)) {
    if (!e.completedAt || !hasCourseExtras(user.email, e.courseId)) continue;
    const course = COURSES.find((c) => c.id === e.courseId);
    if (course)
      issueCertificate(user.email, user.name, {
        id: course.id,
        title: course.title,
        mentor: course.mentor,
        lessons: totalLessonsOf(course.id),
      });
  }
  return certificatesOf(user.email);
};
