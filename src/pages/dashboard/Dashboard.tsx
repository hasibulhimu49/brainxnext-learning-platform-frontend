import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import DashboardEmptyState from "@/components/learner/DashboardEmptyState";
import EnrolledCourseRow from "@/components/learner/EnrolledCourseRow";
import { courseCover } from "@/lib/utils";
import { useDashboard } from "@/queries/account";
import { useSessionUser } from "@/stores/authStore";
import type { DashboardData } from "@/types/dashboard";
import usePageTitle from "@/hooks/usePageTitle";

const DashboardView = ({ data }: { data: DashboardData }) => {
  // behind RequireAuth, so the session is always there
  const firstName = useSessionUser()?.name.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const { stats, continueLearning: current, myCourses, week, weekTotal, certificates, recommended, streakDays } = data;

  return (
    <>
      <section className="bg-page px-4.5 pt-11 sm:px-6">
        <div className="mx-auto flex max-w-310 flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mt-0 mb-1.5 text-[13.5px] font-bold text-soft">{today}</p>
            <h1 className="m-0 font-display text-[clamp(26px,3.4vw,36px)] font-extrabold tracking-[-0.02em] text-ink">
              Welcome back, {firstName} <span aria-hidden="true">👋</span>
            </h1>
          </div>
          <div className="card inline-flex items-center gap-2.5 rounded-full! px-5 py-2.75">
            <Icon name="local_fire_department" className="text-amber" />
            <span className="text-sm font-extrabold text-ink">{streakDays}-day streak</span>
            <span className="text-[12.5px] font-semibold text-soft">— keep it alive!</span>
          </div>
        </div>
      </section>

      <section className="bg-page px-4.5 pt-7 sm:px-6">
        <div className="mx-auto grid max-w-310 grid-cols-2 gap-4 min-[1001px]:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card flex items-center gap-3.5 rounded-[20px]! p-5.5 max-sm:flex-col max-sm:items-start">
              <span className="flex h-11.5 w-11.5 flex-none items-center justify-center rounded-[14px]" style={{ background: s.grad }}>
                <Icon name={s.icon} size={23} className="text-white" />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-[22px] leading-none font-extrabold text-ink">{s.value}</span>
                <span className="mt-1 text-[12.5px] font-bold text-soft">{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-page px-4.5 pt-8 pb-22 sm:px-6">
        <div className="mx-auto grid max-w-310 grid-cols-1 items-start gap-6 min-[1001px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            {myCourses.length === 0 && <DashboardEmptyState />}

            {/* Continue learning */}
            {current && (
              <div className="relative overflow-hidden rounded-3xl border border-[rgba(111,183,255,.3)] bg-[linear-gradient(165deg,#0F2A4E,#0A1B33)] p-7 text-white shadow-[0_20px_48px_rgba(10,27,51,.3)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_260px_at_88%_0%,rgba(27,111,208,.35),transparent_65%),radial-gradient(360px_240px_at_0%_100%,rgba(233,162,27,.14),transparent_65%)]" />
                <div className="relative flex flex-col gap-4">
                  <span className="text-[11.5px] font-extrabold tracking-[0.12em] text-[#8FD8E8]">
                    {current.started ? "CONTINUE LEARNING" : "START LEARNING"}
                  </span>
                  <div className="flex flex-wrap items-center gap-4.5">
                    <span
                      className="h-19 w-30 flex-none rounded-[14px] shadow-[0_10px_24px_rgba(0,0,0,.35)]"
                      style={{ background: courseCover(current) }}
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="font-display text-[19px] font-extrabold tracking-[-0.01em]">{current.title}</span>
                      <span className="text-[13px] font-semibold text-[#A9BFD8]">{current.lesson}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="h-2.25 flex-1 rounded-full bg-white/14">
                      <div
                        className="h-2.25 rounded-full bg-[linear-gradient(90deg,#1B6FD0,#4FD0E0)]"
                        style={{ width: `${current.pct}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-extrabold text-[#8FD8E8]">{current.pct}%</span>
                  </div>
                  <Link to={`/learn/${current.courseId}/${current.lessonId}`} className="btn btn-gold w-max px-6.5 py-3.5 text-[14.5px]">
                    <Icon name="play_arrow" size={19} />
                    {current.started ? "Resume" : "Start"} Class {current.lessonNumber}
                  </Link>
                </div>
              </div>
            )}

            {/* My courses */}
            {myCourses.length > 0 && (
              <div>
                <div className="mb-3.5 flex items-baseline justify-between gap-4">
                  <h2 className="m-0 font-display text-[19px] font-extrabold tracking-[-0.01em] text-ink">My courses</h2>
                  <Link to="/dashboard/courses" className="text-[13.5px] font-extrabold text-brand hover:text-teal">
                    View all →
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {myCourses.slice(0, 4).map((c) => (
                    <EnrolledCourseRow key={c.courseId} course={c} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {/* Weekly chart */}
            <div className="card p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="m-0 font-display text-base font-extrabold text-ink">This week</h3>
                <span className="text-[12.5px] font-bold text-soft">{weekTotal}</span>
              </div>
              <div className="flex h-24 items-end gap-2" role="img" aria-label="Minutes learned per day this week">
                {week.map((d, i) => (
                  <span key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.75" title={`${d.min} min`}>
                    <span
                      className="w-full max-w-6.5 rounded-[7px] transition-all"
                      style={{
                        height: Math.max(6, Math.round((d.min / 70) * 76)),
                        background:
                          d.min === 0
                            ? "var(--surface2)"
                            : d.today
                              ? "linear-gradient(180deg,#F7C948,#E9A21B)"
                              : "linear-gradient(180deg,#1B6FD0,#0E97B0)",
                      }}
                    />
                    <span className={`text-[10.5px] font-extrabold ${d.today ? "text-amber" : "text-soft"}`}>{d.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="card p-6">
              <div className="mb-3.5 flex items-baseline justify-between gap-3">
                <h3 className="m-0 font-display text-base font-extrabold text-ink">Certificates</h3>
                <Link to="/certificates" className="text-[13px] font-extrabold text-brand hover:text-teal">
                  View all →
                </Link>
              </div>
              <div className="flex flex-col gap-2.75">
                {certificates.length === 0 && (
                  <p className="m-0 text-[13px] leading-relaxed font-semibold text-soft">Finish a course to earn your first certificate.</p>
                )}
                {certificates.map((c) => (
                  <Link
                    key={c.id}
                    to={`/certificates/${c.id}`}
                    className="flex items-center gap-3 rounded-[14px] border border-line bg-surface2 px-3.5 py-3 text-ink transition-colors hover:border-brand hover:text-ink"
                  >
                    <Icon name="workspace_premium" size={21} className="text-amber" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[13.5px] font-extrabold">{c.title}</span>
                      <span className="text-[11.5px] font-semibold text-soft">{c.earned}</span>
                    </span>
                    <Icon name="download" size={18} className="text-soft" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Mentor reviews */}
            <Link
              to="/dashboard/reviews"
              className="card flex items-center gap-3.5 p-5 text-ink transition-all hover:-translate-y-0.5 hover:text-ink hover:shadow-card-lg"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-chip text-brand">
                <Icon name="rate_review" size={22} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[15px] font-extrabold">My project reviews</span>
                <span className="text-[12.5px] font-semibold text-soft">Submissions and mentor feedback</span>
              </span>
              <Icon name="arrow_forward" size={19} className="text-soft" />
            </Link>

            {/* Career roadmaps (F-008) */}
            <Link
              to="/paths"
              className="card flex items-center gap-3.5 p-5 text-ink transition-all hover:-translate-y-0.5 hover:text-ink hover:shadow-card-lg"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-chip text-brand">
                <Icon name="route" size={22} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[15px] font-extrabold">Career roadmaps</span>
                <span className="text-[12.5px] font-semibold text-soft">Step-by-step routes to a career</span>
              </span>
              <Icon name="arrow_forward" size={19} className="text-soft" />
            </Link>

            {/* Wishlist (F-004) */}
            <Link
              to="/wishlist"
              className="card flex items-center gap-3.5 p-5 text-ink transition-all hover:-translate-y-0.5 hover:text-ink hover:shadow-card-lg"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-chip text-danger">
                <Icon name="favorite" size={22} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[15px] font-extrabold">My wishlist</span>
                <span className="text-[12.5px] font-semibold text-soft">Courses you saved for later</span>
              </span>
              <Icon name="arrow_forward" size={19} className="text-soft" />
            </Link>

            {/* Recommended */}
            <div className="card p-6">
              <h3 className="mt-0 mb-3.5 font-display text-base font-extrabold text-ink">Recommended for you</h3>
              <div className="flex flex-col gap-2.75">
                {recommended.map(({ to, sub, ...c }) => (
                  <Link
                    key={c.title}
                    to={to}
                    className="flex items-center gap-3 rounded-[14px] p-2.5 text-ink transition-colors hover:bg-surface2 hover:text-ink"
                  >
                    <span
                      className="flex h-10 w-14 flex-none items-center justify-center rounded-[10px]"
                      style={{ background: courseCover(c) }}
                    >
                      {!c.img && <Icon name={c.icon} size={18} className="text-white" />}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-extrabold">{c.title}</span>
                      <span className="text-[11.5px] font-semibold text-soft">{sub}</span>
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

const Dashboard = () => {
  usePageTitle("Dashboard");
  const dashboard = useDashboard();
  return (
    <QueryStatus query={dashboard} className="min-h-[60vh]">
      {(data) => <DashboardView data={data} />}
    </QueryStatus>
  );
};

export default Dashboard;
