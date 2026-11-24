import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import TypeToConfirmDialog from "@/components/admin/dialogs/TypeToConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import { formatDate, timeAgo } from "@/components/admin/format";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, ListItem, Name } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import usePageTitle from "@/hooks/usePageTitle";
import { formatTaka, plural } from "@/lib/utils";
import { useAdminCourse, useDeleteCourse, useUpdateCourse } from "@/queries/admin";
import type { AdminCourseDetail as Detail } from "@/types/admin";

const CourseView = ({ course }: { course: Detail }) => {
  usePageTitle(`Admin · ${course.title}`);
  const navigate = useNavigate();
  const update = useUpdateCourse();
  const remove = useDeleteCourse();
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const published = course.status === "published";
  const lessons = course.draft.modules.reduce((n, m) => n + m.lessons.length, 0);

  const setStatus = (status: Detail["status"]) =>
    update.mutate(
      { id: course.id, patch: { status } },
      {
        onSuccess: () => {
          toast.success(status === "published" ? "Course published" : "Course unpublished — it's a draft again");
          setConfirmUnpublish(false);
        },
        onError: (e) => toast.error(errorMessage(e)),
      }
    );

  return (
    <AdminPage
      crumbs={[{ label: "Courses", to: "/admin/courses" }, { label: course.title }]}
      eyebrow={course.track}
      title={course.title}
      desc={
        <span className="inline-flex flex-wrap items-center gap-2">
          <Pill status={course.status} />
          {plural(course.modules, "module")} · {plural(lessons, "class", "es")} · Updated {timeAgo(course.updatedAt)}
        </span>
      }
      actions={
        <>
          <HeaderButton icon="edit" to={`/admin/courses/${course.id}/edit`}>
            Edit
          </HeaderButton>
          {published ? (
            <HeaderButton icon="unpublished" onClick={() => setConfirmUnpublish(true)}>
              Unpublish
            </HeaderButton>
          ) : (
            <HeaderButton icon="rocket_launch" primary onClick={() => setStatus("published")} disabled={update.isPending}>
              Publish
            </HeaderButton>
          )}
          <HeaderButton icon="delete" danger onClick={() => setConfirmDelete(true)}>
            Delete
          </HeaderButton>
        </>
      }
    >
      <StatStrip
        stats={[
          { label: "Students", value: course.students.toLocaleString("en-IN"), trend: "Enrolled all time" },
          { label: "Completion", value: `${course.completion}%`, trend: "Average progress" },
          {
            label: "Revenue",
            value: formatTaka(course.revenue),
            trend: course.draft.pricing === "free" ? "Free course" : "Paid course orders",
          },
          {
            label: "Rating",
            value: course.rating ? `${course.rating} ★` : "—",
            trend: course.rating ? "Learner reviews" : "No ratings yet",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.3fr_1fr]">
        <AdminCard title="Curriculum" right={<span className="text-[11px] font-bold text-soft">{plural(lessons, "class", "es")}</span>}>
          {course.draft.modules.map((m, i) => (
            <details key={i} className="group border-b border-line py-1 last:border-b-0" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-3 py-2.5 text-xs font-extrabold text-ink">
                <span className="font-display text-brand">0{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{m.title || "Untitled module"}</span>
                <span className="text-[10.5px] font-bold text-soft">{plural(m.lessons.length, "class", "es")}</span>
                <Icon name="expand_more" size={18} className="text-soft transition-transform group-open:rotate-180" />
              </summary>
              <ol className="m-0 mb-2 flex list-none flex-col gap-0.5 p-0 pl-7">
                {m.lessons.map((l, li) => (
                  <li key={li} className="flex items-center gap-2.5 py-1.5 text-xs font-semibold text-muted">
                    <Icon name="smart_display" size={15} className="text-soft" />
                    <span className="min-w-0 flex-1 truncate">{l.title || "Untitled class"}</span>
                    <span className="text-[10.5px] font-bold text-soft">{l.dur}</span>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </AdminCard>

        <AdminCard title="Recent enrolments">
          {course.recentEnrollments.length === 0 ? (
            <EmptyState icon="group_add" title="No enrolments yet">
              Learners who join this course show up here.
            </EmptyState>
          ) : (
            course.recentEnrollments.map((e) => (
              <ListItem key={e.studentId}>
                <Link to={`/admin/students/${e.studentId}`} className="min-w-0 text-ink hover:text-brand">
                  <Name title={e.name} sub={`${e.email} · ${formatDate(e.enrolledAt)}`} />
                </Link>
                <b className="font-extrabold">{e.pct}%</b>
              </ListItem>
            ))
          )}
        </AdminCard>
      </div>

      <ConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Unpublish this course?"
        description="It disappears from the catalog and becomes a draft. Enrolled learners keep their progress."
        confirmLabel="Unpublish"
        danger
        pending={update.isPending}
        onConfirm={() => setStatus("draft")}
      />
      <TypeToConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this course?"
        description="This permanently removes the course and its curriculum. This can't be undone."
        confirmText={course.title}
        submitLabel="Delete course"
        pending={remove.isPending}
        error={remove.error}
        onConfirm={() =>
          remove.mutate(course.id, {
            onSuccess: () => {
              toast.success(`“${course.title}” was deleted`);
              void navigate("/admin/courses", { replace: true });
            },
          })
        }
      />
    </AdminPage>
  );
};

const AdminCourseDetail = () => {
  const { courseId = "" } = useParams();
  const query = useAdminCourse(courseId);
  return query.data ? (
    <CourseView course={query.data} />
  ) : (
    <AdminPage crumbs={[{ label: "Courses", to: "/admin/courses" }, { label: "Course" }]} title="Course">
      <QueryStatus query={query}>{() => null}</QueryStatus>
    </AdminPage>
  );
};

export default AdminCourseDetail;
