import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import LogoMark from "@/components/common/LogoMark";
import ThemeToggle from "@/components/common/ThemeToggle";
import NotificationsMenu from "@/components/learner/NotificationsMenu";
import { plural } from "@/lib/utils";

interface PlayerNavProps {
  title: string;
  /** where the back arrow goes (dashboard, or the course page for guests) */
  backTo: string;
  doneCount: number;
  total: number;
  /** signed-in user's initial; null for guests (shows "Log in" instead of the account controls) */
  initial: string | null;
  onLogout: () => void;
  /** guests: the login link that returns here */
  loginTo?: string;
}

/** Slim sticky nav of the course player: back, course title + progress, theme, notifications, avatar, logout. */
const PlayerNav = ({ title, backTo, doneCount, total, initial, onLogout, loginTo = "/login" }: PlayerNavProps) => {
  const pct = `${total ? Math.round((doneCount / total) * 100) : 0}%`;
  return (
    <nav className="sticky top-0 z-60 border-b border-line bg-nav backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-350 items-center gap-3 px-3.5 py-2.75 sm:gap-4 sm:px-5">
        <Link
          to={backTo}
          title={backTo === "/dashboard" ? "Back to dashboard" : "Back to the course"}
          aria-label={backTo === "/dashboard" ? "Back to dashboard" : "Back to the course"}
          className="icon-btn h-9.5! w-9.5! text-muted"
        >
          <Icon name="arrow_back" size={19} />
        </Link>
        <Link to="/" aria-label="BrainXNext home" className="hidden flex-none sm:block">
          <LogoMark size={36} />
        </Link>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-[14.5px] font-bold text-ink">{title}</span>
          <span className="text-[11.5px] font-bold text-soft">
            {doneCount} of {plural(total, "class", "es")} completed
          </span>
        </span>
        <div className="ml-1.5 hidden h-1.75 max-w-55 flex-1 rounded-full bg-surface2 md:block">
          <div
            className="h-1.75 rounded-full bg-[linear-gradient(90deg,#1B6FD0,#4FD0E0)] transition-[width] duration-300"
            style={{ width: pct }}
          />
        </div>
        <span className="hidden text-xs font-extrabold whitespace-nowrap text-soft md:inline">{pct}</span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="h-9.5! w-9.5!" />
          {initial === null ? (
            <Link to={loginTo} className="btn btn-primary px-4.5 py-2.25 text-[13px]">
              Log in
            </Link>
          ) : (
            <>
              <NotificationsMenu className="h-9.5! w-9.5!" />
              <Link
                to="/settings"
                title="Profile & settings"
                aria-label="Profile & settings"
                className="bg-grad-amber flex h-9.5 w-9.5 flex-none items-center justify-center rounded-full font-display text-sm font-extrabold text-cocoa"
              >
                {initial}
              </Link>
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                onClick={onLogout}
                className="icon-btn h-9.5! w-9.5! text-muted hover:border-danger! hover:text-danger!"
              >
                <Icon name="logout" size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PlayerNav;
