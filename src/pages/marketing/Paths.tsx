import { Link } from "react-router-dom";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { usePathSteps } from "@/hooks/usePathSteps";
import usePageTitle from "@/hooks/usePageTitle";
import { plural } from "@/lib/utils";
import { usePaths } from "@/queries/paths";
import type { LearningPath } from "@/types/path";

const PathCard = ({ path }: { path: LearningPath }) => {
  const { steps, totalHours, freeCount, done } = usePathSteps(path);
  return (
    <Link to={`/paths/${path.id}`} className="card card-hover flex flex-col gap-4 p-6 text-ink hover:text-ink">
      <div className="flex items-center gap-3.5">
        <span className="flex h-13 w-13 flex-none items-center justify-center rounded-[16px] shadow-card" style={{ background: path.grad }}>
          <Icon name={path.icon} size={26} className="text-white" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-[19px] leading-tight font-extrabold">{path.title}</span>
          <span className="text-[12.5px] font-bold text-soft">{path.level}</span>
        </span>
      </div>
      <p className="m-0 text-[13.5px] leading-relaxed text-muted">{path.tagline}</p>
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {steps.map((s, i) => (
          <li key={s.course.id} className="flex items-center gap-2.5 text-[13px] font-semibold text-ink">
            <span
              className={`flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full text-[11px] font-extrabold ${s.status === "completed" ? "bg-success text-white" : "bg-chip text-brand"}`}
            >
              {s.status === "completed" ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span className="truncate">{s.course.title}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3.5 text-[12.5px] font-bold text-muted">
        <span>{plural(steps.length, "course")}</span>
        <span>~{totalHours}h</span>
        <span className="text-success">{freeCount} free</span>
        {done > 0 && <span className="text-brand">{done} done</span>}
      </div>
    </Link>
  );
};

/** /paths — learning paths (F-008). */
const Paths = () => {
  usePageTitle("Learning paths");
  const paths = usePaths();
  return (
    <>
      <HeroBand>
        <h1 className="m-0 font-display text-[clamp(30px,4.4vw,46px)] font-extrabold tracking-[-0.02em] text-white">
          Learning <span className="text-grad-hero">paths</span>
        </h1>
        <p className="m-0 text-[15.5px] leading-relaxed text-[#C9DAEC]">
          Not sure where to start? Follow a path: the right courses in the right order, free ones first.
        </p>
      </HeroBand>
      <section className="bg-page px-4.5 py-14 sm:px-6">
        <div className="mx-auto max-w-310">
          <QueryStatus query={paths}>
            {(list) => (
              <div className="grid grid-cols-1 gap-5 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-4">
                {list.map((p) => (
                  <PathCard key={p.id} path={p} />
                ))}
              </div>
            )}
          </QueryStatus>
        </div>
      </section>
    </>
  );
};

export default Paths;
