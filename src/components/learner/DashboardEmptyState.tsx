import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";

/** Shown instead of "Continue learning" + "My courses" for a learner with no enrolments yet. */
const DashboardEmptyState = () => (
  <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-12 text-center">
    <span className="bg-grad-brand flex h-16 w-16 items-center justify-center rounded-[20px] shadow-card">
      <Icon name="school" size={30} className="text-white" />
    </span>
    <h2 className="m-0 font-display text-xl font-extrabold tracking-[-0.01em] text-ink">Your learning starts here</h2>
    <p className="m-0 max-w-[42ch] text-sm leading-relaxed font-medium text-muted">
      You haven&apos;t enrolled in a course yet. Pick a free course to begin — your progress, streak and certificates will show up here.
    </p>
    <Link to="/courses" className="btn btn-primary px-6.5 py-3.5 text-[14.5px]">
      <Icon name="search" size={18} />
      Browse courses
    </Link>
  </div>
);

export default DashboardEmptyState;
