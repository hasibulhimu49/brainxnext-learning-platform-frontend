const btn =
  "rounded-[9px] border border-line bg-surface px-3 py-2 text-[11px] font-extrabold text-ink transition-colors hover:bg-surface2 disabled:pointer-events-none disabled:opacity-45";

interface PaginationProps {
  /** 0-based */
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

/** "Showing 1–10 of 24" with Previous / Next. Hidden when everything fits on one page. */
const Pagination = ({ page, pageSize, total, onPage }: PaginationProps) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, from + pageSize - 1);
  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <span className="text-[11px] font-bold text-soft" aria-live="polite">
        Showing {from}–{to} of {total}
      </span>
      <span className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <span className="text-[11px] font-bold text-soft">
          Page {page + 1} of {pages}
        </span>
        <button type="button" className={btn} disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </span>
    </nav>
  );
};

export default Pagination;
