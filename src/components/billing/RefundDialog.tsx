import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REFUND_WINDOW_DAYS } from "@/constants/plans";
import { formatTaka } from "@/lib/utils";
import { useRequestRefund } from "@/queries/account";
import { refundRequestSchema, type RefundRequestValues } from "@/schemas/learner";
import type { OrderRecord } from "@/types/commerce";

interface RefundDialogProps {
  /** the order being refunded; null = closed */
  order: OrderRecord | null;
  onClose: () => void;
}

/** Billing → Request a refund (paid orders under 30 days). An admin approves it (F-002 Phase 3). */
const RefundDialog = ({ order, onClose }: RefundDialogProps) => {
  const refund = useRequestRefund();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundRequestValues>({ resolver: zodResolver(refundRequestSchema), defaultValues: { reason: "" } });

  const close = () => {
    reset();
    refund.reset();
    onClose();
  };

  const onSubmit = handleSubmit(({ reason }) => {
    if (!order) return;
    refund.mutate(
      { id: order.id, reason },
      {
        onSuccess: () => {
          toast("Refund requested — we'll email you within 2 business days");
          close();
        },
      }
    );
  });

  return (
    <Dialog open={order !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a refund</DialogTitle>
          <DialogDescription>
            {order ? (
              <>
                {order.itemTitle} · {formatTaka(order.total)}. Our {REFUND_WINDOW_DAYS}-day money-back guarantee covers it — tell us what
                went wrong so we can improve.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3.5" noValidate onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea id="refund-reason" rows={4} aria-invalid={!!errors.reason || undefined} {...register("reason")} />
            <FieldError message={errors.reason?.message} />
          </div>
          {refund.isError && <Alert>{errorMessage(refund.error)}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="danger" size="md" disabled={refund.isPending} aria-busy={refund.isPending || undefined}>
              Request refund
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefundDialog;
