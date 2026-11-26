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
  });
});
