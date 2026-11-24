import type { ReactNode } from "react";
import Icon from "@/components/common/Icon";

/** First-run empty state for an admin list ("No promo codes yet" + a call to action). */
const EmptyState = ({ icon, title, children, action }: { icon: string; title: string; children?: ReactNode; action?: ReactNode }) => (
  <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chip text-brand dark:text-brand-light">
      <Icon name={icon} size={24} />
    </span>
    <span className="text-sm font-extrabold text-ink">{title}</span>
    {children && <span className="max-w-90 text-xs leading-relaxed font-semibold text-soft">{children}</span>}
    {action && <span className="mt-1.5">{action}</span>}
  </div>
);

export const NoMatches = () => <p className="py-8 text-center text-xs font-semibold text-soft">Nothing matches your search or filters.</p>;

export default EmptyState;
