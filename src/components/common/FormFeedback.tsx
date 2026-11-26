import type { ComponentProps, ReactNode } from "react";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Form feedback shared by the auth cards and the other forms: banners, field errors, submit button, done state. */

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
