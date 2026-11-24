import { useState, type ReactNode } from "react";
import Icon from "@/components/common/Icon";
import { PAGE_SIZE } from "@/constants/admin";
import { NoMatches } from "./EmptyState";
import Pagination from "./Pagination";

export interface Column<R> {
  key: string;
  header: string;
  render: (row: R) => ReactNode;
  /** makes the header a sort button */
  sort?: (row: R) => string | number;
  className?: string;
}

export type SortDir = "asc" | "desc";

interface DataTableProps<R extends { id: string }> {
  /** accessible table name, e.g. "Courses" */
  label: string;
  columns: Column<R>[];
  rows: R[];
  /** icon buttons for the last column */
  actions?: (row: R) => ReactNode;
  initialSort?: { key: string; dir: SortDir };
  pageSize?: number;
  /** horizontal-scroll threshold */
  min?: number;
  /** shown instead of the table body when `rows` is empty (defaults to "Nothing matches…") */
  empty?: ReactNode;
}

const compare = (a: string | number, b: string | number) =>
  typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));

/** Sorts `rows` by a column value. */
function sortRows<R>(rows: R[], value: ((r: R) => string | number) | undefined, dir: SortDir): R[] {
  if (!value) return rows;
  const sorted = [...rows].sort((a, b) => compare(value(a), value(b)));
  return dir === "asc" ? sorted : sorted.reverse();
}

/**
 * Admin table (Proper designs): sortable headers, client-side pagination (10 per page),
 * optional row actions, horizontal scroll on narrow screens.
 */
function DataTable<R extends { id: string }>({
  label,
  columns,
  rows,
  actions,
  initialSort,
  pageSize = PAGE_SIZE,
  min = 640,
  empty,
}: DataTableProps<R>) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);
  // back to page 1 whenever the filtered row count changes
  const [seenTotal, setSeenTotal] = useState(rows.length);
  if (seenTotal !== rows.length) {
    setSeenTotal(rows.length);
    setPage(0);
  }

  const sortCol = columns.find((c) => c.key === sort?.key);
  const sorted = sortRows(rows, sortCol?.sort, sort?.dir ?? "asc");
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggle = (key: string) => setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const colCount = columns.length + (actions ? 1 : 0);

  return (
    <div>
      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: min }} aria-label={label}>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className="border-b border-line px-2.5 py-2.5 text-left text-[10px] font-bold tracking-[0.06em] whitespace-nowrap text-soft uppercase"
                  >
                    {c.sort ? (
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className={`inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[10px] font-bold tracking-[0.06em] uppercase hover:text-brand ${
                          active ? "text-brand" : "text-soft"
                        }`}
                      >
                        {c.header}
                        <Icon name={active ? (sort.dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"} size={13} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {actions && (
                <th
                  scope="col"
                  className="border-b border-line px-2.5 py-2.5 text-right text-[10px] font-bold tracking-[0.06em] text-soft uppercase"
                >
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={colCount}>{empty ?? <NoMatches />}</td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} className="group">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`border-b border-line px-2.5 py-3.5 text-xs font-semibold text-ink group-last:border-b-0 ${c.className ?? ""}`}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                  {actions && <td className="border-b border-line px-2.5 py-3.5 group-last:border-b-0">{actions(r)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={current} pageSize={pageSize} total={sorted.length} onPage={setPage} />
    </div>
  );
}

export default DataTable;
