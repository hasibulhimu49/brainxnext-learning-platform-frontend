import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { useSessionUser } from "@/stores/authStore";

const btnCls = (primary?: boolean, danger?: boolean) =>
  `inline-flex items-center gap-1.5 rounded-[10px] border px-3.75 py-2.5 text-xs font-extrabold whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-55 ${
    primary
      ? "bg-grad-brand border-transparent text-white hover:-translate-y-px hover:text-white"
      : danger
        ? "border-line bg-surface text-danger hover:border-danger"
        : "border-line bg-surface text-ink hover:bg-surface2"
  }`;

type HeaderButtonProps = ComponentProps<"button"> & { primary?: boolean; danger?: boolean; icon?: string; to?: string };

/** Header / card action button from the Proper designs ("Import", "+ Create course"). */
export const HeaderButton = ({ primary, danger, icon, to, children, className = "", type, ...rest }: HeaderButtonProps) => {
  const content = (
    <>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </>
  );
  return to ? (
    <Link to={to} className={`${btnCls(primary, danger)} ${className}`}>
      {content}
    </Link>
  ) : (
    <button type={type ?? "button"} className={`${btnCls(primary, danger)} ${className}`} {...rest}>
      {content}
    </button>
  );
};

export interface Crumb {
  label: string;
  to?: string;
}

interface AdminPageProps {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
  actions?: ReactNode;
  /** top-bar search; omitted on detail pages */
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  children: ReactNode;
}

/** Admin section shell: top bar (breadcrumb, search, inbox, avatar) + page title + content. */
const AdminPage = ({ crumbs, eyebrow, title, desc, actions, search, children }: AdminPageProps) => {
  const initial = useSessionUser()?.name[0]?.toUpperCase() ?? "";
  return (
    <main className="flex min-w-0 flex-col">
      <header className="flex h-17.5 items-center gap-4.5 border-b border-line bg-surface px-3.75 sm:px-7.5">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px] font-extrabold text-ink">
          {crumbs.map((c, i) => (
            <span key={c.label + i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <Icon name="chevron_right" size={16} className="flex-none text-soft" />}
              {c.to ? (
                <Link to={c.to} className="flex-none text-soft hover:text-brand">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate" aria-current="page">
                  {c.label}
                </span>
              )}
            </span>
          ))}
        </nav>
        {search ? (
          <input
            type="search"
            aria-label="Search"
            placeholder={search.placeholder ?? "Search..."}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className="ml-auto w-37.5 min-w-0 rounded-[11px] border border-line bg-surface2 px-3.25 py-2.5 text-xs font-semibold text-ink outline-none focus:border-brand sm:w-65"
          />
        ) : (
          <span className="ml-auto" />
        )}
        <Link
          to="/admin/inbox"
          aria-label="Notifications — open the inbox"
          className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-[11px] border border-line bg-surface text-muted hover:text-brand"
        >
          <Icon name="notifications" size={18} />
        </Link>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#F2BC4B] text-xs font-black text-cocoa max-sm:hidden">
          {initial}
        </div>
      </header>

      <section className="mx-auto w-full max-w-312.5 px-3.75 py-5 sm:p-7.5">
        <div className="mb-6 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0">
            {eyebrow && <div className="text-[11px] font-black tracking-widest text-brand uppercase">{eyebrow}</div>}
            <h1 className="mt-1.5 mb-1.25 text-[28px] font-extrabold wrap-break-word text-ink">{title}</h1>
            {desc && <div className="text-xs font-semibold text-soft">{desc}</div>}
          </div>
          {actions && <div className="flex flex-wrap gap-2.25">{actions}</div>}
        </div>
        {children}
      </section>
    </main>
  );
};

export default AdminPage;
