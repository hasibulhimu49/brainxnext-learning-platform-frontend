import type { ReactNode } from "react";
import Icon from "@/components/common/Icon";

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

/** "—— OR ——" divider */
export const OrDivider = () => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-line" />
    <span className="text-[11px] font-bold tracking-[0.08em] text-soft">OR</span>
    <span className="h-px flex-1 bg-line" />
  </div>
);
