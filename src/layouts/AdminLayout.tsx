import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

/** Admin shell: fixed sidebar + scrolling content. Admin pages render their own <main>, so the skip-link target is a div. */
const AdminLayout = () => (
  <div className="grid min-h-screen grid-cols-1 bg-page text-ink min-[1081px]:grid-cols-[250px_minmax(0,1fr)]">
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <Sidebar />
    <div id="main" tabIndex={-1} className="min-w-0 outline-none">
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
