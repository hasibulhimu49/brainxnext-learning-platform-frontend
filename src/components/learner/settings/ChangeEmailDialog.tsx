import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { USE_MOCK_API } from "@/api/config";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmEmailChange, useStartEmailChange } from "@/queries/account";
import { emailChangeCodeSchema, emailChangeSchema, type EmailChangeValues } from "@/schemas/account";
import { OTP_LENGTH, type OtpValues } from "@/schemas/auth";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

/** Step 1: new address + current password. */
const EmailStep = ({ onSent }: { onSent: (email: string) => void }) => {
  const start = useStartEmailChange();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailChangeValues>({ resolver: zodResolver(emailChangeSchema), defaultValues: { newEmail: "", password: "" } });

  return (
    <form
      className="flex flex-col gap-3.5"
      noValidate
      onSubmit={handleSubmit((v) => start.mutate(v, { onSuccess: (r) => onSent(r.sentTo) }))}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-email">New email</Label>
        <Input id="new-email" type="email" autoComplete="email" aria-invalid={!!errors.newEmail || undefined} {...register("newEmail")} />
        <FieldError message={errors.newEmail?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-password">Current password</Label>
        <Input
          id="email-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password || undefined}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      {start.isError && <Alert>{errorMessage(start.error)}</Alert>}
      <DialogFooter>
        <Button type="submit" size="md" disabled={start.isPending} aria-busy={start.isPending || undefined}>
          Send verification code
        </Button>
      </DialogFooter>
    </form>
  );
};

/** Step 2: the code sent to the new address. */
const CodeStep = ({ sentTo, onDone }: { sentTo: string; onDone: () => void }) => {
  const confirm = useConfirmEmailChange();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpValues>({ resolver: zodResolver(emailChangeCodeSchema), defaultValues: { code: "" } });

  return (
    <form className="flex flex-col gap-3.5" noValidate onSubmit={handleSubmit(({ code }) => confirm.mutate(code, { onSuccess: onDone }))}>
      <p className="m-0 text-[13.5px] font-semibold text-muted">
        We sent a {OTP_LENGTH}-digit code to <span className="font-extrabold text-ink">{sentTo}</span>.
        {USE_MOCK_API && " (Demo: any code except 000000 works.)"}
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-code">Verification code</Label>
        <Input
          id="email-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          className="font-mono text-[16px]! tracking-[0.3em]"
          aria-invalid={!!errors.code || undefined}
          {...register("code", { onChange: () => confirm.reset() })}
        />
        <FieldError message={errors.code?.message} />
      </div>
      {confirm.isError && <Alert>{errorMessage(confirm.error)}</Alert>}
      <DialogFooter>
        <Button type="submit" size="md" disabled={confirm.isPending} aria-busy={confirm.isPending || undefined}>
          Verify and change email
        </Button>
      </DialogFooter>
    </form>
  );
};

/** Settings → Profile → Change email: password check, then a code sent to the new address. */
const ChangeEmailDialog = ({ open, onOpenChange, currentEmail }: ChangeEmailDialogProps) => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const close = (next: boolean) => {
    if (!next) setSentTo(null);
    onOpenChange(next);
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            You sign in with <span className="font-extrabold text-ink">{currentEmail}</span>. We&apos;ll verify the new address before
            switching.
          </DialogDescription>
        </DialogHeader>
        {sentTo ? (
          <CodeStep
            sentTo={sentTo}
            onDone={() => {
              toast("Email updated");
              close(false);
            }}
          />
        ) : (
          <EmailStep onSent={setSentTo} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeEmailDialog;
