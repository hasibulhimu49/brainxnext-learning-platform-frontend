import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/common/Icon";

export const filterCls =
  "rounded-[9px] border border-line bg-surface2 px-2.75 py-2.25 text-[11px] font-semibold text-ink outline-none focus:border-brand";

/** In-card search box (Proper designs). */
export const SearchFilter = ({
  placeholder = "Search...",
  value,
  onChange,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <input
    type="search"
    aria-label={placeholder}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`${filterCls} w-full max-w-50`}
  />
);

export interface FilterOption<V extends string> {
  value: V;
  label: string;
  count?: number;
}

/** Native select styled like the Proper filters. */
export function SelectFilter<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: FilterOption<V>[];
  onChange: (v: V) => void;
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as V)} className={`${filterCls} cursor-pointer`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
          {o.count !== undefined ? ` (${o.count})` : ""}
        </option>
      ))}
    </select>
  );
}

/** Chip row filter (Pending / Approved / …) with counts. */
export function ChipFilter<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: FilterOption<V>[];
  onChange: (v: V) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
          className="filter-chip px-3 py-1.75 text-[11.5px]"
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1 opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Header "Filter" button that opens a status menu (closes on Escape / outside click). */
export function FilterMenu<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: FilterOption<V>[];
  onChange: (v: V) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const active = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3.75 py-2.5 text-xs font-extrabold whitespace-nowrap text-ink transition-all hover:bg-surface2"
      >
        <Icon name="filter_list" size={15} />
        Filter{active && options[0]?.value !== value ? `: ${active.label}` : ""}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-30 mt-2 flex min-w-47.5 flex-col gap-0.5 rounded-[14px] border border-line bg-surface p-1.5 shadow-card-lg"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left text-xs font-bold transition-colors hover:bg-chip ${
                value === o.value ? "bg-chip text-brand" : "text-ink"
              }`}
            >
              {o.label}
              {o.count !== undefined && <span className="text-[10.5px] text-soft">{o.count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
