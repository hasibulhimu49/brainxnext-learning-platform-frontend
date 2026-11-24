import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";

const cls = (danger?: boolean) =>
  `flex h-7.5 w-7.5 flex-none items-center justify-center rounded-[9px] border border-line bg-surface text-muted transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40 ${
    danger ? "hover:border-danger! hover:text-danger!" : ""
  }`;

interface RowActionProps {
  icon: string;
  /** accessible name and tooltip, e.g. "Refund ORD-123" */
  label: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/** Icon-only row action (link or button) with an aria-label. */
export const RowAction = ({ icon, label, to, onClick, danger, disabled }: RowActionProps) =>
  to ? (
    <Link to={to} aria-label={label} title={label} className={cls(danger)}>
      <Icon name={icon} size={16} />
    </Link>
  ) : (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={cls(danger)}>
      <Icon name={icon} size={16} />
    </button>
  );

export const RowActions = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-end gap-1.5">{children}</div>
);
