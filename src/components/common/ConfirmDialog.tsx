import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** red confirm button for destructive actions (delete, refund, cancel) */
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
}

/** "Are you sure?" dialog shared by destructive actions (F-002 D9). */
const ConfirmDialog = ({ open, onOpenChange, title, description, confirmLabel, danger, pending, onConfirm }: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" size="md">
            Cancel
          </Button>
        </DialogClose>
        <Button variant={danger ? "danger" : "primary"} size="md" disabled={pending} aria-busy={pending || undefined} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;
