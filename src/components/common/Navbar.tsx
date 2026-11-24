import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import useTheme from "@/hooks/useTheme";
import NotificationsMenu from "@/components/learner/NotificationsMenu";
import { useLogout } from "@/queries/auth";
import { homeFor } from "@/routes/redirects";
import { useSessionUser } from "@/stores/authStore";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

/*
 * One stable public set (F-002 E5): Home · Courses · Notes · Pricing · About · Help · Contact,
 * the same on every marketing page and in the mobile menu.
 * The signed-in set ends with Contact on the dashboard and Settings on the settings page.
 */
const PUBLIC_LINKS: NavItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/notes", label: "Notes" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" },
];

const appLinks = (onSettings: boolean): NavItem[] => [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/courses", label: "Courses" },
  { to: "/notes", label: "Notes" },
  onSettings ? { to: "/settings", label: "Settings" } : { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-[10px] px-3.75 py-2.25 text-sm transition-all duration-200 min-[1001px]:max-[1199px]:px-2.5 ${
    isActive ? "bg-chip font-bold text-brand" : "font-semibold text-muted hover:bg-chip hover:text-brand"
  }`;

/**
 * Sticky top navigation.
 * variant="public" — marketing pages (Login / Sign up when signed out; Dashboard/Admin + avatar when signed in)
 * variant="app"    — signed-in pages (notifications, avatar, logout)
 */
const Navbar = ({ variant = "public" }: { variant?: "public" | "app" }) => {
  const { pathname } = useLocation();
  // the mobile menu remembers the path it was opened on, so it closes itself after navigating
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const onSettings = pathname.startsWith("/settings");
  const links = variant === "app" ? appLinks(onSettings) : PUBLIC_LINKS;
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and puts focus back on its toggle
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenOn(null);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const user = useSessionUser();
  const handleLogout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const initial = user?.name[0]?.toUpperCase() ?? "";
  const home = homeFor(user?.role);
  const homeLabel = user?.role === "admin" ? "Admin" : "Dashboard";

  const avatar = (
    <Link
      to="/settings"
      title="Profile & settings"
      aria-label="Profile & settings"
      className="bg-grad-amber flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[15px] font-extrabold text-cocoa"
    >
      {initial}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-60 border-b border-line bg-nav backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-310 items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <Logo size="lg" tagline />

        <div className="ml-auto hidden items-center gap-0.5 min-[1001px]:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 min-[400px]:gap-2.25 min-[1001px]:ml-2">
          {/* very narrow phones: the toggle moves into the menu so the bar fits */}
          <ThemeToggle className="max-[380px]:hidden" />

          {variant === "app" ? (
            <>
              {!onSettings && <NotificationsMenu />}
              {avatar}
              {!onSettings && (
                <button
                  type="button"
                  title="Log out"
                  aria-label="Log out"
                  onClick={handleLogout}
                  className="icon-btn hidden text-muted hover:border-danger! hover:text-danger! sm:inline-flex"
                >
                  <Icon name="logout" size={19} />
                </button>
              )}
            </>
          ) : user ? (
            <>
              <Link
                to={home}
                className="btn btn-primary hidden px-5.5 py-2.75 shadow-[0_6px_18px_rgba(27,111,208,.35)]! hover:shadow-[0_12px_26px_rgba(27,111,208,.45)]! sm:inline-flex"
              >
                {homeLabel}
              </Link>
              {avatar}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full border-[1.5px] border-line px-4.5 py-2.5 text-sm font-bold whitespace-nowrap text-ink transition-all hover:border-brand hover:text-brand sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary px-4 py-2.75 whitespace-nowrap shadow-[0_6px_18px_rgba(27,111,208,.35)]! hover:shadow-[0_12px_26px_rgba(27,111,208,.45)]! min-[400px]:px-5.5"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            ref={toggleRef}
            type="button"
            className="icon-btn min-[1001px]:hidden"
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-4 py-3 min-[1001px]:hidden">
          <div className="mx-auto flex max-w-310 flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-[10px] px-3.75 py-2.25 text-left text-sm font-semibold text-muted min-[381px]:hidden"
            >
              <Icon name={theme === "light" ? "dark_mode" : "light_mode"} size={18} />
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            {variant === "public" && !user ? (
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            ) : variant === "public" ? (
              <NavLink to={home} className={linkClass}>
                {homeLabel}
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-[10px] px-3.75 py-2.25 text-left text-sm font-semibold text-danger"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
