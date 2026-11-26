import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ChangeEvent, ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { discountFor, formatTaka } from "@/lib/utils";
import {
  PAYMENT_METHODS,
  checkoutFormSchema,
  defaultCheckoutValues,
  formatCardNumber,
  formatExpiry,
  onlyDigits,
  toPayment,
  type CheckoutFormValues,
  type PaymentValues,
} from "@/schemas/checkout";
import type { PromoResult } from "@/types/account";
import MethodPicker from "./MethodPicker";

const fieldCls = "py-3.5! text-[14.5px]!";

type FormattedField = "cardNumber" | "expiry" | "cvc" | "walletNumber";

export type PromoMutation = UseMutationResult<PromoResult, Error, string>;

interface PaymentFormProps {
  /** before any promo, whole taka */
  price: number;
  promo: PromoMutation;
  pending: boolean;
  error: unknown;
  onPay: (payment: PaymentValues, promoCode?: string) => void;
  /** small print under the pay button */
  note: ReactNode;
  /** pre-fills the promo box (e.g. a code already applied in the cart) */
  initialPromo?: string;
}

/** Payment method, card / wallet fields, promo code and the Pay button — shared by course and plan checkout. */
const PaymentForm = ({ price, promo, pending, error, onPay, note, initialPromo = "" }: PaymentFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { ...defaultCheckoutValues, promo: initialPromo },
  });

  const values = useWatch({ control });

  /** Controlled props for inputs that reformat as you type (card number, expiry…). */
  const formatted = (name: FormattedField, format: (v: string) => string) => ({
    name,
    value: values[name] ?? "",
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setValue(name, format(e.target.value), { shouldDirty: true, shouldValidate: !!errors[name] }),
  });

  const method = values.method ?? "Card";
  const ready = checkoutFormSchema.safeParse(values).success;
  const total = formatTaka(price - discountFor(price, promo.data?.percentOff ?? 0));

  const onSubmit = handleSubmit((v) => onPay(toPayment(v), promo.data?.code));

  return (
    <form className="flex flex-col gap-5.5" onSubmit={onSubmit} noValidate>
      <h1 className="m-0 font-display text-[23px] font-extrabold tracking-[-0.02em] text-ink">Payment</h1>

      <Controller
        control={control}
        name="method"
        render={({ field }) => <MethodPicker methods={PAYMENT_METHODS} value={field.value} onChange={field.onChange} />}
      />

      {method === "Card" ? (
        <div className="flex flex-col gap-3.25">
          <Input
            className={fieldCls}
            placeholder="Name on card"
            aria-label="Name on card"
            autoComplete="cc-name"
            aria-invalid={!!errors.cardName || undefined}
            {...register("cardName")}
          />
          <FieldError message={errors.cardName?.message} />
          <span className="relative block">
            <Input
              className={`${fieldCls} pr-13! tracking-[0.04em]`}
              placeholder="Card number"
              aria-label="Card number"
              inputMode="numeric"
              autoComplete="cc-number"
              aria-invalid={!!errors.cardNumber || undefined}
              {...formatted("cardNumber", formatCardNumber)}
            />
            <Icon name="credit_card" size={22} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-soft" />
          </span>
          <FieldError message={errors.cardNumber?.message} />
          <div className="grid grid-cols-1 gap-3.25 min-[561px]:grid-cols-2">
            <span className="flex flex-col gap-2">
              <Input
                className={fieldCls}
                placeholder="MM / YY"
                aria-label="Expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                aria-invalid={!!errors.expiry || undefined}
                {...formatted("expiry", formatExpiry)}
              />
              <FieldError message={errors.expiry?.message} />
            </span>
            <span className="flex flex-col gap-2">
              <Input
                className={fieldCls}
                type="password"
                placeholder="CVC"
                aria-label="CVC"
                inputMode="numeric"
                autoComplete="cc-csc"
                aria-invalid={!!errors.cvc || undefined}
                {...formatted("cvc", onlyDigits(4))}
              />
              <FieldError message={errors.cvc?.message} />
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.25">
          <Input
            className={fieldCls}
            type="tel"
            inputMode="numeric"
            placeholder={`${method} account number (01XXXXXXXXX)`}
            aria-label={`${method} account number`}
            aria-invalid={!!errors.walletNumber || undefined}
            {...formatted("walletNumber", onlyDigits(11))}
          />
          <FieldError message={errors.walletNumber?.message} />
          <div className="flex items-start gap-2.5 rounded-[13px] border border-line bg-surface2 px-3.75 py-3.25">
            <Icon name="info" size={18} className="mt-px text-brand" />
            <span className="text-[12.5px] leading-[1.55] font-semibold text-muted">
              You&apos;ll get a payment request on your phone. Approve it with your PIN to finish.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <label htmlFor="promo" className="text-[12.5px] font-extrabold tracking-[0.06em] text-soft">
          PROMO CODE
        </label>
        <div className="flex gap-2.5">
          <Input
            id="promo"
            className="min-w-0 flex-1 font-bold! uppercase"
            placeholder="e.g. LEARN20"
            aria-invalid={promo.isError || undefined}
            {...register("promo", { onChange: () => promo.reset() })}
          />
          <button
            type="button"
            disabled={promo.isPending}
            onClick={() => values.promo?.trim() && promo.mutate(values.promo.trim())}
            className="rounded-[13px] border-[1.5px] border-line bg-surface px-5.5 text-[13.5px] font-extrabold text-ink transition-all hover:border-brand hover:text-brand"
          >
            Apply
          </button>
        </div>
        {promo.isSuccess && (
          <span className="text-[12.5px] font-bold text-success">
            ✓ {promo.data.code} applied — {promo.data.percentOff}% off
          </span>
        )}
        {promo.isError && <span className="text-[12.5px] font-bold text-danger">{errorMessage(promo.error)}</span>}
      </div>

      <Button
        type="submit"
        size="none"
        shape="rounded"
        disabled={pending}
        aria-busy={pending || undefined}
        className={`px-5 py-4 text-[15px] ${ready && !pending ? "" : "opacity-55"}`}
      >
        <Icon name={pending ? "progress_activity" : "lock"} size={18} className={pending ? "animate-spin" : ""} />
        Pay {total}
      </Button>
      {!!error && <Alert>{errorMessage(error)}</Alert>}
      <span className="text-center text-xs leading-normal font-semibold text-soft">{note}</span>
    </form>
  );
};

export default PaymentForm;
