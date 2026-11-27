import { useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Icon from "./Icon";
import Logo from "./Logo";
import CartButton from "@/components/shop/CartButton";
import ThemeToggle from "./ThemeToggle";
import useFocusTrap from "./useFocusTrap";
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
 * The navbar depends only on whether you're signed in — never on the page — so it looks the same everywhere:
 * - signed out: Home · Courses · Roadmaps · Notes · Pricing · Help · Contact, then Log in / Sign up (About is in the footer)
 * - signed in:  Dashboard (or Admin) · Courses · Roadmaps · Notes · Pricing · Help · Contact, then notifications, avatar, log out
 * The lesson player, checkout and auth screens use their own focused headers on purpose.
 */
const PUBLIC_LINKS: NavItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/paths", label: "Roadmaps" },
  { to: "/notes", label: "Notes" },
  { to: "/pricing", label: "Pricing" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" },
];

const signedInLinks = (home: string, homeLabel: string): NavItem[] => [
  { to: home, label: homeLabel },
  { to: "/courses", label: "Courses" },
  { to: "/paths", label: "Roadmaps" },
  { to: "/notes", label: "Notes" },
  { to: "/pricing", label: "Pricing" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-[10px] px-3.75 py-2.25 text-sm transition-all duration-200 min-[1001px]:max-[1199px]:px-2.5 min-[1001px]:max-[1099px]:px-2 ${
    isActive ? "bg-chip font-bold text-brand" : "font-semibold text-muted hover:bg-chip hover:text-brand"
  }`;

/** Sticky top navigation — one navbar for every page that has one. */
const Navbar = () => {
  const { pathname } = useLocation();
  // the mobile menu remembers the path it was opened on, so it closes itself after navigating
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // while the mobile menu is open, Tab stays in the navbar + menu; Escape closes it and refocuses the toggle
  useFocusTrap(navRef, open, () => setOpenOn(null), toggleRef);
  const user = useSessionUser();
  const handleLogout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const initial = user?.name[0]?.toUpperCase() ?? "";
  const home = homeFor(user?.role);
  const homeLabel = user?.role === "admin" ? "Admin" : "Dashboard";
  const links = user ? signedInLinks(home, homeLabel) : PUBLIC_LINKS;

  const avatar = (
    <Link
      to="/settings"
      title="Profile & settings"
      aria-label="Profile & settings"
      className="bg-grad-amber flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[15px] font-extrabold text-cocoa max-[399px]:size-9"
    >
      {initial}
    </Link>
  );

  return (
    <nav ref={navRef} className="sticky top-0 z-60 border-b border-line bg-nav backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-310 items-center gap-3 px-4 py-3 min-[1001px]:max-[1099px]:gap-3 sm:gap-6 sm:px-6">
        <Logo size="lg" tagline />

        <div className="ml-auto hidden items-center gap-0.5 min-[1001px]:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* under 400px the round buttons shrink to 36px so logo + cart + menu fit on a 360px phone */}
        <div className="ml-auto flex min-w-0 items-center gap-1.5 min-[400px]:gap-2.25 min-[1001px]:ml-2 min-[1001px]:max-[1099px]:gap-1.5! max-[399px]:[&_.icon-btn]:size-9">
          {/* phones: the theme toggle and wishlist move into the menu so the cart fits */}
          <ThemeToggle className="max-sm:hidden" />
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            title="Wishlist"
            className="icon-btn text-ink max-sm:hidden min-[1001px]:max-[1199px]:hidden"
          >
            <Icon name="favorite" size={20} />
          </Link>
          <CartButton />

          {user ? (
            <>
              <NotificationsMenu />
              {avatar}
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                onClick={handleLogout}
                className="icon-btn hidden text-muted hover:border-danger! hover:text-danger! sm:inline-flex"
              >
                <Icon name="logout" size={19} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full border-[1.5px] border-line px-4.5 py-2.5 text-sm font-bold whitespace-nowrap text-ink transition-all hover:border-brand hover:text-brand min-[1001px]:max-[1099px]:px-3.5 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary px-4 py-2.75 whitespace-nowrap shadow-[0_6px_18px_rgba(27,111,208,.35)]! hover:shadow-[0_12px_26px_rgba(27,111,208,.45)]! min-[400px]:px-5.5 min-[1001px]:max-[1099px]:px-4!"
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
            <NavLink to="/wishlist" className={(a) => `${linkClass(a)} sm:hidden`}>
              Wishlist
            </NavLink>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-[10px] px-3.75 py-2.25 text-left text-sm font-semibold text-muted sm:hidden"
            >
              <Icon name={theme === "light" ? "dark_mode" : "light_mode"} size={18} />
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            {!user ? (
              <NavLink to="/login" className={linkClass}>
                Log in
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
