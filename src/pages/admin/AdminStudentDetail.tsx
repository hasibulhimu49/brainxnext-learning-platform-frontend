import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { GrantCourseDialog } from "@/components/admin/dialogs/StudentDialogs";
import { formatDateGB, timeAgoGB } from "@/lib/dates";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, InfoList, ListItem, Name, ProgressBar } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { QueryStatus } from "@/components/common/QueryStatus";
import { PLAN_LABEL } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { formatTaka } from "@/lib/utils";
import { useAdminStudent, useSendPasswordReset, useSetStudentStatus } from "@/queries/admin";
import type { AdminStudentDetail as Detail } from "@/types/admin";

const SOURCE_LABEL = { free: "Free", purchase: "Purchased", granted: "Granted by admin", pro: "Pro plan" } as Record<string, string>;

const Empty = ({ children }: { children: string }) => <p className="m-0 py-5 text-center text-xs font-semibold text-soft">{children}</p>;

const StudentView = ({ student }: { student: Detail }) => {
  usePageTitle(`Admin · ${student.name}`);
  const setStatus = useSetStudentStatus();
  const reset = useSendPasswordReset();
  const [granting, setGranting] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(false);
  const suspended = student.status === "suspended";
  const spent = student.orders.filter((o) => o.status === "paid" || o.status === "refund_requested").reduce((s, o) => s + o.total, 0);

  return (
    <AdminPage
      crumbs={[{ label: "Students", to: "/admin/students" }, { label: student.name }]}
      eyebrow="Student"
      title={student.name}
      desc={
        <span className="inline-flex flex-wrap items-center gap-2">
          <Pill status={student.status} />
          {student.email} · Joined {formatDateGB(student.joinedAt)}
        </span>
      }
      actions={
        <>
          <HeaderButton
            icon="lock_reset"
            disabled={reset.isPending}
            onClick={() =>
              reset.mutate(student.id, {
                onSuccess: (r) => toast.success(`Password reset link sent to ${r.sentTo}`),
                onError: (e) => toast.error(errorMessage(e)),
              })
            }
          >
            Send password reset
          </HeaderButton>
          <HeaderButton icon="add_circle" onClick={() => setGranting(true)}>
            Grant course
          </HeaderButton>
          <HeaderButton
            icon={suspended ? "play_circle" : "block"}
            danger={!suspended}
            primary={suspended}
            onClick={() => setConfirmStatus(true)}
          >
            {suspended ? "Reactivate" : "Suspend"}
          </HeaderButton>
        </>
      }
    >
      <StatStrip
        stats={[
          { label: "Plan", value: PLAN_LABEL[student.plan], trend: student.plan === "free" ? "No subscription" : "Subscriber" },
          { label: "Courses", value: String(student.courses), trend: `${student.progress}% average progress` },
          { label: "Certificates", value: String(student.certificates.length), trend: "Completed courses" },
          { label: "Total spent", value: formatTaka(spent), trend: `${student.orders.length} orders` },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.45fr_.75fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <AdminCard title="Enrolments">
            {student.enrollments.length === 0 && <Empty>Not enrolled in any course yet.</Empty>}
            {student.enrollments.map((e) => (
              <ListItem key={e.courseId}>
                <Link to={`/admin/courses/${e.courseId}`} className="min-w-0 text-ink hover:text-brand">
                  <Name title={e.title} sub={`${SOURCE_LABEL[e.source] ?? e.source} · since ${formatDateGB(e.enrolledAt)}`} />
                </Link>
                <span className="flex flex-none items-center gap-2.5">
                  <ProgressBar pct={e.pct} label={`${e.title} progress`} />
                  <b className="w-9 text-right font-extrabold">{e.pct}%</b>
                </span>
              </ListItem>
            ))}
          </AdminCard>

          <AdminCard title="Orders">
            {student.orders.length === 0 && <Empty>No orders.</Empty>}
            {student.orders.map((o) => (
              <ListItem key={o.id}>
                <Link to={`/admin/payments/${o.id}`} className="min-w-0 text-ink hover:text-brand">
                  <Name title={o.itemTitle} sub={`${o.id} · ${o.method} · ${formatDateGB(o.createdAt)}`} />
                </Link>
                <span className="flex flex-none items-center gap-2.5">
                  <Pill status={o.status} />
                  <b className="font-black">{formatTaka(o.total)}</b>
                </span>
              </ListItem>
            ))}
          </AdminCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <AdminCard title="Profile">
            <div className="mb-3 flex items-center gap-3">
              <span className="bg-grad-brand flex h-12 w-12 flex-none items-center justify-center rounded-full font-display text-lg font-extrabold text-white">
                {student.name[0]?.toUpperCase()}
              </span>
              <Name title={student.name} sub={student.email} />
            </div>
            <InfoList
              items={[
                { label: "Student ID", value: student.id },
                { label: "Plan", value: PLAN_LABEL[student.plan] },
                { label: "Status", value: <Pill status={student.status} /> },
                { label: "Last active", value: timeAgoGB(student.lastActiveAt) },
                { label: "Joined", value: formatDateGB(student.joinedAt) },
              ]}
            />
          </AdminCard>
          <AdminCard title="Certificates">
            {student.certificates.length === 0 && <Empty>No certificates yet.</Empty>}
            {student.certificates.map((c) => (
              <ListItem key={c.courseId}>
                <Name title={c.title} sub={`Completed ${formatDateGB(c.completedAt)}`} />
                <Pill label="Issued" tone="success" />
              </ListItem>
            ))}
          </AdminCard>
        </div>
      </div>

      <GrantCourseDialog
        open={granting}
        onOpenChange={setGranting}
        studentId={student.id}
        ownedIds={student.enrollments.map((e) => e.courseId)}
      />
      <ConfirmDialog
        open={confirmStatus}
        onOpenChange={setConfirmStatus}
        title={suspended ? `Reactivate ${student.name}?` : `Suspend ${student.name}?`}
        description={
          suspended
            ? "They can log in and learn again."
            : "They can't log in or open courses until you reactivate them. Their progress and orders are kept."
        }
        confirmLabel={suspended ? "Reactivate" : "Suspend"}
        danger={!suspended}
        pending={setStatus.isPending}
        onConfirm={() =>
          setStatus.mutate(
            { id: student.id, status: suspended ? "active" : "suspended" },
            {
              onSuccess: () => {
                toast.success(suspended ? `${student.name} was reactivated` : `${student.name} was suspended`);
                setConfirmStatus(false);
              },
              onError: (e) => toast.error(errorMessage(e)),
            }
          )
        }
      />
    </AdminPage>
  );
};

const AdminStudentDetail = () => {
  const { studentId = "" } = useParams();
  const query = useAdminStudent(studentId);
  return query.data ? (
    <StudentView student={query.data} />
  ) : (
    <AdminPage crumbs={[{ label: "Students", to: "/admin/students" }, { label: "Student" }]} title="Student">
      <QueryStatus query={query}>{() => null}</QueryStatus>
    </AdminPage>
  );
};

export default AdminStudentDetail;
