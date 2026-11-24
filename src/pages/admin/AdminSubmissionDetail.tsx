import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/auth/AuthCard";
import { errorMessage } from "@/api/envelope";
import { Field } from "@/components/admin/dialogs/FormDialog";
import { formatDateTime } from "@/components/admin/format";
import AdminPage from "@/components/admin/PageHeader";
import { AdminCard, InfoList } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import SlaPill from "@/components/admin/SlaPill";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminSubmission, useReviewSubmission } from "@/queries/admin";
import { FEEDBACK_MIN, feedbackSchema, type FeedbackValues } from "@/schemas/admin";
import type { SubmissionDecision } from "@/types/admin";
import type { Submission } from "@/types/commerce";

const ReviewForm = ({ submission }: { submission: Submission }) => {
  const navigate = useNavigate();
  const review = useReviewSubmission();
  const [decision, setDecision] = useState<SubmissionDecision | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackValues>({ resolver: zodResolver(feedbackSchema), defaultValues: { feedback: submission.feedback ?? "" } });
  const length = (useWatch({ control, name: "feedback" }) ?? "").trim().length;

  const submit = (d: SubmissionDecision) =>
    handleSubmit((v) => {
      setDecision(d);
      review.mutate(
        { id: submission.id, decision: d, feedback: v.feedback },
        {
          onSuccess: () => {
            toast.success(d === "approved" ? `Approved “${submission.title}”` : `Changes requested from ${submission.userName}`);
            void navigate("/admin/submissions");
          },
        }
      );
    });

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <Field
        id="feedback"
        label="Feedback for the learner"
        error={errors.feedback?.message}
        hint={`${length} / ${FEEDBACK_MIN}+ characters. The learner sees this with your decision.`}
      >
        <Textarea id="feedback" rows={7} aria-invalid={!!errors.feedback || undefined} {...register("feedback")} />
      </Field>
      {review.isError && <Alert>{errorMessage(review.error)}</Alert>}
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          size="md"
          disabled={review.isPending}
          aria-busy={(review.isPending && decision === "changes_requested") || undefined}
          onClick={() => void submit("changes_requested")()}
        >
          <Icon name="replay" size={17} />
          Request changes
        </Button>
        <Button
          variant="success"
          size="md"
          disabled={review.isPending}
          aria-busy={(review.isPending && decision === "approved") || undefined}
          onClick={() => void submit("approved")()}
        >
          <Icon name="check_circle" size={17} />
          Approve
        </Button>
      </div>
    </form>
  );
};

const SubmissionView = ({ submission: s }: { submission: Submission }) => {
  usePageTitle(`Admin · ${s.title}`);
  const reviewed = s.status !== "pending";
  return (
    <AdminPage
      crumbs={[{ label: "Submissions", to: "/admin/submissions" }, { label: s.id }]}
      eyebrow={s.courseTitle}
      title={s.title}
      desc={
        <span className="inline-flex flex-wrap items-center gap-2">
          <Pill status={s.status} />
          <SlaPill submission={s} />
          Submitted {formatDateTime(s.submittedAt)}
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.45fr_.75fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <AdminCard title="Learner notes">
            <p className="m-0 text-[13px] leading-relaxed font-semibold whitespace-pre-line text-muted">{s.notes || "No notes."}</p>
            <a
              href={s.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-extrabold break-all text-brand"
            >
              <Icon name="code" size={17} />
              {s.repoUrl}
              <Icon name="open_in_new" size={15} />
            </a>
          </AdminCard>
          <AdminCard title={reviewed ? "Review" : "Your review"}>
            {reviewed && (
              <div className="mb-4 rounded-[13px] bg-surface2 px-4 py-3 text-xs leading-relaxed font-semibold text-muted">
                <b className="mb-1 block text-ink">
                  {s.status === "approved" ? "Approved" : "Changes requested"} by {s.reviewer ?? "—"} · {formatDateTime(s.reviewedAt)}
                </b>
                {s.feedback}
              </div>
            )}
            {reviewed && <p className="mt-0 mb-3 text-[11.5px] font-bold text-soft">You can change the decision below.</p>}
            <ReviewForm submission={s} />
          </AdminCard>
        </div>
        <AdminCard title="Details" className="self-start">
          <InfoList
            items={[
              { label: "Learner", value: s.userName },
              { label: "Email", value: s.userEmail },
              { label: "Course", value: s.courseTitle },
              { label: "Module", value: s.moduleTitle },
              { label: "Submission", value: s.id },
            ]}
          />
        </AdminCard>
      </div>
    </AdminPage>
  );
};

const AdminSubmissionDetail = () => {
  const { submissionId = "" } = useParams();
  const query = useAdminSubmission(submissionId);
  return query.data ? (
    <SubmissionView submission={query.data} />
  ) : (
    <AdminPage crumbs={[{ label: "Submissions", to: "/admin/submissions" }, { label: "Submission" }]} title="Submission">
      <QueryStatus query={query}>{() => null}</QueryStatus>
    </AdminPage>
  );
};

export default AdminSubmissionDetail;
