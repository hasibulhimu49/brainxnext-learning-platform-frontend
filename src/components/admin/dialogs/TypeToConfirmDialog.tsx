import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import FormDialog, { Field } from "./FormDialog";

interface TypeToConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** the text the admin must type, e.g. the course title */
  confirmText: string;
  submitLabel: string;
  pending?: boolean;
  error?: unknown;
  onConfirm: () => void;
}

/** Destructive confirmation that only unlocks after typing `confirmText` exactly. */
const TypeToConfirmDialog = ({ open, onOpenChange, confirmText, onConfirm, ...rest }: TypeToConfirmDialogProps) => {
  const [typed, setTyped] = useState("");
  const matchesText = typed.trim() === confirmText.trim();
  const [touched, setTouched] = useState(false);

  return (
    <FormDialog
      {...rest}
      danger
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setTyped("");
          setTouched(false);
        }
        onOpenChange(o);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (matchesText) onConfirm();
      }}
    >
      <Field
        id="confirm-text"
        label={`Type “${confirmText}” to confirm`}
        error={touched && !matchesText ? "The text doesn't match" : undefined}
      >
        <Input
          id="confirm-text"
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-invalid={(touched && !matchesText) || undefined}
        />
      </Field>
    </FormDialog>
  );
};

export default TypeToConfirmDialog;
