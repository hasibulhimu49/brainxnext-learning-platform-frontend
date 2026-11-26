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

  it("stays out of the admin panel", () => {
    renderWithProviders(<AssistantWidget />, { route: "/admin/payments" });
    expect(screen.queryByRole("button", { name: "Ask Next AI" })).not.toBeInTheDocument();
  });
});
