import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";

interface LearnerPageProps {
  title: string;
  subtitle?: ReactNode;
  /** right side of the header (links, buttons) */
  actions?: ReactNode;
  children: ReactNode;
  /** the small back link above the title (default: Dashboard) */
  back?: { to: string; label: string };
}

/** Page frame for the signed-in list screens (My courses, Certificates, My reviews) — matches the dashboard header. */
const LearnerPage = ({ title, subtitle, actions, children, back = { to: "/dashboard", label: "Dashboard" } }: LearnerPageProps) => (
  <section className="bg-page px-4.5 pt-11 pb-22 sm:px-6">
    <div className="mx-auto flex max-w-310 flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <Link to={back.to} className="inline-flex w-max items-center gap-1 text-[13px] font-bold text-soft hover:text-brand">
            <Icon name="arrow_back" size={16} />
            {back.label}
          </Link>
          <h1 className="m-0 font-display text-[clamp(26px,3.4vw,36px)] font-extrabold tracking-[-0.02em] text-ink">{title}</h1>
          {subtitle && <p className="m-0 text-[14px] font-semibold text-soft">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  </section>
);

/** Dashed empty-state card (same style as the dashboard's). */
export const EmptyCard = ({ icon, title, children, action }: { icon: string; title: string; children: ReactNode; action?: ReactNode }) => (
  <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-12 text-center">
    <span className="bg-grad-brand flex h-16 w-16 items-center justify-center rounded-[20px] shadow-card">
      <Icon name={icon} size={30} className="text-white" />
    </span>
    <h2 className="m-0 font-display text-xl font-extrabold tracking-[-0.01em] text-ink">{title}</h2>
    <p className="m-0 max-w-[46ch] text-sm leading-relaxed font-medium text-muted">{children}</p>
    {action}
  </div>
);

export default LearnerPage;
