import { useState } from "react";
import { exportCsv, type CsvColumn } from "@/lib/csv";
import DataTable, { type Column } from "@/components/admin/DataTable";
import { AddStudentDialog } from "@/components/admin/dialogs/StudentDialogs";
import EmptyState from "@/components/admin/EmptyState";
import { SearchFilter, SelectFilter } from "@/components/admin/Filters";
import { matches } from "@/lib/admin";
import { formatDateGB, timeAgoGB } from "@/lib/dates";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, Name } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import { QueryStatus } from "@/components/common/QueryStatus";
import { PLAN_LABEL, SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminStudents } from "@/queries/admin";
import type { AdminStudentRow, AdminStudentStatus } from "@/types/admin";

const meta = SECTION_META.students;
type StatusFilter = "all" | AdminStudentStatus;

const COLUMNS: Column<AdminStudentRow>[] = [
  { key: "name", header: "Student", sort: (s) => s.name, render: (s) => <Name title={s.name} sub={s.email} /> },
  { key: "plan", header: "Plan", sort: (s) => s.plan, render: (s) => PLAN_LABEL[s.plan] },
  { key: "courses", header: "Courses", sort: (s) => s.courses, render: (s) => s.courses },
  { key: "progress", header: "Progress", sort: (s) => s.progress, render: (s) => `${s.progress}%` },
  { key: "status", header: "Status", sort: (s) => s.status, render: (s) => <Pill status={s.status} /> },
  { key: "active", header: "Last active", sort: (s) => s.lastActiveAt, render: (s) => timeAgoGB(s.lastActiveAt) },
  { key: "joined", header: "Joined", sort: (s) => s.joinedAt, render: (s) => formatDateGB(s.joinedAt) },
];

const CSV: CsvColumn<AdminStudentRow>[] = [
  { header: "id", value: (s) => s.id },
  { header: "name", value: (s) => s.name },
  { header: "email", value: (s) => s.email },
  { header: "plan", value: (s) => s.plan },
  { header: "courses", value: (s) => s.courses },
  { header: "progress", value: (s) => s.progress },
  { header: "status", value: (s) => s.status },
  { header: "last_active", value: (s) => s.lastActiveAt },
  { header: "joined", value: (s) => s.joinedAt },
];

const StudentsSection = () => {
  usePageTitle("Admin · Students");
  const query = useAdminStudents();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [adding, setAdding] = useState(false);
  const rows = (query.data?.rows ?? []).filter((s) => (status === "all" || s.status === status) && matches(q, s.name, s.email));

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
      actions={
        <>
          <HeaderButton onClick={() => exportCsv("brainxnext-students.csv", CSV, rows)} disabled={!rows.length}>
            Export
          </HeaderButton>
          <HeaderButton primary onClick={() => setAdding(true)}>
            + Add student
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
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                  />
                  <SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />
                </div>
              }
            >
              <DataTable
                label="Students"
                columns={COLUMNS}
                rows={rows}
                initialSort={{ key: "active", dir: "desc" }}
                min={760}
                empty={
                  data.rows.length === 0 ? (
                    <EmptyState
                      icon="group"
                      title="No students yet"
                      action={
                        <HeaderButton primary onClick={() => setAdding(true)}>
                          + Add student
                        </HeaderButton>
                      }
                    >
                      Learners appear here when they sign up.
                    </EmptyState>
                  ) : undefined
                }
                actions={(s) => (
                  <RowActions>
                    <RowAction icon="visibility" label={`View ${s.name}`} to={`/admin/students/${s.id}`} />
                  </RowActions>
                )}
              />
            </AdminCard>
          </>
        )}
      </QueryStatus>
      <AddStudentDialog open={adding} onOpenChange={setAdding} />
    </AdminPage>
  );
};

export default StudentsSection;
