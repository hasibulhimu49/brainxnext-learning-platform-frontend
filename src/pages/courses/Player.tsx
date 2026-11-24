import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { Alert } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import CourseCompleteCard from "@/components/player/CourseCompleteCard";
import CurriculumSidebar from "@/components/player/CurriculumSidebar";
import LessonTabs from "@/components/player/LessonTabs";
import PaywallCard from "@/components/player/PaywallCard";
import PlayerNav from "@/components/player/PlayerNav";
import PlayerVideo from "@/components/player/PlayerVideo";
import usePageTitle from "@/hooks/usePageTitle";
import { flattenLessons, type FlatLesson } from "@/lib/lessons";
import { useCertificates, useCourseExtras, useIsPro } from "@/queries/account";
import { useLogout } from "@/queries/auth";
import { useCourse } from "@/queries/courses";
import { useEnroll, useProgress, useUpdateProgress } from "@/queries/learning";
import { useSessionUser } from "@/stores/authStore";
import type { CourseDetail } from "@/types/course";
import type { CourseProgress } from "@/types/learning";

const PlayerView = ({ course, progress, lessonId }: { course: CourseDetail; progress: CourseProgress; lessonId?: string }) => {
  const navigate = useNavigate();
  const logout = useLogout();
  const userName = useSessionUser()?.name ?? "";
  const initial = userName[0]?.toUpperCase() ?? "";
  const update = useUpdateProgress(course.id);
  const enroll = useEnroll();
  const isPro = useIsPro() ?? false;
  const extras = useCourseExtras(course.id) ?? false;
  const certificates = useCertificates();
  usePageTitle(course.title);

  const lessons = flattenLessons(course.curriculum);
  const index = lessons.findIndex((l) => l.id === lessonId);
  const current = lessons[index];
  const fallback = lessons.find((l) => l.id === progress.lastLessonId) ?? lessons[0];
  if (!current) return fallback ? <Navigate to={`/learn/${course.id}/${fallback.id}`} replace /> : null;

  const owned = progress.enrolled;
  // free courses (and every course for Pro) can be watched before enrolling; paid ones only show their preview classes
  const canEnroll = course.free || isPro;
  const isLocked = (l: FlatLesson) => !owned && !canEnroll && !l.lesson.preview;
  const done = new Set(progress.completed);
  const curDone = done.has(current.id);
  const finished = owned && lessons.every((l) => done.has(l.id));
  const certificateId = certificates.data?.find((c) => c.courseId === course.id)?.id;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  const goTo = (id: string) => {
    navigate(`/learn/${course.id}/${id}`);
    if (owned) update.mutate({ lessonId: id });
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      <PlayerNav title={course.title} doneCount={done.size} total={lessons.length} initial={initial} onLogout={logout} />

      <div className="mx-auto grid max-w-350 grid-cols-1 items-start gap-5.5 px-3.5 pt-6 pb-18 min-[1081px]:grid-cols-[minmax(0,1fr)_380px] sm:px-5">
        <div className="flex min-w-0 flex-col gap-4.5">
          {finished && <CourseCompleteCard course={course} entitled={extras} certificateId={certificateId} />}
          <PlayerVideo
            key={current.id}
            duration={current.lesson.dur}
            onPrev={prev && (() => goTo(prev.id))}
            onNext={next && (() => goTo(next.id))}
            overlay={isLocked(current) ? <PaywallCard courseId={course.id} price={course.price} /> : undefined}
          />

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4.5">
            <div className="flex min-w-0 flex-col gap-1.75">
              <span className="text-xs font-extrabold tracking-widest text-brand">
                MODULE {current.moduleIndex + 1} · {current.module.title.toUpperCase()}
              </span>
              <h1 className="m-0 font-display text-[clamp(19px,2.4vw,25px)] font-extrabold tracking-[-0.01em] text-ink">
                {current.lesson.title}
              </h1>
              <span className="text-[13px] font-semibold text-soft">{current.lesson.dur} · Bangla · updated Aug 2026</span>
            </div>
            <div className="flex flex-wrap gap-2.25">
              {owned ? (
                <button
                  type="button"
                  onClick={() => update.mutate({ lessonId: current.id, completed: !curDone })}
                  aria-pressed={curDone}
                  className={`btn px-5 py-3 text-[13.5px] ${curDone ? "bg-success text-white hover:-translate-y-0.5" : "btn-primary"}`}
                >
                  <Icon name={curDone ? "check_circle" : "task_alt"} size={17} />
                  {curDone ? "Completed" : "Mark as complete"}
                </button>
              ) : canEnroll ? (
                <button
                  type="button"
                  onClick={() => enroll.mutate(course.id)}
                  disabled={enroll.isPending}
                  className="btn btn-primary px-5 py-3 text-[13.5px]"
                >
                  <Icon name="bookmark_add" size={17} />
                  Enroll to track progress
                </button>
              ) : null}
              {next && (
                <button type="button" onClick={() => goTo(next.id)} className="btn btn-outline px-5 py-3 text-[13.5px]">
                  Next class
                  <Icon name="arrow_forward" size={17} />
                </button>
              )}
              <Link to="/notes" className="btn btn-outline px-5 py-3 text-[13.5px]">
                <Icon name="download" size={17} />
                Notes
              </Link>
              {owned && (
                <Link to={`/learn/${course.id}/project`} className="btn btn-outline px-5 py-3 text-[13.5px]">
                  <Icon name="rate_review" size={17} />
                  Submit project
                </Link>
              )}
            </div>
          </div>
          {update.isError && <Alert>{errorMessage(update.error)}</Alert>}
          {enroll.isError && <Alert>{errorMessage(enroll.error)}</Alert>}

          <LessonTabs author={userName} />
        </div>

        <CurriculumSidebar
          curriculum={course.curriculum}
          lessons={lessons}
          currentId={current.id}
          done={done}
          isLocked={isLocked}
          onSelect={goTo}
          showPreview={!owned && !canEnroll}
        />
      </div>
    </div>
  );
};

/** /learn/:courseId/:lessonId? — loads the course and the learner's progress. */
const Player = () => {
  const { courseId = "", lessonId } = useParams();
  const courseQuery = useCourse(courseId);
  const progressQuery = useProgress(courseId);

  if (isApiError(courseQuery.error) && courseQuery.error.code === API_ERROR_CODES.notFound) return <Navigate to="/404" replace />;

  return (
    <QueryStatus query={courseQuery} className="min-h-screen bg-page">
      {(course) => (
        <QueryStatus query={progressQuery} className="min-h-screen bg-page">
          {(progress) => <PlayerView course={course} progress={progress} lessonId={lessonId} />}
        </QueryStatus>
      )}
    </QueryStatus>
  );
};

export default Player;
