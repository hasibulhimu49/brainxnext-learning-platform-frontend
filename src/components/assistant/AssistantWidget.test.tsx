import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import AssistantWidget from "./AssistantWidget";

describe("<AssistantWidget /> (F-005)", () => {
  it("opens the chat, answers a starter question and suggests courses", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssistantWidget />, { route: "/" });
    await user.click(screen.getByRole("button", { name: "Ask Next AI" }));
    expect(screen.getByRole("dialog", { name: "Next AI chat" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Which course should I start with?" }));
    expect(await screen.findByText(/free, beginner-friendly courses/)).toBeInTheDocument();
    expect(screen.getAllByRole("link").some((a) => a.getAttribute("href")?.startsWith("/courses/"))).toBe(true);
  });

  it("sends a typed question and closes with Escape", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssistantWidget />, { route: "/" });
    await user.click(screen.getByRole("button", { name: "Ask Next AI" }));
    await user.type(screen.getByLabelText("Message Next AI"), "promo code?{Enter}");
    expect(await screen.findByText(/LEARN20/)).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is a modal dialog that keeps Tab inside and returns focus on Escape", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AssistantWidget />, { route: "/" });
    const circle = screen.getByRole("button", { name: "Ask Next AI" });
    await user.click(circle);
    const dialog = screen.getByRole("dialog", { name: "Next AI chat" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText("Message Next AI")).toHaveFocus();
    // Send is disabled (empty draft), so the input is the last stop: Tab wraps to the first control
    await user.tab();
    expect(screen.getByRole("button", { name: "Close chat" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByLabelText("Message Next AI")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask Next AI" })).toHaveFocus();
  });

  it("stays out of the admin panel", () => {
    renderWithProviders(<AssistantWidget />, { route: "/admin/payments" });
    expect(screen.queryByRole("button", { name: "Ask Next AI" })).not.toBeInTheDocument();
  });
});
