import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import ModuleQuiz from "./ModuleQuiz";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));

describe("<ModuleQuiz /> (F-007)", () => {
  it("takes a module quiz and shows the score with explanations", async () => {
    await asStudent();
    const user = userEvent.setup();
    renderWithProviders(<ModuleQuiz />, { route: "/learn/java-generics/quiz/2", path: "/learn/:courseId/quiz/:module" });
    expect(await screen.findByText("Module 2 quiz")).toBeInTheDocument();
    for (let q = 1; q <= 4; q++) {
      const group = screen.getByRole("radiogroup", { name: `Question ${q}` });
      await user.click(group.querySelectorAll("button")[1] as HTMLElement);
    }
    await user.click(screen.getByRole("button", { name: "Submit answers" }));
    expect(await screen.findByText("4/4 — Passed!")).toBeInTheDocument();
    expect(screen.getAllByText("Correct.")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Start module 3/ })).toHaveAttribute("href", "/learn/java-generics/3-1");
  }, 20_000);

  it("uses the course's real module count for the next-module link", async () => {
    await asStudent();
    const user = userEvent.setup();
    // python-data-analysis has 6 modules: module 5 leads to 6, module 6 is the last
    renderWithProviders(<ModuleQuiz />, { route: "/learn/python-data-analysis/quiz/6", path: "/learn/:courseId/quiz/:module" });
    expect(await screen.findByText("Module 6 quiz")).toBeInTheDocument();
    for (let q = 1; q <= 4; q++) {
      const group = screen.getByRole("radiogroup", { name: `Question ${q}` });
      await user.click(group.querySelectorAll("button")[0] as HTMLElement);
    }
    await user.click(screen.getByRole("button", { name: "Submit answers" }));
    expect(await screen.findByText(/\/4 — /)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Start module 7/ })).not.toBeInTheDocument();
  }, 20_000);

  it("doesn't request a quiz for an invalid module", async () => {
    await asStudent();
    renderWithProviders(<ModuleQuiz />, {
      route: "/learn/java-generics/quiz/abc",
      path: "/learn/:courseId/quiz/:module",
      stubs: ["/learn/:courseId"],
    });
    expect(await screen.findByText(/Stub: \/learn\/:courseId/)).toBeInTheDocument();
  });
});
