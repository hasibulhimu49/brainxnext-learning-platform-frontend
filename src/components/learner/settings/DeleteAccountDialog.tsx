import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/common/FormFeedback";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAccount } from "@/queries/account";
import { useLogout } from "@/queries/auth";
import { DELETE_CONFIRM_WORD, deleteAccountSchema, type DeleteAccountValues } from "@/schemas/account";

/** "Type DELETE to confirm" → DELETE /me → signed out with a toast. */
const DeleteAccountDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const remove = useDeleteAccount();
  const signOut = useLogout("Your account was deleted");
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountValues>({ resolver: zodResolver(deleteAccountSchema), defaultValues: { confirm: "" } });
  const typed = useWatch({ control, name: "confirm" }).trim() === DELETE_CONFIRM_WORD;

  const change = (next: boolean) => {
    if (!next) {
      reset();
      remove.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently removes your profile, progress, certificates and subscription. Receipts for past payments are kept for our
            records. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3.5"
          noValidate
          onSubmit={handleSubmit(({ confirm }) => remove.mutate(confirm, { onSuccess: () => signOut() }))}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono text-danger">{DELETE_CONFIRM_WORD}</span> to confirm
            </Label>
            <Input id="delete-confirm" autoComplete="off" aria-invalid={!!errors.confirm || undefined} {...register("confirm")} />
            <FieldError message={errors.confirm?.message} />
          </div>
          {remove.isError && <Alert>{errorMessage(remove.error)}</Alert>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="danger"
              size="md"
              disabled={!typed || remove.isPending}
              aria-busy={remove.isPending || undefined}
            >
              Delete my account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
