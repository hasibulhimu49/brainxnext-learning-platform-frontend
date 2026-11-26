import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { API_ERROR_CODES, isApiError } from "@/api/envelope";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { usePathSteps, type PathStepView, type StepStatus } from "@/hooks/usePathSteps";
import usePageTitle from "@/hooks/usePageTitle";
import { courseCover, formatTaka, plural } from "@/lib/utils";
import { useIsPro } from "@/queries/account";
import { usePath } from "@/queries/paths";
import { useShopStore } from "@/stores/shopStore";
import type { LearningPath } from "@/types/path";

const STATUS: Record<StepStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-success/12 text-success" },
  in_progress: { label: "In progress", cls: "bg-chip text-brand" },
  owned: { label: "Enrolled", cls: "bg-chip text-brand" },
  not_started: { label: "Not started", cls: "bg-surface2 text-soft" },
};

const StepRow = ({ step, index, last }: { step: PathStepView; index: number; last: boolean }) => {
  const { course, status, pct, why } = step;
  const action = status === "completed" ? "Review" : status === "not_started" ? (course.free ? "Start free" : "View course") : "Continue";
  const to = status === "not_started" ? (course.free ? `/learn/${course.id}` : `/courses/${course.id}`) : `/learn/${course.id}`;
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && <span className="absolute top-10 bottom-0 left-4.75 w-0.5 bg-line" aria-hidden="true" />}
      <span
        className={`relative z-1 flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[15px] font-extrabold ${status === "completed" ? "bg-success text-white" : "bg-grad-brand text-white"}`}
      >
        {status === "completed" ? <Icon name="check" size={20} /> : index + 1}
      </span>
      <div className="card flex min-w-0 flex-1 flex-col gap-3 p-4.5 sm:flex-row sm:items-center">
        <Link
          to={`/courses/${course.id}`}
          className="flex aspect-video w-full flex-none items-center justify-center overflow-hidden rounded-xl sm:w-36"
          style={{ background: courseCover(course) }}
          aria-label={course.title}
        >
          {!course.img && <Icon name={course.icon} size={26} className="text-white/90" />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`pill ${STATUS[status].cls}`}>{STATUS[status].label}</span>
            <span className={`text-[12.5px] font-extrabold ${course.free ? "text-success" : "text-ink"}`}>
              {course.free ? "Free" : formatTaka(course.price)}
            </span>
          </span>
          <Link to={`/courses/${course.id}`} className="font-display text-[16px] leading-tight font-bold text-ink hover:text-brand">
            {course.title}
          </Link>
          <span className="text-[12.5px] leading-normal font-medium text-muted">{why}</span>
          <span className="text-[12px] font-bold text-soft">
            {course.level} · {course.lessons} lessons · {course.hours}
          </span>
          {status === "in_progress" && (
            <span className="mt-0.5 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-chip" aria-hidden="true">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </span>
              <span className="text-[11.5px] font-extrabold text-brand">{pct}%</span>
            </span>
          )}
        </div>
        <Link to={to} className={`btn flex-none px-4.5 py-2.75 text-[13px] ${status === "not_started" ? "btn-outline" : "btn-primary"}`}>
          {action}
        </Link>
      </div>
    </li>
  );
};

const PathView = ({ path }: { path: LearningPath }) => {
  const navigate = useNavigate();
  const { steps, done, next, toBuy, totalHours, freeCount } = usePathSteps(path);
  const isPro = useIsPro() === true;
  const addToCart = useShopStore((s) => s.addToCart);
  const toBuyTotal = toBuy.reduce((sum, c) => sum + c.price, 0);
  const nextTo = next
    ? next.status === "not_started" && !next.course.free
      ? `/courses/${next.course.id}`
      : `/learn/${next.course.id}`
    : null;

  return (
    <>
      <HeroBand innerClassName="max-w-190 items-center text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-[20px] shadow-[0_14px_32px_rgba(0,0,0,.35)]"
          style={{ background: path.grad }}
        >
          <Icon name={path.icon} size={32} className="text-white" />
        </span>
        <span className="text-[12px] font-extrabold tracking-[0.12em] text-[#8FD8E8]">LEARNING PATH · {path.level.toUpperCase()}</span>
        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,46px)] font-extrabold tracking-[-0.02em] text-white">{path.title}</h1>
        <p className="m-0 text-[15.5px] leading-relaxed text-[#C9DAEC]">{path.description}</p>
        <span className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13.5px] font-bold text-[#C9DAEC]">
          <span>{plural(steps.length, "course")}</span>
          <span>~{totalHours} hours</span>
          <span>{freeCount} free</span>
        </span>
      </HeroBand>

      <section className="bg-page px-4.5 pt-12 pb-22 sm:px-6">
        <div className="mx-auto grid max-w-310 grid-cols-1 items-start gap-8 min-[1001px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <Link to="/paths" className="inline-flex w-max items-center gap-1 text-[13px] font-bold text-soft hover:text-brand">
              <Icon name="arrow_back" size={16} />
              All paths
            </Link>
            <ol className="m-0 list-none p-0">
              {steps.map((s, i) => (
                <StepRow key={s.course.id} step={s} index={i} last={i === steps.length - 1} />
              ))}
            </ol>
          </div>

          <aside className="card flex flex-col gap-4.5 p-6 min-[1001px]:sticky min-[1001px]:top-24">
            <div className="flex flex-col gap-2">
              <span className="flex items-baseline justify-between">
                <span className="font-display text-[17px] font-extrabold text-ink">Your progress</span>
                <span className="text-[13px] font-extrabold text-brand">
                  {done}/{steps.length}
                </span>
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-chip" aria-hidden="true">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,#1B6FD0,#0E97B0)]"
                  style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }}
                />
              </span>
            </div>

            {next && nextTo ? (
              <Link to={nextTo} className="btn btn-primary w-full rounded-[13px] px-5 py-3.5 text-[14.5px]">
                <Icon name="play_arrow" size={18} />
                {done === 0 && next.status === "not_started" ? "Start the path" : "Continue"}: {next.course.title}
              </Link>
            ) : (
              <p className="m-0 rounded-xl bg-success/10 px-4 py-3 text-center text-[13.5px] font-extrabold text-success">
                Path complete — well done! 🎉
              </p>
            )}

            {isPro ? (
              <p className="m-0 text-center text-[12.5px] font-bold text-muted">Every course in this path is included in your Pro plan.</p>
            ) : toBuy.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  toBuy.forEach((c) => addToCart(c.id));
                  toast(`Added ${plural(toBuy.length, "course")} to your cart`, {
                    action: { label: "View cart", onClick: () => void navigate("/cart") },
                  });
                }}
                className="btn btn-outline w-full rounded-[13px] px-5 py-3.25 text-[13.5px]"
              >
                <Icon name="add_shopping_cart" size={17} />
                Add {plural(toBuy.length, "paid course")} to cart · {formatTaka(toBuyTotal)}
              </button>
            ) : null}

            <div className="flex flex-col gap-2.5 border-t border-line pt-4">
              <span className="text-[12px] font-extrabold tracking-[0.08em] text-soft">YOU&apos;LL BE ABLE TO</span>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {path.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-[13.5px] leading-snug font-semibold text-muted">
                    <Icon name="check_circle" size={17} className="mt-px flex-none text-success" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

/** /paths/:pathId — one learning path (F-008). */
const PathDetail = () => {
  const { pathId = "" } = useParams();
  const path = usePath(pathId);
  usePageTitle(path.data ? `${path.data.title} path` : "Learning path");
  if (isApiError(path.error) && path.error.code === API_ERROR_CODES.notFound) return <Navigate to="/paths" replace />;
  return <QueryStatus query={path}>{(p) => <PathView path={p} />}</QueryStatus>;
};

export default PathDetail;
