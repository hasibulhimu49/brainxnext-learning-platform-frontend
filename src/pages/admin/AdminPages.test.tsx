import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { resetMockAdmin } from "@/api/mock/db/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import AdminCourseDetail from "./AdminCourseDetail";
import AdminDashboard from "./AdminDashboard";
import AdminInbox from "./AdminInbox";
import AdminInboxDetail from "./AdminInboxDetail";
import AdminPaymentDetail from "./AdminPaymentDetail";
import AdminPromos from "./AdminPromos";
import AdminStudentDetail from "./AdminStudentDetail";
import AdminSubmissionDetail from "./AdminSubmissionDetail";
import AdminSubmissions from "./AdminSubmissions";

beforeEach(async () => {
  resetMockAdmin();
  useAuthStore.getState().setSession(await authService.login("admin@brainxnext.com", "admin12345"));
});

const PAGES: [string, string, ReactElement, string | RegExp][] = [
  ["/admin/courses", "/admin/:section", <AdminDashboard />, "Courses"],
  ["/admin/students", "/admin/:section", <AdminDashboard />, "Students"],
  ["/admin/reviews", "/admin/:section", <AdminDashboard />, "Reviews"],
  ["/admin/payments", "/admin/:section", <AdminDashboard />, "Payments"],
  ["/admin/notes", "/admin/:section", <AdminDashboard />, "Notes"],
  ["/admin/courses/java-generics", "/admin/courses/:courseId", <AdminCourseDetail />, "Generics in Java — Basics to Advanced"],
  ["/admin/students/STU-1001", "/admin/students/:studentId", <AdminStudentDetail />, "Mohammad Hasibul Hasan"],
  ["/admin/payments/ORD-UX-8342", "/admin/payments/:paymentId", <AdminPaymentDetail />, "ORD-UX-8342"],
  ["/admin/submissions", "/admin/submissions", <AdminSubmissions />, "Project submissions"],
  ["/admin/submissions/SUB-1001", "/admin/submissions/:submissionId", <AdminSubmissionDetail />, "Bounded container practice"],
  ["/admin/promos", "/admin/promos", <AdminPromos />, "Promo codes"],
  ["/admin/inbox", "/admin/inbox", <AdminInbox />, "Inbox"],
  ["/admin/inbox/TCK-2041", "/admin/inbox/:ticketId", <AdminInboxDetail />, "Message from Nusrat Jahan"],
];

describe("admin pages render with data", () => {
  it.each(PAGES)("%s", async (route, path, ui, heading) => {
    renderWithProviders(ui, { route, path });
    expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("admin page details", () => {
  it("lists courses 10 per page with row actions", async () => {
    renderWithProviders(<AdminDashboard />, { route: "/admin/courses", path: "/admin/:section" });
    expect(await screen.findByText("Showing 1–10 of 16")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Generics in Java — Basics to Advanced" })).toHaveAttribute(
      "href",
      "/admin/courses/java-generics/edit"
    );
  });

  it("filters payments with the Filter menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminDashboard />, { route: "/admin/payments", path: "/admin/:section" });
    await screen.findByRole("table", { name: "Transactions" });
    await user.click(screen.getByRole("button", { name: /^Filter/ }));
    await user.click(screen.getByRole("menuitemradio", { name: /Refund requested/ }));
    expect(screen.getByRole("link", { name: "View ORD-UX-8342" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View ORD-JS-8412" })).not.toBeInTheDocument();
  });

  it("shows live counts in the sidebar", async () => {
    renderWithProviders(<AdminSidebar />, { route: "/admin/submissions/SUB-1001" });
    expect(await screen.findByRole("link", { name: "Submissions, 2 pending" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Inbox, 1 pending" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reviews, 6 pending" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Promos/ })).toHaveAttribute("href", "/admin/promos");
  });

  it("validates promo codes in the create dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminPromos />, { route: "/admin/promos", path: "/admin/promos" });
    await user.click(await screen.findByRole("button", { name: "+ Create code" }));
    await user.type(screen.getByLabelText("Code"), "ab");
    await user.type(screen.getByLabelText("% off"), "95");
    await user.click(screen.getByRole("button", { name: "Create code" }));
    expect(await screen.findByText("4–16 letters or digits, no spaces")).toBeInTheDocument();
    expect(screen.getByText("Enter a whole number from 1 to 90")).toBeInTheDocument();
  });
});
