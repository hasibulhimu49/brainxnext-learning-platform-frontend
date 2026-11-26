import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import EnrolledCourseRow from "@/components/learner/EnrolledCourseRow";
import LearnerPage, { EmptyCard } from "@/components/learner/LearnerPage";
import usePageTitle from "@/hooks/usePageTitle";
import { useDashboard } from "@/queries/account";
import type { EnrolledCourse } from "@/types/dashboard";

const TABS = [
  { id: "progress", label: "In progress", match: (c: EnrolledCourse) => c.pct < 100 },
  { id: "completed", label: "Completed", match: (c: EnrolledCourse) => c.pct === 100 },
  { id: "all", label: "All", match: () => true },
] as const;
type TabId = (typeof TABS)[number]["id"];

const EMPTY: Record<TabId, string> = {
  progress: "Nothing in progress — every course you started is finished. Pick something new.",
  completed: "No finished courses yet. Keep going — completing every lesson earns the certificate.",
  all: "You haven't enrolled in a course yet. Pick a free course to begin.",
};

const MyCoursesView = ({ courses }: { courses: EnrolledCourse[] }) => {
  const [tab, setTab] = useState<TabId>("progress");
  const shown = courses.filter(TABS.find((t) => t.id === tab)?.match ?? (() => true));
  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Filter courses" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            data-active={tab === t.id}
            className="filter-chip"
          >
            {t.label} <span className="opacity-70">({courses.filter(t.match).length})</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyCard
          icon="school"
          title="No courses here"
          action={
            <Link to="/courses" className="btn btn-primary px-6.5 py-3.5 text-[14.5px]">
              <Icon name="search" size={18} />
              Browse courses
            </Link>
          }
        >
          {EMPTY[tab]}
        </EmptyCard>
      ) : (
        <div role="tabpanel" className="flex flex-col gap-3">
          {shown.map((c) => (
            <EnrolledCourseRow key={c.courseId} course={c} />
          ))}
        </div>
      )}
    </div>
  );
};

/** /dashboard/courses — every course the learner is enrolled in, filtered by status. */
const MyCourses = () => {
  usePageTitle("My courses");
  const dashboard = useDashboard();
  return (
    <LearnerPage
      title="My courses"
      actions={
        <Link to="/courses" className="btn btn-outline px-5 py-3 text-[13.5px]">
          Browse more
          <Icon name="arrow_forward" size={17} />
        </Link>
      }
    >
      <QueryStatus query={dashboard}>{(d) => <MyCoursesView courses={d.myCourses} />}</QueryStatus>
    </LearnerPage>
  );
};

export default MyCourses;
