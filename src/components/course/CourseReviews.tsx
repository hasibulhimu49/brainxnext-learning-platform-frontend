import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/dates";
import { plural, stars } from "@/lib/utils";
import { useMyReview, useSaveReview } from "@/queries/reviews";
import { reviewSchema, type ReviewValues } from "@/schemas/review";
import { useIsSignedIn } from "@/stores/authStore";
import type { CourseDetail, CourseReview, MyReviewState } from "@/types/course";

const FILLED = { fontVariationSettings: "'FILL' 1" };

/** 1–5 star picker as a radio group. */
const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        role="radio"
        aria-checked={value === n}
        aria-label={plural(n, "star")}
        onClick={() => onChange(n)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-amber transition-transform hover:scale-110"
      >
        <Icon name="star" size={28} style={n <= value ? FILLED : undefined} />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ courseId, initial, onDone }: { courseId: string; initial: CourseReview | null; onDone: () => void }) => {
  const save = useSaveReview(courseId);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { stars: initial?.stars ?? 0, text: initial?.text ?? "" },
  });
  const value = useWatch({ control, name: "stars" });
  const onSubmit = handleSubmit((v) =>
    save.mutate(v, {
      onSuccess: () => {
        toast(initial ? "Your review was updated" : "Thanks for your review!");
        onDone();
      },
    })
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 rounded-2xl border border-line bg-surface2 p-4.5">
      <span className="text-[14px] font-extrabold text-ink">{initial ? "Edit your review" : "Rate this course"}</span>
      <StarPicker value={value} onChange={(n) => setValue("stars", n, { shouldValidate: true })} />
      {errors.stars && (
        <span role="alert" className="text-[12.5px] font-bold text-danger">
          {errors.stars.message}
        </span>
      )}
      <Textarea
        aria-label="Your review"
        rows={4}
        placeholder="What did you like? What could be better?"
        aria-invalid={!!errors.text || undefined}
        {...register("text")}
      />
      {errors.text && (
        <span role="alert" className="text-[12.5px] font-bold text-danger">
          {errors.text.message}
        </span>
      )}
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}
      <div className="flex flex-wrap gap-2.5">
        <Button type="submit" variant="primary" size="none" disabled={save.isPending} className="px-5 py-3 text-[13.5px]">
          {initial ? "Update review" : "Post review"}
        </Button>
        {initial && (
          <Button type="button" variant="outline" size="none" onClick={onDone} className="px-5 py-3 text-[13.5px]">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

/** What the signed-in learner can do: write, edit, or why not yet. */
const MyReview = ({ courseId, state }: { courseId: string; state: MyReviewState }) => {
  const [editing, setEditing] = useState(false);
  if (state.reason === "not_enrolled") return null;
  if (state.reason === "too_early") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-line px-4.5 py-4 text-[13px] font-semibold text-muted">
        <span>
          Finish {state.minPct}% of the course to leave a review — you&apos;re at {state.progressPct}%.
        </span>
        <span className="h-1.5 overflow-hidden rounded-full bg-chip" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-brand"
            style={{ width: `${Math.min(100, (state.progressPct / state.minPct) * 100)}%` }}
          />
        </span>
      </div>
    );
  }
  if (!state.review || editing) return <ReviewForm courseId={courseId} initial={state.review} onDone={() => setEditing(false)} />;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-chip px-4.5 py-3.5">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[12px] font-extrabold tracking-[0.06em] text-brand">YOUR REVIEW</span>
        <span className="text-[14px] tracking-[2px] text-amber" aria-label={`${state.review.stars} out of 5 stars`}>
          {stars(state.review.stars)}
        </span>
      </span>
      <Button type="button" variant="outline" size="none" onClick={() => setEditing(true)} className="px-4.5 py-2.5 text-[13px]">
        <Icon name="edit" size={16} />
        Edit
      </Button>
    </div>
  );
};

const ReviewComposer = ({ courseId }: { courseId: string }) => {
  const signedIn = useIsSignedIn();
  const mine = useMyReview(courseId);
  if (!signedIn) {
    return (
      <p className="m-0 text-[13px] font-semibold text-muted">
        <Link to={`/login?next=${encodeURIComponent(`/courses/${courseId}`)}`} className="font-extrabold text-brand">
          Log in
        </Link>{" "}
        to rate a course you&apos;re taking.
      </p>
    );
  }
  return mine.data ? <MyReview courseId={courseId} state={mine.data} /> : null;
};

/** Course page "Reviews" card (F-006): average, the learner's own review, then every visible review with the team's reply. */
const CourseReviews = ({ course }: { course: CourseDetail }) => {
  const { reviews } = course;
  const average = reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;
  return (
    <div id="reviews" className="card flex scroll-mt-24 flex-col gap-4.5 p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 font-display text-[21px] font-extrabold tracking-[-0.01em] text-ink">Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-baseline gap-2 text-[13.5px] font-bold text-muted">
            <span className="font-display text-[19px] font-extrabold text-ink">{average.toFixed(1)}</span>
            <span className="tracking-[2px] text-amber" aria-hidden="true">
              {stars(Math.round(average))}
            </span>
            <span>({plural(reviews.length, "review")})</span>
          </span>
        )}
      </div>

      <ReviewComposer courseId={course.id} />

      {reviews.length === 0 ? (
        <p className="m-0 text-[13.5px] font-medium text-muted">No reviews yet — learners can review once they&apos;re 30% through.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 min-[1001px]:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id ?? r.name} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface2 p-4.5">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[15px] tracking-[2px] text-amber" aria-label={`${r.stars} out of 5 stars`}>
                  {stars(r.stars)}
                </span>
                {r.at && <span className="text-[11.5px] font-bold text-soft">{formatDate(r.at)}</span>}
              </span>
              <span className="text-[13.5px] leading-[1.55] font-medium text-muted">{r.text}</span>
              <span className="text-[12.5px] font-extrabold text-ink">{r.name}</span>
              {r.reply && (
                <span className="flex flex-col gap-1 rounded-xl border-l-[3px] border-brand bg-surface px-3.5 py-2.5 text-[12.5px] leading-normal text-muted">
                  <span className="font-extrabold text-brand">Reply from BrainXNext</span>
                  {r.reply}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
