import type { ReactNode } from "react";
import type { LabelValue } from "@/types/admin";

/** Card surfaces used by the admin screens (19-admin + BrainXNext_*_Proper designs). */

export const cardBase = "rounded-[18px] border border-line bg-surface shadow-[0_8px_26px_rgba(22,59,90,.045)]";

/** Overview panel (19-admin). */
export const Panel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`card overflow-hidden rounded-[20px]! ${className}`}>{children}</div>
);

/** Section card with a title and an optional control on the right (Proper designs). */
export const AdminCard = ({
  title,
  right,
  children,
  className = "",
}: {
  title: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`${cardBase} min-w-0 p-5.25 ${className}`}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 text-base font-extrabold text-ink">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

export const ListItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`flex items-center justify-between gap-3.75 border-b border-line py-3.5 text-xs font-semibold text-ink last:border-b-0 ${className}`}
  >
    {children}
  </div>
);

export const SideList = ({ title, items }: { title?: string; items: LabelValue[] }) => (
  <div className={`${cardBase} self-start p-5.25`}>
    <h2 className="m-0 text-base font-extrabold text-ink">{title}</h2>
    {items.length === 0 && <p className="mt-4 text-xs font-semibold text-soft">Nothing yet.</p>}
    {items.map((it) => (
      <ListItem key={it.label}>
        <span>{it.label}</span>
        <b className="font-bold">{it.value}</b>
      </ListItem>
    ))}
  </div>
);

/** Two-line cell: bold title + small grey subtitle. */
export const Name = ({ title, sub }: { title: ReactNode; sub?: ReactNode }) => (
  <>
    <div className="font-extrabold">{title}</div>
    {sub && <div className="mt-0.75 text-[10px] text-soft">{sub}</div>}
  </>
);

/** Label / value rows for detail pages. */
export const InfoList = ({ items }: { items: { label: string; value: ReactNode }[] }) => (
  <dl className="m-0">
    {items.map((it) => (
      <div key={it.label} className="flex items-start justify-between gap-4 border-b border-line py-3 text-xs last:border-b-0">
        <dt className="font-bold text-soft">{it.label}</dt>
        <dd className="m-0 text-right font-extrabold wrap-break-word text-ink">{it.value}</dd>
      </div>
    ))}
  </dl>
);

/** Thin progress bar (Proper courses table). */
export const ProgressBar = ({ pct, label }: { pct: number; label?: string }) => (
  <div
    role="progressbar"
    aria-valuenow={pct}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label ?? "Progress"}
    className="h-1.75 w-27.5 overflow-hidden rounded-full bg-surface2 dark:bg-white/10"
  >
    <i className="block h-full rounded-full bg-[linear-gradient(90deg,#1B6FD0,#0E97B0)]" style={{ width: `${pct}%` }} />
  </div>
);
