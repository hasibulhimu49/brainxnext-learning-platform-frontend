import { Outlet } from "react-router-dom";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

/**
 * Navbar + page + footer.
 * footer: "full" | "simple" | false (the navbar is the same everywhere; it follows the sign-in state)
 */
interface PublicLayoutProps {
  footer?: "full" | "simple" | false;
}

const PublicLayout = ({ footer = "simple" }: PublicLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-page text-ink">
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <Navbar />
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <Outlet />
    </main>
    {footer && <Footer variant={footer} />}
  </div>
);

export default PublicLayout;
