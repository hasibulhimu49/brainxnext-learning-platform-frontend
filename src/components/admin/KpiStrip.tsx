import Icon from "@/components/common/Icon";
import type { OverviewKpi, SectionStat } from "@/types/admin";
import { cardBase } from "./Panel";

/** Overview KPIs with trend arrows (19-admin). */
export const KpiStrip = ({ items }: { items: OverviewKpi[] }) => (
  <div className="grid grid-cols-2 gap-4 min-[1081px]:grid-cols-4">
    {items.map((k) => (
      <div key={k.label} className="card flex flex-col gap-2.5 rounded-[20px]! px-5.5 py-5">
        <span className="flex items-center justify-between">
          <span className="text-xs font-bold text-soft">{k.label}</span>
          <Icon name={k.icon} size={19} style={{ color: k.color }} />
        </span>
        <span className="font-display text-[26px] leading-none font-extrabold text-ink">{k.value}</span>
        <span
          className={`inline-flex flex-wrap items-center gap-1.25 text-[11.5px] font-extrabold ${k.up ? "text-success" : "text-danger"}`}
        >
          <Icon name={k.up ? "trending_up" : "trending_down"} size={14} />
          {k.delta}
          <span className="font-semibold text-soft">vs last month</span>
        </span>
      </div>
    ))}
  </div>
);

/** Section stat strip (Proper designs). */
export const StatStrip = ({ stats }: { stats: SectionStat[] }) => (
  <div className="mb-5 grid grid-cols-2 gap-3.5 min-[1050px]:grid-cols-4">
    {stats.map((s) => (
      <div key={s.label} className={`${cardBase} min-w-0 p-4.5`}>
        <div className="text-[11px] font-bold text-soft">{s.label}</div>
        <div className="mt-1.75 truncate text-2xl font-black text-ink">{s.value}</div>
        <div className="mt-1 text-[10px] font-extrabold text-success">{s.trend}</div>
      </div>
    ))}
  </div>
);
