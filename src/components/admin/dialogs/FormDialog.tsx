import type { FormEventHandler, ReactNode } from "react";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  submitLabel: string;
  danger?: boolean;
  pending?: boolean;
  /** API error from the mutation, shown above the buttons */
  error?: unknown;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  /** wider dialog for longer forms */
  wide?: boolean;
}

/** Dialog wrapping a form (RHF `handleSubmit`), with Cancel + submit buttons. */
const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  danger,
  pending,
  error,
  onSubmit,
  children,
  wide,
}: FormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={wide ? "max-w-130" : undefined}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : (
          <DialogDescription className="sr-only">{title}</DialogDescription>
        )}
      </DialogHeader>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        {error !== null && error !== undefined && <Alert>{errorMessage(error)}</Alert>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" variant={danger ? "danger" : "primary"} size="md" disabled={pending} aria-busy={pending || undefined}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

/** Label + control + error, the field layout used in every admin dialog. */
export const Field = ({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  hint?: ReactNode;
}) => (
  <div className="flex flex-col gap-1.75">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <span className="text-[11.5px] font-semibold text-soft">{hint}</span>}
    <FieldError message={error} />
  </div>
);

export const selectCls =
  "w-full cursor-pointer rounded-[13px] border-[1.5px] border-line bg-surface2 px-4 py-3 text-[13.5px] font-semibold text-ink outline-none focus:border-brand";

export default FormDialog;
