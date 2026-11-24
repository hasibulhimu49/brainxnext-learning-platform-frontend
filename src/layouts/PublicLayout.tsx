import { Outlet } from "react-router-dom";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

/**
 * Navbar + page + footer.
 * nav: "public" | "app"   footer: "full" | "simple" | false
 */
interface PublicLayoutProps {
  footer?: "full" | "simple" | false;
  nav?: "public" | "app";
}

const PublicLayout = ({ footer = "simple", nav = "public" }: PublicLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-page text-ink">
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <Navbar variant={nav} />
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <Outlet />
    </main>
    {footer && <Footer variant={footer} />}
  </div>
);

export default PublicLayout;
