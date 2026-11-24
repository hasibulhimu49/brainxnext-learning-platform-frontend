import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateReview } from "@/queries/admin";
import { replySchema, type ReplyValues } from "@/schemas/admin";
import type { AdminReview } from "@/types/admin";
import FormDialog, { Field } from "./FormDialog";

/** Reply to a learner review (the reply is stored on the review and shown under it). */
const ReviewReplyDialog = ({ review, onOpenChange }: { review: AdminReview | null; onOpenChange: (open: boolean) => void }) => {
  const update = useUpdateReview();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyValues>({ resolver: zodResolver(replySchema), defaultValues: { message: "" } });

  useEffect(() => {
    if (review) reset({ message: review.reply ?? "" });
  }, [review, reset]);

  const close = (o: boolean) => {
    if (!o) update.reset();
    onOpenChange(o);
  };

  return (
    <FormDialog
      open={!!review}
      onOpenChange={close}
      title={review?.reply ? "Edit reply" : "Reply to review"}
      description={review ? `${review.who} · ${review.course}` : undefined}
      submitLabel="Post reply"
      pending={update.isPending}
      error={update.error}
      onSubmit={handleSubmit((v) => {
        if (!review) return;
        update.mutate(
          { id: review.id, reply: v.message },
          {
            onSuccess: () => {
              toast.success("Reply posted");
              close(false);
            },
          }
        );
      })}
    >
      {review && (
        <blockquote className="m-0 rounded-[13px] bg-surface2 px-4 py-3 text-xs leading-relaxed font-semibold text-muted">
          {review.text}
        </blockquote>
      )}
      <Field id="review-reply" label="Your reply" error={errors.message?.message}>
        <Textarea id="review-reply" rows={4} aria-invalid={!!errors.message || undefined} {...register("message")} />
      </Field>
    </FormDialog>
  );
};

export default ReviewReplyDialog;
