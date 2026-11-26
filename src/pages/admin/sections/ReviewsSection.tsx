import { useState } from "react";
import { toast } from "sonner";
import ReviewReplyDialog from "@/components/admin/dialogs/ReviewReplyDialog";
import EmptyState, { NoMatches } from "@/components/admin/EmptyState";
import { FilterMenu, SelectFilter } from "@/components/admin/Filters";
import { matches } from "@/lib/admin";
import { timeAgoGB } from "@/lib/dates";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import { AdminCard, SideList } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { QueryStatus } from "@/components/common/QueryStatus";
import { PAGE_SIZE, SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { stars } from "@/lib/utils";
import { useAdminReviews, useUpdateReview } from "@/queries/admin";
import type { AdminReview } from "@/types/admin";

const meta = SECTION_META.reviews;
type ReplyFilter = "all" | "needs_reply" | "answered" | "hidden";

const byReply: Record<ReplyFilter, (r: AdminReview) => boolean> = {
  all: () => true,
  needs_reply: (r) => !r.reply && !r.hidden,
  answered: (r) => !!r.reply,
  hidden: (r) => r.hidden,
};

const ReviewsSection = () => {
  usePageTitle("Admin · Reviews");
  const query = useAdminReviews();
  const update = useUpdateReview();
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("all");
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>("all");
  const [page, setPage] = useState(0);
  const [replying, setReplying] = useState<AdminReview | null>(null);
  const [hiding, setHiding] = useState<AdminReview | null>(null);

  const all = query.data?.rows ?? [];
  const rows = all.filter(
    (r) => (rating === "all" || r.stars === Number(rating)) && byReply[replyFilter](r) && matches(q, r.who, r.course, r.text)
  );
  const current = Math.min(page, Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1));
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const filterOptions = (Object.keys(byReply) as ReplyFilter[]).map((v) => ({
    value: v,
    label: { all: "All reviews", needs_reply: "Needs reply", answered: "Answered", hidden: "Hidden" }[v],
    count: all.filter(byReply[v]).length,
  }));

  const setHidden = (r: AdminReview, hidden: boolean) =>
    update.mutate(
      { id: r.id, hidden },
      {
        onSuccess: () => {
          toast.success(hidden ? "Review hidden" : "Review is visible again");
          setHiding(null);
        },
      }
    );

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
      actions={<FilterMenu value={replyFilter} onChange={setReplyFilter} options={filterOptions} />}
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip stats={data.stats} />
            <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.45fr_.75fr]">
              <AdminCard
                title={meta.cardTitle}
                right={
                  <SelectFilter
                    label="Filter by rating"
                    value={rating}
                    onChange={setRating}
                    options={[
                      { value: "all", label: "All ratings" },
                      ...[5, 4, 3, 2, 1].map((s) => ({ value: String(s), label: `${s} star${s === 1 ? "" : "s"}` })),
                    ]}
                  />
                }
              >
                {data.rows.length === 0 ? (
                  <EmptyState icon="rate_review" title="No reviews yet">
                    Learner reviews show up here once they rate a course.
                  </EmptyState>
                ) : (
                  visible.length === 0 && <NoMatches />
                )}
                {visible.map((r) => (
                  <article key={r.id} className={`border-b border-line py-4 last:border-b-0 ${r.hidden ? "opacity-60" : ""}`}>
                    <div className="flex justify-between gap-3">
                      <div>
                        <b className="text-[13px] font-bold text-ink">{r.who}</b>
                        <div className="mt-0.75 text-[10px] font-semibold text-soft">
                          {r.course} • {timeAgoGB(r.at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="font-black whitespace-nowrap text-amber" aria-label={`${r.stars} out of 5 stars`}>
                          {stars(r.stars)}
                        </div>
                        {r.hidden && <Pill status="hidden" />}
                      </div>
                    </div>
                    <div className="mt-1.75 text-xs leading-[1.55] text-[#566D84] dark:text-muted">{r.text}</div>
                    {r.reply && (
                      <div className="mt-3 rounded-xl border-l-[3px] border-brand bg-surface2 px-3.5 py-2.5 text-xs leading-[1.55] text-muted">
                        <b className="mb-0.5 block text-[10.5px] font-extrabold tracking-[0.06em] text-brand uppercase">
                          BrainXNext replied
                        </b>
                        {r.reply}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <HeaderButton icon="reply" onClick={() => setReplying(r)}>
                        {r.reply ? "Edit reply" : "Reply"}
                      </HeaderButton>
                      {r.hidden ? (
                        <HeaderButton icon="visibility" onClick={() => setHidden(r, false)} disabled={update.isPending}>
                          Unhide
                        </HeaderButton>
                      ) : (
                        <HeaderButton icon="visibility_off" danger onClick={() => setHiding(r)}>
                          Hide
                        </HeaderButton>
                      )}
                    </div>
                  </article>
                ))}
                <Pagination page={current} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
              </AdminCard>
              <SideList title={meta.sideTitle} items={data.breakdown} />
            </div>
          </>
        )}
      </QueryStatus>

      <ReviewReplyDialog review={replying} onOpenChange={(o) => !o && setReplying(null)} />
      <ConfirmDialog
        open={!!hiding}
        onOpenChange={(o) => !o && setHiding(null)}
        title="Hide this review?"
        description={hiding ? `${hiding.who}'s review will no longer show on ${hiding.course}. You can unhide it later.` : ""}
        confirmLabel="Hide review"
        danger
        pending={update.isPending}
        onConfirm={() => hiding && setHidden(hiding, true)}
      />
    </AdminPage>
  );
};

export default ReviewsSection;
