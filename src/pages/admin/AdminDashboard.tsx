import { useState, type ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "@/components/admin/EmptyState";
import { KpiStrip } from "@/components/admin/KpiStrip";
import { Panel } from "@/components/admin/Panel";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { OVERVIEW_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminOverview } from "@/queries/admin";
import { ADMIN_SECTIONS, type AdminSection } from "@/types/admin";
import CoursesSection from "./sections/CoursesSection";
import NotesSection from "./sections/NotesSection";
import PaymentsSection from "./sections/PaymentsSection";
import ReviewsSection from "./sections/ReviewsSection";
import StudentsSection from "./sections/StudentsSection";

/* Overview — 19-admin design */
const Overview = () => {
  usePageTitle("Admin overview");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const overview = useAdminOverview();
  return (
    <main className="flex min-w-0 flex-col gap-5.5 px-3.5 pt-4.5 pb-16 sm:px-7.5 sm:pt-6.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">{OVERVIEW_META.title}</h1>
          <span className="text-[12.5px] font-semibold text-soft">{OVERVIEW_META.sub}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex min-w-50 items-center gap-2.25 rounded-full border border-line bg-surface px-4 py-2.25">
            <Icon name="search" size={17} className="text-soft" />
            <input
              type="search"
              aria-label="Search activity"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-semibold text-ink outline-none"
            />
          </label>
          <Link to="/admin/courses/new" className="btn btn-primary px-5 py-2.75 text-[13px]">
            + New course
          </Link>
        </div>
      </div>

      <QueryStatus query={overview}>
        {({ kpis, revenue, topCourses, activity: allActivity }) => {
          const activity = allActivity.filter((a) => !query || `${a.who} ${a.what}`.toLowerCase().includes(query));
          const peak = Math.max(1, ...revenue);
          return (
            <>
              <KpiStrip items={kpis} />

              <div className="grid grid-cols-1 gap-4 min-[641px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Panel className="px-6 py-5.5">
                  <div className="mb-4.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="min-w-0 font-display text-[15px] font-extrabold text-ink">Revenue — last 8 weeks</span>
                    <span className="flex-none text-xs font-bold whitespace-nowrap text-soft">৳ thousand</span>
                  </div>
                  <div className="flex h-37.5 items-end gap-2.5" role="img" aria-label="Weekly revenue bar chart">
                    {revenue.map((v, i) => (
                      <span key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.75">
                        <span className="text-[10.5px] font-extrabold text-muted">{v}</span>
                        <span
                          className="w-full max-w-8.5 rounded-t-lg rounded-b-[3px]"
                          style={{
                            height: Math.round((v / peak) * 110),
                            background:
                              i === revenue.length - 1
                                ? "linear-gradient(180deg,#F7C948,#E9A21B)"
                                : "linear-gradient(180deg,#1B6FD0,#0E97B0)",
                          }}
                        />
                        <span className="text-[10px] font-bold text-soft">W{i + 1}</span>
                      </span>
                    ))}
                  </div>
                </Panel>
                <Panel className="flex flex-col gap-3.25 px-6 py-5.5">
                  <span className="font-display text-[15px] font-extrabold text-ink">Top courses</span>
                  {topCourses.map((t) => (
                    <div key={t.name} className="flex flex-col gap-1.5">
                      <span className="flex justify-between text-[12.5px]">
                        <span className="font-extrabold text-ink">{t.name}</span>
                        <span className="font-bold text-soft">{t.count}</span>
                      </span>
                      <span className="h-1.75 rounded-full bg-surface2">
                        <span
                          className="block h-1.75 rounded-full"
                          style={{
                            width: `${t.pct}%`,
                            background: t.gold ? "linear-gradient(90deg,#E9A21B,#F7C948)" : "linear-gradient(90deg,#1B6FD0,#4FD0E0)",
                          }}
                        />
                      </span>
                    </div>
                  ))}
                </Panel>
              </div>

              <Panel>
                <div className="flex items-center justify-between border-b border-line px-6 py-4.5">
                  <span className="font-display text-[15px] font-extrabold text-ink">Recent activity</span>
                  <Link to="/admin/students" className="text-[12.5px] font-extrabold text-brand">
                    View all →
                  </Link>
                </div>
                {activity.length === 0 && (
                  <div className="px-6 py-8 text-center text-[13px] font-semibold text-soft">Nothing matches your search.</div>
                )}
                {activity.map((a) => (
                  <div key={a.who + a.when} className="flex items-center gap-3.25 border-b border-line px-6 py-3.5 last:border-b-0">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl" style={{ background: a.bg }}>
                      <Icon name={a.icon} size={18} className="text-white" />
                    </span>
                    <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-muted">
                      <span className="font-extrabold text-ink">{a.who}</span> {a.what}
                    </span>
                    <span className="text-[11.5px] font-bold whitespace-nowrap text-soft">{a.when}</span>
                  </div>
                ))}
              </Panel>
            </>
          );
        }}
      </QueryStatus>
    </main>
  );
};

/* Section pages — BrainXNext_*_Proper designs */
const SECTION_VIEWS: Record<AdminSection, ComponentType> = {
  courses: CoursesSection,
  students: StudentsSection,
  reviews: ReviewsSection,
  payments: PaymentsSection,
  notes: NotesSection,
};

const isSection = (s: string): s is AdminSection => (ADMIN_SECTIONS as readonly string[]).includes(s);

/** /admin/<anything unknown> */
const UnknownSection = () => {
  usePageTitle("Page not found");
  return (
    <main className="flex min-w-0 flex-col px-3.5 pt-4.5 pb-16 sm:px-7.5 sm:pt-6.5">
      <Panel>
        <EmptyState
          icon="search"
          title="This admin page doesn't exist"
          action={
            <Link to="/admin" className="btn btn-primary px-5 py-2.75 text-[13px]">
              Back to overview
            </Link>
          }
        >
          Check the address, or pick a section from the sidebar.
        </EmptyState>
      </Panel>
    </main>
  );
};

const AdminDashboard = () => {
  const { section = "overview" } = useParams();
  if (section === "overview") return <Overview />;
  if (!isSection(section)) return <UnknownSection />;
  const View = SECTION_VIEWS[section];
  // key resets search and filters when switching sections
  return <View key={section} />;
};

export default AdminDashboard;
