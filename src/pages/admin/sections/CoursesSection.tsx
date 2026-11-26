import { useState } from "react";
import { exportCsv, type CsvColumn } from "@/lib/csv";
import DataTable, { type Column } from "@/components/admin/DataTable";
import ImportDialog from "@/components/admin/dialogs/ImportDialog";
import EmptyState from "@/components/admin/EmptyState";
import { SearchFilter, SelectFilter } from "@/components/admin/Filters";
import { matches } from "@/lib/admin";
import { timeAgoGB } from "@/lib/dates";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, Name, ProgressBar } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import { QueryStatus } from "@/components/common/QueryStatus";
import { SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminCourses } from "@/queries/admin";
import type { AdminCourseRow, AdminCourseStatus } from "@/types/admin";

const meta = SECTION_META.courses;
type StatusFilter = "all" | AdminCourseStatus;

const COLUMNS: Column<AdminCourseRow>[] = [
  {
    key: "title",
    header: "Course",
    sort: (c) => c.title,
    render: (c) => <Name title={c.title} sub={`${c.track} • ${c.modules} modules`} />,
  },
  { key: "students", header: "Students", sort: (c) => c.students, render: (c) => c.students.toLocaleString("en-IN") },
  {
    key: "rating",
    header: "Rating",
    sort: (c) => c.rating,
    className: "font-black! text-amber",
    render: (c) => (c.rating ? `★ ${c.rating}` : "—"),
  },
  {
    key: "completion",
    header: "Completion",
    sort: (c) => c.completion,
    render: (c) => <ProgressBar pct={c.completion} label={`${c.title} completion`} />,
  },
  { key: "status", header: "Status", sort: (c) => c.status, render: (c) => <Pill status={c.status} /> },
  { key: "updated", header: "Updated", sort: (c) => c.updatedAt, render: (c) => timeAgoGB(c.updatedAt) },
];

const CSV: CsvColumn<AdminCourseRow>[] = [
  { header: "id", value: (c) => c.id },
  { header: "title", value: (c) => c.title },
  { header: "track", value: (c) => c.track },
  { header: "modules", value: (c) => c.modules },
  { header: "students", value: (c) => c.students },
  { header: "rating", value: (c) => c.rating },
  { header: "completion", value: (c) => c.completion },
  { header: "status", value: (c) => c.status },
  { header: "updated", value: (c) => c.updatedAt },
];

const CoursesSection = () => {
  usePageTitle("Admin · Courses");
  const query = useAdminCourses();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [importing, setImporting] = useState(false);
  const all = query.data?.rows ?? [];
  const rows = all.filter((c) => (status === "all" || c.status === status) && matches(q, c.title, c.track));

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
      actions={
        <>
          <HeaderButton onClick={() => setImporting(true)}>Import</HeaderButton>
          <HeaderButton onClick={() => exportCsv("brainxnext-courses.csv", CSV, rows)} disabled={!rows.length}>
            Export
          </HeaderButton>
          <HeaderButton primary to="/admin/courses/new">
            + Create course
          </HeaderButton>
        </>
      }
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip stats={data.stats} />
            <AdminCard
              title={meta.cardTitle}
              right={
                <div className="flex flex-wrap gap-2">
                  <SelectFilter
                    label="Filter by status"
                    value={status}
                    onChange={setStatus}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "published", label: "Published" },
                      { value: "draft", label: "Draft" },
                    ]}
                  />
                  <SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />
                </div>
              }
            >
              <DataTable
                label="Courses"
                columns={COLUMNS}
                rows={rows}
                initialSort={{ key: "updated", dir: "desc" }}
                min={760}
                empty={
                  data.rows.length === 0 ? (
                    <EmptyState
                      icon="auto_stories"
                      title="No courses yet"
                      action={
                        <HeaderButton primary to="/admin/courses/new">
                          + Create course
                        </HeaderButton>
                      }
                    >
                      Create your first course; it stays a draft until you publish it.
                    </EmptyState>
                  ) : undefined
                }
                actions={(c) => (
                  <RowActions>
                    <RowAction icon="visibility" label={`View ${c.title}`} to={`/admin/courses/${c.id}`} />
                    <RowAction icon="edit" label={`Edit ${c.title}`} to={`/admin/courses/${c.id}/edit`} />
                  </RowActions>
                )}
              />
            </AdminCard>
          </>
        )}
      </QueryStatus>
      <ImportDialog open={importing} onOpenChange={setImporting} what="courses" requiredHeaders={["title", "track", "level", "price"]} />
    </AdminPage>
  );
};

export default CoursesSection;
