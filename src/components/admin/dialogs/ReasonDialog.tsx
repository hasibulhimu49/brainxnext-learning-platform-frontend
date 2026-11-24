import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { refundSchema, type RefundValues } from "@/schemas/admin";
import FormDialog, { Field } from "./FormDialog";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  submitLabel: string;
  reasonLabel?: string;
  danger?: boolean;
  pending?: boolean;
  error?: unknown;
  onConfirm: (reason: string) => void;
}

/** Confirm a money decision with a written reason (refund, reject refund). */
const ReasonDialog = ({ open, onOpenChange, reasonLabel = "Reason", onConfirm, ...rest }: ReasonDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundValues>({ resolver: zodResolver(refundSchema), defaultValues: { reason: "" } });

  // start empty each time it opens
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <FormDialog {...rest} open={open} onOpenChange={onOpenChange} onSubmit={handleSubmit((v) => onConfirm(v.reason))}>
      <Field id="reason" label={reasonLabel} error={errors.reason?.message}>
        <Textarea id="reason" rows={3} aria-invalid={!!errors.reason || undefined} {...register("reason")} />
      </Field>
    </FormDialog>
  );
};

export default ReasonDialog;
