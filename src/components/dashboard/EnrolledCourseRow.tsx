import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { courseCover } from "@/lib/utils";
import type { EnrolledCourse } from "@/types/dashboard";

/** One enrolled course (cover, title, progress bar, meta, status pill) → opens the player. */
const EnrolledCourseRow = ({ course: c }: { course: EnrolledCourse }) => {
  const done = c.pct === 100;
  return (
    <Link
      to={`/learn/${c.courseId}`}
      className="card grid grid-cols-1 items-center gap-4 rounded-[18px]! px-4.5 py-4 text-ink transition-all duration-250 hover:-translate-y-0.75 hover:text-ink hover:shadow-card-lg sm:grid-cols-[auto_1fr_auto]"
    >
      <span className="flex h-14 w-21 flex-none items-center justify-center rounded-xl" style={{ background: courseCover(c) }}>
        {!c.img && <Icon name={c.icon} size={22} className="text-white" />}
      </span>
      <span className="flex min-w-0 flex-col gap-1.75">
        <span className="font-display text-[15px] font-bold tracking-[-0.01em]">{c.title}</span>
        <span className="flex items-center gap-3">
          <span className="h-1.75 max-w-65 flex-1 rounded-full bg-surface2">
            <span
              className="block h-1.75 rounded-full"
              style={{ width: `${c.pct}%`, background: done ? "#3FA457" : "linear-gradient(90deg,#1B6FD0,#4FD0E0)" }}
            />
          </span>
          <span className="text-xs font-extrabold whitespace-nowrap text-soft">{c.pct}%</span>
        </span>
        <span className="text-[12.5px] font-semibold text-soft">{c.meta}</span>
      </span>
      <span className={`pill w-max px-3.25 py-1.5 text-[11.5px] ${done ? "bg-success/14 text-success" : "bg-chip text-brand"}`}>
        {done ? "COMPLETED" : "IN PROGRESS"}
      </span>
    </Link>
  );
};

export default EnrolledCourseRow;
