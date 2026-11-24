import { Link, NavLink } from "react-router-dom";
import { ADMIN_NAV } from "@/constants/admin";
import useTheme from "../../hooks/useTheme";
import Icon from "../common/Icon";
import LogoMark from "@/components/common/LogoMark";
import { useAdminCounts } from "@/queries/admin";
import { useLogout } from "@/queries/auth";
import { useSessionUser } from "@/stores/authStore";

const footerItem =
  "flex items-center gap-3 rounded-[13px] border-0 bg-transparent px-3.5 py-3 text-left text-[13.5px] font-semibold text-muted transition-all hover:bg-chip";

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 whitespace-nowrap rounded-[13px] px-3.5 py-3 text-[13.5px] transition-all hover:bg-chip ${
    isActive ? "bg-chip font-extrabold text-brand" : "font-semibold text-muted"
  }`;

/** Admin panel sidebar — stacks horizontally on narrow screens */
const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const user = useSessionUser();
  const logout = useLogout();
  const counts = useAdminCounts().data;

  return (
    <aside className="relative flex min-w-0 flex-row gap-1.5 overflow-x-auto border-b border-line bg-surface px-3.5 py-3 min-[1081px]:sticky min-[1081px]:top-0 min-[1081px]:h-screen min-[1081px]:flex-col min-[1081px]:overflow-visible min-[1081px]:border-r min-[1081px]:border-b-0 min-[1081px]:py-4.5">
      <Link to="/" className="mr-2 flex flex-none items-center gap-2.5 px-2.5 py-2 text-ink min-[1081px]:mr-0 min-[1081px]:mb-2.5">
        <LogoMark size={36} />
        <span className="hidden flex-col leading-[1.15] min-[1081px]:flex">
          <span className="font-display text-[15.5px] font-extrabold text-ink">BrainXNext</span>
          <span className="text-[10px] font-extrabold tracking-[0.14em] text-soft">ADMIN</span>
        </span>
      </Link>

      {ADMIN_NAV.map((n) => {
        const count = n.badge && counts ? counts[n.badge] : 0;
        return (
          // nested detail routes (/admin/courses/:id) keep their section active; only Overview is exact
          <NavLink key={n.label} to={n.slug ? `/admin/${n.slug}` : "/admin"} end={!n.slug} className={itemClass}>
            <Icon name={n.icon} size={19} />
            {n.label}
            {count > 0 && (
              <>
                <span aria-hidden="true" className="ml-auto rounded-full bg-[#EC3013] px-2 py-0.5 text-[10.5px] font-extrabold text-white">
                  {count}
                </span>
                <span className="sr-only">{`, ${count} pending`}</span>
              </>
            )}
          </NavLink>
        );
      })}

      {/* narrow screens: the footer is hidden, so log out sits at the end of the row */}
      <button type="button" onClick={logout} className={`${footerItem} flex-none hover:text-danger! min-[1081px]:hidden`}>
        <Icon name="logout" size={19} />
        Log out
      </button>

      <div className="mt-auto hidden flex-col gap-1.5 min-[1081px]:flex">
        <button type="button" onClick={toggleTheme} className={footerItem}>
          <Icon name={theme === "light" ? "dark_mode" : "light_mode"} size={19} />
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
        <Link to="/" className={footerItem}>
          <Icon name="open_in_new" size={19} />
          Exit to site
        </Link>
        <button type="button" onClick={logout} className={`${footerItem} hover:text-danger!`}>
          <Icon name="logout" size={19} />
          Log out
        </button>
        <div className="flex items-center gap-2.75 border-t border-line px-3.5 py-3">
          <span className="bg-grad-brand flex h-8.5 w-8.5 flex-none items-center justify-center rounded-full font-display text-[13px] font-extrabold text-white">
            {user?.name[0]?.toUpperCase() ?? ""}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-extrabold text-ink">{user?.name}</span>
            <span className="truncate text-[11px] font-semibold text-soft">{user?.email}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
