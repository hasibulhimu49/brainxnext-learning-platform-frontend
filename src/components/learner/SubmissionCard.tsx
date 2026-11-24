import { useId, useState } from "react";
import Icon from "@/components/common/Icon";
import { formatDate } from "@/lib/dates";
import type { Submission, SubmissionStatus } from "@/types/commerce";

const STATUS: Record<SubmissionStatus, { label: string; cls: string; icon: string }> = {
  pending: { label: "Pending", cls: "bg-amber/16 text-amber", icon: "hourglass_top" },
  approved: { label: "Approved", cls: "bg-success/14 text-success", icon: "check_circle" },
  changes_requested: { label: "Changes requested", cls: "bg-danger/12 text-danger", icon: "edit_note" },
};

export const SubmissionStatusPill = ({ status }: { status: SubmissionStatus }) => (
  <span className={`pill w-max px-2.75 py-1.5 text-[11.5px] tracking-normal ${STATUS[status].cls}`}>
    <Icon name={STATUS[status].icon} size={15} />
    {STATUS[status].label}
  </span>
);

/** One project submission in "My reviews", with the mentor's feedback behind a toggle. */
const SubmissionCard = ({ submission: s }: { submission: Submission }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <article className="card flex flex-col gap-3.5 rounded-[20px]! p-5.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="m-0 font-display text-[16px] font-extrabold tracking-[-0.01em] text-ink">{s.title}</h2>
          <span className="text-[13px] font-semibold text-soft">
            {s.courseTitle} · {s.moduleTitle} · submitted {formatDate(s.submittedAt)}
          </span>
        </div>
        <SubmissionStatusPill status={s.status} />
      </div>
      <a
        href={s.repoUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-max max-w-full items-center gap-1.5 truncate text-[13px] font-bold text-brand"
      >
        <Icon name="link" size={16} />
        {s.repoUrl.replace(/^https?:\/\//, "")}
      </a>
      {s.notes && <p className="m-0 text-[13.5px] leading-relaxed font-medium text-muted">{s.notes}</p>}
      {s.status === "pending" ? (
        <span className="text-[12.5px] font-semibold text-soft">A mentor usually replies within 48 hours.</span>
      ) : (
        <div className="flex flex-col gap-2.5 border-t border-line pt-3.5">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex w-max items-center gap-1.5 text-[13.5px] font-extrabold text-ink hover:text-brand"
          >
            <Icon name={open ? "expand_less" : "expand_more"} size={19} />
            {open ? "Hide mentor feedback" : "Show mentor feedback"}
          </button>
          {open && (
            <div id={panelId} className="rounded-[14px] border border-line bg-surface2 px-4 py-3.5">
              <p className="m-0 text-[13.5px] leading-relaxed font-medium text-muted">{s.feedback ?? "No written feedback."}</p>
              {s.reviewer && (
                <span className="mt-2 block text-[12px] font-bold text-soft">
                  — {s.reviewer}
                  {s.reviewedAt ? `, ${formatDate(s.reviewedAt)}` : ""}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default SubmissionCard;
