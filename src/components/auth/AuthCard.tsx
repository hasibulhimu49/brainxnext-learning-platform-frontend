import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Icon from "../common/Icon";

/** White card used on every auth screen. Goes borderless on small phones. */
export const AuthCard = ({ children, width = 410, className = "" }: { children: ReactNode; width?: number; className?: string }) => (
  <div
    style={{ maxWidth: width }}
    className={`flex w-full flex-col gap-5 rounded-[26px] border border-line bg-surface px-9.5 py-10 shadow-pop max-[520px]:border-0 max-[520px]:bg-transparent max-[520px]:px-5.5 max-[520px]:py-8 max-[520px]:shadow-none ${className}`}
  >
    {children}
  </div>
);

/** Rounded-square icon tile + title + subtitle */
export const AuthHeader = ({ icon, title, children }: { icon?: string; title: string; children?: ReactNode }) => (
  <div className="mb-0.5 flex flex-col items-center gap-2.5 text-center">
    {icon && (
      <span className="flex h-14.5 w-14.5 items-center justify-center rounded-[18px] border border-line bg-surface2">
        <Icon name={icon} size={27} className="text-brand" />
      </span>
    )}
    <h1 className="m-0 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">{title}</h1>
    {children && <p className="m-0 text-sm leading-[1.55] font-medium text-muted">{children}</p>}
  </div>
);

interface SuccessStateProps {
  icon?: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

/** Green success circle + title + text, used for "done" states */
export const SuccessState = ({ icon = "check_circle", title, children, action }: SuccessStateProps) => (
  <div className="flex flex-col items-center gap-4.5 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-success/35 bg-success/12">
      <Icon name={icon} size={30} className="text-success" />
    </span>
    <h1 className="m-0 font-display text-[23px] font-extrabold tracking-[-0.02em] text-ink">{title}</h1>
    <div className="m-0 text-sm leading-relaxed font-medium text-muted">{children}</div>
    {action}
  </div>
);

type AlertTone = "error" | "success" | "info";

const ALERT_TONES: Record<AlertTone, string> = {
  error: "border-danger/35 bg-danger/8 text-danger",
  success: "border-success/35 bg-success/10 text-success",
  info: "border-brand/30 bg-chip text-brand",
};

const ALERT_ICONS: Record<AlertTone, string> = { error: "error", success: "check_circle", info: "info" };

/** Error / success / info banner */
export const Alert = ({ tone = "error", icon, children }: { tone?: AlertTone; icon?: string; children: ReactNode }) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className={`flex items-center gap-2.25 rounded-[13px] border px-3.75 py-3 text-[13px] font-bold ${ALERT_TONES[tone]}`}
  >
    <Icon name={icon ?? ALERT_ICONS[tone]} size={17} className="flex-none" />
    <span>{children}</span>
  </div>
);

/** Inline field error under an input */
export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span role="alert" className="-mt-1 flex items-center gap-1.75 text-[12.5px] font-bold text-danger">
      <Icon name="error" size={15} />
      {message}
    </span>
  ) : null;

/** "—— OR ——" divider */
export const OrDivider = () => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-line" />
    <span className="text-[11px] font-bold tracking-[0.08em] text-soft">OR</span>
    <span className="h-px flex-1 bg-line" />
  </div>
);

type SubmitButtonProps = ComponentProps<"button"> & { dimmed?: boolean; pending?: boolean };

/**
 * Large primary submit button used on auth cards.
 * `dimmed` matches the design's 55% opacity while the form isn't complete (it stays clickable so
 * validation messages can show); `pending` disables it during the request.
 */
export const SubmitButton = ({ children, dimmed, pending, className, ...rest }: SubmitButtonProps) => (
  <Button
    type="submit"
    size="xl"
    shape="rounded"
    disabled={pending}
    aria-busy={pending || undefined}
    className={cn("mt-1 w-full", (dimmed || pending) && "opacity-55 hover:translate-y-0!", className)}
    {...rest}
  >
    {children}
  </Button>
);
