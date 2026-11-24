import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { resetMockAdmin } from "@/api/mock/db/admin";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import AdminNewCourse from "./AdminNewCourse";

beforeEach(async () => {
  resetMockAdmin();
  useAuthStore.getState().setSession(await authService.login("admin@brainxnext.com", "admin12345"));
});

describe("<AdminNewCourse /> edit mode", () => {
  it("loads the existing course into the form", async () => {
    renderWithProviders(<AdminNewCourse />, { route: "/admin/courses/java-generics/edit", path: "/admin/courses/:courseId/edit" });
    expect(await screen.findByLabelText("Course title")).toHaveValue("Generics in Java — Basics to Advanced");
    expect(screen.getByText("Edit course")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save draft" })).not.toBeInTheDocument();
    expect(screen.getAllByLabelText(/Module \d title/)).toHaveLength(4);
  }, 20_000);

  it("saves changes and opens the course detail page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminNewCourse />, {
      route: "/admin/courses/java-generics/edit",
      path: "/admin/courses/:courseId/edit",
      stubs: ["/admin/courses/:courseId"],
    });
    const title = await screen.findByLabelText("Course title");
    await user.clear(title);
    await user.type(title, "Revised");
    expect(screen.getByText(/UNSAVED/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(
      await screen.findByText(/Stub: \/admin\/courses\/:courseId \/admin\/courses\/java-generics/, undefined, { timeout: 10_000 })
    ).toBeInTheDocument();
  }, 20_000);

  it("asks before leaving with unsaved changes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminNewCourse />, { route: "/admin/courses/java-generics/edit", path: "/admin/courses/:courseId/edit" });
    await user.type(await screen.findByLabelText("Course title"), "!");
    await user.click(screen.getByRole("link", { name: "Back to admin" }));
    expect(await screen.findByRole("dialog", { name: "Discard unsaved changes?" })).toBeInTheDocument();
  }, 20_000);

  it("shows an error for an unknown course", async () => {
    renderWithProviders(<AdminNewCourse />, { route: "/admin/courses/nope/edit", path: "/admin/courses/:courseId/edit" });
    expect(await screen.findByText("Course not found.")).toBeInTheDocument();
  });
});
