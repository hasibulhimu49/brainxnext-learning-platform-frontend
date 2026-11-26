import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import BuyCard from "@/components/course/BuyCard";
import CourseReviews from "@/components/course/CourseReviews";
import { YouTubeSubscribe } from "@/components/common/SocialIcons";
import usePageTitle from "@/hooks/usePageTitle";
import { flattenLessons } from "@/lib/lessons";
import { courseCover, formatTaka } from "@/lib/utils";
import { useIsPro } from "@/queries/account";
import { useCourse, useCourses } from "@/queries/courses";
import { useEnroll, useIsEnrolled } from "@/queries/learning";
import { loginPath } from "@/routes/redirects";
import { useIsSignedIn } from "@/stores/authStore";
import type { Course, CourseDetail as CourseDetailData } from "@/types/course";

const HERO_FACTS: { icon: string; color: string; text?: string; key?: "hours" | "lang" }[] = [
  { icon: "star", color: "#F7C948", text: "4.9 (1,240 ratings)" },
  { icon: "group", color: "#6FB7FF", text: "8,430 learners" },
  { icon: "schedule", color: "#4FD0E0", key: "hours" },
  { icon: "translate", color: "#7ED694", key: "lang" },
  { icon: "update", color: "#E9A21B", text: "Updated Aug 2026" },
];

const REQUIREMENTS = [
  "Core Java basics — classes, objects, methods",
  "Any IDE (IntelliJ or VS Code)",
  "No prior generics knowledge needed",
];

type Fact = (typeof HERO_FACTS)[number];

const CourseDetailView = ({ course, allCourses }: { course: CourseDetailData; allCourses: Course[] }) => {
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(0);
  const signedIn = useIsSignedIn();
  const enrolled = useIsEnrolled(course.id) ?? false;
  const enroll = useEnroll();
  // Pro unlocks every paid course: enrol instead of buying
  const isPro = useIsPro() ?? false;
  const viaPro = !course.free && isPro;
  usePageTitle(course.title);
  const previewLesson = flattenLessons(course.curriculum).find((l) => l.lesson.preview);

  const [titleMain = course.title, titleSub] = course.title.split(" — ");
  const related = allCourses.filter((c) => c.cat === course.cat && c.id !== course.id).slice(0, 3);
  const factText = (f: Fact) => f.text ?? (f.key === "hours" ? `${course.hours} total` : course.lang || "English");

  const handleEnroll = () => {
    if (enrolled) return navigate(`/learn/${course.id}`);
    if (!course.free && !viaPro) return navigate(`/checkout/${course.id}`);
    if (!signedIn) return navigate(loginPath(`/courses/${course.id}`));
    enroll.mutate(course.id, { onSuccess: () => toast.success("You're enrolled — enjoy the course!") });
  };

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero-band px-4.5 pt-12 pb-14 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_380px_at_85%_10%,rgba(233,162,27,.2),transparent_65%),radial-gradient(560px_380px_at_8%_90%,rgba(14,151,176,.26),transparent_65%),radial-gradient(480px_320px_at_40%_0%,rgba(27,111,208,.32),transparent_65%)]" />
        <div className="relative mx-auto max-w-310">
          <nav aria-label="Breadcrumb" className="mb-5.5 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#8AA0B8]">
            <Link to="/" className="text-[#A9BFD8] hover:text-brand-light">
              Home
            </Link>
            <Icon name="chevron_right" size={15} />
            <Link to="/courses" className="text-[#A9BFD8] hover:text-brand-light">
              Courses
            </Link>
            <Icon name="chevron_right" size={15} />
            <span className="text-[#EAF2FC]">{titleMain}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-11 min-[1001px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2.25">
                {course.free && <span className="pill bg-success px-3.25 py-1.5 text-[11.5px] text-white">FREE</span>}
                {course.featured && <span className="pill bg-grad-gold px-3.25 py-1.5 text-[11.5px] text-cocoa">FEATURED</span>}
                <span className="pill border border-white/22 bg-white/14 px-3.25 py-1.5 text-[11.5px] text-[#EAF2FC]">
                  {course.cat.toUpperCase()}
                </span>
              </div>
              <h1 className="m-0 font-display text-[clamp(30px,4vw,46px)] leading-[1.12] font-extrabold tracking-[-0.02em]">
                {titleSub ? (
                  <>
                    {titleMain} —<br />
                    <span className="text-grad-hero">{titleSub}</span>
                  </>
                ) : (
                  <span className="text-grad-hero">{titleMain}</span>
                )}
              </h1>
              <p className="m-0 max-w-[60ch] text-[16.5px] leading-relaxed font-medium text-[#C3D8EF]">{course.description}</p>
              <div className="flex flex-wrap gap-4.5 text-[13.5px] font-bold text-[#C9DAEC]">
                {HERO_FACTS.map((f) => (
                  <span key={f.icon} className="inline-flex items-center gap-1.75">
                    <Icon name={f.icon} size={17} style={{ color: f.color }} />
                    {factText(f)}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-grad-brand flex h-11.5 w-11.5 items-center justify-center rounded-full font-display text-base font-extrabold">
                  {course.mentor[0]}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-extrabold">{course.mentor}</span>
                  <span className="text-xs font-semibold text-[#8AA0B8]">Course instructor · 31k subscribers</span>
                </span>
                {/* BrainXNext's own courses come from its YouTube channel */}
                {course.mentor === "BrainXNext" && <YouTubeSubscribe className="ml-1" />}
              </div>
            </div>

            <BuyCard
              course={course}
              enrolled={enrolled}
              includedInPro={viaPro}
              pending={enroll.isPending}
              error={enroll.isError ? errorMessage(enroll.error) : undefined}
              onPrimary={handleEnroll}
              onPreview={() => navigate(`/learn/${course.id}/${previewLesson?.id ?? ""}`)}
            />
          </div>
        </div>
      </section>

      {/* ---------------- Body ---------------- */}
      <section className="bg-page px-4.5 pt-16 pb-22 sm:px-6">
        <div className="mx-auto grid max-w-310 grid-cols-1 items-start gap-11 min-[1001px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-10">
            <div className="card p-7">
              <h2 className="mt-0 mb-4.5 font-display text-[21px] font-extrabold tracking-[-0.01em] text-ink">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 gap-3 min-[1001px]:grid-cols-2">
                {course.outcomes.map((o) => (
                  <span key={o} className="flex items-start gap-2.5 text-sm leading-normal font-semibold text-muted">
                    <Icon name="check_circle" size={18} className="text-success" />
                    {o}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="m-0 font-display text-[21px] font-extrabold tracking-[-0.01em] text-ink">Course content</h2>
                <span className="text-[13px] font-bold text-soft">
                  {course.curriculum.length} modules · {course.totalLessons} classes · 6h total
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {course.curriculum.map((m, i) => {
                  const open = openModule === i;
                  return (
                    <div
                      key={m.title}
                      className={`overflow-hidden rounded-[18px] border bg-surface shadow-card ${open ? "border-brand" : "border-line"}`}
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenModule(open ? -1 : i)}
                        className="flex w-full items-center justify-between gap-3.5 border-0 bg-transparent px-5.5 py-4.5 text-left text-ink"
                      >
                        <span className="flex min-w-0 items-center gap-3.5">
                          <span className="font-display text-[13px] font-extrabold text-brand">0{i + 1}</span>
                          <span className="font-display text-base font-bold tracking-[-0.01em]">{m.title}</span>
                        </span>
                        <span className="flex flex-none items-center gap-3.5">
                          <span className="hidden text-[12.5px] font-bold whitespace-nowrap text-soft sm:inline">{m.meta}</span>
                          <Icon name={open ? "expand_less" : "expand_more"} className="text-soft" />
                        </span>
                      </button>
                      {open && (
                        <div className="flex flex-col border-t border-line">
                          {m.lessons.map((l) => (
                            <div
                              key={l.title}
                              className="flex items-center justify-between gap-3.5 border-b border-line px-5.5 py-3.25 transition-colors last:border-b-0 hover:bg-surface2"
                            >
                              <span className="flex min-w-0 items-center gap-2.75 text-sm font-semibold text-muted">
                                <Icon
                                  name={l.preview ? "play_circle" : "lock"}
                                  size={18}
                                  className={l.preview ? "text-brand" : "text-soft"}
                                />
                                {l.title}
                              </span>
                              <span className="flex flex-none items-center gap-3">
                                <span
                                  className={`pill px-2.25 py-0.75 ${l.preview ? "bg-chip text-brand" : "invisible"}`}
                                  aria-hidden={!l.preview}
                                >
                                  {l.preview ? "PREVIEW" : "ENROLL"}
                                </span>
                                <span className="text-[12.5px] font-bold text-soft">{l.dur}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <CourseReviews course={course} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="card p-6.5">
              <h3 className="mt-0 mb-3.5 font-display text-[17px] font-extrabold text-ink">Requirements</h3>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[13.5px] leading-normal font-semibold text-muted">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex gap-2.25">
                    <Icon name="arrow_right" size={17} className="text-brand" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6.5">
              <h3 className="mt-0 mb-3.5 font-display text-[17px] font-extrabold text-ink">More from this track</h3>
              <div className="flex flex-col gap-3">
                {related.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="flex items-center gap-3.25 rounded-[14px] p-2.5 text-ink transition-colors hover:bg-surface2 hover:text-ink"
                  >
                    <span
                      className="flex h-11 w-15.5 flex-none items-center justify-center rounded-[10px]"
                      style={{ background: courseCover(c) }}
                    >
                      {!c.img && <Icon name={c.icon} className="text-white" />}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13.5px] font-extrabold">{c.title}</span>
                      <span className="text-xs font-semibold text-soft">
                        {c.lessons} lessons · {c.free ? "Free" : formatTaka(c.price)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

/** Loads the course (and the catalog for "More from this track") through TanStack Query. */
const CourseDetail = () => {
  const { courseId = "java-generics" } = useParams();
  const courseQuery = useCourse(courseId);
  const allCourses = useCourses();

  if (isApiError(courseQuery.error) && courseQuery.error.code === API_ERROR_CODES.notFound) return <Navigate to="/404" replace />;

  return (
    <QueryStatus query={courseQuery} className="min-h-[60vh]">
      {(course) => <CourseDetailView course={course} allCourses={allCourses.data ?? []} />}
    </QueryStatus>
  );
};

export default CourseDetail;
