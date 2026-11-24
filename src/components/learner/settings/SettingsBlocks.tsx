import type { ComponentProps, ReactNode } from "react";
import Icon from "@/components/common/Icon";

/** Building blocks shared by the Settings tabs (from the Figma Settings screens). */

/** small pill button used across the Notifications / Billing designs */
export const PillBtn = ({ primary, className = "", children, ...rest }: ComponentProps<"button"> & { primary?: boolean }) => (
  <button
    type="button"
    className={`rounded-full border px-4.5 py-2.5 text-[13px] font-bold whitespace-nowrap transition-colors disabled:opacity-55 ${
      primary ? "border-brand bg-brand text-white hover:bg-[#165fb3]" : "border-line bg-surface text-ink hover:bg-surface2"
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center justify-between gap-4.5 border-b border-line py-4.25 last:border-b-0">{children}</div>
);

export const RowText = ({ title, desc, id }: { title: string; desc: ReactNode; id?: string }) => (
  <div className="min-w-0">
    <div id={id} className="text-sm font-extrabold text-ink">
      {title}
    </div>
    <div className="text-[13px] leading-normal font-semibold wrap-break-word text-soft">{desc}</div>
  </div>
);

export const SettingsCard = ({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) => (
  <div className={`card flex flex-col gap-4.5 rounded-3xl! p-5.5 sm:p-7.5 ${className}`}>
    {title && <h2 className="m-0 font-display text-lg font-extrabold text-ink">{title}</h2>}
    {children}
  </div>
);

export const SavedNote = ({ children = "Saved" }: { children?: ReactNode }) => (
  <span role="status" className="inline-flex items-center gap-1.75 text-[13px] font-extrabold text-success">
    <Icon name="check_circle" size={17} />
    {children}
  </span>
);
