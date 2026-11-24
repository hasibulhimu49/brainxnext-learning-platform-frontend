import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useCreatePromo, useUpdatePromo } from "@/queries/admin";
import { promoSchema, toPromoInput, type PromoFormInput, type PromoFormValues } from "@/schemas/admin";
import type { AdminPromo } from "@/types/admin";
import FormDialog, { Field } from "./FormDialog";

const EMPTY: PromoFormInput = { code: "", percentOff: "", expiresAt: "", usageLimit: "" };

const toForm = (p: AdminPromo): PromoFormInput => ({
  code: p.code,
  percentOff: String(p.percentOff),
  expiresAt: p.expiresAt ?? "",
  usageLimit: p.usageLimit === null ? "" : String(p.usageLimit),
});

/**
 * Create (`promo` = "new") or edit a promo code. The code can't change once created,
 * because past orders reference it.
 */
const PromoDialog = ({ promo, onOpenChange }: { promo: AdminPromo | "new" | null; onOpenChange: (open: boolean) => void }) => {
  const create = useCreatePromo();
  const update = useUpdatePromo();
  const editing = promo && promo !== "new" ? promo : null;
  const mutation = editing ? update : create;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromoFormInput, unknown, PromoFormValues>({ resolver: zodResolver(promoSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (promo) reset(promo === "new" ? EMPTY : toForm(promo));
  }, [promo, reset]);

  const close = (o: boolean) => {
    if (!o) {
      create.reset();
      update.reset();
    }
    onOpenChange(o);
  };

  const onSubmit = handleSubmit((v) => {
    const input = toPromoInput(v);
    const done = (code: string) => {
      toast.success(editing ? `${code} was updated` : `${code} was created`);
      close(false);
    };
    if (editing) {
      update.mutate(
        { code: editing.code, percentOff: input.percentOff, expiresAt: input.expiresAt, usageLimit: input.usageLimit },
        { onSuccess: (p) => done(p.code) }
      );
    } else create.mutate(input, { onSuccess: (p) => done(p.code) });
  });

  return (
    <FormDialog
      open={!!promo}
      onOpenChange={close}
      title={editing ? `Edit ${editing.code}` : "Create promo code"}
      description="Checkout accepts the code while it is active, not expired and under its usage limit."
      submitLabel={editing ? "Save changes" : "Create code"}
      pending={mutation.isPending}
      error={mutation.error}
      onSubmit={onSubmit}
    >
      <Field id="promo-code" label="Code" error={errors.code?.message} hint="4–16 letters or digits; saved in capitals.">
        <Input
          id="promo-code"
          autoComplete="off"
          readOnly={!!editing}
          className="uppercase"
          aria-invalid={!!errors.code || undefined}
          {...register("code")}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Field id="promo-percent" label="% off" error={errors.percentOff?.message}>
          <Input
            id="promo-percent"
            inputMode="numeric"
            placeholder="20"
            aria-invalid={!!errors.percentOff || undefined}
            {...register("percentOff")}
          />
        </Field>
        <Field id="promo-expiry" label="Expires (optional)" error={errors.expiresAt?.message}>
          <Input id="promo-expiry" type="date" aria-invalid={!!errors.expiresAt || undefined} {...register("expiresAt")} />
        </Field>
        <Field id="promo-limit" label="Usage limit (optional)" error={errors.usageLimit?.message}>
          <Input
            id="promo-limit"
            inputMode="numeric"
            placeholder="Unlimited"
            aria-invalid={!!errors.usageLimit || undefined}
            {...register("usageLimit")}
          />
        </Field>
      </div>
    </FormDialog>
  );
};

export default PromoDialog;
