import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import Icon from "@/components/common/Icon";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";

/**
 * Centered single-card screens (login, register, OTP, 404, support…):
 * soft colour orbs, a slim header with the logo + theme toggle, and an optional footer line.
 *
 * headerExtra: extra items left of the theme toggle; mainClassName: override vertical alignment/padding.
 * Use as a route element (renders <Outlet />) or wrap children directly.
 */
interface AuthLayoutProps {
  children?: ReactNode;
  footer?: ReactNode;
  /** show a close (×) button linking here */
  closeTo?: string;
  headerExtra?: ReactNode;
  mainClassName?: string;
}

const AuthLayout = ({ children, footer, closeTo, headerExtra, mainClassName = "items-center pt-6 pb-14" }: AuthLayoutProps) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-page-soft text-ink dark:[--line:rgba(255,255,255,.11)] dark:[--surface:#0E2138]">
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <div className="orb-backdrop" />

    <header className="relative flex items-center justify-between px-4.5 py-5 sm:px-7">
      <Logo />
      <div className="flex items-center gap-2.25">
        {headerExtra}
        <ThemeToggle className="h-9.5! w-9.5!" />
        {closeTo && (
          <Link
            to={closeTo}
            title="Close"
            aria-label="Close"
            className="icon-btn h-9.5! w-9.5! text-muted hover:border-danger! hover:text-danger!"
          >
            <Icon name="close" size={19} />
          </Link>
        )}
      </div>
    </header>

    <main id="main" tabIndex={-1} className={`relative flex flex-1 justify-center px-5 outline-none ${mainClassName}`}>
      {children ?? <Outlet />}
    </main>

    {footer && <p className="relative m-0 px-5 pb-7 text-center text-sm font-semibold text-muted">{footer}</p>}
  </div>
);

export default AuthLayout;
