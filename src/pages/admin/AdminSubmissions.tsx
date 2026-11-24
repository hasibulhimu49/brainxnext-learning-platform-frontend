import { useState } from "react";
import DataTable, { type Column } from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import { ChipFilter, SearchFilter } from "@/components/admin/Filters";
import { formatDateTime, matches, slaHoursLeft } from "@/components/admin/format";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage from "@/components/admin/PageHeader";
import { AdminCard, Name } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import SlaPill from "@/components/admin/SlaPill";
import { QueryStatus } from "@/components/common/QueryStatus";
import { SECTION_META, SUBMISSION_SLA_HOURS } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminSubmissions } from "@/queries/admin";
import type { Submission, SubmissionStatus } from "@/types/commerce";

const meta = SECTION_META.submissions;

const COLUMNS: Column<Submission>[] = [
  { key: "title", header: "Project", sort: (s) => s.title, render: (s) => <Name title={s.title} sub={s.id} /> },
  { key: "learner", header: "Learner", sort: (s) => s.userName, render: (s) => <Name title={s.userName} sub={s.userEmail} /> },
  { key: "course", header: "Course", sort: (s) => s.courseTitle, render: (s) => <Name title={s.courseTitle} sub={s.moduleTitle} /> },
  {
    key: "submitted",
    header: "Submitted",
    sort: (s) => s.submittedAt,
    className: "whitespace-nowrap",
    render: (s) => formatDateTime(s.submittedAt),
  },
  {
    key: "sla",
    header: "SLA",
    sort: (s) => (s.status === "pending" ? slaHoursLeft(s.submittedAt, SUBMISSION_SLA_HOURS) : 9999),
    render: (s) => <SlaPill submission={s} />,
  },
  { key: "status", header: "Status", sort: (s) => s.status, render: (s) => <Pill status={s.status} /> },
];

type Filter = SubmissionStatus | "all";

const AdminSubmissions = () => {
  usePageTitle("Admin · Submissions");
  const query = useAdminSubmissions();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Filter>("pending");
  const all = query.data ?? [];
  const rows = all.filter((s) => (status === "all" || s.status === status) && matches(q, s.title, s.userName, s.userEmail, s.courseTitle));
  const count = (v: Filter) => (v === "all" ? all.length : all.filter((s) => s.status === v).length);
  const overdue = all.filter((s) => s.status === "pending" && slaHoursLeft(s.submittedAt, SUBMISSION_SLA_HOURS) < 0).length;

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip
              stats={[
                { label: "Pending", value: String(count("pending")), trend: `${SUBMISSION_SLA_HOURS} h review SLA` },
                { label: "Overdue", value: String(overdue), trend: overdue ? "Past the SLA" : "All on time" },
                { label: "Approved", value: String(count("approved")), trend: "All time" },
                { label: "Changes requested", value: String(count("changes_requested")), trend: "Waiting on learners" },
              ]}
            />
            <AdminCard
              title={meta.cardTitle}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <ChipFilter
                    label="Filter by status"
                    value={status}
                    onChange={setStatus}
                    options={(["pending", "approved", "changes_requested", "all"] as const).map((v) => ({
                      value: v,
                      label: { pending: "Pending", approved: "Approved", changes_requested: "Changes requested", all: "All" }[v],
                      count: count(v),
                    }))}
                  />
                  <SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />
                </div>
              }
            >
              <DataTable
                label="Submissions"
                columns={COLUMNS}
                rows={rows}
                initialSort={{ key: "submitted", dir: "asc" }}
                min={880}
                empty={
                  data.length === 0 ? (
                    <EmptyState icon="assignment_turned_in" title="No submissions yet">
                      Learner projects arrive here for review.
                    </EmptyState>
                  ) : status === "pending" && !q ? (
                    <EmptyState icon="task_alt" title="Queue is clear">
                      Every submitted project has been reviewed.
                    </EmptyState>
                  ) : undefined
                }
                actions={(s) => (
                  <RowActions>
                    <RowAction
                      icon={s.status === "pending" ? "rate_review" : "visibility"}
                      label={`${s.status === "pending" ? "Review" : "View"} ${s.title}`}
                      to={`/admin/submissions/${s.id}`}
                    />
                  </RowActions>
                )}
              />
            </AdminCard>
          </>
        )}
      </QueryStatus>
    </AdminPage>
  );
};

export default AdminSubmissions;
